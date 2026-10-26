/* ============================================================
   monitor.js · 监控窗（正像预览 + 导播控制）
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const readingGuide = FPReadingGuide.create({ root: $('mvRoot'), track: $('mvTrack'), layer: $('mvGuide') });
  let S = null;
  let PB = null;
  let parsed = { blocks: [], segments: [] };
  let lastKey = '';
  let lastLayoutKey = '';
  let cfg = null;
  let anchorPerf = 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function pickCfg(s) {
    const open = s.outputs.filter((o) => o.open);
    return open[0] || s.outputs[0] || null;
  }

  function fit() {
    const v = $('monView');
    const w = v.clientWidth;
    const h = v.clientHeight;
    if (!w || !h) return;
    const k = Math.min(w / 1920, h / 1080);
    const el = $('monInner');
    el.style.transform = `scale(${k})`;
    el.style.left = (w - 1920 * k) / 2 + 'px';
    el.style.top = (h - 1080 * k) / 2 + 'px';
  }

  function applyVars() {
    const r = $('mvRoot').style;
    r.setProperty('--k', '1');
    r.setProperty('--osc', String(cfg ? cfg.scale : 1));
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
    r.setProperty('--is', Math.max(14, S.infoSize * 1.1) + 'px');
    r.setProperty('--align', S.align);
    r.setProperty(
      '--ff',
      S.fontFamily
        ? `"${S.fontFamily}","Segoe UI","Microsoft YaHei UI",sans-serif`
        : '"Segoe UI","Microsoft YaHei UI","Microsoft YaHei",sans-serif'
    );
    // 监控恒为正像
    const pm = $('mvMirror');
    pm.classList.remove('mh');
    pm.classList.remove('mv');
    readingGuide.configure(S);
    $('mvRoot').parentElement
      .querySelectorAll('.veil')
      .forEach((v) => (v.style.display = S.showFade ? 'block' : 'none'));
  }

  function renderText() {
    FPParser.render($('mvTrack'), parsed);
    applyVars();
    requestAnimationFrame(() => {
      const pad = 1080 * ((S.anchorY || 0) / 100);
      $('mvTrack').style.paddingTop = pad + 'px';
      fit();
      readingGuide.measure();
      paint();
      buildMap();
    });
  }

  function ratioNow() {
    if (!PB) return 0;
    const span = PB.contentH > 1 && PB.viewH > 0
      ? PB.contentH - PB.viewH : $('mvTrack').scrollHeight - 1080;
    return clamp(positionNow() / Math.max(1, span), 0, 1);
  }

  function positionNow() {
    const dt = PB && PB.playing ? Math.max(0, performance.now() - anchorPerf) / 1000 : 0;
    return PB ? PB.y + dt * PB.speed : 0;
  }

  function paint() {
    if (!S || !PB) return;
    const t = $('mvTrack');
    const H = 1080;
    const pad = parseFloat(t.style.paddingTop || '0');
    const pvMax = Math.max(0, t.scrollHeight - H);
    const ratio = ratioNow();
    t.style.transform = `translate3d(0,${-(pvMax * ratio)}px,0)`;
    readingGuide.paint(pvMax * ratio);

    // 信息栏
    const put = (id, val) =>
      document.querySelectorAll(`[data-mv="${id}"]`).forEach((el) => {
        el.textContent = val;
      });
    put('clock', FP.clock());
    const elapsed = (PB.elapsed || 0) + (PB.playing ? Math.max(0, performance.now() - anchorPerf) / 1000 : 0);
    put('elapsed', FP.fmt(elapsed));

    // 顶部数值
    $('mSpeed').textContent = Math.round(PB.speed);
    $('mElapsed').textContent = FP.fmt(elapsed);
    const remainSpan =
      PB.contentH > 1 && PB.viewH > 0 ? Math.max(0, PB.contentH - PB.viewH) : pvMax;
    const remain = PB.speed > 0 ? (remainSpan * (1 - ratio)) / PB.speed : 0;
    $('mRemain').textContent = remainSpan > 0 ? FP.fmt(remain) : '--:--';

    const segs = parsed.segments;
    const cur = curSegIndex();
    $('mSeg').textContent = segs.length ? cur + 1 : 0;
    $('mSegTotal').textContent = segs.length;

    document.querySelectorAll('#monMap .seg').forEach((el, i) => {
      el.classList.toggle('done', i < cur);
      el.classList.toggle('cur', i === cur);
    });

    $('liveTag').classList.toggle('paused', !PB.playing);
    $('liveTag').querySelector('span').textContent = PB.playing ? '播放中' : '已暂停';
    $('mPlay').textContent = PB.playing ? '⏸ 暂停' : '▶ 播放';
    $('mPlay').classList.toggle('primary', true);
  }

  function renderInfo() {
    const t = $('mvInfo');
    const items = [];
    if (S.showClock) items.push(['clock', '时间']);
    if (S.showElapsed) items.push(['elapsed', '已用']);
    t.innerHTML = items
      .map(
        ([id, l]) =>
          `<div class="it"><span class="k">${l}</span><span class="v" data-mv="${id}">--</span></div>`
      )
      .join('');
    t.style.display = items.length ? 'flex' : 'none';
  }

  function buildMap() {
    const map = $('monMap');
    const key = parsed.segments.map((s) => s.label).join('\u0001');
    if (map.dataset.key === key) return;
    map.dataset.key = key;
    map.innerHTML = parsed.segments
      .map((s, i) => `<button class="seg" data-i="${i}" title="${FP.escapeHtml(s.label).replace(/"/g, '&quot;')}" aria-label="跳到第 ${i + 1} 段"></button>`)
      .join('');
  }

  function curSegIndex() {
    const t = $('mvTrack');
    const pad = parseFloat(t.style.paddingTop || '0');
    const tr = t.getBoundingClientRect();
    const pvMax = Math.max(0, t.scrollHeight - 1080);
    const y = ratioNow() * pvMax;
    let idx = 0;
    parsed.segments.forEach((sg, i) => {
      const el = t.querySelector(`[data-seg="${sg.index}"]`);
      if (!el) return;
      const off = el.offsetTop - pad;
      if (off <= y + 6) idx = i;
    });
    return idx;
  }

  function jumpToSeg(i) {
    const t = $('mvTrack');
    const pad = parseFloat(t.style.paddingTop || '0');
    const tr = t.getBoundingClientRect();
    const pvMax = Math.max(0, t.scrollHeight - 1080);
    const sg = parsed.segments[i];
    if (!sg) return;
    const el = t.querySelector(`[data-seg="${sg.index}"]`);
    if (!el) return;
    const off = Math.max(0, el.offsetTop - pad);
    const ratio = pvMax > 0 ? clamp(off / pvMax, 0, 1) : 0;
    const realMax = Math.max(1, PB.contentH - PB.viewH);
    FP.invoke('seek', { y: PB.contentH > 1 ? ratio * realMax : off });
  }

  function onState(s) {
    S = s.settings;
    PB = s.playback;
    anchorPerf = performance.now();
    cfg = pickCfg(S);
    if (!cfg) return;

    const key = S.scriptText + '\u0001' + JSON.stringify(S.roles);
    const layoutKey = [S.fontSize, S.fontWeight, S.fontFamily, S.lineHeight, S.paraGap, S.paddingX, S.anchorY, S.align, cfg.scale].join('|');
    if (key !== lastKey) {
      lastKey = key;
      parsed = FPParser.parse(S.scriptText, S.roles);
      renderText();
    } else {
      applyVars();
      if (layoutKey !== lastLayoutKey) {
        $('mvTrack').style.paddingTop = 1080 * ((S.anchorY || 0) / 100) + 'px';
        readingGuide.measure();
      }
      paint();
    }
    lastLayoutKey = layoutKey;
    $('mvTrack').style.paddingTop = 1080 * ((S.anchorY || 0) / 100) + 'px';
    renderInfo();
  }

  // ── 交互 ──
  $('mPlay').onclick = () => FP.invoke('set_playing', { on: !PB.playing });

  $('monMap').addEventListener('click', (e) => {
    const el = e.target.closest('[data-i]');
    if (el) jumpToSeg(Number(el.dataset.i));
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    const act = b.dataset.m;
    const vh = PB.viewH || 900;
    if (act === 'restart') FP.invoke('restart');
    else if (act === 'back') FP.invoke('nudge', { dy: -vh * 0.5 });
    else if (act === 'fwd') FP.invoke('nudge', { dy: vh * 0.5 });
    else if (act === 'slower') FP.invoke('set_speed', { speed: clamp(PB.speed - 5, 5, 600) });
    else if (act === 'faster') FP.invoke('set_speed', { speed: clamp(PB.speed + 5, 5, 600) });
    else if (act === 'fontDown' || act === 'fontUp') {
      const d = act === 'fontUp' ? 2 : -2;
      FP.invoke('patch', { patch: { fontSize: clamp((S ? S.fontSize : 86) + d, 24, 200) } });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!PB || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) return;
    if (e.key === ' ') {
      e.preventDefault();
      FP.invoke('set_playing', { on: !PB.playing });
    } else if (e.key === 'ArrowLeft') {
      jumpToSeg(clamp(curSegIndex() - 1, 0, Math.max(0, parsed.segments.length - 1)));
    } else if (e.key === 'ArrowRight') {
      jumpToSeg(clamp(curSegIndex() + 1, 0, Math.max(0, parsed.segments.length - 1)));
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      FP.invoke('patch', { patch: { fontSize: clamp((S ? S.fontSize : 86) - 2, 24, 200) } });
    } else if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      FP.invoke('patch', { patch: { fontSize: clamp((S ? S.fontSize : 86) + 2, 24, 200) } });
    }
  });

  window.addEventListener('resize', () => {
    fit();
    paint();
  });

  function frame() {
    if (PB) {
      const t = $('mvTrack');
      const max = Math.max(0, t.scrollHeight - 1080);
      const y = max * ratioNow();
      t.style.transform = `translate3d(0,${-y}px,0)`;
      readingGuide.paint(y);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setInterval(paint, 250);

  const refreshGuide = () => { readingGuide.measure(); paint(); };
  document.fonts.ready.then(refreshGuide);
  document.fonts.addEventListener('loadingdone', refreshGuide);
  FP.onState(onState);
})();
