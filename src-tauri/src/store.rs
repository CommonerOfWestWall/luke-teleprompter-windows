//! 配置与文稿持久化（便携模式：文件放在 exe 同目录）

use std::fs;
use std::path::{Path, PathBuf};

use crate::model::Settings;

pub const CONFIG_FILE: &str = "freeprompter.json";
pub const SCRIPT_FILE: &str = "last_script.txt";

/// exe 所在目录（绿色版：配置与文稿都放这里）
pub fn data_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
}

pub fn config_path() -> PathBuf {
    data_dir().join(CONFIG_FILE)
}

pub fn script_path() -> PathBuf {
    data_dir().join(SCRIPT_FILE)
}

/// 读取配置；损坏或不存在时返回 None
pub fn load_settings() -> Option<Settings> {
    let bytes = fs::read(config_path()).ok()?;
    let text = decode_bytes(&bytes);
    serde_json::from_str::<Settings>(&text).ok()
}

pub fn save_settings(s: &Settings) -> std::io::Result<()> {
    let json = serde_json::to_string_pretty(s).unwrap_or_else(|_| "{}".into());
    // 先写临时文件再替换，避免断电写出半截文件
    let tmp = config_path().with_extension("json.tmp");
    fs::write(&tmp, json.as_bytes())?;
    fs::rename(&tmp, config_path())
}

pub fn load_last_script() -> Option<String> {
    let bytes = fs::read(script_path()).ok()?;
    let s = decode_bytes(&bytes);
    if s.trim().is_empty() {
        None
    } else {
        Some(s)
    }
}

pub fn save_last_script(text: &str) -> std::io::Result<()> {
    let tmp = script_path().with_extension("txt.tmp");
    fs::write(&tmp, text.as_bytes())?;
    fs::rename(&tmp, script_path())
}

/// 智能解码：BOM → UTF-8 → GB18030 → Big5
pub fn decode_bytes(bytes: &[u8]) -> String {
    if bytes.is_empty() {
        return String::new();
    }
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return String::from_utf8_lossy(&bytes[3..]).into_owned();
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        let (s, _, _) = encoding_rs::UTF_16LE.decode(bytes);
        return s.into_owned();
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        let (s, _, _) = encoding_rs::UTF_16BE.decode(bytes);
        return s.into_owned();
    }
    if let Ok(s) = std::str::from_utf8(bytes) {
        return s.to_string();
    }
    let (s, _, err) = encoding_rs::GB18030.decode(bytes);
    if !err {
        return s.into_owned();
    }
    let (s, _, _) = encoding_rs::BIG5.decode(bytes);
    s.into_owned()
}

pub fn read_text_file(path: &Path) -> std::io::Result<String> {
    let bytes = fs::read(path)?;
    Ok(decode_bytes(&bytes))
}

/// 从 HTML 里抽纯文本（粗略但够用：去掉 script/style，块级标签转换行，消标签，解实体）
pub fn html_to_text(html: &str) -> String {
    let mut s = html.to_string();

    // 去掉 head / script / style
    for tag in ["head", "script", "style"] {
        let open = format!("<{tag}");
        let close = format!("</{tag}>");
        loop {
            let low = s.to_lowercase();
            let Some(a) = low.find(&open) else { break };
            let Some(b) = low.find(&close) else { break };
            s.replace_range(a..b + close.len(), "");
        }
    }

    // 块级标签 → 换行
    let lower = s.to_lowercase();
    let mut out = String::with_capacity(s.len());
    let bytes = s.as_bytes();
    let mut i = 0usize;
    while i < bytes.len() {
        if bytes[i] == b'<' {
            if let Some(end) = s[i..].find('>') {
                let tag_raw = &lower[i + 1..i + end];
                let tag = tag_raw.trim_start_matches('/').trim();
                let is_block = tag.starts_with("p")
                    || tag.starts_with("div")
                    || tag.starts_with("br")
                    || tag.starts_with("h1")
                    || tag.starts_with("h2")
                    || tag.starts_with("h3")
                    || tag.starts_with("h4")
                    || tag.starts_with("li")
                    || tag.starts_with("tr");
                if is_block {
                    out.push('\n');
                }
                i += end + 1;
                continue;
            }
        }
        let ch = s[i..].chars().next().unwrap();
        out.push(ch);
        i += ch.len_utf8();
    }

    // 实体
    let out = out
        .replace("&nbsp;", " ")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&amp;", "&");

    // 压缩多余空行
    let mut lines: Vec<&str> = Vec::new();
    let mut blank = 0;
    for line in out.lines() {
        let t = line.trim();
        if t.is_empty() {
            blank += 1;
            if blank > 1 {
                continue;
            }
        } else {
            blank = 0;
        }
        lines.push(t);
    }
    lines.join("\n").trim().to_string()
}

// ───────────────── Word(.docx) 导入 ─────────────────

