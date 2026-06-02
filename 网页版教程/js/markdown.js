/* ============================================================
 * markdown.js — Lightweight Markdown → HTML renderer
 * Supports: headings, bold/italic, links, images (with basePath),
 *           inline + fenced code, blockquotes, lists (nested),
 *           tables (with alignment), hr, paragraphs, inline math.
 * No external dependencies.
 * ============================================================ */
(function (global) {
  'use strict';

  // ----------------------------- helpers -----------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  // Convert heading text to a slug usable as an HTML id.
  // Strips inline HTML, decodes common entities, keeps CJK + word chars,
  // replaces other runs with '-'.
  function slugify(text) {
    if (!text) return '';
    var plain = String(text).replace(/<[^>]*>/g, '');
    plain = plain.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return plain.trim().toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function joinPath(base, rel) {
    if (!rel) return rel;
    if (/^(https?:|data:|file:|blob:|\/\/)/i.test(rel)) return rel;
    if (!base) return rel;
    if (base.endsWith('/')) return base + rel.replace(/^\.?\/+/, '');
    return base + '/' + rel.replace(/^\.?\/+/, '');
  }

  // very small token-style highlighter for code blocks
  function highlightCode(code, lang) {
    if (!lang) return escapeHtml(code);
    const l = lang.toLowerCase();
    const escaped = escapeHtml(code);
    const isCode = /^(js|javascript|ts|typescript|py|python|java|go|rust|c|cpp|cs|json|sh|bash|yaml|yml|sql)$/.test(l);
    if (!isCode) return escaped;

    const keywords = {
      js: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|async|await|yield|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|this)\b/g,
      ts: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|implements|interface|import|export|from|default|async|await|yield|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false|this|public|private|protected|readonly|type|enum|as|namespace)\b/g,
      py: /\b(def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|with|try|except|finally|raise|yield|lambda|pass|break|continue|global|nonlocal|async|await|self)\b/g,
      java: /\b(public|private|protected|class|interface|extends|implements|abstract|static|final|void|int|long|short|byte|char|boolean|float|double|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|null|true|false|this|super|enum)\b/g,
      go:   /\b(func|var|const|type|struct|interface|package|import|return|if|else|for|range|switch|case|break|continue|default|go|defer|chan|map|nil|true|false)\b/g,
      json: /\b(true|false|null)\b/g,
      sh:   /\b(if|then|else|elif|fi|case|esac|for|while|do|done|in|function|return|local|export)\b/g,
      yaml: /^(\s*-\s|\s*[A-Za-z_][\w-]*\s*:)/gm
    };
    const langKey =
      l === 'javascript' ? 'js' :
      l === 'typescript' ? 'ts' :
      l === 'python' ? 'py' :
      l === 'cpp' || l === 'c' || l === 'cs' ? 'java' :
      l === 'rust' ? 'js' :
      l === 'bash' ? 'sh' :
      l === 'yml' ? 'yaml' :
      l === 'sql' ? 'js' :
      l;

    let out = escaped;
    // strings
    out = out.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="tok-str">$1</span>');
    // single-line comments
    if (langKey === 'py' || langKey === 'sh' || langKey === 'yaml') {
      out = out.replace(/(^|\n)(#[^\n]*)/g, '$1<span class="tok-com">$2</span>');
    } else {
      out = out.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
      out = out.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>');
    }
    // numbers
    out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
    // keywords
    if (keywords[langKey]) {
      out = out.replace(keywords[langKey], '<span class="tok-key">$&</span>');
    }
    // function calls
    out = out.replace(/([A-Za-z_][\w]*)(\s*\()/g, '<span class="tok-fn">$1</span>$2');
    return out;
  }

  // ----------------------------- inline -----------------------------
  function renderInline(text, basePath) {
    if (!text) return '';

    // 1) protect inline code spans  `code`
    const codeStash = [];
    text = text.replace(/`([^`\n]+?)`/g, function (_, c) {
      codeStash.push(c);
      return '\u0000C' + (codeStash.length - 1) + '\u0000';
    });

    // 2) protect inline math  $...$
    const mathStash = [];
    text = text.replace(/\$([^$\n]+?)\$/g, function (_, m) {
      mathStash.push(m);
      return '\u0000M' + (mathStash.length - 1) + '\u0000';
    });

    // 3) protect a small allowlist of inline HTML tags so they survive escapeHtml.
    //    Lets raw HTML <img>, <br>, <hr>, <b>/<i>/<em>/<strong>/<sub>/<sup>... in
    //    source markdown render correctly instead of being shown as literal text.
    const htmlStash = [];
    function stashHtml(m) {
      htmlStash.push(m);
      return '\u0000H' + (htmlStash.length - 1) + '\u0000';
    }
    // self-closing / void: <img ... />
    text = text.replace(/<img\s[^>]*\/?>/gi, stashHtml);
    // void: <br>, <hr>
    text = text.replace(/<(?:br|hr)\s*\/?>/gi, stashHtml);
    // safe inline tags (open & close)
    text = text.replace(/<\/?(?:b|i|em|strong|sub|sup|u|s|del|mark|small|span|a)(?:\s[^>]*)?>/gi, stashHtml);

    // escape html on remaining text (so user input cannot break layout)
    text = escapeHtml(text);

    // images  ![alt](src "title")
    text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
      function (_, alt, src, title) {
        const finalSrc = joinPath(basePath, src);
        const t = title ? ` title="${escapeAttr(title)}"` : '';
        return `<img src="${escapeAttr(finalSrc)}" alt="${escapeAttr(alt)}"${t} loading="lazy" />`;
      });

    // links  [text](url "title")
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
      function (_, txt, url, title) {
        const isExternal = /^(https?:|mailto:)/i.test(url);
        const t = title ? ` title="${escapeAttr(title)}"` : '';
        const tgt = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeAttr(url)}"${t}${tgt}>${txt}</a>`;
      });

    // bold: **text** or __text__
    text = text.replace(/\*\*([^*\n][^*]*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_\n][^_]*?)__/g, '<strong>$1</strong>');

    // italic: *text* or _text_  (avoid eating ** parts already converted)
    text = text.replace(/(^|[^*])\*([^*\n][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
    text = text.replace(/(^|[^_])_([^_\n][^_]*?)_(?!_)/g, '$1<em>$2</em>');

    // strikethrough ~~x~~
    text = text.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>');

    // restore math
    text = text.replace(/\u0000M(\d+)\u0000/g, function (_, i) {
      return `<span class="math">${escapeHtml(mathStash[+i])}</span>`;
    });

    // restore inline code
    text = text.replace(/\u0000C(\d+)\u0000/g, function (_, i) {
      return `<code>${escapeHtml(codeStash[+i])}</code>`;
    });

    // restore preserved inline HTML; for <img> with relative src, resolve via basePath
    text = text.replace(/\u0000H(\d+)\u0000/g, function (_, i) {
      var raw = htmlStash[+i];
      if (/^<img\b/i.test(raw)) {
        raw = raw.replace(/(\ssrc\s*=\s*)(?:"([^"]*)"|'([^']*)')/i, function (_m, pre, dq, sq) {
          var url = dq != null ? dq : sq;
          var resolved = joinPath(basePath, url);
          return pre + '"' + escapeAttr(resolved) + '"';
        });
      }
      return raw;
    });

    return text;
  }

  // ----------------------------- block parser -----------------------------
  function renderMarkdown(src, basePath) {
    if (src == null) return '';
    basePath = basePath || '';
    // normalize line endings, strip BOM
    src = String(src).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

    const lines = src.split('\n');
    const out = [];
    let i = 0;

    // List stack: [{type:'ul'|'ol', indent:number}]
    let listStack = [];

    function closeAllLists() {
      while (listStack.length) {
        out.push('</li></' + listStack.pop().type + '>');
      }
    }
    function closeListsTo(indent) {
      while (listStack.length && listStack[listStack.length - 1].indent > indent) {
        out.push('</li></' + listStack.pop().type + '>');
      }
    }

    while (i < lines.length) {
      let line = lines[i];

      // ----- fenced code block -----
      const fence = line.match(/^(\s*)(```+|~~~+)\s*([\w+-]*)\s*$/);
      if (fence) {
        closeAllLists();
        const marker = fence[2];
        const lang = fence[3] || '';
        i++;
        const codeLines = [];
        while (i < lines.length && !lines[i].match(new RegExp('^\\s*' + marker[0] + '{' + marker.length + ',}\\s*$'))) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing fence
        const codeText = codeLines.join('\n');
        const langClass = lang ? ` class="language-${escapeAttr(lang)}"` : '';
        const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : '';
        out.push(`<pre${langAttr}><code${langClass}>${highlightCode(codeText, lang)}</code></pre>`);
        continue;
      }

      // ----- horizontal rule -----
      if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) {
        closeAllLists();
        out.push('<hr/>');
        i++;
        continue;
      }

      // ----- heading -----
      const heading = line.match(/^(\s*)(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        closeAllLists();
        const level = heading[2].length;
        const inner = renderInline(heading[3], basePath);
        const slug = slugify(heading[3]);
        const idAttr = slug ? ` id="${escapeAttr(slug)}"` : '';
        out.push(`<h${level}${idAttr}>${inner}</h${level}>`);
        i++;
        continue;
      }

      // ----- blockquote -----
      if (/^\s*>\s?/.test(line)) {
        closeAllLists();
        const buf = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        // recursively render inner content (no basePath change)
        const inner = renderMarkdown(buf.join('\n'), basePath);
        out.push(`<blockquote>${inner}</blockquote>`);
        continue;
      }

      // ----- table -----
      if (i + 1 < lines.length && /\|/.test(line) && /^\s*\|?\s*:?-{2,}:?(\s*\|\s*:?-{2,}:?)+\s*\|?\s*$/.test(lines[i + 1])) {
        closeAllLists();
        const header = splitRow(line);
        const aligns = splitRow(lines[i + 1]).map(c => {
          const t = c.trim();
          if (/^:-+:$/.test(t)) return 'center';
          if (/-+:$/.test(t)) return 'right';
          if (/^:-+/.test(t)) return 'left';
          return null;
        });
        i += 2;
        const rows = [];
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') {
          rows.push(splitRow(lines[i]));
          i++;
        }
        let html = '<table><thead><tr>';
        header.forEach((h, idx) => {
          const a = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : '';
          html += `<th${a}>${renderInline(h.trim(), basePath)}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(r => {
          html += '<tr>';
          r.forEach((c, idx) => {
            const a = aligns[idx] ? ` style="text-align:${aligns[idx]}"` : '';
            html += `<td${a}>${renderInline(c.trim(), basePath)}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
        out.push(html);
        continue;
      }

      // ----- list item -----
      const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (ulMatch || olMatch) {
        const m = ulMatch || olMatch;
        const indent = m[1].replace(/\t/g, '    ').length;
        const type = ulMatch ? 'ul' : 'ol';
        const content = m[3];

        // close deeper lists
        closeListsTo(indent);

        // open new list if needed
        const top = listStack[listStack.length - 1];
        if (!top || top.indent < indent || top.type !== type) {
          if (top && top.indent === indent && top.type !== type) {
            // same indent but different type -> close current
            out.push('</li></' + listStack.pop().type + '>');
          }
          out.push('<' + type + '>');
          listStack.push({ type: type, indent: indent });
        } else {
          // sibling
          out.push('</li>');
        }
        out.push('<li>' + renderInline(content, basePath));
        i++;
        // collect continuation lines (indented under current item)
        while (i < lines.length) {
          const nxt = lines[i];
          if (nxt.trim() === '') { break; }
          const nxtUl = nxt.match(/^(\s*)([-*+])\s+/);
          const nxtOl = nxt.match(/^(\s*)(\d+)\.\s+/);
          if (nxtUl || nxtOl) break;
          if (/^\s*#{1,6}\s+/.test(nxt)) break;
          if (/^\s*>\s?/.test(nxt)) break;
          if (/^\s*```/.test(nxt)) break;
          // continuation paragraph for current item
          out.push('<br/>' + renderInline(nxt.trim(), basePath));
          i++;
        }
        continue;
      }

      // blank line: paragraph break / list close on double-blank
      if (line.trim() === '') {
        // peek: if next non-blank line is not a list item, close lists
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        if (j >= lines.length || (!/^(\s*)([-*+])\s+/.test(lines[j]) && !/^(\s*)\d+\.\s+/.test(lines[j]))) {
          closeAllLists();
        }
        i++;
        continue;
      }

      // ----- paragraph -----
      closeAllLists();
      const buf = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^\s*#{1,6}\s+/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i]) &&
        !/^\s*```/.test(lines[i]) &&
        !/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(lines[i]) &&
        !/^(\s*)([-*+])\s+/.test(lines[i]) &&
        !/^(\s*)\d+\.\s+/.test(lines[i])
      ) {
        buf.push(lines[i]);
        i++;
      }
      out.push('<p>' + renderInline(buf.join(' '), basePath) + '</p>');
    }

    closeAllLists();
    return out.join('\n');
  }

  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    // split on | not preceded by backslash
    const cells = [];
    let cur = '';
    for (let k = 0; k < s.length; k++) {
      const ch = s[k];
      if (ch === '\\' && s[k + 1] === '|') { cur += '|'; k++; continue; }
      if (ch === '|') { cells.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cells.push(cur);
    return cells;
  }

  // expose
  global.renderMarkdown = renderMarkdown;
  global.MD = { render: renderMarkdown, escape: escapeHtml };
})(typeof window !== 'undefined' ? window : this);
