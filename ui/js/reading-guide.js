/* Shared visual reading guide for the output, preview, and monitor windows. */
window.FPReadingGuide = (function () {
  'use strict';

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function number(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function matrixInfo(el) {
    const transform = el ? getComputedStyle(el).transform : 'none';
    if (!transform || transform === 'none') return { x: 1, y: 1, scaleX: 1, scaleY: 1 };
    const match = transform.match(/^matrix(3d)?\(([^)]+)\)$/);
    if (!match) return { x: 1, y: 1, scaleX: 1, scaleY: 1 };
    const values = match[2].split(',').map(Number);
    if (match[1]) {
      return { x: values[0] < 0 ? -1 : 1, y: values[5] < 0 ? -1 : 1, scaleX: Math.abs(values[0]) || 1, scaleY: Math.abs(values[5]) || 1 };
    }
    return { x: values[0] < 0 ? -1 : 1, y: values[3] < 0 ? -1 : 1, scaleX: Math.abs(values[0]) || 1, scaleY: Math.abs(values[3]) || 1 };
  }

  function create(options) {
    const root = options && options.root;
    const track = options && options.track;
    const layer = options && options.layer;
    if (!root || !track || !layer) throw new TypeError('FPReadingGuide.create requires root, track, and layer');

    const settings = {
      showGuide: false,
      guideMode: 'triangle',
      guideOpacity: 65,
      guideSize: 16,
      anchorY: 50,
    };
    let lines = [];
    let active = false;
    let lastLine = -1;
    let lastScroll = NaN;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let nodes = null;

    layer.setAttribute('aria-hidden', 'true');
    layer.style.pointerEvents = 'none';

    function clear() {
      layer.replaceChildren();
      layer.classList.remove('rg-active');
      layer.dataset.mode = settings.guideMode;
      delete layer.dataset.line;
      lastLine = -1;
      nodes = null;
    }

    function configure(next) {
      const input = next || {};
      const previousMode = settings.guideMode;
      const previousActive = active;
      if (Object.prototype.hasOwnProperty.call(input, 'showGuide')) {
        settings.showGuide = input.showGuide === true;
      }
      settings.guideMode = input.guideMode === 'invert' ? 'invert' : 'triangle';
      settings.guideOpacity = clamp(number(input.guideOpacity, 65), 0, 100);
      settings.guideSize = clamp(number(input.guideSize, 16), 8, 40);
      settings.anchorY = clamp(number(input.anchorY, 50), 8, 88);
      active = settings.showGuide;
      layer.dataset.mode = settings.guideMode;
      layer.dataset.opacity = String(settings.guideOpacity);
      layer.dataset.size = String(settings.guideSize);
      layer.dataset.anchorY = String(settings.anchorY);
      lastLine = -1;
      lastScroll = NaN;
      if (!active) clear();
      else {
        layer.classList.add('rg-active');
        layer.style.mixBlendMode = settings.guideMode === 'invert' ? 'difference' : 'normal';
        if (previousMode !== settings.guideMode || previousActive !== active) {
          layer.replaceChildren();
          nodes = null;
          lastLine = -1;
          lastScroll = NaN;
        }
      }
      return api;
    }

    function localRect(rect, trackRect, sx, sy, scaleX, scaleY) {
      const x = (screen) => sx < 0
        ? (trackRect.right - screen) / scaleX
        : (screen - trackRect.left) / scaleX;
      const y = (screen) => sy < 0
        ? (trackRect.bottom - screen) / scaleY
        : (screen - trackRect.top) / scaleY;
      let left = x(rect.left);
      let right = x(rect.right);
      let top = y(rect.top);
      let bottom = y(rect.bottom);
      if (left > right) [left, right] = [right, left];
      if (top > bottom) [top, bottom] = [bottom, top];
      return { left, right, top, bottom };
    }

    function measure() {
      const width = root.clientWidth;
      const height = root.clientHeight;
      viewportWidth = width;
      viewportHeight = height;
      if (!width || !height) {
        lines = [];
        if (!active) clear();
        return lines;
      }
      const trackRect = track.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const rootScaleX = Math.abs(rootRect.width / width) || 1;
      const rootScaleY = Math.abs(rootRect.height / height) || 1;
      const signs = matrixInfo(layer.parentElement);
      const raw = [];
      const walker = document.createTreeWalker(track, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.nodeValue || !node.nodeValue.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = range.getClientRects();
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          if (r.width < 0.1 || r.height < 0.1) continue;
          const local = localRect(r, trackRect, signs.x, signs.y, rootScaleX * signs.scaleX, rootScaleY * signs.scaleY);
          raw.push(local);
        }
        range.detach();
      }
      raw.sort((a, b) => a.top - b.top || a.left - b.left);
      const merged = [];
      for (const r of raw) {
        const center = (r.top + r.bottom) / 2;
        const last = merged[merged.length - 1];
        if (last && Math.abs(center - last.center) <= Math.max(0.75, Math.min(r.bottom - r.top, last.bottom - last.top) * 0.35)) {
          last.left = Math.min(last.left, r.left);
          last.right = Math.max(last.right, r.right);
          last.top = Math.min(last.top, r.top);
          last.bottom = Math.max(last.bottom, r.bottom);
          last.center = (last.top + last.bottom) / 2;
        } else {
          merged.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, center });
        }
      }
      lines = merged.map((r) => ({
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        center: r.center,
      }));
      lastLine = -1;
      lastScroll = NaN;
      if (!active) clear();
      return lines;
    }

    function paint(scrollY) {
      if (!active || !lines.length) {
        if (layer.childNodes.length || layer.classList.contains('rg-active')) clear();
        return -1;
      }
      const yScroll = Number.isFinite(Number(scrollY)) ? Number(scrollY) : 0;
      const target = viewportHeight * settings.anchorY / 100;
      const visibleTop = yScroll;
      const visibleBottom = yScroll + viewportHeight;
      const lowerBound = (value, field) => {
        let lo = 0, hi = lines.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (lines[mid][field] < value) lo = mid + 1; else hi = mid; }
        return lo;
      };
      const first = Math.max(0, lowerBound(visibleTop, 'bottom') - 1);
      const end = Math.min(lines.length, lowerBound(visibleBottom, 'top') + 1);
      let selected = -1;
      let distance = Infinity;
      const targetContent = target + yScroll;
      let near = lowerBound(targetContent, 'center');
      near = Math.max(first, Math.min(end - 1, near));
      for (let i = Math.max(first, near - 1); i <= Math.min(end - 1, near + 1); i++) {
        const line = lines[i];
        const center = line.center - yScroll;
        if (line.bottom - yScroll <= 0 || line.top - yScroll >= viewportHeight) continue;
        const d = Math.abs(center - target);
        if (d < distance) { distance = d; selected = i; }
      }
      if (selected < 0) {
        clear();
        return -1;
      }
      if (selected === lastLine && yScroll === lastScroll) return selected;
      lastLine = selected;
      lastScroll = yScroll;
      const line = lines[selected];
      const top = line.top - yScroll;
      const height = Math.max(1, line.bottom - line.top);
      const center = line.center - yScroll;
      layer.classList.add('rg-active');
      layer.dataset.line = String(selected);
      if (!nodes) {
        const band = document.createElement('div');
        band.className = 'rg-band';
        band.setAttribute('aria-hidden', 'true');
        const left = document.createElement('div');
        left.className = 'rg-arrow rg-arrow-left';
        left.dataset.side = 'left';
        left.setAttribute('aria-hidden', 'true');
        const right = document.createElement('div');
        right.className = 'rg-arrow rg-arrow-right';
        right.dataset.side = 'right';
        right.setAttribute('aria-hidden', 'true');
        layer.append(band, left, right);
        nodes = { band, left, right };
      }
      if (settings.guideMode === 'invert') {
        nodes.band.style.display = 'block';
        nodes.band.style.left = '0px';
        nodes.band.style.top = `${top}px`;
        nodes.band.style.width = `${viewportWidth}px`;
        nodes.band.style.height = `${height}px`;
        nodes.left.style.display = 'none';
        nodes.right.style.display = 'none';
      } else {
        const size = Math.max(8, settings.guideSize * viewportHeight / 1080);
        nodes.band.style.display = 'none';
        for (const arrow of [nodes.left, nodes.right]) {
          arrow.style.display = 'block';
          arrow.style.top = `${center - size / 2}px`;
          arrow.style.width = `${size}px`;
          arrow.style.height = `${size}px`;
          arrow.style.setProperty('--rg-arrow-size', `${size}px`);
          arrow.style.opacity = String(settings.guideOpacity / 100);
          arrow.style.pointerEvents = 'none';
        }
      }
      return selected;
    }

    const api = { configure, measure, paint };
    return api;
  }

  return { create };
})();
