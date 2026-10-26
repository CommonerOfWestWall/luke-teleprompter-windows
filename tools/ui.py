"""按窗口相对坐标点击 / 键盘输入 / 列出窗口，用于自动化验收。"""
import ctypes
import ctypes.wintypes as wt
import sys
import time

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

u = ctypes.windll.user32
u.EnumWindows.argtypes = [ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM), wt.LPARAM]
u.GetWindowTextW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
u.GetWindowRect.argtypes = [wt.HWND, ctypes.POINTER(wt.RECT)]
u.SetForegroundWindow.argtypes = [wt.HWND]


def find(needle):
    res = []

    def cb(hwnd, _):
        if not u.IsWindowVisible(hwnd):
            return True
        n = u.GetWindowTextLengthW(hwnd)
        if n <= 0:
            return True
        buf = ctypes.create_unicode_buffer(n + 1)
        u.GetWindowTextW(hwnd, buf, n + 1)
        if needle in buf.value:
            res.append((hwnd, buf.value))
        return True

    u.EnumWindows(ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)(cb), 0)
    return res


def rect(hwnd):
    r = wt.RECT()
    u.GetWindowRect(hwnd, ctypes.byref(r))
    return r.left, r.top, r.right - r.left, r.bottom - r.top


def client_box(hwnd):
    """客户区在屏幕上的位置与尺寸（无边框窗口的窗口矩形会含隐藏缩放边距）。"""
    cr = wt.RECT()
    u.GetClientRect(hwnd, ctypes.byref(cr))
    pt = wt.POINT(0, 0)
    u.ClientToScreen(hwnd, ctypes.byref(pt))
    return pt.x, pt.y, cr.right - cr.left, cr.bottom - cr.top


SWP_NOMOVE = 0x0002
SWP_NOSIZE = 0x0001
SWP_NOACTIVATE = 0x0010


KEEP_TOP = []


def raise_win(hwnd):
    """置顶，确保窗口在最上层（SetForegroundWindow 常被系统拒绝）。"""
    u.SetWindowPos(hwnd, -1, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE)
    if hwnd not in KEEP_TOP:
        # 测试期间保持置顶，否则会被其他 Chromium 窗口盖住导致点击打偏
        KEEP_TOP.append(hwnd)
    u.BringWindowToTop(hwnd)
    u.SetForegroundWindow(hwnd)
    time.sleep(0.3)


def click(hwnd, rx, ry):
    x, y, w, h = client_box(hwnd)
    px, py = int(x + rx * w), int(y + ry * h)
    raise_win(hwnd)
    u.SetCursorPos(px, py)
    time.sleep(0.08)
    u.mouse_event(2, 0, 0, 0, 0)  # LEFTDOWN
    time.sleep(0.05)
    u.mouse_event(4, 0, 0, 0, 0)  # LEFTUP
    print(f"click ({rx:.4f},{ry:.4f}) -> {px},{py}")


def drag(hwnd, rx1, ry1, rx2, ry2, steps=18):
    x, y, w, h = client_box(hwnd)
    x1, y1 = int(x + rx1 * w), int(y + ry1 * h)
    x2, y2 = int(x + rx2 * w), int(y + ry2 * h)
    raise_win(hwnd)
    u.SetCursorPos(x1, y1)
    time.sleep(0.1)
    u.mouse_event(2, 0, 0, 0, 0)
    for i in range(1, steps + 1):
        u.SetCursorPos(int(x1 + (x2 - x1) * i / steps), int(y1 + (y2 - y1) * i / steps))
        time.sleep(0.012)
    u.mouse_event(4, 0, 0, 0, 0)
    print(f"drag ({rx1:.3f},{ry1:.3f}) -> ({rx2:.3f},{ry2:.3f})")


def type_text(s):
    for ch in s:
        if ch == "\n":
            u.keybd_event(13, 0, 0, 0)
            u.keybd_event(13, 0, 2, 0)
        else:
            # KEYEVENTF_UNICODE
            u.keybd_event(0, ord(ch), 4, 0)
            u.keybd_event(0, ord(ch), 4 | 2, 0)
        time.sleep(0.01)
    print(f"typed {len(s)} chars")


def key(vk, times=1):
    for _ in range(times):
        u.keybd_event(vk, 0, 0, 0)
        u.keybd_event(vk, 0, 2, 0)
        time.sleep(0.03)
    print(f"key {vk} x{times}")



def post_click(hwnd, rx, ry):
    """直接向窗口内的 Chromium 渲染子窗投递鼠标消息（前台抢不到时的备用方案）。"""
    x, y, w, h = client_box(hwnd)
    cx, cy = int(rx * w), int(ry * h)
    # 找到覆盖该点的子窗口（不受窗口叠放影响）
    u.RealChildWindowFromPoint.restype = wt.HWND
    u.RealChildWindowFromPoint.argtypes = [wt.HWND, wt.POINT]
    child = u.RealChildWindowFromPoint(hwnd, wt.POINT(cx, cy))
    if not child:
        child = hwnd
    lp = (cy << 16) | (cx & 0xFFFF)
    u.PostMessageW(child, 0x0200, 0, lp)          # WM_MOUSEMOVE
    u.PostMessageW(child, 0x0201, 1, lp)          # WM_LBUTTONDOWN
    u.PostMessageW(child, 0x0202, 0, lp)          # WM_LBUTTONUP
    buf = ctypes.create_unicode_buffer(128)
    u.GetClassNameW(child, buf, 128)
    print(f"post_click -> child={child} cls={buf.value} at ({cx},{cy})")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "list":
        for hwnd, title in find(sys.argv[2] if len(sys.argv) > 2 else ""):
            print(hwnd, rect(hwnd), "client", client_box(hwnd), title)
    elif cmd == "click":
        hwnd, _ = find(sys.argv[2])[0]
        click(hwnd, float(sys.argv[3]), float(sys.argv[4]))
    elif cmd == "drag":
        hwnd, _ = find(sys.argv[2])[0]
        drag(hwnd, float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6]))
    elif cmd == "type":
        hwnd, _ = find(sys.argv[2])[0]
        raise_win(hwnd)
        type_text(sys.argv[3])
    elif cmd == "pclick":
        hwnd, _ = find(sys.argv[2])[0]
        post_click(hwnd, float(sys.argv[3]), float(sys.argv[4]))
    elif cmd == "key":
        hwnd, _ = find(sys.argv[2])[0]
        raise_win(hwnd)
        key(int(sys.argv[3]), int(sys.argv[4]) if len(sys.argv) > 4 else 1)
