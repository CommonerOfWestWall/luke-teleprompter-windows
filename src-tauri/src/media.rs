//! 本地媒体服务：给 WebView 提供带 Range 支持的本地文件访问
//! （视频 seek 必须走 206 Partial Content，自己起一个比 asset 协议更可控）

use std::collections::HashSet;
use std::fs::File;
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;

pub struct MediaHub {
    pub port: u16,
    /// 白名单：只允许访问用户主动导入过的文件
    allowed: Mutex<HashSet<PathBuf>>,
}

impl MediaHub {
    pub fn start() -> Arc<MediaHub> {
        let listener = TcpListener::bind("127.0.0.1:0").expect("无法绑定本地媒体端口");
        let port = listener.local_addr().map(|a| a.port()).unwrap_or(0);
        let hub = Arc::new(MediaHub {
            port,
            allowed: Mutex::new(HashSet::new()),
        });

        let h = Arc::clone(&hub);
        std::thread::spawn(move || {
            for stream in listener.incoming().flatten() {
                let h2 = Arc::clone(&h);
                std::thread::spawn(move || {
                    let _ = handle(stream, h2);
                });
            }
        });
        hub
    }

    pub fn base(&self) -> String {
        format!("http://127.0.0.1:{}", self.port)
    }

    /// 允许访问某个文件，并返回其 URL
    pub fn allow_and_url(&self, path: &Path) -> String {
        let p = path.to_path_buf();
        if let Ok(mut a) = self.allowed.lock() {
            a.insert(p.clone());
        }
        self.url_for(&p)
    }

    pub fn url_for(&self, path: &Path) -> String {
        let key = URL_SAFE_NO_PAD.encode(path.to_string_lossy().as_bytes());
        format!("{}/f/{}", self.base(), key)
    }

    pub fn is_allowed(&self, path: &Path) -> bool {
        self.allowed
            .lock()
            .map(|a| a.contains(path))
            .unwrap_or(false)
    }
}

fn mime_of(p: &Path) -> &'static str {
    let ext = p
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_ascii_lowercase();
    match ext.as_str() {
        "mp4" | "m4v" => "video/mp4",
        "webm" => "video/webm",
        "ogv" => "video/ogg",
        "mov" => "video/quicktime",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        "svg" => "image/svg+xml",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "m4a" => "audio/mp4",
        _ => "application/octet-stream",
    }
}

