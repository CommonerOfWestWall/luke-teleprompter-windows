//! 鲁科影视提词器 · 多屏提词器

mod commands;
mod media;
mod model;
mod monitors;
mod selftest;
mod state;
mod store;

use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::Manager;

fn parse_args() -> (Option<String>, Option<f32>, bool, bool, bool, bool) {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut path = None;
    let mut speed = None;
    let mut play = false;
    let mut open = false;
    let mut selftest = false;
    let mut monitor = false;
    for a in args {
        if let Some(v) = a.strip_prefix("--speed=") {
            speed = v.parse::<f32>().ok();
        } else if a == "--play" {
            play = true;
        } else if a == "--open" {
            open = true;
        } else if a == "--selftest" {
            selftest = true;
        } else if a == "--monitor" {
            monitor = true;
        } else if !a.starts_with("--") {
            path = Some(a);
        }
    }
    (path, speed, play, open, selftest, monitor)
}

pub fn run() {
    let (cli_script, cli_speed, cli_play, cli_open, cli_selftest, cli_monitor) = parse_args();

    // 本地媒体服务（视频 seek 需要 Range 支持）
    let hub = media::MediaHub::start();
    let media_port = hub.port;

    let mut settings = store::load_settings().unwrap_or_default();

    // 文稿优先级：命令行 > 上次打开的文件 > 自动保存稿
    if let Some(p) = &cli_script {
        match store::read_text_file(std::path::Path::new(p)) {
            Ok(t) => {
                settings.script_text = if p.to_lowercase().ends_with(".html")
                    || p.to_lowercase().ends_with(".htm")
                {
                    store::html_to_text(&t)
                } else {
                    t
                };
                settings.script_path = Some(p.clone());
            }
            Err(e) => eprintln!("[boot] 读取文稿失败：{e}"),
        }
    } else if settings.script_text.trim().is_empty() {
        if let Some(s) = store::load_last_script() {
            settings.script_text = s;
        }
    }

    if let Some(sp) = cli_speed {
        settings.speed = sp.clamp(5.0, 600.0);
    }

    let mut app_state = state::AppState::new(settings);
    app_state.media_port = media_port;

    let shared: commands::Shared = Arc::new(Mutex::new(app_state));

    // 后台节流落盘
    {
        let s = Arc::clone(&shared);
        std::thread::spawn(move || loop {
            std::thread::sleep(Duration::from_millis(500));
            if let Ok(mut st) = s.lock() {
                st.maybe_flush();
            }
        });
    }

    let hub_for_cmd = Arc::clone(&hub);

    tauri::Builder::default()
        .manage(Arc::clone(&shared))
        .manage(hub_for_cmd)
        .invoke_handler(tauri::generate_handler![
            commands::get_snapshot,
            commands::list_monitors,
            commands::app_info,
            commands::patch,
            commands::reset_settings,
            commands::set_script,
            commands::open_script,
            commands::save_script_as,
            commands::set_playing,
            commands::set_speed,
            commands::seek,
            commands::nudge,
            commands::restart,
            commands::report_metrics,
            commands::add_output,
            commands::remove_output,
            commands::update_output,
            commands::open_output,
            commands::close_output,
            commands::place_output,
            commands::pick_media,
            commands::clear_media,
            commands::slide_step,
            commands::win_minimize,
            commands::win_toggle_max,
            commands::win_close,
            commands::open_monitor,
            commands::close_monitor,
            commands::output_self_close,
            commands::touch_media,
        ])
        .setup(move |app| {
            let handle = app.handle().clone();

            // 刷新显示器列表
            {
                let mons = monitors::list(&handle);
                let mut st = shared.lock().unwrap();
                st.monitors = mons;
                // 首次启动或换了机器：把未绑定 / 越界的输出屏自动绑到主显示器，
                // 免得界面上显示「未绑定」而点了投放没反应
                let primary = st
                    .monitors
                    .iter()
                    .find(|m| m.primary)
                    .or_else(|| st.monitors.first())
                    .map(|m| m.index as i32);
                let total = st.monitors.len() as i32;
                if let Some(p) = primary {
                    let mut changed = false;
                    for o in st.settings.outputs.iter_mut() {
                        if o.monitor < 0 || o.monitor >= total {
                            o.monitor = p;
                            changed = true;
                        }
                    }
                    if changed {
                        st.mark_cfg();
                    }
                }
            }

            // 命令行 --open：打开第一个输出屏
            if cli_open {
                let first = {
                    let st = shared.lock().unwrap();
                    st.settings.outputs.first().map(|o| o.id.clone())
                };
                if let Some(id) = first {
                    let cfg = {
                        let mut st = shared.lock().unwrap();
                        if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
                            o.open = true;
                            o.clone()
                        } else {
                            return Ok(());
                        }
                    };
                    if let Err(e) = monitors::ensure_output(&handle, &cfg) {
                        eprintln!("[boot] 打开输出屏失败：{e}");
                    }
                    let mut st = shared.lock().unwrap();
                    st.mark_cfg();
                }
            } else {
                commands::restore_outputs(&handle, &shared);
            }

            // 命令行 --monitor：同时开监控窗
            if cli_monitor {
                if let Err(e) = commands::ensure_monitor(handle.clone()) {
                    eprintln!("[boot] 打开监控窗失败：{e}");
                }
            }

            // 自检模式：驱动真实后端跑一遍关键路径
            if cli_selftest {
                selftest::run(handle.clone(), Arc::clone(&shared));
            }

            // 命令行 --play
            if cli_play {
                let mut st = shared.lock().unwrap();
                st.set_playing(true);
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            let label = window.label().to_string();

            match event {
                tauri::WindowEvent::CloseRequested { .. } => {
                    if label == "console" {
                        if let Some(shared) = window.try_state::<commands::Shared>() {
                            if let Ok(mut st) = shared.lock() {
                                st.flush_now();
                            }
                        }
                        window.app_handle().exit(0);
                    } else if let Some(id) = label.strip_prefix("out-") {
                        let id = id.to_string();
                        let app = window.app_handle().clone();
                        let sh = window.try_state::<commands::Shared>();
                        let hb = window.try_state::<Arc<media::MediaHub>>();
                        if let (Some(shared), Some(hub)) = (sh, hb) {
                            {
                                let mut st = shared.lock().unwrap();
                                if let Some(o) =
                                    st.settings.outputs.iter_mut().find(|o| o.id == id)
                                {
                                    o.open = false;
                                }
                                st.mark_cfg();
                            }
                            commands::broadcast(&app, &shared, &hub);
                        }
                    }
                }
                // 记住窗口化时的位置与尺寸，下次原样还原
                tauri::WindowEvent::Moved(p) => {
                    if let Some(id) = label.strip_prefix("out-") {
                        let id = id.to_string();
                        if let Some(shared) = window.try_state::<commands::Shared>() {
                            if let Ok(mut st) = shared.lock() {
                                if let Some(o) =
                                    st.settings.outputs.iter_mut().find(|o| o.id == id)
                                {
                                    if !o.fullscreen {
                                        o.x = p.x;
                                        o.y = p.y;
                                        st.mark_cfg();
                                    }
                                }
                            }
                        }
                    }
                }
                tauri::WindowEvent::Resized(sz) => {
                    if let Some(id) = label.strip_prefix("out-") {
                        let id = id.to_string();
                        if let Some(shared) = window.try_state::<commands::Shared>() {
                            if let Ok(mut st) = shared.lock() {
                                if let Some(o) =
                                    st.settings.outputs.iter_mut().find(|o| o.id == id)
                                {
                                    if !o.fullscreen && sz.width >= 200 && sz.height >= 150 {
                                        o.w = sz.width;
                                        o.h = sz.height;
                                        st.mark_cfg();
                                    }
                                }
                            }
                        }
                    }
                }
                tauri::WindowEvent::Destroyed => {
                    if label == "console" {
                        if let Some(shared) = window.try_state::<commands::Shared>() {
                            if let Ok(mut st) = shared.lock() {
                                st.flush_now();
                            }
                        }
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("鲁科影视提词器启动失败");
}
