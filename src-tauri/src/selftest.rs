//! 自检通道：`freeprompter.exe --selftest`
//!
//! 直接走与界面完全相同的后端路径，验证「投放 / 移动 / 记住位置 / 全屏 / 锁定 / 落盘」，
//! 结果打印到 stdout，便于无人工干预的回归验收。

use std::thread::sleep;
use std::time::Duration;

use tauri::{AppHandle, Manager};

use crate::commands::Shared;
use crate::model::OutputCfg;
use crate::monitors;

fn ok(cond: bool, name: &str, detail: &str) -> bool {
    println!("{} {name}  {detail}", if cond { "  [PASS]" } else { "  [FAIL]" });
    cond
}

/// 取输出窗当前真实几何（物理像素）
fn geom(app: &AppHandle, id: &str) -> Option<(i32, i32, u32, u32, bool)> {
    let win = app.get_webview_window(&monitors::output_label(id))?;
    let pos = win.outer_position().ok()?;
    let size = win.inner_size().ok()?;
    let fs = win.is_fullscreen().unwrap_or(false);
    Some((pos.x, pos.y, size.width, size.height, fs))
}

pub fn run(app: AppHandle, shared: Shared) {
    std::thread::spawn(move || {
        sleep(Duration::from_millis(1600));
        println!("\n=== 鲁科影视提词器 自检 ===");
        let mut fails = 0;

        // 1) 显示器
        let mons = monitors::list(&app);
        println!("显示器 {} 台：", mons.len());
        for m in &mons {
            println!(
                "  #{}{} {} {}x{} @{} scale={}",
                m.index,
                if m.primary { "（主）" } else { "" },
                m.name,
                m.width,
                m.height,
                format!("({},{})", m.x, m.y),
                m.scale
            );
        }
        if mons.is_empty() {
            println!("  [SKIP] 没有可用显示器，后续窗口测试跳过");
            println!("=== 自检结束（跳过）===\n");
            app.exit(0);
            return;
        }
        let m0 = mons[0].clone();

        // 2) 准备一个输出屏：绑定 0 号显示器、窗口化、初始位置故意清空
        let id = {
            let mut st = shared.lock().unwrap();
            if st.settings.outputs.is_empty() {
                st.settings.outputs.push(OutputCfg {
                    id: "selftest".into(),
                    ..Default::default()
                });
            }
            let o = &mut st.settings.outputs[0];
            o.monitor = 0;
            o.fullscreen = false;
            o.x = 0;
            o.y = 0;
            o.w = 0;
            o.h = 0;
            o.open = true;
            let out_id = o.id.clone();
            st.mark_cfg();
            out_id
        };

        // 3) 投放（首次窗口化应落在显示器中央、占七成）
        let cfg = {
            let st = shared.lock().unwrap();
            st.settings.outputs[0].clone()
        };
        if let Err(e) = monitors::ensure_output(&app, &cfg) {
            fails += 1;
            println!("  [FAIL] 投放失败：{e}");
        }
        sleep(Duration::from_millis(700));
        if let Some((x, y, w, h, fs)) = geom(&app, &id) {
            println!("  首次投放几何：pos=({x},{y}) size={w}x{h} fullscreen={fs}");
            let exp_w = (m0.width as f64 * 0.7) as u32;
            let exp_h = (m0.height as f64 * 0.7) as u32;
            fails += if ok(!fs, "窗口化投放（非全屏）", "") { 0 } else { 1 };
            fails += if ok(
                (w as i64 - exp_w as i64).abs() < 8 && (h as i64 - exp_h as i64).abs() < 8,
                "首次窗口化占屏七成",
                &format!("期望约 {exp_w}x{exp_h}"),
            ) {
                0
            } else {
                1
            };
            fails += if ok(
                x >= m0.x && y >= m0.y,
                "落在绑定显示器范围内",
                &format!("显示器起点 ({},{})", m0.x, m0.y),
            ) {
                0
            } else {
                1
            };
        } else {
            fails += 1;
            println!("  [FAIL] 找不到输出窗");
        }

        // 4) 移动窗口 → 应自动回写配置（下次还原）
        if let Some(win) = app.get_webview_window(&monitors::output_label(&id)) {
            let _ = win.set_position(tauri::PhysicalPosition::new(m0.x + 150, m0.y + 120));
            sleep(Duration::from_millis(600));
            let (x, y) = {
                let st = shared.lock().unwrap();
                let o = &st.settings.outputs[0];
                (o.x, o.y)
            };
            println!("  移动到 ({},{}) 后配置记录 ({x},{y})", m0.x + 150, m0.y + 120);
            fails += if ok(
                (x - (m0.x + 150)).abs() <= 4 && (y - (m0.y + 120)).abs() <= 4,
                "移动位置被记住",
                "",
            ) {
                0
            } else {
                1
            };

            let _ = win.set_size(tauri::PhysicalSize::new(1280, 720));
            sleep(Duration::from_millis(600));
            let (cw, ch) = {
                let st = shared.lock().unwrap();
                let o = &st.settings.outputs[0];
                (o.w, o.h)
            };
            println!("  改尺寸 1280x720 后配置记录 {cw}x{ch}");
            fails += if ok(
                (cw as i64 - 1280).abs() <= 8 && (ch as i64 - 720).abs() <= 8,
                "窗口尺寸被记住",
                "",
            ) {
                0
            } else {
                1
            };
        }

        // 5) 切全屏
        {
            let mut st = shared.lock().unwrap();
            st.settings.outputs[0].fullscreen = true;
            st.mark_cfg();
        }
        let cfg = {
            let st = shared.lock().unwrap();
            st.settings.outputs[0].clone()
        };
        let _ = monitors::place(&app, &cfg);
        sleep(Duration::from_millis(700));
        if let Some((x, y, w, h, fs)) = geom(&app, &id) {
            println!("  全屏几何：pos=({x},{y}) size={w}x{h} fullscreen={fs}");
            fails += if ok(fs, "切全屏成功", "") { 0 } else { 1 };
            fails += if ok(
                (w as i64 - m0.width as i64).abs() < 8 && (h as i64 - m0.height as i64).abs() < 8,
                "全屏尺寸铺满显示器",
                &format!("期望 {}x{}", m0.width, m0.height),
            ) {
                0
            } else {
                1
            };
        }

        // 6) 退出全屏 → 应还原到步骤 4 记住的 (150,120) / 1280x720
        {
            let mut st = shared.lock().unwrap();
            st.settings.outputs[0].fullscreen = false;
            st.mark_cfg();
        }
        let cfg = {
            let st = shared.lock().unwrap();
            st.settings.outputs[0].clone()
        };
        let _ = monitors::place(&app, &cfg);
        sleep(Duration::from_millis(700));
        if let Some((x, y, w, h, fs)) = geom(&app, &id) {
            println!("  退出全屏几何：pos=({x},{y}) size={w}x{h} fullscreen={fs}");
            fails += if ok(
                !fs
                    && (x - (m0.x + 150)).abs() <= 6
                    && (y - (m0.y + 120)).abs() <= 6
                    && (w as i64 - 1280).abs() <= 8,
                "退出全屏后还原上次窗口位置与尺寸",
                "",
            ) {
                0
            } else {
                1
            };
        }

        // 7) 锁定状态落盘
        {
            let mut st = shared.lock().unwrap();
            st.settings.outputs[0].locked = true;
            st.mark_cfg();
            st.flush_now();
        }
        let saved = crate::store::load_settings();
        match saved {
            Some(s) => {
                let o = s.outputs.first();
                let (lk, mon, fs) = o
                    .map(|o| (o.locked, o.monitor, o.fullscreen))
                    .unwrap_or((false, -9, true));
                println!("  落盘内容：locked={lk} monitor={mon} fullscreen={fs}");
                fails += if ok(lk && mon == 0 && !fs, "锁定/绑定/全屏状态已写入配置", "") {
                    0
                } else {
                    1
                };
            }
            None => {
                fails += 1;
                println!("  [FAIL] 配置文件读不出来");
            }
        }

        println!(
            "\n=== 自检结束：{} 通过，{} 失败 ===\n",
            if fails == 0 { "全部" } else { "部分" },
            fails
        );
        sleep(Duration::from_millis(300));
        app.exit(if fails == 0 { 0 } else { 3 });
    });
}
