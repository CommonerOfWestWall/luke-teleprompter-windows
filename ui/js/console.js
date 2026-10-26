/* ============================================================
   console.js · 控制台
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const ta = $('scriptInput');
  const ln = $('lineNumbers');
  const tabBody = $('tabBody');
  const previewGuide = FPReadingGuide.create({ root: $('pvRoot'), track: $('pvTrack'), layer: $('pvGuide') });

  let S = null;
  let PB = null;
  let parsed = { blocks: [], segments: [] };
  let lastParseKey = '';
  let currentTab = 'look';
  let panelKey = '';
  let pvMirror = false; // 预览默认正向，可手动切镜像
  let MONITORS = [];
  let panelOpen = false;
  let previewLocal = { y: 0, speed: 0, playing: false, elapsed: 0, key: '' };
  let lastLayoutKey = '';

  const esc = (value) => String(value == null ? '' : value).replace(/[&<>\"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  // ── 主题预设 ──
  const THEMES = [
    { id: 'noir', n: '曜石', bg: '#000000', fg: '#f5f5f5', t: '#fbbf24', c: '#60a5fa', nt: '#94a3b8' },
    { id: 'amber', n: '琥珀', bg: '#000000', fg: '#ffc75a', t: '#ffffff', c: '#ff9f43', nt: '#a17836' },
    { id: 'deep', n: '深海', bg: '#001428', fg: '#dbeafe', t: '#7dd3fc', c: '#38bdf8', nt: '#64748b' },
    { id: 'high', n: '高对比', bg: '#000000', fg: '#ffffff', t: '#ffff00', c: '#00e5ff', nt: '#9e9e9e' },
    { id: 'paper', n: '白底', bg: '#ffffff', fg: '#141414', t: '#b45309', c: '#1d4ed8', nt: '#6b7280' },
    { id: 'cream', n: '米黄', bg: '#f6f1e4', fg: '#2b2620', t: '#9a3412', c: '#1e40af', nt: '#78716c' },
    { id: 'stage', n: '幕绿', bg: '#04331f', fg: '#e8fff5', t: '#7dffb0', c: '#5eead4', nt: '#5f8f78' },
    { id: 'rose', n: '暗红', bg: '#1c0507', fg: '#ffe4e6', t: '#fda4af', c: '#f472b6', nt: '#9f6b74' },
  ];

  const FONTS = [
    { v: '', n: '系统默认（微软雅黑）' },
    { v: 'Microsoft YaHei', n: '微软雅黑' },
    { v: 'SimHei', n: '黑体' },
    { v: 'SimSun', n: '宋体' },
    { v: 'KaiTi', n: '楷体' },
    { v: 'DengXian', n: '等线' },
    { v: '方正兰亭黑', n: '方正兰亭黑（需已安装）' },
    { v: 'Source Han Sans SC', n: '思源黑体（需已安装）' },
    { v: 'Arial', n: 'Arial（英文）' },
    { v: 'Georgia', n: 'Georgia（英文衬线）' },
  ];

  // ── 工具 ──
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function getPath(o, p) {
    return p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  }

  let pending = {};
  let patchTimer = 0;
  function patch(obj) {
    Object.assign(pending, obj);
    clearTimeout(patchTimer);
    patchTimer = setTimeout(() => {
      const p = pending;
      pending = {};
      FP.invoke('patch', { patch: p }).catch((e) => FP.toast(String(e), 'err'));
    }, 45);
  }
  function patchNow(obj) {
    Object.assign(pending, obj);
    clearTimeout(patchTimer);
    patchTimer = setTimeout(() => {
      const p = pending;
      pending = {};
      FP.invoke('patch', { patch: p }).catch((e) => FP.toast(String(e), 'err'));
    }, 0);
  }

  // ── 编辑器 ──
  function updateLineNumbers() {
    const n = ta.value.split('\n').length;
    let s = '';
    for (let i = 1; i <= n; i++) s += i + '\n';
    ln.textContent = s;
  }

  const pushScript = FP.debounce((text) => {
    FP.invoke('set_script', { text }).catch(() => {});
  }, 220);

  ta.addEventListener('input', () => {
    updateLineNumbers();
    pushScript(ta.value);
    updateStatsSoon();
  });
  ta.addEventListener('scroll', () => {
    ln.scrollTop = ta.scrollTop;
  });

  function syncEditor(text) {
    if (document.activeElement === ta) return;
    if (ta.value === text) return;
    ta.value = text;
    updateLineNumbers();
    ta.scrollTop = 0;
    ln.scrollTop = 0;
  }

  function insertAtLineStart(prefix) {
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const before = ta.value.slice(0, s);
    const lineStart = before.lastIndexOf('\n') + 1;
    ta.value = ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
    const pos = s + prefix.length;
    ta.selectionStart = ta.selectionEnd = Math.max(pos, e + prefix.length);
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  }

  function wrapSelection(mark) {
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = ta.value.slice(s, e);
    if (!sel) {
      FP.toast('先选中要标记的文字');
      return;
    }
    ta.value = ta.value.slice(0, s) + mark + sel + mark + ta.value.slice(e);
    ta.selectionStart = s + mark.length;
    ta.selectionEnd = e + mark.length;
    ta.focus();
    ta.dispatchEvent(new Event('input'));
  }

  document.querySelectorAll('[data-ins]').forEach((b) => {
    b.onclick = () => insertAtLineStart(b.dataset.ins);
  });
  document.querySelectorAll('[data-wrap]').forEach((b) => {
    b.onclick = () => wrapSelection(b.dataset.wrap);
  });

  // ── 预览 ──
  function previewScale() {
    return $('previewInner').clientWidth ? 1 : 1;
  }

  /** 画布按「可用区域」等比撑满：宽度和高度都取最优 */
  function fitPreview() {
    const body = document.querySelector('.preview-body');
    if (!body) return;
    const cw = Math.max(120, body.clientWidth - 32);
    const ch = Math.max(70, body.clientHeight - 32);
    const unit = Math.min(cw / 16, ch / 9); // 每「比例单位」的像素
    const w = Math.floor(unit * 16);
    const h = Math.floor(unit * 9);
    const stage = $('previewStage');
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    $('previewInner').style.transform = `scale(${w / 1920})`;
  }

  function renderPreview() {
    FPParser.render($('pvTrack'), parsed);
    $('previewStage').classList.toggle('empty', !parsed.segments.length);
    applyPreviewVars();
    requestAnimationFrame(() => {
      const H = 1080;
      const pad = H * ((S.anchorY || 0) / 100);
      $('pvTrack').style.paddingTop = pad + 'px';
      fitPreview();
      previewGuide.measure();
      paintPreview();
    });
  }

  function applyPreviewVars() {
    const root = $('pvRoot');
    if (!S) return;
    const c = previewCfg();
    const r = root.style;
    r.setProperty('--k', '1');
    r.setProperty('--osc', String(c ? c.scale : 1));
    r.setProperty('--bgc', S.bg);
    r.setProperty('--fgc', S.fg);
    r.setProperty('--tc', S.titleColor);
    r.setProperty('--cc', S.cueColor);
    r.setProperty('--nc', S.noteColor);
    r.setProperty('--ic', S.infoColor);
    r.setProperty('--fs', S.fontSize + 'px');
    r.setProperty('--lh', String(S.lineHeight));
    r.setProperty('--fw', String(S.fontWeight));
    r.setProperty('--pg', S.paraGap + 'em');
    r.setProperty('--px', S.paddingX + '%');
    r.setProperty('--is', S.infoSize + 'px');
    r.setProperty('--align', S.align);
    r.setProperty(
      '--ff',
      S.fontFamily
        ? `"${S.fontFamily}","Segoe UI","Microsoft YaHei UI",sans-serif`
        : '"Segoe UI","Microsoft YaHei UI","Microsoft YaHei",sans-serif'
    );

    const mir = !!pvMirror;
    const pm = $('pvMirror');
    pm.classList.toggle('mh', mir);

    $('pvProgress').classList.toggle('on', !!S.showProgress);
    root.parentElement.querySelectorAll('.veil').forEach((v) => {
      v.style.display = S.showFade ? 'block' : 'none';
    });
  }

  function previewCfg() {
    if (!S || !S.outputs.length) return null;
    const open = S.outputs.find((o) => o.open) || S.outputs[0];
    return open;
  }

  function paintPreview(animationOnly = false) {
    if (!S || !PB) return;
    const t = $('pvTrack');
    const H = 1080;
    const pad = parseFloat(t.style.paddingTop || '0');
    const pvMax = Math.max(0, t.scrollHeight - H);
    const yReal = previewY();
    const realMax = previewMaxY();
    let ratio = 0;
    ratio = clamp(yReal / Math.max(1, realMax), 0, 1);
    const y = pvMax * ratio;
    t.style.transform = `translate3d(0,${-y}px,0)`;
    previewGuide.paint(y);
    if (animationOnly) return;

    // 信息栏数值
    const put = (id, val) =>
      document.querySelectorAll(`[data-pv="${id}"]`).forEach((el) => {
        el.textContent = val;
      });
    put('clock', FP.clock());
    put('elapsed', FP.fmt(previewElapsed()));
    const remainPx = Math.max(0, realMax - yReal);
    put('remain', FP.fmt(previewLocal.speed > 0 ? remainPx / previewLocal.speed : 0));
    const lineH = S.fontSize * ((previewCfg() && previewCfg().scale) || 1) * S.lineHeight;
    put('speed', (lineH > 0 ? previewLocal.speed / lineH : 0).toFixed(1) + ' 行/秒');

    if (S.showProgress) {
      $('pvProgressBar').style.width = (ratio * 100).toFixed(2) + '%';
    }
    const progress = $('previewProgressInput');
    if (progress) {
      progress.disabled = realMax <= 0;
      if (document.activeElement !== progress) progress.value = (ratio * 100).toFixed(1);
    }
  }

  function previewY() {
    if (!PB) return 0;
    if (!previewLocal.playing) return previewLocal.y;
    return Math.min(previewMaxY(), previewLocal.y + ((performance.now() - previewLocal.anchor) / 1000) * previewLocal.speed);
  }

  function previewMaxY() {
    if (!S || !S.scriptText.trim()) return 0;
    const t = $('pvTrack');
    const fallback = Math.max(0, t.scrollHeight - 1080);
    return PB && PB.contentH > PB.viewH ? Math.max(0, PB.contentH - PB.viewH) : fallback;
  }

  function previewElapsed() {
    if (!previewLocal.playing) return previewLocal.elapsed;
    return previewLocal.elapsed + (performance.now() - previewLocal.anchor) / 1000;
  }

  function renderPreviewInfo() {
    if (!S) return;
    const items = [];
    if (S.showClock) items.push(['clock', '时间']);
    if (S.showElapsed) items.push(['elapsed', '已用']);
    if (S.showRemaining) items.push(['remain', '剩余']);
    if (S.showSpeed) items.push(['speed', '速度']);
    const html = items
      .map(
        ([id, label]) =>
          `<div class="it"><span class="k">${label}</span><span class="v" data-pv="${id}">--</span></div>`
      )
      .join('');
    $('pvInfoTop').innerHTML = html;
    $('pvInfoBottom').innerHTML = html;
    $('pvInfoTop').style.display = S.infoTop && items.length ? 'flex' : 'none';
    $('pvInfoBottom').style.display = S.infoBottom && items.length ? 'flex' : 'none';
  }

  // ── 工具条 ──
  function renderChips() {
    const bar = $('chipBar');
    const key = S.outputs.map((o) => `${o.id}:${o.open}:${o.monitor}:${o.name}`).join('|') + '::' + MONITORS.map((m) => `${m.index}:${m.width}x${m.height}:${m.primary}`).join('|');
    if (bar.dataset.key === key) return;
    bar.dataset.key = key;
    bar.innerHTML = S.outputs
      .map((o) => {
        const mon = MONITORS.find((m) => m.index === o.monitor);
        const tag = !mon
          ? '· 未绑定'
          : mon.primary
            ? '· 主屏'
            : '· 屏 ' + (o.monitor + 1);
        return `<div class="chip ${o.open ? 'on' : ''}" data-chip="${esc(o.id)}" role="button" tabindex="0" title="打开屏幕管理">
          <svg class="ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 20h8"/></svg>
          <span class="nm">${esc(o.name)}</span>
          <span class="mon">${tag}</span>
        </div>`;
      })
      .join('');
  }

  function renderOutputOverview() {
    const host = $('outputOverview');
    if (!host || !S) return;
    const count = MONITORS.length;
    const hint = count === 1 ? '<span class="output-empty">单屏彩排 · 输出与控制在同一显示器</span>' : count === 0 ? '<span class="output-empty">未检测到显示器 · 可先在当前窗口彩排</span>' : '';
    host.innerHTML = `<span class="overview-label">输出概览 · ${count} 台显示器</span>${hint}` +
      (S.outputs.length ? S.outputs.map((o) => {
        const mon = MONITORS.find((m) => m.index === o.monitor);
        const target = mon ? `${mon.index + 1}号屏 ${mon.width}×${mon.height}${mon.primary ? ' · 主屏' : ''}` : '未绑定显示器';
        const summary = [o.mirrorH ? '镜像' : '正像', o.fullscreen ? '全屏' : '窗口', o.locked ? '锁定' : '可移动'].join(' · ');
        return `<div class="output-summary ${o.open ? 'live' : ''}" data-overview="${esc(o.id)}">
          <span class="summary-name">${esc(o.name)}</span><span class="summary-meta">${esc(target)} · ${esc(summary)}</span>
          <span class="summary-state">${o.open ? '已投放' : '未投放'}</span>
          <span class="summary-actions">${o.open ? `<button class="btn danger" data-over-close="${esc(o.id)}" aria-label="关闭 ${esc(o.name)}">关闭</button>` : `<button class="btn primary" data-over-open="${esc(o.id)}" aria-label="投放 ${esc(o.name)}">投放</button>`}</span>
        </div>`;
      }).join('') : '<span class="output-empty">暂无输出屏，可使用右上角“新增提词屏”</span>');
  }

  $('outputOverview').addEventListener('click', (e) => {
    const open = e.target.closest('[data-over-open]');
    const close = e.target.closest('[data-over-close]');
    if (open) FP.invoke('open_output', { id: open.dataset.overOpen }).catch((err) => FP.toast(String(err), 'err'));
    if (close) FP.invoke('close_output', { id: close.dataset.overClose });
  });

  $('chipBar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-chip]');
    if (!b) return;
    const o = S.outputs.find((x) => x.id === b.dataset.chip);
    if (!o) return;
    setPanel(true, 'outputs');
  });
  $('chipBar').addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-chip]')) {
      e.preventDefault();
      setPanel(true, 'outputs');
    }
  });

  // ── 状态 ──
  function onState(s) {
    const prevOutCount = S ? S.outputs.length : -1;
    S = s.settings;
    previewGuide.configure(S);
    PB = s.playback;
    if (Array.isArray(s.monitors)) MONITORS = s.monitors;
    const pbKey = `${PB.seq}|${PB.y}|${PB.speed}|${PB.playing}`;
    if (pbKey !== previewLocal.key) {
      previewLocal = { y: PB.y || 0, speed: PB.speed || 0, playing: !!PB.playing, elapsed: PB.elapsed || 0, key: pbKey, anchor: performance.now() };
    } else if (!previewLocal.playing) {
      previewLocal.elapsed = PB.elapsed || 0;
    }

    const key = S.scriptText + '\u0001' + JSON.stringify(S.roles);
    if (key !== lastParseKey) {
      lastParseKey = key;
      parsed = FPParser.parse(S.scriptText, S.roles);
      syncEditor(S.scriptText);
      renderPreview();
      renderPreviewInfo();
      updateStats();
    }

    const layoutKey = [S.bg, S.fg, S.titleColor, S.cueColor, S.noteColor, S.infoColor, S.fontSize, S.lineHeight, S.paraGap, S.paddingX, S.anchorY, S.fontWeight, S.fontFamily, S.align, S.showFade, S.showGuide, S.showProgress, S.showClock, S.showElapsed, S.showRemaining, S.showSpeed, S.infoTop, S.infoBottom, S.infoSize, JSON.stringify((S.outputs || []).map((o) => [o.id, o.scale, o.open, o.monitor]))].join('|');
    if (layoutKey !== lastLayoutKey) {
      lastLayoutKey = layoutKey;
      applyPreviewVars();
      renderPreviewInfo();
      requestAnimationFrame(() => {
        $('pvTrack').style.paddingTop = (1080 * ((S.anchorY || 0) / 100)) + 'px';
        fitPreview();
        previewGuide.measure();
        paintPreview();
      });
    }

    syncEditor(S.scriptText);

    // 播放按钮
    $('btnPlay').classList.toggle('playing', PB.playing);
    $('btnPlay').setAttribute('aria-pressed', String(!!PB.playing));
    $('btnPlay').setAttribute('aria-label', PB.playing ? '暂停' : '播放');
    $('playLabel').textContent = PB.playing ? '暂停' : '播放';
    $('playIcon').innerHTML = PB.playing
      ? '<path d="M8 4.6h3.4v14.8H8zM12.6 4.6H16v14.8h-3.4z" fill="currentColor" stroke="none"/>'
      : '<path d="M8 4.6v14.8L20 12z" fill="currentColor" stroke="none"/>';

    renderChips();
    renderOutputOverview();
    renderPanel(prevOutCount !== S.outputs.length);
    syncQuick();
    const modeControl = $('readingGuideMode');
    if (document.activeElement !== modeControl) modeControl.value = S.showGuide ? (S.guideMode === 'invert' ? 'invert' : 'triangle') : 'off';
    updateStatus();

    const f = S.scriptPath ? S.scriptPath.split(/[\\/]/).pop() : '未命名文稿';
    $('fileName').innerHTML = `${esc(f)}<span class="dirty" id="dirtyMark"></span>`;
  }

  function updateStatus() {
    if (!S) return;
    $('stMon').textContent = MONITORS.length;
    $('stElapsed').textContent = FP.fmt(previewElapsed());
    $('previewPlayState').textContent = previewLocal.playing ? '播放中' : '已暂停';
    // 剩余时间以真实提词屏上报的度量为准（窗宽不同换行不同，长度也会变），
    // 没有提词屏时退回预览画布估算，保证三处显示同一套数
    const t = $('pvTrack');
    const pvMax = Math.max(0, t.scrollHeight - 1080);
    let span = 0;
    let ratio = 0;
    span = previewMaxY();
    ratio = clamp(previewY() / Math.max(1, span), 0, 1);
    const remain = previewLocal.speed > 0 ? (span * (1 - ratio)) / previewLocal.speed : 0;
    $('stRemain').textContent = span > 0 ? FP.fmt(remain) : '--:--';
    $('stCurrent').textContent = parsed.segments.length ? `${currentSeg() + 1}/${parsed.segments.length}` : '—';
  }

  let statsTimer = 0;
  function updateStatsSoon() {
    clearTimeout(statsTimer);
    statsTimer = setTimeout(updateStats, 300);
  }
  function updateStats() {
    const text = ta.value || (S ? S.scriptText : '');
    $('stChars').textContent = text.replace(/\s/g, '').length;
    $('stSegs').textContent = (parsed.segments || []).length;
  }

  // ── 快调条：现场最常用的四个参数，常驻可见，可点按、可按住连调、可直接键入 ──
  const QUICK = [
    { k: 'speed', n: '速度', min: 5, max: 600, step: 5, dig: 0, unit: 'px/s' },
    { k: 'fontSize', n: '字号', min: 24, max: 200, step: 2, dig: 0, unit: 'px' },
    { k: 'lineHeight', n: '行距', min: 1, max: 2.6, step: 0.05, dig: 2, unit: '倍' },
    { k: 'anchorY', n: '阅读线', min: 8, max: 88, step: 2, dig: 0, unit: '%' },
  ];
  // 按住连调时以本地累加值为准，避免等后端回包导致加不动
  const quickLocal = {};
  const quickTimers = {};

  function qfmt(q, v) {
    return q.dig ? Number(v).toFixed(q.dig) : String(Math.round(v));
  }

  function renderQuick() {
    const bar = $('quickBar');
    if (bar.dataset.on) return;
    bar.dataset.on = '1';
    bar.innerHTML =
      QUICK.map(
        (q) => `<span class="qk" data-q="${q.k}">
        <span class="k">${q.n}</span>
        <button class="qbtn" data-step="${-q.step}" aria-label="${q.n}减 ${q.step}${q.unit}" title="减 ${q.step}${q.unit}（按住连调）">−</button>
        <input class="v" aria-label="${q.n}" type="number" min="${q.min}" max="${q.max}" step="${q.step}" value="">
        <button class="qbtn" data-step="${q.step}" aria-label="${q.n}加 ${q.step}${q.unit}" title="加 ${q.step}${q.unit}（按住连调）">+</button>
        <span class="u">${q.unit}</span>
      </span>`
      ).join('') +
      `<span class="qbar-tip"><kbd>↑</kbd><kbd>↓</kbd> 速度 · <kbd>-</kbd><kbd>=</kbd> 字号 · <kbd>←</kbd><kbd>→</kbd> 跳段 · <kbd>空格</kbd> 播放</span>`;
  }

  function quickCur(k) {
    if (k === 'speed') return PB ? PB.speed : 60;
    return S ? S[k] : 0;
  }

  function syncQuick() {
    QUICK.forEach((q) => {
      const el = document.querySelector(`.qk[data-q="${q.k}"] .v`);
      if (!el || document.activeElement === el) return;
      if (quickLocal[q.k] === undefined) el.value = qfmt(q, quickCur(q.k));
    });
  }

  function applyQuick(k, v) {
    const q = QUICK.find((x) => x.k === k);
    if (!q) return;
    v = clamp(v, q.min, q.max);
    if (q.dig) v = Math.round(v / q.step) * q.step;
    else v = Math.round(v);
    quickLocal[k] = v;
    clearTimeout(quickTimers[k]);
    quickTimers[k] = setTimeout(() => {
      delete quickLocal[k];
    }, 600);

    if (k === 'speed') FP.invoke('set_speed', { speed: v }).catch(() => {});
    else patch({ [k]: v });

    const box = document.querySelector(`.qk[data-q="${k}"]`);
    if (box) {
      box.querySelector('.v').value = qfmt(q, v);
      box.classList.add('hot');
      setTimeout(() => box.classList.remove('hot'), 220);
    }
  }

  let holdDelay = 0;
  let holdRepeat = 0;
  function stopHold() {
    clearTimeout(holdDelay);
    clearInterval(holdRepeat);
    holdDelay = holdRepeat = 0;
  }

  $('quickBar').addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.qbtn');
    if (!b) return;
    e.preventDefault();
    const k = b.closest('.qk').dataset.q;
    const step = Number(b.dataset.step);
    const base = quickLocal[k] !== undefined ? quickLocal[k] : quickCur(k);
    applyQuick(k, base + step);
    stopHold();
    holdDelay = setTimeout(() => {
      holdRepeat = setInterval(() => {
        const cur = quickLocal[k] !== undefined ? quickLocal[k] : quickCur(k);
        applyQuick(k, cur + step);
      }, 55);
    }, 320);
  });
  window.addEventListener('pointerup', stopHold);
  window.addEventListener('pointercancel', stopHold);
  $('quickBar').addEventListener('pointerleave', stopHold);

  $('quickBar').addEventListener('change', (e) => {
    const inp = e.target.closest('.v');
    if (!inp) return;
    const k = inp.closest('.qk').dataset.q;
    const v = Number(inp.value);
    if (!isFinite(v)) return;
    applyQuick(k, v);
  });
  $('quickBar').addEventListener('keydown', (e) => {
    const b = e.target.closest('.qbtn');
    if (!b || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    const k = b.closest('.qk').dataset.q;
    const step = Number(b.dataset.step);
    const base = quickLocal[k] !== undefined ? quickLocal[k] : quickCur(k);
    applyQuick(k, base + step);
  });

  function adjustQuick(k, delta) {
    const base = quickLocal[k] !== undefined ? quickLocal[k] : quickCur(k);
    applyQuick(k, base + delta);
  }

  // ── 面板 ──
  function fmtNum(v) {
    return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, '');
  }

  /** 滑块 + 数值输入框联动（可拖、也可直接键入精确值） */
  function nf(label, k, min, max, step, unit) {
    return `<div class="field"><label>${label}</label><div class="ctl">
      <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}">
      <input type="number" class="numin" data-k="${k}" min="${min}" max="${max}" step="${step}">
      <span class="unit" style="min-width:18px">${unit || ''}</span>
    </div></div>`;
  }

  const PANELS = {
    look: () => `
      <div class="section">
        <h4>主题方案</h4>
        <div class="theme-grid">
          ${THEMES.map(
            (t) =>
              `<div class="theme-cell ${
                S.bg.toLowerCase() === t.bg && S.fg.toLowerCase() === t.fg ? 'on' : ''
              }" data-theme="${t.id}" style="background:${t.bg};color:${t.fg}" title="${t.n}">Aa</div>`
          ).join('')}
        </div>
        <div class="tiny" style="margin-top:8px">一键换全套配色，也可在下面单独微调。</div>
      </div>
      <div class="section">
        <h4>配色微调</h4>
        <div class="field"><label>底色</label><div class="ctl"><input type="color" data-k="bg"></div></div>
        <div class="field"><label>正文</label><div class="ctl"><input type="color" data-k="fg"></div></div>
        <div class="field"><label>标题</label><div class="ctl"><input type="color" data-k="titleColor"></div></div>
        <div class="field"><label>提示</label><div class="ctl"><input type="color" data-k="cueColor"></div></div>
        <div class="field"><label>备注</label><div class="ctl"><input type="color" data-k="noteColor"></div></div>
      </div>
      <div class="section">
        <h4>字体</h4>
        <div class="field"><label>字体</label><div class="ctl">
          <select data-k="fontFamily">
            ${FONTS.map((f) => `<option value="${f.v}">${f.n}</option>`).join('')}
          </select>
        </div></div>
        <div class="field"><label>字重</label><div class="ctl">
          <select data-k="fontWeight" data-num="1">
            <option value="400">常规</option>
            <option value="500">中等</option>
            <option value="600">半粗</option>
            <option value="700">粗体</option>
            <option value="800">特粗</option>
          </select>
        </div></div>
      </div>
    `,

    layout: () => `
      <div class="section">
        <h4>字号与间距</h4>
        ${nf('字号', 'fontSize', 24, 200, 1, 'px')}
        ${nf('行距', 'lineHeight', 1, 2.6, 0.05, '倍')}
        ${nf('段距', 'paraGap', 0, 2.4, 0.1, 'em')}
        ${nf('左右留白', 'paddingX', 0, 30, 0.5, '%')}
      </div>
      <div class="section">
        <h4>阅读提示</h4>
        <div class="field"><label>样式</label><div class="ctl">
          <select data-guide-mode aria-label="阅读提示样式">
            <option value="off">关闭</option>
            <option value="triangle">边缘三角 · 轻提示</option>
            <option value="invert">当前行反色 · 强提示</option>
          </select>
        </div></div>
        ${nf('位置', 'anchorY', 8, 88, 1, '%')}
        ${nf('三角透明度', 'guideOpacity', 0, 100, 5, '%')}
        ${nf('三角大小', 'guideSize', 8, 40, 1, 'px')}
        <div class="tiny" style="margin-top:6px">把阅读位置对准提词玻璃里的镜头附近，再按舒适度调节。反色只标出当前一行，并保持完整对比度；透明度和大小仅用于三角。</div>
        <div class="field"><label>对齐</label><div class="ctl">
          <select data-k="align">
            <option value="center">居中</option>
            <option value="left">左对齐</option>
          </select>
        </div></div>
      </div>
      <div class="section">
        <h4>显示辅助</h4>
        <div class="field"><label>字号自适应</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="autoScale"><i></i></label>
          <span class="tiny" style="flex:1">按屏幕高度等比缩放（4K 屏字也会很大）</span>
        </div></div>
        <div class="field"><label>上下渐隐</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showFade"><i></i></label>
        </div></div>
      </div>
    `,

    info: () => `
      <div class="section">
        <h4>显示项</h4>
        <div class="field"><label>当前时间</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showClock"><i></i></label>
        </div></div>
        <div class="field"><label>已用时长</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showElapsed"><i></i></label>
        </div></div>
        <div class="field"><label>剩余时长</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showRemaining"><i></i></label>
          <span class="tiny" style="flex:1">按当前速度估算</span>
        </div></div>
        <div class="field"><label>演播速度</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showSpeed"><i></i></label>
        </div></div>
        <div class="field"><label>进度条</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="showProgress"><i></i></label>
        </div></div>
      </div>
      <div class="section">
        <h4>位置与样式</h4>
        <div class="field"><label>顶部</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="infoTop"><i></i></label>
        </div></div>
        <div class="field"><label>底部</label><div class="ctl">
          <label class="switch"><input type="checkbox" data-k="infoBottom"><i></i></label>
        </div></div>
        ${nf('字号', 'infoSize', 12, 72, 1, 'px')}
        <div class="field"><label>颜色</label><div class="ctl"><input type="color" data-k="infoColor"></div></div>
      </div>
    `,

    roles: () => `
      <div class="section">
        <h4>角色分色</h4>
        <div class="tiny" style="margin-bottom:9px">
          行首加标记即可整行套用角色样式，例如
          <code style="color:var(--accent)">@男 各位观众晚上好</code>
        </div>
        ${S.roles
          .map(
            (r, i) => `
          <div class="role-item">
            <input type="color" data-rk="color" data-ri="${i}" value="${r.color}" />
            <input type="text" data-rk="name" data-ri="${i}" value="${r.name}" style="flex:1" />
            <input type="text" class="tag" data-rk="tag" data-ri="${i}" value="${r.tag}" />
            <input type="range" data-rk="scale" data-ri="${i}" min="0.6" max="1.6" step="0.02"
                   value="${r.scale}" style="width:56px" title="字号倍率 ${r.scale}" />
            <button class="btn sm ghost icon-only" data-delrole="${i}" title="删除">
              <svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
            </button>
          </div>`
          )
          .join('')}
        <button class="btn sm" data-addrole="1" style="margin-top:9px;width:100%">＋ 添加角色</button>
      </div>
    `,

    outputs: () => `
      <div class="section">
        <h4>输出屏（可拖到任意显示器）</h4>
        <div class="tiny" style="margin-bottom:9px">
          共 ${MONITORS.length} 台显示器。绑定后点“投放”即全屏显示。
        </div>
        ${S.outputs
          .map(
            (o, i) => `
          <div class="out-card">
            <div class="hd">
              <span class="nm">${esc(o.name)}</span>
              <span class="state ${o.open ? 'live' : ''}">${o.open ? '已投放' : '未投放'}</span>
            </div>
            <div class="bd">
              <div class="field tight"><label>名称</label><div class="ctl">
                <input type="text" data-oid="${esc(o.id)}" data-ok="name" value="${esc(o.name)}">
              </div></div>
              <div class="field tight"><label>显示器</label><div class="ctl">
                <select data-oid="${o.id}" data-ok="monitor" data-num="1" data-place="1">
                  <option value="-1">未绑定</option>
                  ${MONITORS
                    .map(
                      (m) =>
                        `<option value="${m.index}">${m.index + 1}. ${m.width}×${m.height}${
                          m.primary ? '（主）' : ''
                        }</option>`
                    )
                    .join('')}
                </select>
              </div></div>
              <div class="mini-row">
                <label class="switch"><input type="checkbox" data-oid="${o.id}" data-ok="mirrorH"><i></i></label>
                <span class="tiny" style="width:46px">水平镜像</span>
                <label class="switch"><input type="checkbox" data-oid="${o.id}" data-ok="mirrorV"><i></i></label>
                <span class="tiny" style="width:46px">垂直镜像</span>
              </div>
              <div class="mini-row">
                <label class="switch"><input type="checkbox" data-oid="${o.id}" data-ok="fullscreen"><i></i></label>
                <span class="tiny" style="width:34px">全屏</span>
                <label class="switch"><input type="checkbox" data-oid="${o.id}" data-ok="showInfo"><i></i></label>
                <span class="tiny" style="width:46px">信息栏</span>
              </div>
              <div class="mini-row">
                <label class="switch"><input type="checkbox" data-oid="${o.id}" data-ok="locked"><i></i></label>
                <span class="tiny" style="width:34px">锁定</span>
                <span class="tiny" style="flex:1;opacity:.7">锁定后不可拖动、Esc 不关闭，防现场误操作</span>
              </div>
              <div class="field tight"><label>字号</label><div class="ctl">
                <input type="range" data-oid="${o.id}" data-ok="scale" data-num="1"
                       min="0.4" max="2.4" step="0.05" value="${o.scale}">
                <input type="number" class="numin" data-oid="${o.id}" data-ok="scale" data-num="1"
                       min="0.4" max="2.4" step="0.05" value="${o.scale}">
                <span class="unit" style="min-width:14px">×</span>
              </div></div>
              ${
                o.mode === 'media' && o.media
                  ? `<div class="mini-row" style="align-items:center">
                      <span class="tiny grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.media.label}</span>
                      ${
                        o.media.kind === 'slides'
                          ? `<button class="btn sm icon-only" data-slide="${o.id}|-1">‹</button>
                             <span class="tiny num">${(o.slide || 0) + 1}/${o.media.frames.length}</span>
                             <button class="btn sm icon-only" data-slide="${o.id}|1">›</button>`
                          : ''
                      }
                      <button class="btn sm icon-only" data-clearmedia="${o.id}" title="清除素材">
                        <svg class="ico" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>`
                  : `<div class="mini-row">
                      <button class="btn sm grow" data-media="${o.id}">投放图片 / 视频 / PPT</button>
                    </div>`
              }
              <div class="mini-row">
                ${
                  o.open
                    ? `<button class="btn sm danger grow" data-closeout="${o.id}">关闭此屏</button>`
                    : `<button class="btn sm primary grow" data-openout="${o.id}">投放到显示器</button>`
                }
                <button class="btn sm icon-only" data-delout="${o.id}" title="删除此屏">
                  <svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>
                </button>
              </div>
            </div>
          </div>`
          )
          .join('')}
        <button class="btn sm" data-addout="1" style="margin-top:10px;width:100%">＋ 新增输出屏</button>
      </div>
    `,

    help: () => `
      <div class="section">
        <h4>快捷键</h4>
        ${[
          ['空格', '播放 / 暂停'],
          ['↑ / ↓', '速度 +5 / −5'],
          ['PageUp / PageDown', '前后翻半屏'],
          ['← / →', '前后跳一段'],
          ['Home', '回到开头'],
          ['Ctrl+O / Ctrl+S', '打开 / 另存文稿'],
          ['Esc', '关闭当前提词屏'],
          ['滚轮', '在提词屏上调速度'],
        ]
          .map(
            ([k, v]) =>
              `<div class="field tight"><label style="width:118px;font-family:var(--mono);font-size:11.5px">${k}</label><span class="tiny grow">${v}</span></div>`
          )
          .join('')}
      </div>
      <div class="section">
        <h4>文稿标记</h4>
        ${[
          ['# 标题', '一级标题（黄色大字）'],
          ['## 标题', '二级标题'],
          ['&gt; 提示', '口播提示（蓝色斜体）'],
          ['**重点**', '红色加粗'],
          ['// 备注', '灰色小字，不朗读'],
          ['---', '强制分段'],
          ['@男 台词', '整行套用角色配色'],
          ['空行', '自动分成可跳转的段落'],
        ]
          .map(
            ([k, v]) =>
              `<div class="field tight"><label style="width:96px;font-family:var(--mono);font-size:11.5px;color:#c9d3e3">${k}</label><span class="tiny grow">${v}</span></div>`
          )
          .join('')}
      </div>
      <div class="section">
        <h4>关于</h4>
        <div class="tiny" style="line-height:1.9">
          鲁科影视提词器 LK-Prompter 2.0<br/>
          配置与文稿保存在程序同目录，整包拷贝即可换机器。<br/>
          <span style="color:var(--text-3)">按主窗口的 × 关闭时自动保存。</span>
        </div>
      </div>
    `,
  };

  function renderPanel(force) {
    if (!S) return;
    const structKey = [
      currentTab,
      S.roles.length,
      S.outputs.length,
      S.outputs.map((o) => `${o.id}:${o.open ? 1 : 0}:${o.mode}:${o.media ? 1 : 0}`).join(','),
      MONITORS.length,
    ].join('|');
    if (!force && structKey === panelKey) {
      syncPanelValues();
      return;
    }
    panelKey = structKey;
    tabBody.innerHTML = PANELS[currentTab]();
    syncPanelValues();
  }

  function syncPanelValues() {
    if (!S) return;
    const guideMode = tabBody.querySelector('[data-guide-mode]');
    if (guideMode && document.activeElement !== guideMode) guideMode.value = S.showGuide ? (S.guideMode === 'invert' ? 'invert' : 'triangle') : 'off';
    tabBody.querySelectorAll('[data-k]').forEach((el) => {
      if (el === document.activeElement) return;
      const v = getPath(S, el.dataset.k);
      if (el.type === 'checkbox') el.checked = !!v;
      else if (v !== undefined && v !== null) el.value = v;
    });

    tabBody.querySelectorAll('[data-rk]').forEach((el) => {
      if (el === document.activeElement) return;
      const r = S.roles[Number(el.dataset.ri)];
      if (!r) return;
      el.value = r[el.dataset.rk];
    });

    tabBody.querySelectorAll('[data-oid]').forEach((el) => {
      if (el === document.activeElement) return;
      const o = S.outputs.find((x) => x.id === el.dataset.oid);
      if (!o) return;
      const v = o[el.dataset.ok];
      if (el.type === 'checkbox') el.checked = !!v;
      else if (v !== undefined && v !== null) el.value = v;
    });
  }

  function unitText(k, v) {
    switch (k) {
      case 'fontSize':
        return 'px';
      case 'lineHeight':
        return '倍';
      case 'paraGap':
        return 'em';
      case 'paddingX':
        return '%';
      case 'anchorY':
      case 'guideOpacity':
        return '%';
      case 'guideSize':
        return 'px';
      case 'infoSize':
        return 'px';
      default:
        return v === undefined ? '' : fmtNum(Number(v));
    }
  }

  // 面板交互
  tabBody.addEventListener('input', (e) => {
    const t = e.target;

    if (t.dataset.rk) {
      const i = Number(t.dataset.ri);
      const roles = JSON.parse(JSON.stringify(S.roles));
      const v = t.dataset.rk === 'scale' ? Number(t.value) : t.value;
      roles[i][t.dataset.rk] = v;
      S.roles = roles;
      patchNow({ roles });
      return;
    }

    if (t.dataset.oid) {
      if (t.dataset.place) return; // 由 change 处理
      const v =
        t.type === 'checkbox' ? t.checked : t.dataset.num ? Number(t.value) : t.value;
      if (t.type === 'number' && !isFinite(v)) return;
      // 滑块与数值框同步
      if (t.type === 'range' || t.type === 'number') {
        const sib = t.parentElement.querySelector(
          t.type === 'range' ? 'input[type=number]' : 'input[type=range]'
        );
        if (sib) sib.value = v;
      }
      FP.invoke('update_output', { id: t.dataset.oid, patch: { [t.dataset.ok]: v } }).catch(
        () => {}
      );
      return;
    }

    const k = t.dataset.k;
    if (!k) return;
    let v;
    if (t.type === 'checkbox') v = t.checked;
    else if (t.type === 'range' || t.type === 'number') v = Number(t.value);
    else if (t.dataset.num) v = Number(t.value);
    else v = t.value;

    if (t.type === 'number' && !isFinite(v)) return;

    if (k === 'guideOpacity') v = clamp(Number(v), 0, 100);
    if (k === 'guideSize') v = clamp(Number(v), 8, 40);

    // 滑块与数值框双向联动
    if (t.type === 'range' || t.type === 'number') {
      const sib = t.parentElement.querySelector(
        t.type === 'range' ? 'input[type=number]' : 'input[type=range]'
      );
      if (sib) sib.value = v;
    }
    patch({ [k]: v });
  });

  tabBody.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-guide-mode]')) {
      setGuideMode(t.value);
      return;
    }

    if (t.dataset.oid && t.dataset.place) {
      const v = t.dataset.num ? Number(t.value) : t.value;
      FP.invoke('update_output', { id: t.dataset.oid, patch: { [t.dataset.ok]: v } })
        .then(() => FP.invoke('place_output', { id: t.dataset.oid }))
        .catch((err) => FP.toast(String(err), 'err'));
      return;
    }

    if (t.tagName === 'SELECT' && t.dataset.k) {
      const v = t.dataset.num ? Number(t.value) : t.value;
      patchNow({ [t.dataset.k]: v });
    }
  });

  tabBody.addEventListener('click', (e) => {
    const el = e.target.closest('[data-theme],[data-addrole],[data-delrole],[data-openout],[data-closeout],[data-delout],[data-media],[data-clearmedia],[data-slide],[data-addout]');
    if (!el) return;

    if (el.dataset.theme) {
      const t = THEMES.find((x) => x.id === el.dataset.theme);
      if (!t) return;
      patchNow({ themeId: t.id, bg: t.bg, fg: t.fg, titleColor: t.t, cueColor: t.c, noteColor: t.nt });
      return;
    }
    if (el.dataset.addrole) {
      const roles = JSON.parse(JSON.stringify(S.roles));
      roles.push({
        id: 'r' + Date.now(),
        name: '角色' + (roles.length + 1),
        tag: '@' + (roles.length + 1),
        color: '#c4b5fd',
        scale: 1,
        bold: false,
      });
      patchNow({ roles });
      return;
    }
    if (el.dataset.delrole !== undefined) {
      const i = Number(el.dataset.delrole);
      const roles = S.roles.filter((_, j) => j !== i);
      patchNow({ roles });
      return;
    }
    if (el.dataset.openout) {
      FP.invoke('open_output', { id: el.dataset.openout }).catch((err) =>
        FP.toast(String(err), 'err')
      );
      return;
    }
    if (el.dataset.closeout) {
      FP.invoke('close_output', { id: el.dataset.closeout });
      return;
    }
    if (el.dataset.delout) {
      FP.invoke('remove_output', { id: el.dataset.delout });
      return;
    }
    if (el.dataset.media) {
      FP.invoke('pick_media', { id: el.dataset.media }).catch((err) =>
        FP.toast(String(err), 'err')
      );
      return;
    }
    if (el.dataset.clearmedia) {
      FP.invoke('clear_media', { id: el.dataset.clearmedia });
      return;
    }
    if (el.dataset.slide) {
      const [id, d] = el.dataset.slide.split('|');
      FP.invoke('slide_step', { id, delta: Number(d) });
      return;
    }
    if (el.dataset.addout) {
      FP.invoke('add_output');
      return;
    }
  });

  // ── 标签切换 ──
  $('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    currentTab = b.dataset.tab;
    $('settingsTitle').textContent = currentTab === 'outputs' ? '屏幕管理' : '设置';
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === b));
    panelKey = '';
    renderPanel(true);
  });

  // ── 工具条动作 ──
  $('btnPlay').onclick = () => FP.invoke('set_playing', { on: !PB.playing });

  function setPanel(open, tab) {
    panelOpen = !!open;
    if (tab) currentTab = tab;
    $('app').classList.toggle('panel-open', panelOpen);
    $('settingsPane').setAttribute('aria-hidden', String(!panelOpen));
    $('settingsTitle').textContent = currentTab === 'outputs' ? '屏幕管理' : '设置';
    document.querySelector('[data-act="settings"]').setAttribute('aria-pressed', String(panelOpen && currentTab !== 'outputs'));
    document.querySelector('[data-act="screens"]').setAttribute('aria-pressed', String(panelOpen && currentTab === 'outputs'));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === currentTab));
    panelKey = '';
    renderPanel(true);
    requestAnimationFrame(() => { fitPreview(); paintPreview(); });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    switch (b.dataset.act) {
      case 'min':
        FP.invoke('win_minimize');
        break;
      case 'max':
        FP.invoke('win_toggle_max');
        break;
      case 'close':
        FP.invoke('win_close');
        break;
      case 'open':
        FP.invoke('open_script');
        break;
      case 'save':
        FP.invoke('save_script_as', { defaultName: '讲稿.txt' }).then((p) => {
          if (p) FP.toast('已保存到 ' + p, 'ok');
        });
        break;
      case 'restart':
        FP.invoke('restart');
        break;
      case 'monitor':
        FP.invoke('open_monitor').catch((e) => FP.toast(String(e), 'err'));
        break;
      case 'addOut':
        FP.invoke('add_output').then(() => {
          setPanel(true, 'outputs');
        });
        break;
      case 'settings':
        setPanel(true, currentTab === 'outputs' ? 'look' : currentTab);
        break;
      case 'screens':
        setPanel(true, 'outputs');
        break;
      case 'closePanel':
        setPanel(false);
        break;
      case 'previewSeg':
        jumpSeg(-1);
        break;
      case 'nextSeg':
        jumpSeg(1);
        break;
    }
  });

  $('btnPreviewMirror').onclick = () => {
    pvMirror = !pvMirror;
    $('btnPreviewMirror').setAttribute('aria-pressed', String(pvMirror));
    applyPreviewVars();
    FP.toast(pvMirror ? '预览：镜像视图（主持人所见）' : '预览：正向视图');
  };

  $('previewProgressInput').addEventListener('change', (e) => {
    const max = previewMaxY();
    if (max <= 0) return;
    FP.invoke('seek', { y: (Number(e.target.value) / 100) * max }).catch(() => {});
  });

  // ── 跳段 ──
  function currentSeg() {
    const t = $('pvTrack');
    const H = 1080;
    const pad = parseFloat(t.style.paddingTop || '0');
    const tr = t.getBoundingClientRect();
    // 用真实提词位置换算出预览位置
    const pvMax = Math.max(0, t.scrollHeight - H);
    let ratio = 0;
    if (PB) ratio = clamp(previewY() / Math.max(1, previewMaxY()), 0, 1);
    const y = ratio * pvMax;
    let idx = 0;
    parsed.segments.forEach((sg, i) => {
      const el = t.querySelector(`[data-seg="${sg.index}"]`);
      if (!el) return;
      const off = el.offsetTop - pad;
      if (off <= y + 6) idx = i;
    });
    return idx;
  }

  function jumpSeg(d) {
    if (!parsed.segments.length || !PB || !S) return;
    const t = $('pvTrack');
    const H = 1080;
    const pad = parseFloat(t.style.paddingTop || '0');
    const tr = t.getBoundingClientRect();
    const pvMax = Math.max(0, t.scrollHeight - H);

    let idx = clamp(currentSeg() + d, 0, parsed.segments.length - 1);
    const sg = parsed.segments[idx];
    const el = t.querySelector(`[data-seg="${sg.index}"]`);
    if (!el) return;
    const off = Math.max(0, el.offsetTop - pad);
    const ratio = pvMax > 0 ? clamp(off / pvMax, 0, 1) : 0;

    const realMax = Math.max(1, PB.contentH - PB.viewH);
    const y = ratio * realMax;
    FP.invoke('seek', { y: PB.contentH > 1 ? y : off });
    FP.toast(`第 ${idx + 1} / ${parsed.segments.length} 段`);
  }

  // ── 快捷键 ──
  window.addEventListener('keydown', (e) => {
    if (e.defaultPrevented) return;
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      FP.invoke('open_script');
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      FP.invoke('save_script_as', { defaultName: '讲稿.txt' });
      return;
    }
    if (e.key === 'Escape' && !inField && panelOpen) {
      e.preventDefault();
      setPanel(false);
      return;
    }
    if (inField) return;
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        FP.invoke('set_playing', { on: !PB.playing });
        break;
      case 'ArrowUp':
        e.preventDefault();
        FP.invoke('set_speed', { speed: clamp(PB.speed + 5, 5, 600) });
        break;
      case 'ArrowDown':
        e.preventDefault();
        FP.invoke('set_speed', { speed: clamp(PB.speed - 5, 5, 600) });
        break;
      case 'ArrowLeft':
        e.preventDefault();
        jumpSeg(-1);
        break;
      case '-':
      case '_':
        e.preventDefault();
        adjustQuick('fontSize', -2);
        break;
      case '=':
      case '+':
        e.preventDefault();
        adjustQuick('fontSize', 2);
        break;
      case 'ArrowRight':
        e.preventDefault();
        jumpSeg(1);
        break;
      case 'PageUp':
        e.preventDefault();
        FP.invoke('nudge', { dy: -(PB.viewH || 900) * 0.5 });
        break;
      case 'PageDown':
        e.preventDefault();
        FP.invoke('nudge', { dy: (PB.viewH || 900) * 0.5 });
        break;
      case 'Home':
        e.preventDefault();
        FP.invoke('restart');
        break;
    }
  });

  // ── 定时刷新 ──
  function previewFrame() {
    paintPreview(true);
    requestAnimationFrame(previewFrame);
  }
  requestAnimationFrame(previewFrame);
  setInterval(() => {
    paintPreview();
    updateStatus();
  }, 400);

  window.addEventListener('resize', () => {
    fitPreview();
    paintPreview();
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => { fitPreview(); paintPreview(); });
    ro.observe(document.querySelector('.preview-body'));
  }

  function setGuideMode(mode) {
    patchNow({ showGuide: mode !== 'off', guideMode: mode === 'off' ? (S.guideMode || 'triangle') : mode });
  }
  $('readingGuideMode').addEventListener('change', (e) => setGuideMode(e.target.value));
  document.fonts.ready.then(() => { previewGuide.measure(); paintPreview(); });
  document.fonts.addEventListener('loadingdone', () => { previewGuide.measure(); paintPreview(); });

  // ── 启动 ──
  renderQuick();

  FP.invoke('app_info')
    .then((info) => {
      $('stVer').textContent = 'v' + info.version;
      window.__DATA_DIR__ = info.dataDir;
    })
    .catch(() => {});

  function refreshMonitors() {
    return FP.invoke('list_monitors').then((m) => {
      const next = Array.isArray(m) ? m : [];
      if (JSON.stringify(next) === JSON.stringify(MONITORS)) return;
      MONITORS = next;
      $('stMon').textContent = next.length;
      $('stDot').classList.toggle('off', next.length === 0);
      panelKey = '';
      renderPanel(true);
      renderChips();
      renderOutputOverview();
    }).catch(() => {});
  }
  refreshMonitors();
  setInterval(refreshMonitors, 4000);

  FP.onState(onState);
})();