/// 读取 .docx（zip + word/document.xml），提取纯文本段落
pub fn docx_to_text(path: &Path) -> Result<String, String> {
    use std::io::Read;

    let file = std::fs::File::open(path).map_err(|e| format!("打不开文件：{e}"))?;
    let mut zip = zip::ZipArchive::new(file).map_err(|e| format!("不是有效的 .docx：{e}"))?;
    let mut xml = String::new();
    zip.by_name("word/document.xml")
        .map_err(|_| "文档结构异常：找不到 word/document.xml".to_string())?
        .read_to_string(&mut xml)
        .map_err(|e| format!("解压失败：{e}"))?;

    let mut out = String::new();
    let mut rest: &str = &xml;

    while let Some(p) = find_tag(rest, "w:p") {
        let after = &rest[p..];
        let p_end = after.find("</w:p>").map(|i| i + 6).unwrap_or(after.len());
        let para = &after[..p_end];
        let text = extract_wt(para);
        out.push_str(&text);
        out.push('\n');
        rest = &after[p_end..];
    }

    // 压缩 3 行以上空行
    let mut lines: Vec<&str> = Vec::new();
    let mut blank = 0;
    for l in out.lines() {
        let t = l.trim_end();
        if t.trim().is_empty() {
            blank += 1;
            if blank > 1 {
                continue;
            }
        } else {
            blank = 0;
        }
        lines.push(t);
    }
    let text = lines.join("\n").trim().to_string();
    if text.is_empty() {
        return Err("这份文档里没有提取到文字（可能是扫描图片或纯表格）".into());
    }
    Ok(text)
}

/// 找 `<prefix` 且紧跟 '>' 或空白的位置（避免把 <w:tabs> 误当成 <w:t>）
fn find_tag(s: &str, prefix: &str) -> Option<usize> {
    let key = format!("<{prefix}");
    let mut i = 0usize;
    while let Some(rel) = s[i..].find(&key) {
        let at = i + rel;
        let next = s[at + key.len()..].chars().next();
        if matches!(next, Some('>') | Some(' ') | Some('/')) {
            return Some(at);
        }
        i = at + key.len();
    }
    None
}

fn extract_wt(para: &str) -> String {
    let mut out = String::new();
    let mut rest = para;
    while let Some(a) = find_tag(rest, "w:t") {
        let after = &rest[a..];
        let Some(gt) = after.find('>') else { break };
        let body = &after[gt + 1..];
        let Some(end) = body.find("</w:t>") else { break };
        out.push_str(&unescape_xml(&body[..end]));
        rest = &body[end + 6..];
    }
    // 段内的软换行与制表符
    out = out.replace('\u{000B}', " ");
    out
}

fn unescape_xml(s: &str) -> String {
    s.replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&apos;", "'")
        .replace("&#xA;", " ")
        .replace("&amp;", "&")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_docx(xml: &str) -> std::path::PathBuf {
        use std::io::Write;
        let mut buf = std::io::Cursor::new(Vec::new());
        {
            let mut zw = zip::ZipWriter::new(&mut buf);
            let opt = zip::write::SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);
            zw.start_file("word/document.xml", opt).unwrap();
            zw.write_all(xml.as_bytes()).unwrap();
            zw.finish().unwrap();
        }
        let p = std::env::temp_dir().join(format!("fp_test_{}.docx", std::process::id()));
        std::fs::write(&p, buf.into_inner()).unwrap();
        p
    }

    #[test]
    fn docx_按段落提取文本() {
        let xml = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t># 新闻播报</w:t></w:r></w:p>
<w:p/>
<w:p><w:r><w:t xml:space="preserve">@男 各位观众晚上好</w:t></w:r><w:r><w:t>，欢迎收看。</w:t></w:r></w:p>
<w:p><w:r><w:t>重点 &amp; 提示 &lt;test&gt;</w:t></w:r></w:p>
</w:body></w:document>"#;
        let p = make_docx(xml);
        let text = docx_to_text(&p).unwrap();
        let _ = std::fs::remove_file(&p);
        assert!(text.contains("# 新闻播报"), "标题丢失：{text}");
        assert!(
            text.contains("@男 各位观众晚上好，欢迎收看。"),
            "同段多 run 未拼接：{text}"
        );
        assert!(text.contains("重点 & 提示 <test>"), "实体未还原：{text}");
        assert!(!text.contains("<w:"), "XML 标签泄漏：{text}");
        assert!(text.lines().count() >= 3, "段落数不对：{text}");
    }

    #[test]
    fn 编码识别_utf8与gb18030与utf16() {
        let s = "@女 晚上好，今天是十月二十三日。";
        let utf8 = s.as_bytes().to_vec();
        assert_eq!(decode_bytes(&utf8), s);

        let (gb, _, _) = encoding_rs::GB18030.encode(s);
        assert_eq!(decode_bytes(&gb), s, "GB18030 识别失败");

        let mut utf16 = vec![0xFF, 0xFE];
        for u in s.encode_utf16() {
            utf16.extend_from_slice(&u.to_le_bytes());
        }
        assert_eq!(decode_bytes(&utf16), s, "UTF-16LE BOM 识别失败");
    }

    #[test]
    fn 配置读写可往返() {
        let s = Settings::default();
        let json = serde_json::to_string_pretty(&s).unwrap();
        let back: Settings = serde_json::from_str(&json).unwrap();
        assert_eq!(back.speed, s.speed);
        assert_eq!(back.outputs.len(), s.outputs.len());
    }
}
