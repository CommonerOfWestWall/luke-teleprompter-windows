"""把指定标题的窗口置顶/摆位，便于截图验证。仅开发自用。"""
import ctypes
import ctypes.wintypes as wt
import sys
import time

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

user32 = ctypes.windll.user32
EnumWindows = user32.EnumWindows
GetWindowTextW = user32.GetWindowTextW
GetWindowTextLengthW = user32.GetWindowTextLengthW
IsWindowVisible = user32.IsWindowVisible
SetWindowPos = user32.SetWindowPos
SetForegroundWindow = user32.SetForegroundWindow
ShowWindow = user32.ShowWindow
GetWindowRect = user32.GetWindowRect

EnumWindows.argtypes = [ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM), wt.LPARAM]
GetWindowTextW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
SetWindowPos.argtypes = [wt.HWND, wt.HWND, ctypes.c_int, ctypes.c_int,
                         ctypes.c_int, ctypes.c_int, ctypes.c_uint]
GetWindowRect.argtypes = [wt.HWND, ctypes.POINTER(wt.RECT)]

HWND_TOPMOST = -1
SWP_SHOWWINDOW = 0x0040

needle = sys.argv[1] if len(sys.argv) > 1 else "鲁科影视提词器"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 0
H = int(sys.argv[3]) if len(sys.argv) > 3 else 0
X = int(sys.argv[4]) if len(sys.argv) > 4 else 0
Y = int(sys.argv[5]) if len(sys.argv) > 5 else 0

found = []


def cb(hwnd, _):
    if not IsWindowVisible(hwnd):
        return True
    n = GetWindowTextLengthW(hwnd)
    if n <= 0:
        return True
    buf = ctypes.create_unicode_buffer(n + 1)
    GetWindowTextW(hwnd, buf, n + 1)
    t = buf.value
    if needle in t:
        r = wt.RECT()
        GetWindowRect(hwnd, ctypes.byref(r))
        found.append((hwnd, t, r.left, r.top, r.right - r.left, r.bottom - r.top))
    return True


EnumWindows(ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)(cb), 0)

for (hwnd, title, l, t, w, h) in found:
    print(f"hwnd={hwnd} title={title!r} rect=({l},{t},{w},{h})")

if found and W > 0:
    hwnd = found[0][0]
    ShowWindow(hwnd, 9)  # SW_RESTORE
    SetWindowPos(hwnd, HWND_TOPMOST, X, Y, W, H, SWP_SHOWWINDOW)
    SetForegroundWindow(hwnd)
    time.sleep(0.4)
    print("placed")
