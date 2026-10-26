//! 显示器枚举与输出窗定位（Tauri 用物理像素，跨屏定位比 winit 简单可靠）

use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize};

use crate::model::{MonitorInfo, OutputCfg};

pub const OUTPUT_PREFIX: &str = "out-";

pub fn output_label(id: &str) -> String {
    format!("{OUTPUT_PREFIX}{id}")
}

pub fn list(app: &AppHandle) -> Vec<MonitorInfo> {
    let mut out = Vec::new();
    let primary_pos = app.primary_monitor().ok().flatten().map(|m| *m.position());
    if let Ok(mons) = app.available_monitors() {
        for (i, m) in mons.iter().enumerate() {
            let pos = *m.position();
            out.push(MonitorInfo {
                index: i,
                name: m
                    .name()
                    .cloned()
                    .unwrap_or_else(|| format!("显示器 {}", i + 1)),
                x: pos.x,
                y: pos.y,
                width: m.size().width,
                height: m.size().height,
                scale: m.scale_factor() as f32,
                primary: primary_pos
                    .map(|p| p.x == pos.x && p.y == pos.y)
                    .unwrap_or(i == 0),
            });
        }
    }
    out
}

/// 创建（如需要）并把输出窗摆到目标显示器
pub fn ensure_output(app: &AppHandle, cfg: &OutputCfg) -> Result<(), String> {
    let label = output_label(&cfg.id);
    if app.get_webview_window(&label).is_none() {
        let url = tauri::WebviewUrl::App(format!("prompter.html?out={}", cfg.id).into());
        let win = tauri::WebviewWindowBuilder::new(app, &label, url)
            .title(format!("鲁科影视提词器 · {}", cfg.name))
            .decorations(false)
            .skip_taskbar(true)
            .visible(false)
            .inner_size(1280.0, 720.0)
            .build()
            .map_err(|e| format!("创建输出窗失败：{e}"))?;
        let _ = win.set_always_on_top(false);
    }
    place(app, cfg)?;
    if let Some(win) = app.get_webview_window(&label) {
        let _ = win.show();
    }
    Ok(())
}

/// 把已有输出窗摆到目标显示器（切屏 / 改全屏状态时用）
pub fn place(app: &AppHandle, cfg: &OutputCfg) -> Result<(), String> {
    let label = output_label(&cfg.id);
    let win = app
        .get_webview_window(&label)
        .ok_or_else(|| "输出窗尚未创建".to_string())?;

    let mons = app.available_monitors().map_err(|e| e.to_string())?;

    // 必须先退出全屏，否则 set_position 会被忽略
    let _ = win.set_fullscreen(false);

    if mons.is_empty() {
        return Ok(());
    }
    // 未绑定时落到主显示器，避免「点了投放却留在系统默认位置」
    let idx = if cfg.monitor >= 0 && (cfg.monitor as usize) < mons.len() {
        cfg.monitor as usize
    } else {
        mons.iter().position(|m| {
            let p = *m.position();
            app.primary_monitor()
                .ok()
                .flatten()
                .map(|pm| *pm.position() == p)
                .unwrap_or(false)
        })
        .unwrap_or(0)
    };
    let m = &mons[idx];

    if !cfg.fullscreen {
        // 窗口化：优先还原上次记住的位置与尺寸
        if cfg.w >= 200 && cfg.h >= 150 {
            win.set_position(PhysicalPosition::new(cfg.x, cfg.y))
                .map_err(|e| e.to_string())?;
            win.set_size(PhysicalSize::new(cfg.w, cfg.h))
                .map_err(|e| e.to_string())?;
        } else {
            // 首次窗口化：放到该显示器中央，占七成
            let sw = m.size().width;
            let sh = m.size().height;
            let w = ((sw as f64) * 0.7) as u32;
            let h = ((sh as f64) * 0.7) as u32;
            let x = m.position().x + (((sw - w) / 2) as i32);
            let y = m.position().y + (((sh - h) / 2) as i32);
            win.set_position(PhysicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
            win.set_size(PhysicalSize::new(w, h))
                .map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    win.set_position(PhysicalPosition::new(m.position().x, m.position().y))
        .map_err(|e| e.to_string())?;
    win.set_size(PhysicalSize::new(m.size().width, m.size().height))
        .map_err(|e| e.to_string())?;
    win.set_fullscreen(true).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn close_output(app: &AppHandle, id: &str) {
    if let Some(win) = app.get_webview_window(&output_label(id)) {
        let _ = win.close();
    }
}

pub fn focus_output(app: &AppHandle, id: &str) {
    if let Some(win) = app.get_webview_window(&output_label(id)) {
        let _ = win.set_focus();
    }
}
