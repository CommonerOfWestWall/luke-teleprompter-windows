/* ============================================================
   parser.js · 文稿解析与渲染
   标记：
     # 标题1 / ## 标题2 / ### 标题3
     > 口播提示
     **重点**   行内高亮
     // 备注     不朗读的说明
     ---        强制分段
     @男 台词    角色行（角色标记可在设置里改）
   ============================================================ */
window.FPParser = (function () {
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function inline(s) {
    let out = esc(s);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<em class="hl">$1</em>');
    out = out.replace(/==([^=]+)==/g, '<em class="hl">$1</em>');
    return out;
  }

  function parse(text, roles) {
    const lines = (text || '').replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let seg = 0;
    let opened = false; // 当前段是否已有内容
    const roleList = (roles || []).filter((r) => r.tag);

    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      const t = line.trim();

      if (t === '') {
        if (opened) {
          seg++;
          opened = false;
        }
        blocks.push({ kind: 'blank', seg });
        continue;
      }

      if (/^-{3,}$/.test(t)) {
        if (opened) {
          seg++;
          opened = false;
        }
        blocks.push({ kind: 'sep', seg });
        seg++;
        continue;
      }

      if (t.startsWith('//')) {
        blocks.push({ kind: 'note', seg, html: inline(t.slice(2).trim()) });
        opened = true;
        continue;
      }

      // 角色行优先于标题（避免 @ 与 # 冲突其实不冲突，但顺序更直观）
      let role = null;
      for (const r of roleList) {
        if (t.startsWith(r.tag)) {
          role = r;
          break;
        }
      }
      if (role) {
        const body = t
          .slice(role.tag.length)
          .replace(/^[:：\s]+/, '');
        blocks.push({ kind: 'p', seg, role, html: inline(body) });
        opened = true;
        continue;
      }

      if (t.startsWith('### ')) {
        blocks.push({ kind: 'h3', seg, html: inline(t.slice(4)) });
        opened = true;
        continue;
      }
      if (t.startsWith('## ')) {
        blocks.push({ kind: 'h2', seg, html: inline(t.slice(3)) });
        opened = true;
        continue;
      }
      if (t.startsWith('# ')) {
        blocks.push({ kind: 'h1', seg, html: inline(t.slice(2)) });
        opened = true;
        continue;
      }
      if (t.startsWith('> ')) {
        blocks.push({ kind: 'cue', seg, html: inline(t.slice(2)) });
        opened = true;
        continue;
      }

      blocks.push({ kind: 'p', seg, html: inline(t) });
      opened = true;
    }

    // 汇总分段
    const map = new Map();
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.kind === 'blank' || b.kind === 'sep') continue;
      if (!map.has(b.seg)) map.set(b.seg, { index: b.seg, from: i, to: i, label: '' });
      const s = map.get(b.seg);
      s.to = i;
      if (!s.label) {
        const plain = (b.html || '')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        s.label = plain.slice(0, 10) || `第 ${map.size + 1} 段`;
      }
    }
    const segments = [...map.values()].sort((a, b) => a.index - b.index);
    segments.forEach((s, i) => (s.no = i + 1));

    return { blocks, segments };
  }

  function blockHtml(b) {
    switch (b.kind) {
      case 'blank':
        return '<div style="height:.34em"></div>';
      case 'sep':
        return '<div class="sep"></div>';
      case 'h1':
        return `<p class="h1">${b.html}</p>`;
      case 'h2':
        return `<p class="h2">${b.html}</p>`;
      case 'h3':
        return `<p class="h3">${b.html}</p>`;
      case 'cue':
        return `<p class="cue">${b.html}</p>`;
      case 'note':
        return `<p class="note">${b.html}</p>`;
      case 'p':
        if (b.role) {
          const w = b.role.bold ? 800 : 500;
          return `<p class="role" style="color:${b.role.color};font-weight:${w};font-size:${b.role.scale}em">${b.html}</p>`;
        }
        return `<p>${b.html}</p>`;
      default:
        return '';
    }
  }

  /** 渲染到容器，给每个段的首块打 data-seg 便于定位 */
  function render(container, parsed) {
    const seen = new Set();
    const parts = [];
    for (const b of parsed.blocks) {
      const attr = !seen.has(b.seg) && b.kind !== 'blank' && b.kind !== 'sep'
        ? ` data-seg="${b.seg}"`
        : '';
      if (attr) seen.add(b.seg);
      if (b.kind === 'blank' || b.kind === 'sep') {
        parts.push(blockHtml(b));
      } else {
        const h = blockHtml(b);
        // 把 data-seg 塞进首标签
        parts.push(h.replace(/^<(p|div)/, `<$1${attr}`));
      }
    }
    container.innerHTML = parts.join('');
  }

  /** 取某段起始元素相对容器内容顶部的偏移 */
  function segOffset(container, segIndex) {
    const el =
      container.querySelector(`[data-seg="${segIndex}"]`) ||
      container.querySelector('[data-seg]');
    if (!el) return 0;
    return el.offsetTop;
  }

  return { parse, render, segOffset, blockHtml, inline };
})();
