//! Tauri 命令：全部前端能力入口

use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager, State};

use crate::media::MediaHub;
use crate::model::{MediaItem, OutputCfg, Settings, Snapshot};
use crate::state::{now_ms, AppState};
use crate::{monitors, store};

pub type Shared = Arc<Mutex<AppState>>;

// ─────────────────────────── 内部工具 ───────────────────────────

fn reachable(hub: &MediaHub, p: &str) -> String {
    if p.is_empty() {
        return String::new();
    }
    hub.allow_and_url(Path::new(p))
}

fn snapshot_of(st: &AppState, hub: &MediaHub) -> Snapshot {
    let mut settings = st.settings.clone();
    for o in &mut settings.outputs {
        if let Some(m) = &mut o.media {
            m.url = reachable(hub, &m.src);
            m.frames = m.frames_src.iter().map(|p| reachable(hub, p)).collect();
        }
    }
    Snapshot {
        settings,
        playback: st.pb.clone(),
        monitors: st.monitors.clone(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

fn push(app: &AppHandle, st: &mut AppState, hub: &MediaHub) -> Snapshot {
    st.sync();
    let s = snapshot_of(st, hub);
    let _ = app.emit("state", &s);
    s
}

fn merge(a: &mut Value, b: Value) {
    match (a, b) {
        (Value::Object(a), Value::Object(b)) => {
            for (k, v) in b {
                match a.get_mut(&k) {
                    Some(slot) => merge(slot, v),
                    None => {
                        a.insert(k, v);
                    }
                }
            }
        }
        (a, b) => *a = b,
    }
}

fn is_video(ext: &str) -> bool {
    matches!(ext, "mp4" | "webm" | "mov" | "ogv" | "m4v")
}

fn file_label(p: &Path) -> String {
    p.file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| p.to_string_lossy().into_owned())
}

// ─────────────────────────── 快照 ───────────────────────────

#[tauri::command]
pub fn get_snapshot(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.monitors = monitors::list(&app);
    snapshot_of(&st, &hub)
}

#[tauri::command]
pub fn list_monitors(app: AppHandle, shared: State<'_, Shared>) -> Vec<crate::model::MonitorInfo> {
    let mons = monitors::list(&app);
    let mut st = shared.lock().unwrap();
    st.monitors = mons.clone();
    mons
}

#[tauri::command]
pub fn app_info(hub: State<'_, Arc<MediaHub>>) -> Value {
    serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "dataDir": store::data_dir().to_string_lossy(),
        "mediaBase": hub.base(),
    })
}

// ─────────────────────────── 设置 ───────────────────────────

#[tauri::command]
pub fn patch(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    patch: Value,
) -> Result<Snapshot, String> {
    let mut st = shared.lock().unwrap();
    let mut base = serde_json::to_value(&st.settings).map_err(|e| e.to_string())?;
    merge(&mut base, patch);
    let new: Settings = serde_json::from_value(base).map_err(|e| format!("参数格式不正确：{e}"))?;
    st.settings = new;
    st.pb.speed = st.settings.speed;
    st.mark_cfg();
    Ok(push(&app, &mut st, &hub))
}

