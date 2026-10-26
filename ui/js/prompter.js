/* ============================================================
   prompter.js · 提词输出窗 / 素材投放窗
   ============================================================ */
(function () {
  const outId = new URLSearchParams(location.search).get('out') || 'main';
  const $ = (id) => document.getElementById(id);
  const track = $('track');
  const readingGuide = FPReadingGuide.create({ root: $('root'), track, layer: $('guide') });

  let cfg = null;
  let settings = null;
  let parsed = { blocks: [], segments: [] };
  let segOffsets = [];
  let paddingTop = 0;

  let lastTextKey = '';
  let lastLayoutKey = '';
  let lastApplied = -1;
  let infoStructKey = '';

  let liveY = 0;
  let liveElapsed = 0;

  const local = {
    y: 0,
    speed: 60,
    playing: false,
    anchorPerf: 0,
    seq: -1,
    elapsed: 0,
    maxY: 0,
  };

  const BASE_FONT =
    '"Segoe UI","Microsoft YaHei UI","Microsoft YaHei",system-ui,sans-serif';

  function fontStack(f) {
    return f ? `"${f}",${BASE_FONT}` : BASE_FONT;
  }

  // ── 样式变量 ──
  function applyVars(s, c) {
    const r = document.documentElement.style;
    const H = window.innerHeight || 1080;
    const k = s.autoScale ? H / 1080 : 1;

    r.setProperty('--k', k.toFixed(5));
    r.setProperty('--osc', String(c.scale || 1));
    r.setProperty('--bgc', s.bg);
    r.setProperty('--fgc', s.fg);
    r.setProperty('--tc', s.titleColor);
    r.setProperty('--cc', s.cueColor);
    r.setProperty('--nc', s.noteColor);
    r.setProperty('--ic', s.infoColor);
    r.setProperty('--fs', s.fontSize + 'px');
    r.setProperty('--lh', String(s.lineHeight));
    r.setProperty('--fw', String(s.fontWeight));
    r.setProperty('--pg', s.paraGap + 'em');
    r.setProperty('--px', s.paddingX + '%');
    r.setProperty('--is', s.infoSize + 'px');
    r.setProperty('--align', s.align);
    r.setProperty('--ff', fontStack(s.fontFamily));

    // 锁定位置时不给拖动把手
    document.body.classList.toggle('windowed', !c.fullscreen && !c.locked);

    const mi = $('mirror');
    mi.classList.toggle('mh', !!c.mirrorH);
    mi.classList.toggle('mv', !!c.mirrorV);

    $('veilTop').style.display = s.showFade ? 'block' : 'none';
    $('veilBottom').style.display = s.showFade ? 'block' : 'none';

    readingGuide.configure(c.mode === 'media' && c.media ? { ...s, showGuide: false } : s);

    $('progress').classList.toggle('on', !!s.showProgress);

    const mediaMode = c.mode === 'media' && c.media;
    $('stage').style.display = mediaMode ? 'none' : 'block';
    $('mediaLayer').classList.toggle('on', !!mediaMode);
    if (!mediaMode) {
      $('slideNo').classList.remove('on');
      $('mediaLayer').innerHTML = '';
      $('mediaLayer').dataset.src = '';
    }
  }

  // ── 文稿渲染 ──
  function rerender(s) {
    const key = s.scriptText + '\u0001' + JSON.stringify(s.roles);
    if (key === lastTextKey) return false;
    lastTextKey = key;
    parsed = FPParser.parse(s.scriptText, s.roles);
    FPParser.render(track, parsed);
    return true;
  }

  // ── 测量 ──
  function measure() {
    if (!settings) return;
    const H = window.innerHeight;
    paddingTop = H * ((settings.anchorY || 0) / 100);
    track.style.paddingTop = paddingTop + 'px';

    const tr = track.getBoundingClientRect();
    segOffsets = parsed.segments.map((sg) => {
      const el = track.querySelector(`[data-seg="${sg.index}"]`);
      if (!el) return 0;
      return Math.max(0, el.getBoundingClientRect().top - tr.top - paddingTop);
    });

    const contentH = track.scrollHeight;
    local.maxY = Math.max(0, contentH - H);
    readingGuide.measure();
    FP.invoke('report_metrics', { contentH, viewH: H }).catch(() => {});
  }

  // ── 位移 ──
  function applyY(y) {
    const v = Math.max(0, y);
    if (Math.abs(v - lastApplied) < 0.4) return;
    lastApplied = v;
    track.style.transform = `translate3d(0,${-v}px,0)`;
  }

  function frame() {
    if (local.playing) {
      const dt = (performance.now() - local.anchorPerf) / 1000;
      let y = local.y + dt * local.speed;
      if (y > local.maxY) y = local.maxY;
      applyY(y);
      liveY = y;
      liveElapsed = local.elapsed + dt;
    } else {
      applyY(local.y);
      liveY = local.y;
      liveElapsed = local.elapsed;
    }
    readingGuide.paint(liveY);
    requestAnimationFrame(frame);
  }

  // ── 信息栏 ──
  function renderInfo(s) {
    const st = s.settings;
    const show = !!(cfg && cfg.showInfo);
    const items = [];
    if (show) {
      if (st.showClock) items.push(['clock', '时间']);
      if (st.showElapsed) items.push(['elapsed', '已用']);
      if (st.showRemaining) items.push(['remain', '剩余']);
      if (st.showSpeed) items.push(['speed', '速度']);
    }
    const key = items.map((i) => i[0]).join(',') + '|' + st.infoTop + st.infoBottom;
    if (key === infoStructKey) return;
    infoStructKey = key;

    const html = items
      .map(
        ([id, label]) =>
          `<div class="it"><span class="k">${label}</span><span class="v" data-v="${id}">--</span></div>`
      )
      .join('');

    const top = $('infoTop');
    const bot = $('infoBottom');
    top.innerHTML = html;
    bot.innerHTML = html;
    top.style.display = st.infoTop && items.length ? 'flex' : 'none';
    bot.style.display = st.infoBottom && items.length ? 'flex' : 'none';
  }

  setInterval(() => {
    if (!settings || !cfg) return;
    const put = (id, val) =>
      document.querySelectorAll(`[data-v="${id}"]`).forEach((el) => {
        el.textContent = val;
      });

    put('clock', FP.clock());
    put('elapsed', FP.fmt(liveElapsed));

    const remain = local.speed > 0 ? (local.maxY - liveY) / local.speed : 0;
    put('remain', FP.fmt(remain));

    // 速度单位与控制台保持一致（控制台里就是 px/s），避免两套单位对不上
    put('speed', Math.round(local.speed) + ' px/s');

    if (settings.showProgress) {
      const p = local.maxY > 0 ? (liveY / local.maxY) * 100 : 0;
      $('progressBar').style.width = Math.min(100, p).toFixed(2) + '%';
    }
  }, 250);

  // ── 媒体 ──
  function showMedia(c) {
    const layer = $('mediaLayer');
    const m = c.media;
    if (!m) return;

    if (m.kind === 'video') {
      if (layer.dataset.src !== m.url) {
        layer.dataset.src = m.url;
        layer.innerHTML = `<video src="${m.url}"${
          c.loopVideo ? ' loop' : ''
        } autoplay playsinline></video>`;
      }
      $('slideNo').classList.remove('on');
    } else if (m.kind === 'slides') {
      const url = m.frames[c.slide] || '';
      if (url && layer.dataset.src !== url) {
        layer.dataset.src = url;
        layer.innerHTML = `<img src="${url}" alt="">`;
      }
      const no = $('slideNo');
      no.textContent = `${(c.slide || 0) + 1} / ${m.frames.length}`;
      no.classList.add('on');
    } else {
      if (layer.dataset.src !== m.url) {
        layer.dataset.src = m.url;
        layer.innerHTML = `<img src="${m.url}" alt="">`;
      }
      $('slideNo').classList.remove('on');
    }
  }

  // ── 状态 ──
  function onState(s) {
    settings = s.settings;
    cfg = s.settings.outputs.find((o) => o.id === outId);
    if (!cfg) {
      track.innerHTML =
        '<div style="color:#888;font-size:28px;padding:40px">该提词屏已被移除</div>';
      return;
    }

    applyVars(s.settings, cfg);

    const needMeasureText = rerender(s.settings);

    const layoutKey = [
      s.settings.fontSize,
      s.settings.lineHeight,
      s.settings.paraGap,
      s.settings.paddingX,
      s.settings.anchorY,
      s.settings.autoScale,
      s.settings.align,
      s.settings.fontWeight,
      s.settings.fontFamily,
      cfg.scale,
      cfg.mode,
    ].join('|');
    if (needMeasureText || layoutKey !== lastLayoutKey) {
      lastLayoutKey = layoutKey;
      measure();
    }

    if (cfg.mode === 'media' && cfg.media) {
      showMedia(cfg);
    } else {
      $('stage').style.display = 'block';
      $('mediaLayer').classList.remove('on');
    }

    const pb = s.playback;
    if (pb.seq !== local.seq) {
      local.y = pb.y;
      local.speed = pb.speed;
      local.playing = pb.playing;
      local.elapsed = pb.elapsed || 0;
      local.seq = pb.seq;
      local.anchorPerf = performance.now();
      lastApplied = -1;
      applyY(local.y);
    }

    renderInfo(s);
  }

  // ── 交互 ──
  let hideTimer = 0;
  function poke() {
    document.body.classList.add('show-cursor');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => document.body.classList.remove('show-cursor'), 2200);
  }
  window.addEventListener('mousemove', poke);

  window.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const d = e.deltaY > 0 ? 4 : -4;
      FP.invoke('set_speed', { speed: FP.clamp(local.speed + d, 5, 600) });
    },
    { passive: false }
  );

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (cfg && cfg.locked) return; // 已锁定，防现场误关
      FP.invoke('output_self_close', { id: outId });
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      FP.invoke('set_playing', { on: !local.playing });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      FP.invoke('set_speed', { speed: FP.clamp(local.speed + 5, 5, 600) });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      FP.invoke('set_speed', { speed: FP.clamp(local.speed - 5, 5, 600) });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      FP.invoke('nudge', { dy: -window.innerHeight * 0.5 });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      FP.invoke('nudge', { dy: window.innerHeight * 0.5 });
    } else if (e.key === 'Home') {
      FP.invoke('restart');
    }
  });

  window.addEventListener('resize', () => {
    measure();
    lastApplied = -1;
    applyY(local.y);
  });

  document.fonts.ready.then(measure);
  document.fonts.addEventListener('loadingdone', measure);
  FP.onState(onState);
  requestAnimationFrame(frame);
})();
