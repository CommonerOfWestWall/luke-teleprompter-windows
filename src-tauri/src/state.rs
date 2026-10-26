//! 运行时状态：播放锚点、脏标记

use std::time::{SystemTime, UNIX_EPOCH};

use crate::model::{MonitorInfo, Playback, Settings};

pub fn now_ms() -> f64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs_f64() * 1000.0)
        .unwrap_or(0.0)
}

pub struct AppState {
    pub settings: Settings,
    pub pb: Playback,
    pub monitors: Vec<MonitorInfo>,
    /// 媒体服务端口（0 表示尚未启动）
    pub media_port: u16,
    pub dirty_cfg: bool,
    pub dirty_script: bool,
    pub last_edit_ms: f64,
}

impl AppState {
    pub fn new(settings: Settings) -> Self {
        let mut pb = Playback::default();
        pb.speed = settings.speed;
        pb.anchor_ms = now_ms();
        Self {
            settings,
            pb,
            monitors: Vec::new(),
            media_port: 0,
            dirty_cfg: false,
            dirty_script: false,
            last_edit_ms: 0.0,
        }
    }

    pub fn max_y(&self) -> f32 {
        (self.pb.content_h - self.pb.view_h).max(0.0)
    }

    /// 把滚动位置推进到此刻，并重置时间锚点（每次广播前调用）
    pub fn sync(&mut self) {
        let now = now_ms();
        if self.pb.playing {
            let dt = ((now - self.pb.anchor_ms) / 1000.0).max(0.0) as f32;
            self.pb.y += dt * self.pb.speed;
            self.pb.elapsed += dt;
        }
        self.pb.anchor_ms = now;
        self.clamp_y();
        // 到尾部自动停止
        if self.pb.playing && self.max_y() > 1.0 && self.pb.y >= self.max_y() - 0.5 {
            self.pb.playing = false;
            self.pb.y = self.max_y();
        }
        self.pb.seq = self.pb.seq.wrapping_add(1);
    }

    pub fn clamp_y(&mut self) {
        let max = self.max_y();
        if self.pb.y > max {
            self.pb.y = max;
        }
        if self.pb.y < 0.0 {
            self.pb.y = 0.0;
        }
    }

    pub fn set_playing(&mut self, on: bool) {
        self.sync();
        // 已在尾部还点播放 → 从头开始
        if on && self.max_y() > 1.0 && self.pb.y >= self.max_y() - 0.5 {
            self.pb.y = 0.0;
        }
        self.pb.playing = on;
        self.sync();
    }

    pub fn set_speed(&mut self, v: f32) {
        self.sync();
        let v = v.clamp(5.0, 600.0);
        self.pb.speed = v;
        self.settings.speed = v;
        self.mark_cfg();
    }

    pub fn seek(&mut self, y: f32) {
        self.sync();
        self.pb.y = y;
        self.clamp_y();
        self.sync();
    }

    pub fn nudge(&mut self, dy: f32) {
        self.sync();
        self.pb.y += dy;
        self.clamp_y();
        self.sync();
    }

    pub fn mark_cfg(&mut self) {
        self.dirty_cfg = true;
        self.last_edit_ms = now_ms();
    }

    pub fn mark_script(&mut self) {
        self.dirty_script = true;
        self.last_edit_ms = now_ms();
    }

    /// 节流落盘：停止编辑 800ms 后写一次
    pub fn maybe_flush(&mut self) {
        if !self.dirty_cfg && !self.dirty_script {
            return;
        }
        if now_ms() - self.last_edit_ms < 800.0 {
            return;
        }
        // 内容高度可能还没测出来，但设置仍应保存
        if self.dirty_cfg {
            let _ = crate::store::save_settings(&self.settings);
            self.dirty_cfg = false;
        }
        if self.dirty_script {
            let _ = crate::store::save_last_script(&self.settings.script_text);
            self.dirty_script = false;
        }
    }

    pub fn flush_now(&mut self) {
        if self.dirty_cfg {
            let _ = crate::store::save_settings(&self.settings);
            self.dirty_cfg = false;
        }
        if self.dirty_script {
            let _ = crate::store::save_last_script(&self.settings.script_text);
            self.dirty_script = false;
        }
    }
}