fn handle(mut stream: TcpStream, hub: Arc<MediaHub>) -> std::io::Result<()> {
    let mut reader = BufReader::new(stream.try_clone()?);

    let mut request_line = String::new();
    if reader.read_line(&mut request_line)? == 0 {
        return Ok(());
    }
    let mut range_header: Option<String> = None;
    loop {
        let mut line = String::new();
        if reader.read_line(&mut line)? == 0 {
            break;
        }
        let l = line.trim();
        if l.is_empty() {
            break;
        }
        if let Some(v) = l.to_ascii_lowercase().strip_prefix("range:") {
            range_header = Some(v.trim().to_string());
        }
    }

    let target = request_line
        .split_whitespace()
        .nth(1)
        .unwrap_or("/")
        .to_string();

    let key = target
        .trim_start_matches('/')
        .strip_prefix("f/")
        .and_then(|s| s.split('?').next())
        .unwrap_or("");

    let path: Option<PathBuf> = URL_SAFE_NO_PAD
        .decode(key)
        .ok()
        .and_then(|b| String::from_utf8(b).ok())
        .map(PathBuf::from);

    let Some(path) = path else {
        let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n");
        return Ok(());
    };
    if !hub.is_allowed(&path) {
        let _ = stream.write_all(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n");
        return Ok(());
    }

    let mut file = match File::open(&path) {
        Ok(f) => f,
        Err(_) => {
            let _ = stream.write_all(b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n");
            return Ok(());
        }
    };
    let total = file.metadata().map(|m| m.len()).unwrap_or(0);
    let mime = mime_of(&path);

    let mut start = 0u64;
    let mut end = total.saturating_sub(1);
    let mut partial = false;
    if let Some(r) = range_header {
        if let Some(spec) = r.strip_prefix("bytes=") {
            let spec = spec.split(',').next().unwrap_or("");
            let mut it = spec.split('-');
            let a = it.next().unwrap_or("").trim();
            let b = it.next().unwrap_or("").trim();
            if let Ok(v) = a.parse::<u64>() {
                start = v;
                partial = true;
            }
            if !b.is_empty() {
                if let Ok(v) = b.parse::<u64>() {
                    end = v.min(total.saturating_sub(1));
                }
            }
            if start > end || start >= total {
                let _ = stream
                    .write_all(b"HTTP/1.1 416 Range Not Satisfiable\r\nContent-Length: 0\r\n\r\n");
                return Ok(());
            }
        }
    }

    let len = end - start + 1;

    let head = if partial {
        format!(
            "HTTP/1.1 206 Partial Content\r\nContent-Type: {mime}\r\nContent-Length: {len}\r\n\
             Content-Range: bytes {start}-{end}/{total}\r\nAccept-Ranges: bytes\r\n\
             Cache-Control: no-store\r\nConnection: close\r\n\r\n"
        )
    } else {
        format!(
            "HTTP/1.1 200 OK\r\nContent-Type: {mime}\r\nContent-Length: {len}\r\n\
             Accept-Ranges: bytes\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n"
        )
    };
    stream.write_all(head.as_bytes())?;

    file.seek(SeekFrom::Start(start))?;
    let mut remaining = len;
    let mut buf = vec![0u8; 256 * 1024];
    while remaining > 0 {
        let want = remaining.min(buf.len() as u64) as usize;
        let n = file.read(&mut buf[..want])?;
        if n == 0 {
            break;
        }
        stream.write_all(&buf[..n])?;
        remaining -= n as u64;
    }
    let _ = stream.flush();
    Ok(())
}

/// 用 PowerPoint 把 PPT 导出成 PNG 序列（未安装 Office 时返回错误）
pub fn export_pptx_frames(src: &str, out_dir: &Path) -> Result<Vec<PathBuf>, String> {
    std::fs::create_dir_all(out_dir).map_err(|e| e.to_string())?;

    let script_path = out_dir.join("_export.ps1");
    let script = format!(
        r#"$ErrorActionPreference = 'Stop'
$src = '{src}'
$out = '{out}'
if (!(Test-Path $out)) {{ New-Item -ItemType Directory -Path $out -Force | Out-Null }}
Get-ChildItem -Path $out -Filter '*.PNG' -ErrorAction SilentlyContinue | Remove-Item -Force
$ppt = New-Object -ComObject PowerPoint.Application
try {{
  $pres = $ppt.Presentations.Open($src, $true, $false, $false)
  $pres.SaveAs($out, 18, 0)
  $pres.Close()
}} finally {{
  $ppt.Quit()
}}
Write-Output 'OK'
"#,
        src = src.replace('\'', "''"),
        out = out_dir.to_string_lossy().replace('\'', "''")
    );

    // PowerShell 按本地编码读脚本，带 BOM 的 UTF-8 最稳
    let mut buf = Vec::with_capacity(script.len() + 3);
    buf.extend_from_slice(&[0xEF, 0xBB, 0xBF]);
    buf.extend_from_slice(script.as_bytes());
    std::fs::write(&script_path, &buf).map_err(|e| e.to_string())?;

    let out = std::process::Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            &script_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("无法启动 PowerPoint 导出：{e}"))?;

    let _ = std::fs::remove_file(&script_path);

    if !out.status.success() {
        let err = String::from_utf8_lossy(&out.stderr);
        return Err(format!(
            "PPT 导出失败（需要本机安装 PowerPoint）：{}",
            err.lines().take(3).collect::<Vec<_>>().join(" ")
        ));
    }

    let mut frames: Vec<PathBuf> = std::fs::read_dir(out_dir)
        .map_err(|e| e.to_string())?
        .flatten()
        .map(|e| e.path())
        .filter(|p| {
            p.extension()
                .and_then(|e| e.to_str())
                .map(|e| e.eq_ignore_ascii_case("png"))
                .unwrap_or(false)
        })
        .collect();
    frames.sort_by(|a, b| natural_cmp(&a.to_string_lossy(), &b.to_string_lossy()));
    if frames.is_empty() {
        return Err("PPT 导出完成但没有生成图片".into());
    }
    Ok(frames)
}

/// 自然排序：幻灯片2 排在 幻灯片10 前面
fn natural_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    let num = |s: &str| -> Vec<u64> {
        s.split(|c: char| !c.is_ascii_digit())
            .filter_map(|t| t.parse::<u64>().ok())
            .collect()
    };
    num(a).cmp(&num(b))
}
