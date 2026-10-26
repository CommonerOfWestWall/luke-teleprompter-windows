//! 数据模型：设置、角色、输出屏、播放状态

use serde::{Deserialize, Serialize};

fn d_true() -> bool {
    true
}
fn d_speed() -> f32 {
    60.0
}
fn d_font_size() -> f32 {
    72.0
}
fn d_line_height() -> f32 {
    1.5
}
fn d_para_gap() -> f32 {
    0.8
}
fn d_padding_x() -> f32 {
    8.0
}
fn d_anchor_y() -> f32 {
    50.0
}
fn d_info_size() -> f32 {
    26.0
}
fn d_weight() -> u32 {
    700
}

/// 文本角色：一段台词归属谁，决定字色/字号/字重
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Role {
    pub id: String,
    pub name: String,
    /// 行首标记，例如 "@男"
    pub tag: String,
    pub color: String,
    /// 相对字号倍率
    pub scale: f32,
    pub bold: bool,
}

impl Role {
    pub fn default_roles() -> Vec<Role> {
        vec![
            Role {
                id: "male".into(),
                name: "男声".into(),
                tag: "@男".into(),
                color: "#7dd3fc".into(),
                scale: 1.0,
                bold: false,
            },
            Role {
                id: "female".into(),
                name: "女声".into(),
                tag: "@女".into(),
                color: "#fda4af".into(),
                scale: 1.0,
                bold: false,
            },
            Role {
                id: "extra".into(),
                name: "配角".into(),
                tag: "@配".into(),
                color: "#86efac".into(),
                scale: 0.92,
                bold: false,
            },
        ]
    }
}

/// 媒体素材（图片 / 视频 / PPT 导出的图片序列）
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct MediaItem {
    /// 本地绝对路径（持久化用）
    pub src: String,
    /// image | video | slides
    pub kind: String,
    /// slides 模式下由 PPT 导出的一串本地图片路径
    pub frames_src: Vec<String>,
    pub label: String,
    /// 运行时填充：可被 WebView 访问的 URL
    pub url: String,
    /// 运行时填充：slides 各页 URL
    pub frames: Vec<String>,
}

/// 一个输出屏（提词屏 / 素材屏），可独立绑定显示器与镜像方向
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct OutputCfg {
    pub id: String,
    pub name: String,
    /// 显示器索引，-1 表示未绑定
    pub monitor: i32,
    /// text | media
    pub mode: String,
    pub mirror_h: bool,
    pub mirror_v: bool,
    /// 字号倍率
    pub scale: f32,
    pub show_info: bool,
    pub fullscreen: bool,
    pub media: Option<MediaItem>,
    /// slides 模式当前页
    pub slide: usize,
    /// 视频是否循环
    pub loop_video: bool,
    /// 锁定位置（现场防误拖、防误关）
    pub locked: bool,
    /// 窗口化时记住的位置与尺寸（0 表示未记录）
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
    /// 是否处于打开状态（重启后自动恢复）
    pub open: bool,
}

