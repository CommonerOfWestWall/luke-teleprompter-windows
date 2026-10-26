/* ============================================================
   core.js · Tauri 桥 + 全局状态 + 工具
   ============================================================ */
(function () {
  const TAURI = window.__TAURI__;
  if (!TAURI) {
    document.body.innerHTML =
      '<pre style="color:#f66;padding:20px;font:14px monospace">Tauri 运行时未注入，请通过 freeprompter.exe 启动。</pre>';
    return;
  }

  const invoke = TAURI.core.invoke;
  const listen = TAURI.event.listen;

  const subs = [];
  const FP = {
    invoke,
    snap: null,
    ready: false,

    /** 订阅全局状态（立即回调一次当前快照） */
    onState(fn) {
      subs.push(fn);
      if (FP.snap) fn(FP.snap);
    },

    /** 主动拉取最新快照 */
    async refresh() {
      const s = await invoke('get_snapshot');
      FP.snap = s;
      subs.forEach((f) => f(s));
      return s;
    },

    toast(msg, kind) {
      let host = document.getElementById('toast-host');
      if (!host) {
        host = document.createElement('div');
        host.id = 'toast-host';
        document.body.appendChild(host);
      }
      const el = document.createElement('div');
      el.className = 'toast' + (kind ? ' ' + kind : '');
      el.textContent = msg;
      host.appendChild(el);
      setTimeout(() => {
        el.style.transition = 'opacity .2s, transform .2s';
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => el.remove(), 220);
      }, kind === 'err' ? 4200 : 2200);
    },

    async guard(promise, okMsg) {
      try {
        const r = await promise;
        if (okMsg) FP.toast(okMsg, 'ok');
        return r;
      } catch (e) {
        FP.toast(String(e && e.message ? e.message : e), 'err');
        return null;
      }
    },
  };

  // ── 工具 ──
  FP.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  FP.fmt = (sec) => {
    if (!isFinite(sec) || sec < 0) sec = 0;
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  FP.clock = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };

  FP.debounce = (fn, ms) => {
    let t = 0;
    return function (...a) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, a), ms);
    };
  };

  FP.escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 状态事件
  listen('state', (e) => {
    FP.snap = e.payload;
    FP.ready = true;
    subs.forEach((f) => f(e.payload));
  });

  window.FP = FP;

  // 启动
  FP.refresh().catch((e) => {
    console.error(e);
    FP.toast('初始化失败：' + e, 'err');
  });
})();