#[tauri::command]
pub fn reset_settings(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    let script = st.settings.script_text.clone();
    let path = st.settings.script_path.clone();
    let speed = st.settings.speed;
    st.settings = Settings::default();
    st.settings.script_text = script;
    st.settings.script_path = path;
    st.settings.speed = speed;
    st.pb.speed = speed;
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

// ─────────────────────────── 文稿 ───────────────────────────

#[tauri::command]
pub fn set_script(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    text: String,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    if st.settings.script_text != text {
        st.settings.script_text = text;
        st.mark_script();
    }
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn open_script(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
) -> Result<Option<Snapshot>, String> {
    let picked = rfd::FileDialog::new()
        .set_title("打开文稿")
        .add_filter("文稿文件", &["txt", "md", "docx", "html", "htm"])
        .add_filter("Word 文档", &["docx"])
        .add_filter("纯文本", &["txt", "md"])
        .add_filter("全部文件", &["*"])
        .pick_file();
    let Some(path) = picked else {
        return Ok(None);
    };

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_ascii_lowercase())
        .unwrap_or_default();

    let text = if ext == "docx" {
        store::docx_to_text(&path)?
    } else {
        let raw = store::read_text_file(&path).map_err(|e| format!("读取失败：{e}"))?;
        if ext == "html" || ext == "htm" {
            store::html_to_text(&raw)
        } else {
            raw
        }
    };

    let mut st = shared.lock().unwrap();
    st.settings.script_text = text;
    st.settings.script_path = Some(path.to_string_lossy().into_owned());
    st.pb.y = 0.0;
    st.pb.elapsed = 0.0;
    st.pb.playing = false;
    st.mark_script();
    st.mark_cfg();
    st.flush_now();
    Ok(Some(push(&app, &mut st, &hub)))
}

#[tauri::command]
pub fn save_script_as(
    shared: State<'_, Shared>,
    default_name: Option<String>,
) -> Result<Option<String>, String> {
    let mut dlg = rfd::FileDialog::new()
        .set_title("文稿另存为")
        .add_filter("文本文件", &["txt"]);
    if let Some(n) = default_name {
        dlg = dlg.set_file_name(n);
    }
    let Some(path) = dlg.save_file() else {
        return Ok(None);
    };
    let text = {
        let st = shared.lock().unwrap();
        st.settings.script_text.clone()
    };
    std::fs::write(&path, text.as_bytes()).map_err(|e| format!("写入失败：{e}"))?;
    let mut st = shared.lock().unwrap();
    st.settings.script_path = Some(path.to_string_lossy().into_owned());
    st.mark_cfg();
    Ok(Some(path.to_string_lossy().into_owned()))
}

// ─────────────────────────── 播放 ───────────────────────────

#[tauri::command]
pub fn set_playing(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    on: bool,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.set_playing(on);
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn set_speed(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    speed: f32,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.set_speed(speed);
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn seek(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    y: f32,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.seek(y);
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn nudge(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    dy: f32,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.nudge(dy);
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn restart(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    st.pb.elapsed = 0.0;
    st.seek(0.0);
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn report_metrics(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    content_h: f32,
    view_h: f32,
) {
    let changed = {
        let mut st = shared.lock().unwrap();
        let c =
            (st.pb.content_h - content_h).abs() > 0.5 || (st.pb.view_h - view_h).abs() > 0.5;
        if c {
            st.pb.content_h = content_h;
            st.pb.view_h = view_h;
            st.clamp_y();
        }
        c
    };
    // 度量变了要广播出去：控制台/监控窗的「剩余时间」以提词屏的真实排版长度为准，
    // 收不到这份数据它们只能退回预览估算，两处数字就会对不上
    if changed {
        broadcast(&app, &shared, &hub);
    }
}

// ─────────────────────────── 输出屏 ───────────────────────────

#[tauri::command]
pub fn add_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    let n = st.settings.outputs.len() + 1;
    let taken: Vec<i32> = st.settings.outputs.iter().map(|o| o.monitor).collect();
    // 默认挑一个还没被占用的显示器
    let mon_total = st.monitors.len() as i32;
    let mut pick = -1;
    for i in 0..mon_total {
        if !taken.contains(&i) {
            pick = i;
            break;
        }
    }
    let cfg = OutputCfg {
        id: format!("o{}", now_ms() as u64),
        name: format!("提词屏 {n}"),
        monitor: pick,
        ..Default::default()
    };
    st.settings.outputs.push(cfg);
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn remove_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Snapshot {
    monitors::close_output(&app, &id);
    let mut st = shared.lock().unwrap();
    st.settings.outputs.retain(|o| o.id != id);
    if st.settings.outputs.is_empty() {
        st.settings.outputs.push(OutputCfg::default());
    }
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn update_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
    patch: Value,
) -> Result<Snapshot, String> {
    {
        let mut st = shared.lock().unwrap();
        let idx = st
            .settings
            .outputs
            .iter()
            .position(|o| o.id == id)
            .ok_or_else(|| "找不到该输出屏".to_string())?;
        let mut base = serde_json::to_value(&st.settings.outputs[idx]).map_err(|e| e.to_string())?;
        merge(&mut base, patch);
        let newcfg: OutputCfg =
            serde_json::from_value(base).map_err(|e| format!("参数格式不正确：{e}"))?;
        st.settings.outputs[idx] = newcfg;
        st.mark_cfg();
    }
    let mut st = shared.lock().unwrap();
    Ok(push(&app, &mut st, &hub))
}

#[tauri::command]
pub async fn open_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Result<Snapshot, String> {
    let cfg = {
        let st = shared.lock().unwrap();
        st.settings
            .outputs
            .iter()
            .find(|o| o.id == id)
            .cloned()
            .ok_or_else(|| "找不到该输出屏".to_string())?
    };
    let mut cfg = cfg;
    cfg.open = true;
    monitors::ensure_output(&app, &cfg)?;
    let mut st = shared.lock().unwrap();
    if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
        o.open = true;
    }
    st.mark_cfg();
    Ok(push(&app, &mut st, &hub))
}

#[tauri::command]
pub fn close_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Snapshot {
    monitors::close_output(&app, &id);
    let mut st = shared.lock().unwrap();
    if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
        o.open = false;
    }
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub async fn place_output(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Result<Snapshot, String> {
    let cfg = {
        let st = shared.lock().unwrap();
        st.settings
            .outputs
            .iter()
            .find(|o| o.id == id)
            .cloned()
            .ok_or_else(|| "找不到该输出屏".to_string())?
    };
    if cfg.open {
        monitors::ensure_output(&app, &cfg)?;
    }
    let mut st = shared.lock().unwrap();
    Ok(push(&app, &mut st, &hub))
}

// ─────────────────────────── 媒体 ───────────────────────────

#[tauri::command]
pub fn pick_media(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Result<Option<Snapshot>, String> {
    let picked = rfd::FileDialog::new()
        .set_title("选择投放素材")
        .add_filter(
            "支持的文件",
            &[
                "png", "jpg", "jpeg", "bmp", "gif", "webp", "mp4", "webm", "mov", "pptx", "ppt",
            ],
        )
        .add_filter("图片", &["png", "jpg", "jpeg", "bmp", "gif", "webp"])
        .add_filter("视频", &["mp4", "webm", "mov"])
        .add_filter("PowerPoint", &["pptx", "ppt"])
        .pick_file();

    let Some(path) = picked else {
        return Ok(None);
    };

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_ascii_lowercase())
        .unwrap_or_default();

    let media = if ext == "pptx" || ext == "ppt" {
        let out = std::env::temp_dir().join(format!("freeprompter_slides_{}", now_ms() as u64));
        let frames = crate::media::export_pptx_frames(&path.to_string_lossy(), &out)?;
        for f in &frames {
            let _ = hub.allow_and_url(f);
        }
        MediaItem {
            src: path.to_string_lossy().into_owned(),
            kind: "slides".into(),
            frames_src: frames.iter().map(|f| f.to_string_lossy().into_owned()).collect(),
            label: file_label(&path),
            url: String::new(),
            frames: Vec::new(),
        }
    } else if is_video(&ext) {
        let _ = hub.allow_and_url(&path);
        MediaItem {
            src: path.to_string_lossy().into_owned(),
            kind: "video".into(),
            frames_src: Vec::new(),
            label: file_label(&path),
            url: String::new(),
            frames: Vec::new(),
        }
    } else {
        let _ = hub.allow_and_url(&path);
        MediaItem {
            src: path.to_string_lossy().into_owned(),
            kind: "image".into(),
            frames_src: Vec::new(),
            label: file_label(&path),
            url: String::new(),
            frames: Vec::new(),
        }
    };

    let mut st = shared.lock().unwrap();
    if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
        o.media = Some(media);
        o.slide = 0;
        o.mode = "media".into();
    }
    st.mark_cfg();
    Ok(Some(push(&app, &mut st, &hub)))
}

#[tauri::command]
pub fn clear_media(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Snapshot {
    let mut st = shared.lock().unwrap();
    if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
        o.media = None;
        o.mode = "text".into();
        o.slide = 0;
    }
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

#[tauri::command]
pub fn slide_step(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
    delta: i32,
) -> Snapshot {
    {
        let mut st = shared.lock().unwrap();
        if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
            let n = o.media.as_ref().map(|m| m.frames_src.len()).unwrap_or(0);
            if n > 0 {
                let cur = o.slide as i32 + delta;
                o.slide = cur.clamp(0, n as i32 - 1) as usize;
            }
        }
        st.mark_cfg();
    }
    let mut st = shared.lock().unwrap();
    push(&app, &mut st, &hub)
}

// ─────────────────────────── 窗口 ───────────────────────────

#[tauri::command]
pub fn win_minimize(window: tauri::WebviewWindow) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn win_toggle_max(window: tauri::WebviewWindow) -> bool {
    let is_max = window.is_maximized().unwrap_or(false);
    if is_max {
        let _ = window.unmaximize();
        false
    } else {
        let _ = window.maximize();
        true
    }
}

#[tauri::command]
pub fn win_close(window: tauri::WebviewWindow) {
    let _ = window.close();
}

// ─────────────────────────── 监控窗 ───────────────────────────

#[tauri::command]
pub async fn open_monitor(app: AppHandle) -> Result<(), String> {
    ensure_monitor(app)
}

// Window creation must run off the synchronous IPC handler on Windows.
// The setup hook may call this directly before the event loop starts.
pub fn ensure_monitor(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("monitor") {
        let _ = w.set_focus();
        return Ok(());
    }
    tauri::WebviewWindowBuilder::new(
        &app,
        "monitor",
        tauri::WebviewUrl::App("monitor.html".into()),
    )
    .title("鲁科影视提词器 · 监控")
    .inner_size(820.0, 620.0)
    .min_inner_size(520.0, 420.0)
    .build()
    .map_err(|e| format!("打开监控窗失败：{e}"))?;
    Ok(())
}

#[tauri::command]
pub fn close_monitor(app: AppHandle) {
    if let Some(w) = app.get_webview_window("monitor") {
        let _ = w.close();
    }
}

/// 输出窗收到 Esc / 关闭请求时，把状态同步回主状态
#[tauri::command]
pub fn output_self_close(
    app: AppHandle,
    shared: State<'_, Shared>,
    hub: State<'_, Arc<MediaHub>>,
    id: String,
) -> Snapshot {
    monitors::close_output(&app, &id);
    let mut st = shared.lock().unwrap();
    if let Some(o) = st.settings.outputs.iter_mut().find(|o| o.id == id) {
        o.open = false;
    }
    st.mark_cfg();
    push(&app, &mut st, &hub)
}

/// 供输出窗上报自己的媒体是否漏了路径（重新允许访问）
#[tauri::command]
pub fn touch_media(hub: State<'_, Arc<MediaHub>>, path: String) -> String {
    reachable(&hub, &path)
}

pub fn shut_down(app: &AppHandle, shared: &Shared) {
    if let Ok(mut st) = shared.lock() {
        st.flush_now();
    }
    app.exit(0);
}

/// 立即向所有窗口广播一次当前状态
pub fn broadcast(app: &AppHandle, shared: &Shared, hub: &MediaHub) {
    if let Ok(mut st) = shared.lock() {
        let _ = push(app, &mut st, hub);
    }
}

/// 启动时恢复上次打开的输出窗
pub fn restore_outputs(app: &AppHandle, shared: &Shared) {
    let cfg_list: Vec<OutputCfg> = {
        let st = shared.lock().unwrap();
        st.settings.outputs.iter().filter(|o| o.open).cloned().collect()
    };
    for cfg in cfg_list {
        if let Err(e) = monitors::ensure_output(app, &cfg) {
            eprintln!("[output] 恢复 {} 失败：{e}", cfg.id);
        }
    }
}

/// 兜底：可用路径
pub fn data_dir() -> PathBuf {
    store::data_dir()
}
