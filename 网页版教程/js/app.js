/* ============================================================
 * app.js — ModelScope 学习中心
 * Handles: TOC, routing, progress, search, notes, timer, theme
 * Data source: window.LEARNING_DATA = [{module, chapters:[...]}, ...]
 * ============================================================ */
(function () {
  'use strict';

  // ---------- constants ----------
  var STORAGE_PROGRESS = 'msc-progress';
  var STORAGE_NOTES    = 'msc-notes';
  var STORAGE_TIMER    = 'msc-timer';
  var STORAGE_THEME    = 'msc-theme';
  var STORAGE_LAST     = 'msc-last-chapter';
  var STORAGE_EXPAND   = 'msc-expanded-modules';
  var STORAGE_TOC_VIEW = 'msc-toc-view';

  var WORKSPACE_BASE = 'file:///Users/asura/IdeaProjects/github/modelscope-classroom/';
  var IS_HTTP = location.protocol.startsWith('http');
  var STATUS_LIST = ['pending', 'in_progress', 'completed'];
  var STATUS_ICON = {
    pending: '⭕',
    in_progress: '🟡',
    completed: '✅'
  };
  var STATUS_LABEL = {
    pending: '未开始',
    in_progress: '学习中',
    completed: '已完成'
  };

  // ---------- state ----------
  var state = {
    modules: [],
    chapterById: {},
    chapterToModule: {},
    fileIndex: {},
    progress: {},
    notes: {},
    timer: { totalSeconds: 0, sessionStart: 0 },
    theme: 'dark',
    currentId: null,
    expanded: {},
    notesSaveTimer: null,
    notesAutoTimer: null,
    timerInterval: null,
    timerPersistInterval: null,
    searchDebounce: null,
    tocView: 'module',
    bottomTimer: null,
    bottomChapterId: null,
    bottomCheckTimer: null
  };

  // ---------- helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'dataset') Object.assign(node.dataset, attrs[k]);
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    });
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }
  function loadJSON(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtSeconds(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }
  function fmtTotal(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    return '累计 ' + h + 'h ' + m + 'm';
  }
  function deriveBasePath(filePath) {
    if (IS_HTTP) {
      // HTTP 模式下使用 /repo/ 路由前缀，由 Flask 代理项目根目录资源
      if (!filePath) return '/repo/';
      var idx = filePath.lastIndexOf('/');
      var dir = idx >= 0 ? filePath.slice(0, idx + 1) : '';
      return '/repo/' + dir;
    }
    // file:// 协议直接打开时保持原有行为
    if (!filePath) return WORKSPACE_BASE;
    var idx = filePath.lastIndexOf('/');
    var dir = idx >= 0 ? filePath.slice(0, idx + 1) : '';
    return WORKSPACE_BASE + dir;
  }

  // ---------- data init ----------
  function buildIndex() {
    var data = window.LEARNING_DATA || [];
    // Merge entries that share the same module name so the TOC shows one node per module
    var moduleMap = {};
    var moduleOrder = [];
    data.forEach(function (entry) {
      if (!entry || !entry.module) return;
      if (!moduleMap[entry.module]) {
        moduleMap[entry.module] = { module: entry.module, chapters: [] };
        moduleOrder.push(entry.module);
      }
      (entry.chapters || []).forEach(function (ch) {
        moduleMap[entry.module].chapters.push(ch);
      });
    });
    state.modules = moduleOrder.map(function (name) { return moduleMap[name]; });
    state.fileIndex = {};
    state.modules.forEach(function (mod) {
      (mod.chapters || []).forEach(function (ch) {
        if (!ch.id) return;
        state.chapterById[ch.id] = ch;
        state.chapterToModule[ch.id] = mod.module;
        // Map source file basename -> chapter id, used to resolve in-content
        // relative links like [xxx](./D.Transformer结构.md) to in-app navigation.
        if (ch.file) {
          var fname = String(ch.file).split('/').pop();
          if (fname && !state.fileIndex[fname]) {
            state.fileIndex[fname] = ch.id;
          }
        }
      });
    });
  }

  // ---------- in-content link interception ----------
  // Handles 3 link types in rendered chapter content:
  //   1) Relative .md links -> navigate to matching chapter via loadChapter
  //   2) Anchor links (#xxx) -> smooth-scroll within reader, no hashchange
  //   3) http(s) / file:// links -> leave as-is
  function setupContentLinks(container) {
    if (!container) return;
    var links = container.querySelectorAll('a[href]');
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (/^https?:\/\//i.test(href)) return;
      if (href.indexOf('file://') === 0) return;

      link.addEventListener('click', function (e) {
        var h = this.getAttribute('href');
        if (!h) return;

        // Anchor link: in-page smooth scroll
        if (h.charAt(0) === '#') {
          e.preventDefault();
          var rawId = h.slice(1);
          var targetId;
          try { targetId = decodeURIComponent(rawId); } catch (err) { targetId = rawId; }
          if (!targetId) return;
          var target = null;
          try {
            target = container.querySelector('#' + CSS.escape(targetId));
          } catch (err) { /* fall through */ }
          if (!target) {
            target = container.querySelector('[id="' + targetId.replace(/"/g, '\\"') + '"]');
          }
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }

        // Relative / .md link: navigate to matching chapter
        if (h.indexOf('./') === 0 || h.indexOf('../') === 0 || /\.md(?:[#?].*)?$/i.test(h)) {
          e.preventDefault();
          var pathPart = h.split('#')[0].split('?')[0];
          var fileName = pathPart.split('/').pop();
          if (!fileName) return;
          try { fileName = decodeURIComponent(fileName); } catch (err) { /* keep raw */ }
          var chapterId = state.fileIndex[fileName];
          if (chapterId) {
            loadChapter(chapterId, true);
          }
          return;
        }
      });
    });
  }

  // ---------- TOC ----------
  // ---------- Phase definitions ----------
  var PHASE_DEFS = [
    { id: 1, name: '第1周：基础入门', weeks: '深度学习 + Transformer + 技术选型' },
    { id: 2, name: '第2周：工程核心', weeks: '数据 + 训练 + 推理 + 部署' },
    { id: 3, name: '第3周：部署与优化', weeks: '量化 + 对齐 + 推理优化 + 生成模型' },
    { id: 4, name: '第4周：应用与前沿', weeks: 'Agent + RAG + 多模态 + 论文' }
  ];

  var MODULE_BADGE_MAP = {
    'LLM-tutorial': { label: 'LLM', cls: 'mod-llm' },
    'AIGC-tutorial': { label: 'AIGC', cls: 'mod-aigc' },
    '大模型教程': { label: '大模型', cls: 'mod-advanced' },
    'AIGC-实践篇': { label: 'AIGC实践', cls: 'mod-nb-aigc' },
    'LLM-实践篇': { label: 'LLM实践', cls: 'mod-nb-llm' }
  };

  function getModuleBadge(chId) {
    var modName = state.chapterToModule[chId] || '';
    var info = MODULE_BADGE_MAP[modName];
    if (!info) return null;
    return el('span', { class: 'module-badge ' + info.cls }, info.label);
  }

  function buildToc() {
    if (state.tocView === 'phase') {
      buildTocByPhase();
    } else {
      buildTocByModule();
    }
  }

  function buildTocByModule() {
    var tree = $('#toc-tree');
    tree.innerHTML = '';

    if (!state.modules.length) {
      tree.appendChild(el('div', { class: 'search-empty' }, '暂未加载课程数据'));
      return;
    }

    state.modules.forEach(function (mod) {
      var modWrap = el('div', { class: 'toc-module', dataset: { module: mod.module } });
      var head = el('button', {
        class: 'toc-module-head',
        type: 'button'
      }, [
        el('span', { class: 'toc-module-mark' }),
        el('span', null, mod.module),
        el('span', { class: 'count' }, String((mod.chapters || []).length)),
        el('span', { class: 'arrow' }, '▶')
      ]);
      var children = el('div', { class: 'toc-children' });

      (mod.chapters || []).forEach(function (ch) {
        var item = el('div', {
          class: 'toc-item',
          dataset: { id: ch.id }
        }, [
          el('span', { class: 'status-icon' }, STATUS_ICON[state.progress[ch.id] || 'pending']),
          el('span', { class: 'item-title' }, ch.title || ch.id)
        ]);
        children.appendChild(item);
      });

      modWrap.appendChild(head);
      modWrap.appendChild(children);
      tree.appendChild(modWrap);

      if (state.expanded[mod.module]) modWrap.classList.add('expanded');
    });

    // default: expand first module if nothing remembered
    if (Object.keys(state.expanded).length === 0 && state.modules[0]) {
      state.expanded[state.modules[0].module] = true;
      saveJSON(STORAGE_EXPAND, state.expanded);
      var first = $('.toc-module');
      if (first) first.classList.add('expanded');
    }

    bindTocTreeEvents();
  }

  // 4-week plan: a chapter is "required" only when phase ∈ [1..4] AND week !== 0.
  // Anything else (phase 0 / week 0) is treated as 扩展阅读（可选）.
  function isRequiredChapter(ch) {
    if (!ch) return false;
    var p = ch.phase != null ? Number(ch.phase) : 0;
    var w = ch.week != null ? Number(ch.week) : 0;
    return p >= 1 && p <= 4 && w !== 0;
  }

  // Resolve the storage key used to remember the expanded/collapsed state of a phase wrapper.
  function phaseExpandKey(phaseEl) {
    if (!phaseEl) return null;
    if (phaseEl.classList.contains('toc-phase-optional')) return 'optional';
    if (phaseEl.dataset && phaseEl.dataset.phase) return 'phase-' + phaseEl.dataset.phase;
    return null;
  }

  function buildTocByPhase() {
    var tree = $('#toc-tree');
    tree.innerHTML = '';

    // Group chapters:
    //   phase 1-4 (week != 0)  → flat list under the phase (each phase = one week)
    //   everything else        → 扩展阅读（可选），按原始模块分组
    var phaseChapters = { 1: [], 2: [], 3: [], 4: [] };
    var optionalByModule = {};
    var optionalModuleOrder = [];

    state.modules.forEach(function (mod) {
      (mod.chapters || []).forEach(function (ch) {
        if (isRequiredChapter(ch)) {
          phaseChapters[Number(ch.phase)].push(ch);
        } else {
          if (!optionalByModule[mod.module]) {
            optionalByModule[mod.module] = [];
            optionalModuleOrder.push(mod.module);
          }
          optionalByModule[mod.module].push(ch);
        }
      });
    });

    // ----- Render phase 1-4 -----
    PHASE_DEFS.forEach(function (phaseDef) {
      var pKey = 'phase-' + phaseDef.id;
      var chapters = phaseChapters[phaseDef.id] || [];

      var phaseWrap = el('div', { class: 'toc-phase', dataset: { phase: String(phaseDef.id) } });
      var phaseHead = el('button', {
        class: 'toc-phase-head',
        type: 'button'
      }, [
        el('span', { class: 'toc-phase-mark' }),
        el('div', { class: 'toc-phase-info' }, [
          el('div', { class: 'toc-phase-name' }, phaseDef.name),
          el('div', { class: 'toc-phase-weeks' }, phaseDef.weeks + ' · ' + chapters.length + ' 篇')
        ]),
        el('span', { class: 'arrow' }, '▶')
      ]);

      var phaseChildren = el('div', { class: 'toc-phase-children' });

      chapters.forEach(function (ch) {
        var item = el('div', {
          class: 'toc-item',
          dataset: { id: ch.id }
        }, [
          el('span', { class: 'status-icon' }, STATUS_ICON[state.progress[ch.id] || 'pending']),
          el('span', { class: 'item-title' }, ch.title || ch.id),
          getModuleBadge(ch.id)
        ].filter(Boolean));
        phaseChildren.appendChild(item);
      });

      phaseWrap.appendChild(phaseHead);
      phaseWrap.appendChild(phaseChildren);
      tree.appendChild(phaseWrap);

      if (state.expanded[pKey]) phaseWrap.classList.add('expanded');
    });

    // ----- Render 扩展阅读（可选） -----
    var optionalTotal = 0;
    optionalModuleOrder.forEach(function (m) { optionalTotal += optionalByModule[m].length; });

    if (optionalTotal > 0) {
      var optKey = 'optional';
      var optWrap = el('div', {
        class: 'toc-phase toc-phase-optional',
        dataset: { phase: 'optional' }
      });
      var optHead = el('button', {
        class: 'toc-phase-head',
        type: 'button'
      }, [
        el('span', { class: 'toc-phase-mark' }),
        el('div', { class: 'toc-phase-info' }, [
          el('div', { class: 'toc-phase-name' }, '扩展阅读（可选 · ' + optionalTotal + '篇）'),
          el('div', { class: 'toc-phase-weeks' }, '按需选学 · 不计入 4 周进度')
        ]),
        el('span', { class: 'arrow' }, '▶')
      ]);

      var optChildren = el('div', { class: 'toc-phase-children' });

      optionalModuleOrder.forEach(function (modName) {
        var modChapters = optionalByModule[modName];
        var subKey = 'optional-mod::' + modName;
        var subWrap = el('div', { class: 'toc-week', dataset: { weekkey: subKey } });
        var subHead = el('button', {
          class: 'toc-week-head',
          type: 'button'
        }, [
          el('span', { class: 'toc-week-dot' }),
          el('span', { class: 'toc-week-label' }, modName),
          el('span', { class: 'count' }, String(modChapters.length)),
          el('span', { class: 'arrow' }, '▶')
        ]);

        var subChildren = el('div', { class: 'toc-week-children' });
        modChapters.forEach(function (ch) {
          var item = el('div', {
            class: 'toc-item',
            dataset: { id: ch.id }
          }, [
            el('span', { class: 'status-icon' }, STATUS_ICON[state.progress[ch.id] || 'pending']),
            el('span', { class: 'item-title' }, ch.title || ch.id),
            getModuleBadge(ch.id)
          ].filter(Boolean));
          subChildren.appendChild(item);
        });

        subWrap.appendChild(subHead);
        subWrap.appendChild(subChildren);
        optChildren.appendChild(subWrap);

        if (state.expanded[subKey]) subWrap.classList.add('expanded');
      });

      optWrap.appendChild(optHead);
      optWrap.appendChild(optChildren);
      tree.appendChild(optWrap);

      // Optional group is collapsed by default — only expand if user explicitly opened it.
      if (state.expanded[optKey]) optWrap.classList.add('expanded');
    }

    // Default: expand first phase if nothing remembered
    var anyPhaseExpanded = PHASE_DEFS.some(function(pd){ return state.expanded['phase-' + pd.id]; });
    if (!anyPhaseExpanded) {
      state.expanded['phase-1'] = true;
      saveJSON(STORAGE_EXPAND, state.expanded);
      var firstPhase = tree.querySelector('.toc-phase:not(.toc-phase-optional)');
      if (firstPhase) firstPhase.classList.add('expanded');
    }

    bindTocTreeEvents();
  }

  function bindTocTreeEvents() {
    var tree = $('#toc-tree');
    // Remove previous listener by replacing node (simple approach: clone & replace)
    var newTree = tree.cloneNode(true);
    tree.parentNode.replaceChild(newTree, tree);

    newTree.addEventListener('click', function (e) {
      // Chapter item click
      var tocItem = e.target.closest('.toc-item');
      if (tocItem) {
        var id = tocItem.dataset.id;
        if (id) {
          loadChapter(id, true);
          if (window.innerWidth <= 980) closeMobileSidebar();
        }
        return;
      }
      // Module head click (module view)
      var modHead = e.target.closest('.toc-module-head');
      if (modHead) {
        var modEl = modHead.closest('.toc-module');
        if (modEl && modEl.dataset.module) {
          toggleModule(modEl.dataset.module);
        }
        return;
      }
      // Phase head click (phase view) — handles 4-week phases and 扩展阅读（可选）
      var phaseHead = e.target.closest('.toc-phase-head');
      if (phaseHead) {
        var phaseEl = phaseHead.closest('.toc-phase');
        var pk = phaseExpandKey(phaseEl);
        if (pk) {
          state.expanded[pk] = !state.expanded[pk];
          saveJSON(STORAGE_EXPAND, state.expanded);
          phaseEl.classList.toggle('expanded', !!state.expanded[pk]);
        }
        return;
      }
      // Week head click (phase view)
      var weekHead = e.target.closest('.toc-week-head');
      if (weekHead) {
        var weekEl = weekHead.closest('.toc-week');
        if (weekEl && weekEl.dataset.weekkey) {
          var wk = weekEl.dataset.weekkey;
          state.expanded[wk] = !state.expanded[wk];
          saveJSON(STORAGE_EXPAND, state.expanded);
          weekEl.classList.toggle('expanded', !!state.expanded[wk]);
        }
        return;
      }
    });
  }

  function toggleModule(name) {
    state.expanded[name] = !state.expanded[name];
    saveJSON(STORAGE_EXPAND, state.expanded);
    var node = document.querySelector('.toc-module[data-module="' + cssEscape(name) + '"]');
    if (node) node.classList.toggle('expanded', !!state.expanded[name]);
  }

  function cssEscape(s) {
    return String(s).replace(/(["\\])/g, '\\$1');
  }

  function refreshTocStatus() {
    Object.keys(state.chapterById).forEach(function (id) {
      var node = document.querySelector('.toc-item[data-id="' + cssEscape(id) + '"] .status-icon');
      if (node) node.textContent = STATUS_ICON[state.progress[id] || 'pending'];
    });
    refreshActiveToc();
    refreshStats();
  }

  function refreshActiveToc() {
    $all('.toc-item.active').forEach(function (n) { n.classList.remove('active'); });
    if (!state.currentId) return;
    var node = document.querySelector('.toc-item[data-id="' + cssEscape(state.currentId) + '"]');
    if (!node) return;
    node.classList.add('active');

    if (state.tocView === 'phase') {
      // Auto-expand parent phase (or 扩展阅读) and any week-level subgroup
      var weekEl = node.closest('.toc-week');
      var phaseEl = node.closest('.toc-phase');
      var pk = phaseExpandKey(phaseEl);
      if (pk && !state.expanded[pk]) {
        state.expanded[pk] = true;
        saveJSON(STORAGE_EXPAND, state.expanded);
        phaseEl.classList.add('expanded');
      }
      if (weekEl && weekEl.dataset.weekkey) {
        var wk = weekEl.dataset.weekkey;
        if (!state.expanded[wk]) {
          state.expanded[wk] = true;
          saveJSON(STORAGE_EXPAND, state.expanded);
          weekEl.classList.add('expanded');
        }
      }
    } else {
      var modName = state.chapterToModule[state.currentId];
      if (modName && !state.expanded[modName]) {
        state.expanded[modName] = true;
        saveJSON(STORAGE_EXPAND, state.expanded);
        var modNode = document.querySelector('.toc-module[data-module="' + cssEscape(modName) + '"]');
        if (modNode) modNode.classList.add('expanded');
      }
    }
  }

  function refreshStats() {
    // Stats reflect the 4-week required plan only; 扩展阅读（可选）is excluded.
    var requiredIds = {};
    Object.keys(state.chapterById).forEach(function (id) {
      if (isRequiredChapter(state.chapterById[id])) requiredIds[id] = true;
    });
    var total = Object.keys(requiredIds).length;
    var done = 0, prog = 0;
    Object.keys(state.progress).forEach(function (id) {
      if (!requiredIds[id]) return;
      if (state.progress[id] === 'completed') done++;
      else if (state.progress[id] === 'in_progress') prog++;
    });
    var statTotal = $('#stat-total'), statDone = $('#stat-done'), statProg = $('#stat-progress');
    if (statTotal) statTotal.textContent = total;
    if (statDone) statDone.textContent = done;
    if (statProg) statProg.textContent = prog;
    refreshRing(total, done);
  }

  function refreshRing(total, done) {
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var span = $('#progress-percent');
    if (span) span.textContent = pct;
    var ring = $('#ring-progress');
    if (ring) {
      var circumference = 2 * Math.PI * 18;
      var offset = circumference * (1 - pct / 100);
      ring.setAttribute('stroke-dasharray', circumference.toFixed(2));
      ring.setAttribute('stroke-dashoffset', offset.toFixed(2));
    }
  }

  // ---------- Math & Diagram rendering ----------

  // Lightweight LaTeX-to-Unicode/HTML fallback when KaTeX isn't loaded
  var GREEK = {
    alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',
    iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',
    sigma:'σ',tau:'τ',upsilon:'υ',phi:'φ',chi:'χ',psi:'ψ',omega:'ω',
    Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',
    Phi:'Φ',Psi:'Ψ',Omega:'Ω',varepsilon:'ε',varphi:'φ'
  };
  var SYMBOLS = {
    'rightarrow':'→','leftarrow':'←','Rightarrow':'⇒','Leftarrow':'⇐',
    'leftrightarrow':'↔','Leftrightarrow':'⇔','uparrow':'↑','downarrow':'↓',
    'leq':'≤','geq':'≥','neq':'≠','approx':'≈','equiv':'≡','sim':'∼',
    'times':'×','cdot':'·','div':'÷','pm':'±','mp':'∓',
    'infty':'∞','partial':'∂','nabla':'∇','forall':'∀','exists':'∃',
    'in':'∈','notin':'∉','subset':'⊂','supset':'⊃','subseteq':'⊆','supseteq':'⊇',
    'cup':'∪','cap':'∩','emptyset':'∅','varnothing':'∅',
    'sum':'∑','prod':'∏','int':'∫','iint':'∬','oint':'∮',
    'sqrt':'√','langle':'⟨','rangle':'⟩','ldots':'…','cdots':'⋯','vdots':'⋮',
    'quad':' ','qquad':'  ',',':' ',';':' ',':':' ','!':'',
    'star':'⋆','circ':'∘','bullet':'•','diamond':'◇','triangle':'△',
    'log':'log','ln':'ln','sin':'sin','cos':'cos','tan':'tan',
    'exp':'exp','lim':'lim','max':'max','min':'min','sup':'sup','inf':'inf','arg':'arg',
    'det':'det','dim':'dim','ker':'ker','hom':'hom',
    'mathbb':'','mathcal':'','mathbf':'','mathrm':'','text':'','operatorname':'',
    'left':'','right':'','Big':'','big':'','bigg':'','Bigg':''
  };
  var SUP_MAP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    '+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾','n':'ⁿ','i':'ⁱ','T':'ᵀ','*':'˟'};
  var SUB_MAP = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
    '+':'₊','-':'₋','=':'₌','(':'₍',')':'₎','i':'ᵢ','j':'ⱼ','k':'ₖ','n':'ₙ','m':'ₘ','x':'ₓ'};

  function texToUnicode(tex) {
    var s = tex;
    // \frac{a}{b} → a/b or (a)/(b)
    s = s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, function(_,a,b) {
      var sa = texToUnicode(a), sb = texToUnicode(b);
      return (sa.length > 1 ? '(' + sa + ')' : sa) + '/' + (sb.length > 1 ? '(' + sb + ')' : sb);
    });
    // \sqrt{x} → √(x)
    s = s.replace(/\\sqrt\{([^}]*)\}/g, function(_,c) { return '√(' + texToUnicode(c) + ')'; });
    // \text{...}, \mathrm{...}, \operatorname{...} → plain text
    s = s.replace(/\\(?:text|mathrm|operatorname)\{([^}]*)\}/g, '$1');
    // \mathbb{X} → double-struck
    s = s.replace(/\\mathbb\{([^}]*)\}/g, function(_,c) {
      var bb = {A:'\ud835\udd38',B:'\ud835\udd39',C:'\u2102',E:'\ud835\udd3c',F:'\ud835\udd3d',H:'\u210d',N:'\u2115',P:'\u2119',Q:'\u211a',R:'\u211d',Z:'\u2124'};
      return c.split('').map(function(ch) { return bb[ch] || ch; }).join('');
    });
    // \mathcal{X} → script
    s = s.replace(/\\mathcal\{([^}]*)\}/g, function(_,c) {
      var cal = {A:'\ud835\udc9c',B:'\u212c',C:'\ud835\udc9e',D:'\ud835\udc9f',E:'\u2130',F:'\u2131',G:'\ud835\udca2',H:'\u210b',I:'\u2110',L:'\u2112',M:'\u2133',N:'\ud835\udca9',O:'\ud835\udcaa',P:'\ud835\udcab',R:'\u211b',S:'\ud835\udcae',T:'\ud835\udcaf',X:'\ud835\udcb3'};
      return c.split('').map(function(ch) { return cal[ch] || ch; }).join('');
    });
    // \mathbf{x} → keep as-is
    s = s.replace(/\\mathbf\{([^}]*)\}/g, '$1');
    // superscript: ^{...} or ^x
    s = s.replace(/\^\{([^}]*)\}/g, function(_,c) {
      var inner = texToUnicode(c);
      var mapped = inner.split('').map(function(ch) { return SUP_MAP[ch] || ch; }).join('');
      var unmapped = inner.split('').filter(function(ch) { return !SUP_MAP[ch] && ch !== ' '; }).length;
      if (unmapped > inner.length * 0.5 && inner.length > 2) return '^(' + inner + ')';
      return mapped;
    });
    s = s.replace(/\^([a-zA-Z0-9*])/g, function(_,c) { return SUP_MAP[c] || '^' + c; });
    // subscript: _{...} or _x
    s = s.replace(/_\{([^}]*)\}/g, function(_,c) {
      var inner = texToUnicode(c);
      var mapped = inner.split('').map(function(ch) { return SUB_MAP[ch] || ch; }).join('');
      var unmapped = inner.split('').filter(function(ch) { return !SUB_MAP[ch] && ch !== ' '; }).length;
      if (unmapped > inner.length * 0.5 && inner.length > 2) return '_' + inner;
      return mapped;
    });
    s = s.replace(/_([a-zA-Z0-9])/g, function(_,c) { return SUB_MAP[c] || '_' + c; });
    // Greek letters and symbols
    s = s.replace(/\\([a-zA-Z]+)/g, function(_,cmd) {
      return GREEK[cmd] || SYMBOLS[cmd] || cmd;
    });
    // \| → ‖, \{ → {, \} → }
    s = s.replace(/\\\|/g, '‖').replace(/\\\{/g, '{').replace(/\\\}/g, '}');
    // Remove remaining backslashes before special chars
    s = s.replace(/\\\\/g, '').replace(/\\/g, '');
    return s;
  }

  function renderMathAndDiagrams(container) {
    if (!container) return;

    // KaTeX rendering (or fallback to Unicode)
    var useKatex = (typeof katex !== 'undefined');

    container.querySelectorAll('.math-block, .math-block-inline, .math-inline').forEach(function(el) {
      var tex = el.getAttribute('data-math');
      if (!tex) return;
      var isBlock = el.classList.contains('math-block') || el.classList.contains('math-block-inline');
      if (useKatex) {
        try {
          katex.render(tex, el, { displayMode: isBlock, throwOnError: false });
          return;
        } catch(e) { /* fall through to unicode fallback */ }
      }
      // Unicode fallback
      el.textContent = texToUnicode(tex);
      el.classList.add('math-fallback');
    });

    // Mermaid rendering (or fallback to styled code block)
    var mermaidEls = container.querySelectorAll('.mermaid');
    if (mermaidEls.length === 0) return;

    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.run({ nodes: mermaidEls });
      } catch(e) {
        // If mermaid.run fails, apply fallback
        mermaidEls.forEach(function(el) { el.classList.add('mermaid-fallback'); });
      }
    } else {
      // Mermaid not loaded — show as styled diagram code
      mermaidEls.forEach(function(el) { el.classList.add('mermaid-fallback'); });
    }
  }

  // ---------- chapter loading ----------
  function loadChapter(id, updateHash) {
    var ch = state.chapterById[id];
    if (!ch) return;

    // Skip rendering if already on this chapter
    if (state.currentId === id) return;

    // save notes for previous chapter
    if (state.currentId) {
      flushNotes(state.currentId);
    }

    // reset bottom-stay timer when switching chapters
    if (state.bottomTimer) {
      clearTimeout(state.bottomTimer);
      state.bottomTimer = null;
    }
    state.bottomChapterId = null;

    state.currentId = id;
    saveJSON(STORAGE_LAST, id);
    if (updateHash !== false) {
      try { history.replaceState(null, '', '#' + encodeURIComponent(id)); } catch (e) {
        location.hash = encodeURIComponent(id);
      }
    }

    // hide welcome, show chapter view
    var welcome = $('#welcome-screen');
    var view = $('#chapter-view');
    if (welcome) welcome.hidden = true;
    if (view) view.hidden = false;

    // Show loading state
    var body = $('#markdown-body');
    body.classList.add('loading');

    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(function () {
      // meta
      var meta = $('#chapter-meta');
      var modName = state.chapterToModule[id] || '';
      var phase = ch.phase != null ? '阶段 ' + ch.phase : '';
      var week = ch.week != null ? 'WEEK ' + ch.week : '';
      meta.innerHTML = '';
      meta.appendChild(el('div', { class: 'cm-tag' }, [
        el('span', { class: 'pill' }, modName),
        phase ? el('span', null, phase) : null,
        week ? el('span', null, week) : null
      ].filter(Boolean)));
      meta.appendChild(el('h1', { class: 'cm-title' }, ch.title || ch.id));
      var info = el('div', { class: 'cm-info' }, [
        ch.difficulty ? el('span', { html: '难度 / <b>' + escapeText(ch.difficulty) + '</b>' }) : null,
        ch.duration   ? el('span', { html: '时长 / <b>' + escapeText(ch.duration) + '</b>' }) : null,
        ch.file       ? el('span', { html: '源文件 / <b>' + escapeText(ch.file) + '</b>' }) : null
      ].filter(Boolean));
      meta.appendChild(info);

      // body — innerHTML one-shot replacement
      var basePath = deriveBasePath(ch.file);
      var renderedContent = window.renderMarkdown ? window.renderMarkdown(ch.content || '', basePath) : escapeText(ch.content || '');

      // Inline chapter meta-bar (compact tags replacing right-panel CHAPTER INFO)
      var metaHtml = '<div class="chapter-meta-bar">';
      if (ch.difficulty) metaHtml += '<span class="meta-tag meta-difficulty">' + escapeText(ch.difficulty) + '</span>';
      if (ch.duration) metaHtml += '<span class="meta-tag meta-duration">⏱ ' + escapeText(ch.duration) + '</span>';
      if (ch.week > 0) metaHtml += '<span class="meta-tag meta-week">第' + ch.week + '周</span>';
      if (ch.phase > 0) metaHtml += '<span class="meta-tag meta-phase">阶段' + ch.phase + '</span>';
      if (ch.keywords && ch.keywords.length) {
        ch.keywords.forEach(function(kw) {
          metaHtml += '<span class="meta-tag meta-keyword">' + escapeText(kw) + '</span>';
        });
      }
      metaHtml += '</div>';

      body.innerHTML = metaHtml + renderedContent;
      body.classList.remove('loading');

      // Intercept in-content links: relative .md -> chapter nav, # -> smooth scroll
      setupContentLinks(body);

      // right panel
      refreshPanel(ch);

      // scroll
      var reader = $('#reader');
      if (reader) reader.scrollTop = 0;

      refreshActiveToc();

      // Auto mark as in_progress when first entering a pending chapter
      var curStatus = state.progress[id] || 'pending';
      if (curStatus === 'pending') {
        state.progress[id] = 'in_progress';
        saveJSON(STORAGE_PROGRESS, state.progress);
        refreshTocStatus();
        refreshStatusButtons('in_progress');
      }

      // Mark key-point positions in the rendered article (★ markers)
      markKeyPointsInContent(id);

      // Optional enhancements: code runner (if Python service is up) + quiz panel.
      // These are no-ops when the prerequisites are absent.
      try { enableCodeRunner(body); } catch (_) {}
      try { enableQuiz(ch, body); } catch (_) {}

      // Math (KaTeX) & Diagram (Mermaid) rendering
      renderMathAndDiagrams(body);

      // Re-evaluate scroll position for the freshly loaded chapter
      // (covers very short content where no scroll event will ever fire)
      if (state.bottomCheckTimer) clearTimeout(state.bottomCheckTimer);
      state.bottomCheckTimer = setTimeout(checkBottomAndArm, 200);
    });
  }

  function escapeText(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- auto completion via scroll ----------
  function checkBottomAndArm() {
    var reader = $('#reader');
    if (!reader || !state.currentId) return;
    var distance = reader.scrollHeight - reader.scrollTop - reader.clientHeight;
    if (distance < 50) {
      armBottomTimer();
    } else {
      cancelBottomTimer();
    }
  }

  function armBottomTimer() {
    if (!state.currentId) return;
    if (state.bottomTimer && state.bottomChapterId === state.currentId) return;
    if (state.bottomTimer) clearTimeout(state.bottomTimer);
    state.bottomChapterId = state.currentId;
    state.bottomTimer = setTimeout(function () {
      var reader = $('#reader');
      if (!reader) { state.bottomTimer = null; return; }
      var dist = reader.scrollHeight - reader.scrollTop - reader.clientHeight;
      if (dist < 50 && state.currentId === state.bottomChapterId) {
        var cid = state.currentId;
        var status = state.progress[cid];
        if (status !== 'completed') {
          state.progress[cid] = 'completed';
          saveJSON(STORAGE_PROGRESS, state.progress);
          refreshTocStatus();
          if (cid === state.currentId) refreshStatusButtons('completed');
          showAutoCompleteToast();
        }
      }
      state.bottomTimer = null;
    }, 3000);
  }

  function cancelBottomTimer() {
    if (state.bottomTimer) {
      clearTimeout(state.bottomTimer);
      state.bottomTimer = null;
    }
    state.bottomChapterId = null;
  }

  function setupScrollWatcher() {
    var reader = $('#reader');
    if (!reader) return;
    reader.addEventListener('scroll', checkBottomAndArm, { passive: true });
    window.addEventListener('resize', function () {
      if (state.bottomCheckTimer) clearTimeout(state.bottomCheckTimer);
      state.bottomCheckTimer = setTimeout(checkBottomAndArm, 150);
    });
  }

  function showAutoCompleteToast() {
    var existing = document.querySelector('.auto-complete-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'auto-complete-toast';
    toast.textContent = '已自动标记为完成 ✓';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
    }, 2000);
  }

  // ---------- right panel ----------
  function refreshPanel(ch) {
    var statusCurrent = $('#status-current');
    var infoList = $('#info-list');
    var infoTags = $('#info-tags');
    var notesArea = $('#notes-area');
    var saveHint = $('#save-hint');

    if (!ch) {
      statusCurrent.textContent = '未选择章节';
      if (infoList) infoList.innerHTML = '<dt>难度</dt><dd>—</dd><dt>建议时长</dt><dd>—</dd><dt>所属周</dt><dd>—</dd><dt>阶段</dt><dd>—</dd>';
      if (infoTags) infoTags.innerHTML = '';
      if (notesArea) notesArea.value = '';
      refreshStatusButtons('pending');
      return;
    }

    statusCurrent.textContent = ch.title || ch.id;

    if (infoList) {
      infoList.innerHTML = '';
      var rows = [
        ['难度', ch.difficulty || '—'],
        ['时长', ch.duration || '—'],
        ['周次', ch.week != null ? 'WEEK ' + ch.week : '—'],
        ['阶段', ch.phase != null ? '阶段 ' + ch.phase : '—']
      ];
      rows.forEach(function (r) {
        infoList.appendChild(el('dt', null, r[0]));
        infoList.appendChild(el('dd', null, r[1]));
      });
    }

    if (infoTags) {
      infoTags.innerHTML = '';
      (ch.keywords || []).forEach(function (k) {
        infoTags.appendChild(el('span', { class: 'info-tag' }, '#' + k));
      });
    }

    if (notesArea) {
      notesArea.value = state.notes[ch.id] || '';
    }
    if (saveHint) {
      saveHint.textContent = '·';
      saveHint.classList.remove('saved');
    }

    refreshStatusButtons(state.progress[ch.id] || 'pending');
    renderKeyPoints(ch.id);
  }

  function refreshStatusButtons(active) {
    $all('#status-buttons .status-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.status === active);
    });
  }


  // ---------- key points ----------
  // Each entry is now {text, keyword}. The keyword is matched against the
  // rendered article DOM so that clicking a key point scrolls to and
  // highlights the relevant heading / paragraph in the reader.
  function renderKeyPoints(chapterId) {
    var points = (window.KEY_POINTS || {})[chapterId];
    var container = document.querySelector('#key-points-list');
    if (!container) return;

    if (!points || points.length === 0) {
      container.innerHTML = '<p class="no-points">暂无核心知识点</p>';
      return;
    }

    var html = '<h4 class="key-points-title">重点内容导航</h4>';
    html += '<ul class="key-points-list">';
    points.forEach(function (point, i) {
      // Backwards-compat: accept legacy plain-string entries
      var text = (typeof point === 'string') ? point : (point && point.text) || '';
      var keyword = (typeof point === 'string') ? point : (point && point.keyword) || '';
      html += '<li class="key-point-item" data-keyword="' + escapeText(keyword) + '" title="点击跳转到文章对应位置">' +
        '<span class="point-number">' + (i + 1) + '</span>' +
        '<span class="point-text">' + escapeText(text) + '</span>' +
        '<span class="point-jump" aria-hidden="true">↗</span>' +
        '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;

    // Bind click → scroll & highlight
    container.querySelectorAll('.key-point-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var kw = this.dataset.keyword;
        if (kw) scrollToKeyword(kw, this);
      });
    });
  }

  // Find the first DOM node inside the markdown body that contains `keyword`.
  // Search order: headings → bold/strong → paragraphs/list items.
  function findKeywordTarget(body, keyword) {
    if (!body || !keyword) return null;
    var headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].textContent.indexOf(keyword) >= 0) return headings[i];
    }
    var bolds = body.querySelectorAll('strong, b');
    for (var j = 0; j < bolds.length; j++) {
      if (bolds[j].textContent.indexOf(keyword) >= 0) {
        return bolds[j].closest('p') || bolds[j].closest('li') || bolds[j].parentElement;
      }
    }
    var paras = body.querySelectorAll('p, li, td');
    for (var k = 0; k < paras.length; k++) {
      if (paras[k].textContent.indexOf(keyword) >= 0) return paras[k];
    }
    return null;
  }

  // Scroll the reader to the keyword target and visually highlight it.
  function scrollToKeyword(keyword, sourceItem) {
    var body = $('#markdown-body');
    if (!body) return;

    // clear previous highlights
    body.querySelectorAll('.key-point-highlight, .key-point-highlight-settled').forEach(function (el) {
      el.classList.remove('key-point-highlight', 'key-point-highlight-settled');
    });

    var target = findKeywordTarget(body, keyword);
    if (!target) {
      if (sourceItem) {
        sourceItem.classList.add('key-point-miss');
        setTimeout(function () { sourceItem.classList.remove('key-point-miss'); }, 600);
      }
      return;
    }

    target.classList.add('key-point-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      target.classList.add('key-point-highlight-settled');
    }, 1800);
  }

  // Drop a small ★ marker next to every heading / paragraph that maps to a
  // key point so users can spot 重点 at a glance.
  function markKeyPointsInContent(chapterId) {
    var points = (window.KEY_POINTS || {})[chapterId];
    if (!points || !points.length) return;
    var body = $('#markdown-body');
    if (!body) return;

    // Avoid double marking on re-renders
    body.querySelectorAll('.key-point-marker').forEach(function (m) { m.remove(); });
    body.querySelectorAll('.has-key-point').forEach(function (el) {
      el.classList.remove('has-key-point');
    });

    var seen = [];
    points.forEach(function (point, i) {
      var keyword = (typeof point === 'string') ? point : (point && point.keyword) || '';
      var text = (typeof point === 'string') ? point : (point && point.text) || '';
      if (!keyword) return;
      var target = findKeywordTarget(body, keyword);
      if (!target) return;
      // dedupe — multiple key points may share a target
      if (seen.indexOf(target) >= 0) return;
      seen.push(target);

      target.classList.add('has-key-point');
      var marker = document.createElement('span');
      marker.className = 'key-point-marker';
      marker.textContent = '★';
      marker.title = text;
      marker.setAttribute('data-key-index', String(i + 1));
      target.insertBefore(marker, target.firstChild);
    });
  }
  function setStatus(id, status) {
    if (!state.chapterById[id]) return;
    if (STATUS_LIST.indexOf(status) < 0) return;
    state.progress[id] = status;
    saveJSON(STORAGE_PROGRESS, state.progress);
    refreshTocStatus();
    refreshStatusButtons(status);
  }

  // ---------- notes ----------
  function flushNotes(id) {
    if (!id) return;
    var notesArea = $('#notes-area');
    if (!notesArea) return;
    var v = notesArea.value;
    if (v && v.trim().length > 0) {
      state.notes[id] = v;
    } else {
      delete state.notes[id];
    }
    saveJSON(STORAGE_NOTES, state.notes);
  }
  function showSaved() {
    var hint = $('#save-hint');
    if (!hint) return;
    hint.textContent = '✓ 已保存 ' + new Date().toLocaleTimeString();
    hint.classList.add('saved');
  }
  function bindNotes() {
    var ta = $('#notes-area');
    var btn = $('#notes-save');
    if (!ta) return;

    ta.addEventListener('input', debounce(function () {
      var hint = $('#save-hint');
      if (hint) { hint.textContent = '编辑中…'; hint.classList.remove('saved'); }
    }, 200));

    ta.addEventListener('blur', function () {
      if (!state.currentId) return;
      flushNotes(state.currentId);
      showSaved();
    });

    if (btn) btn.addEventListener('click', function () {
      if (!state.currentId) return;
      flushNotes(state.currentId);
      showSaved();
    });

    // auto save every 30s
    if (state.notesAutoTimer) clearInterval(state.notesAutoTimer);
    state.notesAutoTimer = setInterval(function () {
      if (!state.currentId) return;
      var prev = state.notes[state.currentId] || '';
      var cur = ta.value;
      if (cur !== prev) {
        flushNotes(state.currentId);
        showSaved();
      }
    }, 30000);
  }


  // ---------- notes toggle ----------
  function bindNotesToggle() {
    var btn = document.querySelector('#notes-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var content = document.querySelector('#notes-content');
      if (!content) return;
      var shown = content.style.display !== 'none';
      content.style.display = shown ? 'none' : 'block';
      btn.textContent = shown ? '个人笔记 ▸' : '个人笔记 ▾';
    });
  }
  // ---------- search ----------
  function bindSearch() {
    var input = $('#global-search');
    var box = $('#search-results');
    if (!input || !box) return;

    var run = debounce(function (q) {
      q = (q || '').trim().toLowerCase();
      if (!q) { box.hidden = true; box.innerHTML = ''; return; }

      var results = [];
      Object.keys(state.chapterById).forEach(function (id) {
        var ch = state.chapterById[id];
        var title = (ch.title || '').toLowerCase();
        var content = (ch.content || '').toLowerCase();
        var keywords = (ch.keywords || []).join(' ').toLowerCase();
        var hitTitle = title.indexOf(q) >= 0;
        var hitContent = content.indexOf(q) >= 0;
        var hitKeyword = keywords.indexOf(q) >= 0;
        if (!hitTitle && !hitContent && !hitKeyword) return;
        var snippet = '';
        if (hitContent) {
          var idx = content.indexOf(q);
          var start = Math.max(0, idx - 40);
          var end = Math.min(ch.content.length, idx + q.length + 60);
          snippet = (start > 0 ? '…' : '') + ch.content.slice(start, end) + (end < ch.content.length ? '…' : '');
        } else {
          snippet = (ch.content || '').slice(0, 100);
        }
        results.push({ ch: ch, snippet: snippet });
      });

      results = results.slice(0, 30);

      if (!results.length) {
        box.innerHTML = '<div class="search-empty">未找到与 "' + escapeText(q) + '" 相关的内容</div>';
        box.hidden = false;
        return;
      }

      box.innerHTML = '';
      results.forEach(function (r) {
        var mod = state.chapterToModule[r.ch.id] || '';
        var item = el('div', { class: 'search-result-item', dataset: { id: r.ch.id } });
        item.innerHTML =
          '<div class="sr-mod">' + escapeText(mod) + '</div>' +
          '<div class="sr-title">' + highlight(escapeText(r.ch.title || r.ch.id), q) + '</div>' +
          '<div class="sr-snippet">' + highlight(escapeText(r.snippet), q) + '</div>';
        box.appendChild(item);
      });
      box.hidden = false;
    }, 300);

    input.addEventListener('input', function (e) { run(e.target.value); });
    input.addEventListener('focus', function () {
      if (input.value.trim()) run(input.value);
    });

    // Event delegation for search results
    box.addEventListener('click', function (e) {
      var item = e.target.closest('.search-result-item');
      if (item && item.dataset.id) {
        loadChapter(item.dataset.id, true);
        box.hidden = true;
        input.value = '';
      }
    });

    document.addEventListener('click', function (e) {
      if (!box.contains(e.target) && e.target !== input) box.hidden = true;
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; box.hidden = true; input.blur(); }
    });

    // ⌘K / Ctrl+K
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  function highlight(html, q) {
    if (!q) return html;
    var safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(safe, 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
  }

  // ---------- timer ----------
  // Design:
  //   state.timer.totalSeconds  = baseline accumulated seconds loaded from storage
  //                               (immutable while the session is alive)
  //   state.timer.sessionStart  = wall-clock ms when the current session started
  //   sessionElapsed()          = seconds elapsed in the current session
  //   displayed session         = sessionElapsed()
  //   displayed total           = totalSeconds + sessionElapsed()
  // Persistence writes (totalSeconds + sessionElapsed) to storage WITHOUT mutating
  // the in-memory baseline or sessionStart, so the session counter never resets
  // mid-session. (Previously persistTimer reset sessionStart every 10s, which
  // made the on-screen session timer “归零” once it reached 10 seconds.)
  function startTimer() {
    var saved = loadJSON(STORAGE_TIMER, { totalSeconds: 0 });
    state.timer.totalSeconds = (saved && saved.totalSeconds) || 0;
    state.timer.sessionStart = Date.now();
    tickTimer();
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(tickTimer, 1000);
    if (state.timerPersistInterval) clearInterval(state.timerPersistInterval);
    state.timerPersistInterval = setInterval(persistTimer, 10000);

    window.addEventListener('beforeunload', persistTimer);
    document.addEventListener('visibilitychange', function () {
      // Persist on hide; on show, do nothing — the session keeps ticking from
      // its original sessionStart so both displays remain monotonic.
      if (document.visibilityState === 'hidden') persistTimer();
    });
  }
  function sessionElapsed() {
    return Math.max(0, Math.floor((Date.now() - state.timer.sessionStart) / 1000));
  }
  function tickTimer() {
    var sess = sessionElapsed();
    var total = state.timer.totalSeconds + sess;
    var sEl = $('#timer-session');
    var tEl = $('#timer-total');
    if (sEl) sEl.textContent = fmtSeconds(sess);
    if (tEl) tEl.textContent = fmtTotal(total);
  }
  function persistTimer() {
    // Write latest cumulative total to storage WITHOUT mutating in-memory
    // baseline / sessionStart. Mutating them used to reset the session counter
    // every 10 seconds.
    var sess = sessionElapsed();
    saveJSON(STORAGE_TIMER, { totalSeconds: state.timer.totalSeconds + sess });
  }

  // ---------- theme ----------
  function applyTheme(name) {
    state.theme = name === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('theme-light', state.theme === 'light');
    document.documentElement.classList.toggle('theme-dark', state.theme !== 'light');
    document.body.classList.toggle('theme-light', state.theme === 'light');
    document.body.classList.toggle('theme-dark', state.theme !== 'light');
    saveJSON(STORAGE_THEME, state.theme);
  }
  function bindTheme() {
    var btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      applyTheme(state.theme === 'light' ? 'dark' : 'light');
    });
  }

  // ---------- mobile sidebar ----------
  function bindSidebarToggle() {
    var btn = $('#sidebar-toggle');
    var sidebar = $('#sidebar');
    var mask = $('#sidebar-mask');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      if (mask) mask.classList.toggle('show', open);
    });
    if (mask) mask.addEventListener('click', closeMobileSidebar);
  }
  function closeMobileSidebar() {
    var sidebar = $('#sidebar');
    var mask = $('#sidebar-mask');
    if (sidebar) sidebar.classList.remove('open');
    if (mask) mask.classList.remove('show');
  }

  // ---------- status buttons ----------
  function bindStatusButtons() {
    var container = $('#status-buttons');
    if (!container) return;
    // Event delegation for status buttons
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.status-btn');
      if (btn && state.currentId && btn.dataset.status) {
        setStatus(state.currentId, btn.dataset.status);
      }
    });
  }

  // ---------- hash routing ----------
  function bindHashChange() {
    window.addEventListener('hashchange', function () {
      var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
      if (id && state.chapterById[id] && id !== state.currentId) {
        loadChapter(id, false);
      }
    });
  }

  // ---------- init ----------
  // ---------- TOC tab switching ----------
  function bindTocTabs() {
    var tabsContainer = document.querySelector('.toc-tabs');
    if (!tabsContainer) return;
    tabsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.toc-tab');
      if (!btn || btn.classList.contains('active')) return;
      var view = btn.dataset.view;
      if (!view) return;

      // Update active state on buttons
      tabsContainer.querySelectorAll('.toc-tab').forEach(function (t) {
        t.classList.toggle('active', t === btn);
      });

      // Update state and rebuild
      state.tocView = view;
      saveJSON(STORAGE_TOC_VIEW, view);
      buildToc();
      refreshTocStatus();
    });
  }

  function init() {
    // 0. Initialize mermaid if loaded (async script may arrive later)
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    }
    // Listen for async library loads to re-render current content
    var mathRetryTimer = null;
    function onLibLoaded() {
      if (mathRetryTimer) clearTimeout(mathRetryTimer);
      mathRetryTimer = setTimeout(function() {
        var body = document.getElementById('chapter-body') || document.querySelector('.content-body');
        if (body) {
          if (typeof mermaid !== 'undefined' && !window.__mermaidInited) {
            window.__mermaidInited = true;
            mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
          }
          renderMathAndDiagrams(body);
        }
      }, 100);
    }
    // Poll for late-arriving async scripts (KaTeX/Mermaid)
    var pollCount = 0;
    var pollTimer = setInterval(function() {
      pollCount++;
      if (pollCount > 50) { clearInterval(pollTimer); return; } // stop after 5s
      if (typeof katex !== 'undefined' || typeof mermaid !== 'undefined') {
        clearInterval(pollTimer);
        onLibLoaded();
      }
    }, 100);

    // 1. data
    buildIndex();

    // 2. restore preferences
    state.progress = loadJSON(STORAGE_PROGRESS, {}) || {};
    state.notes = loadJSON(STORAGE_NOTES, {}) || {};
    state.expanded = loadJSON(STORAGE_EXPAND, {}) || {};
    var savedTheme = loadJSON(STORAGE_THEME, 'dark');
    applyTheme(savedTheme);

    // 2b. restore TOC view preference
    var savedView = loadJSON(STORAGE_TOC_VIEW, 'module');
    state.tocView = (savedView === 'phase') ? 'phase' : 'module';
    // Sync tab button active state
    var tabBtns = document.querySelectorAll('.toc-tab');
    tabBtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === state.tocView);
    });

    // 3. build TOC
    buildToc();
    refreshTocStatus();

    // 4. restore last position
    var hashId = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    var lastId = loadJSON(STORAGE_LAST, null);
    var initialId = (hashId && state.chapterById[hashId]) ? hashId
                  : (lastId && state.chapterById[lastId]) ? lastId
                  : null;
    if (initialId) loadChapter(initialId, false);

    // 5. timer
    startTimer();

    // 5.5. probe optional Python runner service
    detectPythonService().then(showPythonServiceStatus);

    // 6. events
    bindStatusButtons();
    bindNotes();
    bindNotesToggle();
    bindSearch();
    bindTheme();
    bindSidebarToggle();
    bindTocTabs();
    bindHashChange();
    setupScrollWatcher();

    // initial stats even when no chapter selected
    refreshStats();
  }

  // ---------- Python service detection (optional code runner) ----------
  var PYTHON_API = 'http://localhost:5678';
  var pythonServiceAvailable = false;

  function detectPythonService() {
    return fetch(PYTHON_API + '/api/health', { mode: 'cors' })
      .then(function (r) { return r.ok; })
      .then(function (ok) {
        pythonServiceAvailable = !!ok;
        // 服务检测完成后，重新对当前已渲染的文章内容启用代码运行器
        if (pythonServiceAvailable) {
          var body = document.querySelector('#reader-body');
          if (body) {
            try { enableCodeRunner(body); } catch (_) {}
          }
        }
      })
      .catch(function () { pythonServiceAvailable = false; });
  }

  function showPythonServiceStatus() {
    var existing = document.querySelector('.python-status-bar');
    if (existing) existing.remove();

    var bar = document.createElement('div');
    bar.className = 'python-status-bar';

    if (pythonServiceAvailable) {
      bar.classList.add('connected');
      bar.innerHTML = '<span class="status-icon">\u2713</span> Python \u4ee3\u7801\u8fd0\u884c\u5df2\u5c31\u7eea';
      var target = document.querySelector('#reader-inner') || document.querySelector('#reader');
      if (target) target.prepend(bar);
      setTimeout(function () { bar.classList.add('fade-out'); }, 4000);
      setTimeout(function () { bar.remove(); }, 4600);
    } else {
      bar.classList.add('disconnected');
      bar.innerHTML = '<span class="status-icon">\ud83d\udca1</span> \u542f\u52a8 Python \u670d\u52a1\u53ef\u89e3\u9501\u4ee3\u7801\u8fd0\u884c\u529f\u80fd\uff1a<code>./start.sh</code>';
      var target2 = document.querySelector('#reader-inner') || document.querySelector('#reader');
      if (target2) target2.prepend(bar);
    }
  }

  // ---------- Code Runner (optional, requires localhost:5678) ----------
  function isRunnableCode(code) {
    // === 严格白名单模式：只有真正自包含、能产生输出的代码才可运行 ===

    // 1. shell 命令 → 不可运行
    if (/^[!%]|^pip\s|^apt\s|^git\s|^conda\s/m.test(code)) return false;

    // 2. 包含省略号(不完整) → 不可运行
    if (/^\s*\.\.\.\s*$/m.test(code)) return false;

    // 3. 至少 3 行有效代码
    var lines = code.split('\n').filter(function(l) {
      return l.trim() && !l.trim().startsWith('#');
    });
    if (lines.length < 3) return false;

    // 4. 必须有 print() — 代码必须产生可见输出
    if (!/\bprint\s*\(/.test(code)) return false;

    // 5. 只允许标准库 import（白名单）
    var allowedModules = [
      'os','sys','json','re','math','random','time','datetime',
      'collections','itertools','functools','string','hashlib','copy',
      'typing','dataclasses','enum','abc','io','struct','textwrap',
      'operator','decimal','fractions','statistics','heapq','bisect',
      'array','queue','threading','contextlib','inspect','pprint',
      'logging','unittest','pathlib','tempfile','glob','shutil',
      'base64','urllib','http','socket','html','xml','csv',
      'configparser','argparse','getopt','secrets','uuid'
    ];
    var importMatches = code.match(/^(?:from\s+(\S+)|import\s+(\S+))/gm) || [];
    for (var i = 0; i < importMatches.length; i++) {
      var m = importMatches[i];
      var mod = m.replace(/^(?:from|import)\s+/, '').split('.')[0].split(' ')[0];
      if (mod && allowedModules.indexOf(mod) === -1) return false;
    }

    // 6. 禁止危险操作
    if (/\bsubprocess\b|\bos\.system\s*\(|\bos\.popen\s*\(|\bos\.exec/.test(code)) return false;

    // 7. 函数调用检查：未定义调用不超过 20%
    var builtins = ['print','len','range','int','str','float','list','dict','set',
      'tuple','type','isinstance','issubclass','hasattr','getattr','setattr',
      'enumerate','zip','map','filter','sorted','reversed','sum','min','max',
      'abs','round','open','input','format','repr','id','hash','hex','oct','bin',
      'chr','ord','any','all','next','iter','super','property','staticmethod',
      'classmethod','vars','dir','help','eval','exec','compile','globals','locals',
      'callable','delattr','divmod','pow','slice','object','bool','bytes','bytearray',
      'memoryview','complex','frozenset','breakpoint','exit','quit'];
    var builtinSet = {};
    builtins.forEach(function(b) { builtinSet[b] = true; });

    var definedFuncs = {};
    (code.match(/(?:^|\n)\s*def\s+([a-z_]\w*)/g) || []).forEach(function(m) {
      definedFuncs[m.replace(/.*def\s+/, '')] = true;
    });
    var assignedVars = {};
    (code.match(/^([a-z_]\w*)\s*=/gm) || []).forEach(function(m) {
      assignedVars[m.replace(/\s*=.*/, '')] = true;
    });

    var allCalls = code.match(/\b([a-z_]\w*)\s*\(/g) || [];
    var unknown = 0, total = 0;
    for (var j = 0; j < allCalls.length; j++) {
      var funcName = allCalls[j].replace(/\s*\($/, '');
      if (/^(def|class|if|for|while|with|elif|except|lambda|not|and|or|in|is)$/.test(funcName)) continue;
      if (funcName.indexOf('.') >= 0) continue;
      total++;
      if (!builtinSet[funcName] && !definedFuncs[funcName] && !assignedVars[funcName]) {
        unknown++;
      }
    }
    if (total > 0 && unknown / total > 0.2) return false;

    return true;
  }

  function enableCodeRunner(container) {
    if (!container) return;

    var codeBlocks = container.querySelectorAll(
      'pre > code.language-python, pre > code.lang-python, pre > code.python'
    );
    codeBlocks.forEach(function (codeEl) {
      var pre = codeEl.parentElement;
      if (!pre) return;
      // 已有 Run 按钮的直接跳过
      if (pre.querySelector('.run-btn')) return;
    
      var code = codeEl.textContent || '';
      pre.style.position = 'relative';
    
      if (pythonServiceAvailable && isRunnableCode(code)) {
        // 可运行：移除可能存在的旧 badge 和 copy 按钮，添加 Run 按钮
        var oldBadge = pre.querySelector('.code-example-badge');
        if (oldBadge) oldBadge.remove();
        var oldCopy = pre.querySelector('.code-copy-btn');
        if (oldCopy) oldCopy.remove();
    
        var btn = document.createElement('button');
        btn.className = 'run-btn';
        btn.type = 'button';
        btn.innerHTML = '&#9654; Run';
        btn.addEventListener('click', function () { runCode(codeEl, btn, pre); });
        pre.appendChild(btn);
      } else if (!pre.querySelector('.code-example-badge')) {
        // 不可运行且还没有 badge：显示"示例代码"标签 + 复制按钮
        var badge = document.createElement('span');
        badge.className = 'code-example-badge';
        badge.textContent = '\uD83D\uDCCB 示例代码';
        pre.appendChild(badge);
    
        var copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.type = 'button';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(code).then(function () {
            copyBtn.textContent = '✓ 已复制';
            setTimeout(function () { copyBtn.textContent = '复制'; }, 2000);
          });
        });
        pre.appendChild(copyBtn);
      }
    });
  }

  function runCode(codeEl, btn, pre) {
    var code = codeEl.textContent || '';
    btn.innerHTML = '&#8987; \u8fd0\u884c\u4e2d...';
    btn.disabled = true;

    var oldOutput = pre.nextElementSibling;
    if (oldOutput && oldOutput.classList && oldOutput.classList.contains('code-output')) {
      oldOutput.remove();
    }

    fetch(PYTHON_API + '/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, timeout: 10 }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        btn.innerHTML = '&#9654; Run';
        btn.disabled = false;

        var output = document.createElement('div');
        output.className = 'code-output';
        var html = '';
        if (data && data.stdout) {
          html += '<pre class="output-stdout">' + escapeText(data.stdout) + '</pre>';
        }
        if (data && data.stderr) {
          html += '<pre class="output-stderr">' + escapeText(data.stderr) + '</pre>';
        }
        if (!html) {
          html = '<pre class="output-stdout">(\u65e0\u8f93\u51fa)</pre>';
        }
        output.innerHTML = html;
        pre.after(output);
      })
      .catch(function (err) {
        btn.innerHTML = '&#9654; Run';
        btn.disabled = false;
        var output = document.createElement('div');
        output.className = 'code-output';
        output.innerHTML =
          '<pre class="output-stderr">\u8fde\u63a5\u5931\u8d25: ' +
          escapeText(err && err.message ? err.message : String(err)) +
          '</pre>';
        pre.after(output);
      });
  }

  // ---------- Quiz (uses pre-generated window.QUIZ_DATA + QUIZ_PATH_MAP) ----------
  function enableQuiz(ch, articleEl) {
    if (!ch || !articleEl) return;
    // Resolve chapter file path to quiz ID via QUIZ_PATH_MAP
    var filePath = ch.file || '';
    var quizId = (window.QUIZ_PATH_MAP || {})[filePath];
    var data = quizId ? (window.QUIZ_DATA || {})[quizId] : null;
    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) return;

    // Avoid duplicates
    if (articleEl.querySelector('.quiz-start-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'quiz-start-bar';
    bar.innerHTML =
      '<button type="button" class="quiz-start-btn">\ud83d\udcdd \u77e5\u8bc6\u70b9\u6d4b\u9a8c\uff08' +
      data.questions.length +
      '\u9898\uff09</button>';
    articleEl.appendChild(bar);

    bar.querySelector('.quiz-start-btn').addEventListener('click', function () {
      showQuizPanel(quizId, data.questions);
    });
  }

  function showQuizPanel(chapterId, questions) {
    var overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';

    var panel = document.createElement('div');
    panel.className = 'quiz-panel';

    var currentQ = 0;
    var score = 0;
    var answers = [];

    function renderQuestion() {
      var q = questions[currentQ];
      var html = '<div class="quiz-header">';
      html += '<span class="quiz-progress">' + (currentQ + 1) + ' / ' + questions.length + '</span>';
      html += '<button type="button" class="quiz-close" aria-label="close">&times;</button>';
      html += '</div>';
      html += '<div class="quiz-question">' + escapeText(q.question) + '</div>';
      html += '<div class="quiz-options">';
      q.options.forEach(function (opt, i) {
        html += '<div class="quiz-option" data-idx="' + i + '">';
        html += '<span class="quiz-option-letter">' + 'ABCDEFGH'[i] + '</span>';
        html += '<span class="quiz-option-text">' + escapeText(opt) + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="quiz-feedback" style="display:none;"></div>';
      panel.innerHTML = html;

      panel.querySelector('.quiz-close').addEventListener('click', function () { overlay.remove(); });

      panel.querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.addEventListener('click', function onPick() {
          var idx = parseInt(this.dataset.idx, 10);
          answers.push(idx);

          var correct = q.answer;
          panel.querySelectorAll('.quiz-option').forEach(function (o) {
            o.style.pointerEvents = 'none';
            var oIdx = parseInt(o.dataset.idx, 10);
            if (oIdx === correct) o.classList.add('quiz-correct');
            if (oIdx === idx && idx !== correct) o.classList.add('quiz-wrong');
          });

          var feedback = panel.querySelector('.quiz-feedback');
          if (idx === correct) {
            score++;
            feedback.innerHTML =
              '<span class="feedback-correct">\u2713 \u6b63\u786e\uff01</span><p>' +
              escapeText(q.explanation || '') + '</p>';
          } else {
            feedback.innerHTML =
              '<span class="feedback-wrong">\u2717 \u9519\u8bef</span><p>' +
              escapeText(q.explanation || '') + '</p>';
          }
          feedback.style.display = 'block';

          var nextBtn = document.createElement('button');
          nextBtn.type = 'button';
          nextBtn.className = 'quiz-next-btn';
          nextBtn.textContent =
            currentQ < questions.length - 1 ? '\u4e0b\u4e00\u9898 \u2192' : '\u67e5\u770b\u7ed3\u679c';
          nextBtn.addEventListener('click', function () {
            currentQ++;
            if (currentQ < questions.length) renderQuestion();
            else showResult();
          });
          feedback.appendChild(nextBtn);
        });
      });
    }

    function showResult() {
      var pct = Math.round((score / questions.length) * 100);
      var remark = pct >= 80 ? '\u8868\u73b0\u4f18\u79c0\uff01' : pct >= 60 ? '\u8fd8\u4e0d\u9519\uff0c\u7ee7\u7eed\u52a0\u6cb9\uff01' : '\u5efa\u8bae\u91cd\u65b0\u9605\u8bfb\u672c\u7ae0\u5185\u5bb9';
      var html = '<div class="quiz-header">';
      html += '<span class="quiz-progress">\u6d4b\u9a8c\u5b8c\u6210</span>';
      html += '<button type="button" class="quiz-close" aria-label="close">&times;</button>';
      html += '</div>';
      html += '<div class="quiz-result">';
      html += '<div class="quiz-score">' + score + ' / ' + questions.length + '</div>';
      html += '<div class="quiz-pct">' + pct + '%</div>';
      html += '<p>' + remark + '</p>';
      html += '<button type="button" class="quiz-close-btn">\u5173\u95ed</button>';
      html += '</div>';
      panel.innerHTML = html;
      panel.querySelector('.quiz-close').addEventListener('click', function () { overlay.remove(); });
      panel.querySelector('.quiz-close-btn').addEventListener('click', function () { overlay.remove(); });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    renderQuestion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
