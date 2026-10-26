"""用 PrintWindow 直接从窗口渲染截图（不受其他窗口遮挡影响）。"""
import ctypes
import ctypes.wintypes as wt
import struct
import subprocess
import sys
import time

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32

EnumWindows = user32.EnumWindows
GetWindowTextW = user32.GetWindowTextW
GetWindowTextLengthW = user32.GetWindowTextLengthW
IsWindowVisible = user32.IsWindowVisible
GetWindowRect = user32.GetWindowRect
GetWindowDC = user32.GetWindowDC
ReleaseDC = user32.ReleaseDC
PrintWindow = user32.PrintWindow
ShowWindow = user32.ShowWindow
SetWindowPos = user32.SetWindowPos

EnumWindows.argtypes = [ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM), wt.LPARAM]
GetWindowTextW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
GetWindowRect.argtypes = [wt.HWND, ctypes.POINTER(wt.RECT)]
GetWindowDC.argtypes = [wt.HWND]
PrintWindow.argtypes = [wt.HWND, wt.HDC, wt.UINT]
SetWindowPos.argtypes = [wt.HWND, ctypes.c_void_p, ctypes.c_int, ctypes.c_int,
                         ctypes.c_int, ctypes.c_int, ctypes.c_uint]


class BITMAPINFOHEADER(ctypes.Structure):
    _fields_ = [
        ("biSize", wt.DWORD), ("biWidth", wt.LONG), ("biHeight", wt.LONG),
        ("biPlanes", wt.WORD), ("biBitCount", wt.WORD),
        ("biCompression", wt.DWORD), ("biSizeImage", wt.DWORD),
        ("biXPelsPerMeter", wt.LONG), ("biYPelsPerMeter", wt.LONG),
        ("biClrUsed", wt.DWORD), ("biClrImportant", wt.DWORD),
    ]


def find_window(needle):
    res = []

    def cb(hwnd, _):
        if not IsWindowVisible(hwnd):
            return True
        n = GetWindowTextLengthW(hwnd)
        if n <= 0:
            return True
        buf = ctypes.create_unicode_buffer(n + 1)
        GetWindowTextW(hwnd, buf, n + 1)
        if needle in buf.value:
            res.append((hwnd, buf.value))
        return True

    EnumWindows(ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)(cb), 0)
    return res


def capture(hwnd, out_bmp):
    rect = wt.RECT()
    GetWindowRect(hwnd, ctypes.byref(rect))
    w = rect.right - rect.left
    h = rect.bottom - rect.top
    if w <= 0 or h <= 0:
        raise RuntimeError("窗口尺寸为 0")

    hdc = GetWindowDC(hwnd)
    memdc = gdi32.CreateCompatibleDC(hdc)
    bmp = gdi32.CreateCompatibleBitmap(hdc, w, h)
    gdi32.SelectObject(memdc, bmp)
    ok = PrintWindow(hwnd, memdc, 2)  # PW_RENDERFULLCONTENT

    bi = BITMAPINFOHEADER()
    bi.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bi.biWidth = w
    bi.biHeight = -h
    bi.biPlanes = 1
    bi.biBitCount = 32
    bi.biCompression = 0
    bi.biSizeImage = w * h * 4

    buf = ctypes.create_string_buffer(w * h * 4)
    got = gdi32.GetDIBits(memdc, bmp, 0, h, buf, ctypes.byref(bi), 0)

    gdi32.DeleteObject(bmp)
    gdi32.DeleteDC(memdc)
    ReleaseDC(hwnd, hdc)

    if not got:
        raise RuntimeError("GetDIBits 失败")

    file_hdr = struct.pack("<2sIHHI", b"BM", 14 + 40 + w * h * 4, 0, 0, 54)
    info_hdr = struct.pack("<IiiHHIIiiII", 40, w, -h, 1, 32, 0, w * h * 4, 0, 0, 0, 0)
    with open(out_bmp, "wb") as f:
        f.write(file_hdr + info_hdr + buf.raw)
    return ok, w, h


def main():
    needle = sys.argv[1]
    out = sys.argv[2]
    W = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    H = int(sys.argv[4]) if len(sys.argv) > 4 else 0

    if needle.isdigit():  # 直接给窗口句柄，避免标题前缀撞车
        hwnd, title = int(needle), ""
    else:
        wins = find_window(needle)
        if not wins:
            print("NOT FOUND")
            sys.exit(1)
        hwnd, title = wins[0]

    if W > 0:
        ShowWindow(hwnd, 9)
        SetWindowPos(hwnd, ctypes.c_void_p(-1), 0, 0, W, H, 0x0040)
        time.sleep(0.6)

    bmp = out.replace(".png", ".bmp")
    ok, w, h = capture(hwnd, bmp)
    subprocess.run(["ffmpeg", "-y", "-i", bmp, out], capture_output=True)
    print(f"ok hwnd={hwnd} {w}x{h} printwindow={ok} -> {out}")


if __name__ == "__main__":
    main()