impl Default for OutputCfg {
    fn default() -> Self {
        Self {
            id: "main".into(),
            name: "提词屏 1".into(),
            monitor: -1,
            mode: "text".into(),
            mirror_h: true,
            mirror_v: false,
            scale: 1.0,
            show_info: true,
            fullscreen: true,
            media: None,
            slide: 0,
            loop_video: false,
            locked: false,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            open: false,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    // ── 外观 ──
    pub theme_id: String,
    pub bg: String,
    pub fg: String,
    pub title_color: String,
    pub cue_color: String,
    pub note_color: String,

    // ── 排版 ──
    pub font_family: String,
    pub font_size: f32,
    pub font_weight: u32,
    pub line_height: f32,
    pub para_gap: f32,
    pub padding_x: f32,
    pub anchor_y: f32,
    /// left | center
    pub align: String,
    /// 字号随屏幕高度等比缩放（以 1080p 为基准）
    pub auto_scale: bool,

    // ── 镜像 ──
    pub mirror_h: bool,
    pub mirror_v: bool,

    // ── 信息栏 ──
    pub show_clock: bool,
    pub show_elapsed: bool,
    pub show_remaining: bool,
    pub show_speed: bool,
    pub show_progress: bool,
    pub info_size: f32,
    pub info_color: String,
    pub info_top: bool,
    pub info_bottom: bool,

    // ── 辅助 ──
    pub show_guide: bool,
    /// triangle | invert；show_guide 为关闭总开关，兼容旧配置。
    pub guide_mode: String,
    /// 仅边缘三角使用透明度；反色始终保持完整对比度。
    pub guide_opacity: f32,
    /// 1080px 逻辑视口下的三角高度。
    pub guide_size: f32,
    pub show_fade: bool,

    // ── 滚动 ──
    pub speed: f32,
    pub roles: Vec<Role>,

    // ── 输出屏 ──
    pub outputs: Vec<OutputCfg>,

    // ── 文稿 ──
    pub script_text: String,
    pub script_path: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme_id: "noir".into(),
            bg: "#000000".into(),
            fg: "#f5f5f5".into(),
            title_color: "#fbbf24".into(),
            cue_color: "#60a5fa".into(),
            note_color: "#94a3b8".into(),

            font_family: String::new(),
            font_size: d_font_size(),
            font_weight: d_weight(),
            line_height: d_line_height(),
            para_gap: d_para_gap(),
            padding_x: d_padding_x(),
            anchor_y: d_anchor_y(),
            align: "center".into(),
            auto_scale: true,

            mirror_h: d_true(),
            mirror_v: false,

            show_clock: d_true(),
            show_elapsed: d_true(),
            show_remaining: d_true(),
            show_speed: d_true(),
            show_progress: false,
            info_size: d_info_size(),
            info_color: "#9ca3af".into(),
            info_top: false,
            info_bottom: d_true(),

            show_guide: true,
            guide_mode: "triangle".into(),
            guide_opacity: 65.0,
            guide_size: 16.0,
            show_fade: d_true(),

            speed: d_speed(),
            roles: Role::default_roles(),
            outputs: vec![OutputCfg::default()],

            script_text: String::new(),
            script_path: None,
        }
    }
}

/// 播放内核：位置 + 速度 + 时间锚点。
/// 前端按 `y + (now - anchorMs) * speed` 本地插值，避免每帧 IPC。
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Playback {
    pub playing: bool,
    pub y: f32,
    pub speed: f32,
    pub anchor_ms: f64,
    /// 内容总高（由提词窗回填）
    pub content_h: f32,
    /// 视口高（由提词窗回填）
    pub view_h: f32,
    /// 当前段落索引（由前端回填，用于跳段高亮）
    pub segment: i32,
    /// 累计播放时长（秒）
    pub elapsed: f32,
    /// 每次状态变更自增，前端据此重置本地锚点
    pub seq: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MonitorInfo {
    pub index: usize,
    pub name: String,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub scale: f32,
    pub primary: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub settings: Settings,
    pub playback: Playback,
    pub monitors: Vec<MonitorInfo>,
    pub version: String,
}

/// 设置补丁：只带需要改的字段
pub type Patch = serde_json::Value;

#[cfg(test)]
mod guide_tests {
    use super::Settings;

    #[test]
    fn legacy_guide_switch_and_position_are_preserved() {
        let old: Settings = serde_json::from_str(r#"{"showGuide":false,"anchorY":34}"#).unwrap();
        assert!(!old.show_guide);
        assert_eq!(old.anchor_y, 34.0);
        assert_eq!(old.guide_mode, "triangle");
        assert_eq!(old.guide_opacity, 65.0);
        assert_eq!(old.guide_size, 16.0);
        let enabled: Settings = serde_json::from_str(r#"{"showGuide":true}"#).unwrap();
        assert!(enabled.show_guide);
        assert_eq!(enabled.guide_mode, "triangle");
    }

    #[test]
    fn reading_guide_settings_round_trip() {
        let settings: Settings = serde_json::from_str(
            r#"{"showGuide":true,"guideMode":"invert","guideOpacity":30,"guideSize":24,"anchorY":56}"#,
        ).unwrap();
        let saved = serde_json::to_value(&settings).unwrap();
        assert_eq!(saved["guideMode"], "invert");
        let restored: Settings = serde_json::from_value(saved).unwrap();
        assert_eq!(restored, settings);
    }

    #[test]
    fn new_install_uses_subtle_centered_guide() {
        let settings = Settings::default();
        assert!(settings.show_guide);
        assert_eq!(settings.guide_mode, "triangle");
        assert_eq!(settings.anchor_y, 50.0);
    }
}
