// src/styles.ts
var STYLES = `
/* Toolbar inside the panel */
.cnv-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  z-index: 9999;
}

.cnv-toolbar-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--lumiverse-transition-fast, 0.15s) ease, background var(--lumiverse-transition-fast, 0.15s) ease, transform var(--lumiverse-transition-fast, 0.15s) ease;
  background: var(--lumiverse-bg, rgba(30, 30, 30, 0.85));
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));
  color: var(--lumiverse-text-muted, #c0c0c0);
  border-radius: var(--lumiverse-radius-sm, 6px);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  margin-left: 6px;
}
.cnv-toolbar-btn:hover {
  background: var(--lumiverse-bg-hover, rgba(50, 50, 50, 0.95));
  color: var(--lumiverse-text, #ffffff);
  transform: translateY(-1px);
}
.cnv-toolbar-btn:active {
  transform: translateY(0);
}
.cnv-toolbar:hover .cnv-toolbar-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Custom tooltip */
.cnv-tooltip {
  position: relative;
}
.cnv-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -34px;
  right: 0;
  background: var(--lumiverse-bg-elevated, rgba(15, 15, 15, 0.95));
  color: var(--lumiverse-text, #e0e0e0);
  padding: 5px 9px;
  font-size: 11px;
  border-radius: var(--lumiverse-radius-sm, 4px);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--lumiverse-transition-fast, 0.15s) ease;
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));
  box-shadow: var(--lumiverse-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.4));
  z-index: 1000000;
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}
.cnv-tooltip:hover::after {
  opacity: 1;
}

.cnv-tooltip-left::after {
  right: auto;
  left: 0;
}

/* Floating widget container */
.cnv-widget {
  position: fixed;
  z-index: 99999;
  background: rgba(26, 26, 26, calc(var(--cnv-bg-opacity, 1.0) * 0.85));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, calc(var(--cnv-bg-opacity, 1.0) * 0.12));
  border-radius: var(--lumiverse-radius, 10px);
  box-shadow: var(--lumiverse-shadow-md, 0 16px 48px rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  color: var(--lumiverse-text, #c0c0c0);
}

.cnv-widget.animating {
  transition: width var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              height var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              left var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              top var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              border-radius var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              background-color var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.cnv-pill-launcher {
  position: fixed;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--lumiverse-radius-sm, 6px) !important;
  background: var(--lumiverse-primary-015, rgba(0, 122, 204, 0.25)) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: var(--lumiverse-shadow-md, 0 8px 24px rgba(0, 0, 0, 0.5));
  cursor: pointer !important;
  color: var(--lumiverse-text, #ffffff);
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.cnv-pill-launcher.transparent {
  opacity: 0.25 !important;
}

.cnv-pill-launcher.transparent:hover {
  opacity: 0.7 !important;
}

.cnv-pill-icon {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--lumiverse-text, #ffffff);
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  white-space: nowrap;
}
.cnv-pill-icon:hover {
  color: var(--lumiverse-text, #ffffff);
}

.cnv-widget.fullscreen {
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  border-radius: 0 !important;
  border: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Drag/Double-click edges */
.cnv-widget-edge {
  position: absolute;
  z-index: 99999;
  background: transparent;
  cursor: move;
}

.cnv-edge-top {
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
}

.cnv-edge-left {
  left: 0;
  top: 0;
  bottom: 0;
  width: 12px;
}

.cnv-edge-right {
  right: 12px;
  top: 0;
  bottom: 0;
  width: 12px;
}

.cnv-edge-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 12px;
}

.cnv-widget-toolbar .cnv-toolbar-btn {
  opacity: 0;
  pointer-events: none;
}
.cnv-widget-toolbar:hover .cnv-toolbar-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Content wrapper in widget */
.cnv-widget-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* Resize handles */
.cnv-resize-handle {
  position: absolute;
  z-index: 100000;
  background: transparent;
}
.cnv-widget.fullscreen .cnv-resize-handle {
  display: none !important;
}
.cnv-widget.fullscreen .cnv-widget-toolbar {
  cursor: default !important;
}

.cnv-resize-t { top: 0; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
.cnv-resize-b { bottom: 0; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
.cnv-resize-l { left: 0; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
.cnv-resize-r { right: 0; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
.cnv-resize-tl { top: 0; left: 0; width: 10px; height: 10px; cursor: nwse-resize; }
.cnv-resize-tr { top: 0; right: 0; width: 10px; height: 10px; cursor: nesw-resize; }
.cnv-resize-bl { bottom: 0; left: 0; width: 10px; height: 10px; cursor: nesw-resize; }
.cnv-resize-br { bottom: 0; right: 0; width: 10px; height: 10px; cursor: nwse-resize; }

/* Settings Dropdown Menu */
.cnv-settings-menu {
  position: absolute;
  top: 38px;
  right: 10px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  width: 140px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 100001;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(10px);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
}

.cnv-settings-title {
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2px;
  margin-bottom: 0;
}

.cnv-settings-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cnv-settings-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.cnv-settings-slider {
  width: 100%;
  height: 3px;
  border-radius: 1.5px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin: 2px 0;
}

.cnv-settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.cnv-settings-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
`;

// src/sanitizer.ts
var ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "img",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "meter",
  "nav",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "section",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]);
var BLOCKED_TAGS = new Set([
  "script",
  "svg",
  "math",
  "noscript",
  "iframe",
  "embed",
  "object",
  "applet",
  "base",
  "template",
  "meta"
]);
var ALLOWED_ATTRS = new Set([
  "href",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "style",
  "width",
  "height",
  "target",
  "rel",
  "loading",
  "decoding",
  "colspan",
  "rowspan",
  "span",
  "headers",
  "scope",
  "type",
  "value",
  "placeholder",
  "disabled",
  "readonly",
  "name",
  "for",
  "label",
  "start",
  "reversed",
  "cite",
  "datetime",
  "wrap",
  "open",
  "max",
  "min",
  "low",
  "high",
  "optimum",
  "controls",
  "loop",
  "muted",
  "preload",
  "poster",
  "playsinline"
]);
var URL_ATTRS = new Set(["href", "src", "poster", "data", "action", "formaction"]);
var SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", "data:image/"]);
var RAW_TEXT_ELEMENTS = new Set(["style"]);
var NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  zwnj: "‌",
  zwj: "‍",
  lrm: "‎",
  rlm: "‏",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  hellip: "…",
  prime: "′",
  Prime: "″",
  copy: "©",
  reg: "®",
  trade: "™",
  laquo: "«",
  raquo: "»",
  deg: "°",
  plusmn: "±",
  micro: "µ",
  para: "¶",
  middot: "·",
  frac12: "½",
  times: "×",
  divide: "÷",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  iexcl: "¡",
  curren: "¤",
  brvbar: "¦",
  sect: "§",
  uml: "¨",
  ordf: "ª",
  not: "¬",
  shy: "­",
  macr: "¯",
  ordm: "º",
  sup1: "¹",
  sup2: "²",
  sup3: "³",
  acute: "´",
  cedil: "¸",
  iquest: "¿",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  ETH: "Ð",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
  THORN: "Þ",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  eth: "ð",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  thorn: "þ",
  yuml: "ÿ",
  OElig: "Œ",
  oelig: "œ",
  Scaron: "Š",
  scaron: "š",
  Yuml: "Ÿ",
  fnof: "ƒ",
  circ: "ˆ",
  tilde: "˜",
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Delta: "Δ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigmaf: "ς",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  thetasym: "ϑ",
  upsih: "ϒ",
  piv: "ϖ",
  larr: "←",
  uarr: "↑",
  rarr: "→",
  darr: "↓",
  harr: "↔",
  crarr: "↵",
  lArr: "⇐",
  uArr: "⇑",
  rArr: "⇒",
  dArr: "⇓",
  hArr: "⇔",
  forall: "∀",
  part: "∂",
  exist: "∃",
  empty: "∅",
  nabla: "∇",
  isin: "∈",
  notin: "∉",
  ni: "∋",
  prod: "∏",
  sum: "∑",
  minus: "−",
  lowast: "∗",
  radic: "√",
  prop: "∝",
  infin: "∞",
  ang: "∠",
  and: "∧",
  or: "∨",
  cap: "∩",
  cup: "∪",
  int: "∫",
  there4: "∴",
  sim: "∼",
  cong: "≅",
  asymp: "≈",
  ne: "≠",
  equiv: "≡",
  le: "≤",
  ge: "≥",
  sub: "⊂",
  sup: "⊃",
  nsub: "⊄",
  sube: "⊆",
  supe: "⊇",
  oplus: "⊕",
  otimes: "⊗",
  perp: "⊥",
  sdot: "⋅",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  lang: "〈",
  rang: "〉",
  loz: "◊",
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diams: "♦"
};
function sanitize(raw) {
  const decoded = decodeEntities(raw);
  const stripped = stripDangerousConstructs(decoded);
  const doc = parseHTML(stripped);
  walkAndFilter(doc, ALLOWED_TAGS, BLOCKED_TAGS, ALLOWED_ATTRS, URL_ATTRS, SAFE_PROTOCOLS);
  return serialize(doc);
}
function decodeEntities(html) {
  let result = html;
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    const cp = parseInt(hex, 16);
    return cp > 0 ? String.fromCodePoint(cp) : `�`;
  });
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    const cp = parseInt(dec, 10);
    return cp > 0 ? String.fromCodePoint(cp) : `�`;
  });
  result = result.replace(/&([A-Za-z]+);/g, (full, name) => {
    return NAMED_ENTITIES[name] ?? full;
  });
  return result;
}
function stripDangerousConstructs(html) {
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, "");
  out = out.replace(/<script[^>]*>/gi, "");
  out = out.replace(/<svg[\s\S]*?<\/svg\s*>/gi, "");
  out = out.replace(/<svg[^>]*>/gi, "");
  out = out.replace(/<math[\s\S]*?<\/math\s*>/gi, "");
  out = out.replace(/<math[^>]*>/gi, "");
  out = out.replace(/<noscript[\s\S]*?<\/noscript\s*>/gi, "");
  out = out.replace(/<noscript[^>]*>/gi, "");
  out = out.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");
  return out;
}
function parseHTML(html) {
  const root = { type: "root", children: [] };
  const stack = [root];
  const tagRe = /<(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>'"\s]+\s*(?:=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let last = 0;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m.index > last) {
      const text = html.slice(last, m.index);
      if (text) {
        const parent = stack[stack.length - 1];
        (parent.children ??= []).push({ type: "text", content: text });
      }
    }
    const [, closing, tag, attrStr, selfClose] = m;
    const tagLower = tag.toLowerCase();
    if (closing) {
      let i = stack.length - 1;
      while (i > 0 && stack[i].tag !== tagLower)
        i--;
      if (i > 0)
        stack.length = i;
    } else {
      const el = {
        type: "element",
        tag: tagLower,
        attrs: parseAttrs(attrStr),
        children: []
      };
      const parent = stack[stack.length - 1];
      (parent.children ??= []).push(el);
      if (!selfClose && !VOID_TAGS.has(tagLower) && !RAW_TEXT_ELEMENTS.has(tagLower)) {
        stack.push(el);
      } else if (RAW_TEXT_ELEMENTS.has(tagLower)) {
        const closingTag = `</${tagLower}>`;
        const rawEnd = html.indexOf(closingTag, m.index + m[0].length);
        if (rawEnd !== -1) {
          const innerContent = html.slice(m.index + m[0].length, rawEnd);
          el.children = [{ type: "text", content: innerContent }];
          tagRe.lastIndex = rawEnd + closingTag.length;
          last = tagRe.lastIndex;
          continue;
        }
      }
    }
    last = m.index + m[0].length;
  }
  if (last < html.length) {
    const text = html.slice(last);
    if (text) {
      const parent = stack[stack.length - 1];
      (parent.children ??= []).push({ type: "text", content: text });
    }
  }
  return root;
}
var VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z_][\w:.%-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const rawKey = m[1];
    const key = rawKey.toLowerCase();
    if (key.startsWith("on"))
      continue;
    attrs[rawKey] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}
function walkAndFilter(node, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols) {
  if (node.type !== "element" && node.type !== "root")
    return;
  if (!node.children)
    return;
  node.children = node.children.filter((child) => {
    if (child.type === "text") {
      if (node.type === "element" && node.tag === "style") {
        child.content = sanitizeCSS(child.content ?? "");
      }
      return true;
    }
    if (child.type !== "element")
      return false;
    if (!child.tag || blockedTags.has(child.tag))
      return false;
    if (child.tag === "link") {
      const rel = (child.attrs?.rel ?? "").toLowerCase().trim();
      const href = child.attrs?.href ?? "";
      if (rel === "stylesheet" && isSafeURL(href, safeProtocols))
        return true;
      return false;
    }
    if (!allowedTags.has(child.tag))
      return false;
    const filteredAttrs = {};
    if (child.attrs) {
      for (const [k, v] of Object.entries(child.attrs)) {
        const kLower = k.toLowerCase();
        if (kLower.startsWith("data-")) {
          filteredAttrs[k] = v;
          continue;
        }
        if (!allowedAttrs.has(kLower))
          continue;
        if (kLower === "style") {
          filteredAttrs[kLower] = sanitizeCSS(v);
          continue;
        }
        if (urlAttrs.has(kLower) && !isSafeURL(v, safeProtocols))
          continue;
        filteredAttrs[kLower] = v;
      }
    }
    child.attrs = filteredAttrs;
    walkAndFilter(child, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols);
    return true;
  });
}
function sanitizeCSS(css) {
  let out = css;
  out = out.replace(/@import\s+(?!url\s*\()/gi, "/* removed */ ");
  out = out.replace(/expression\s*\(/gi, "/* removed */(");
  out = out.replace(/behavior\s*:/gi, "/* removed */:");
  out = out.replace(/-moz-binding\s*:/gi, "/* removed */:");
  out = out.replace(/javascript\s*:/gi, "/* removed */:");
  out = out.replace(/vbscript\s*:/gi, "/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*javascript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*vbscript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*data\s*:\s*(?!image\/)/gi, "url($1/* removed */:");
  out = out.replace(/\btext-align\s*:\s*justify\b/gi, "text-align: left");
  return out;
}
function isSafeURL(url, safeProtocols) {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("#") || trimmed.startsWith("data:image/"))
    return true;
  try {
    const parsed = new URL(url, "https://placeholder");
    return safeProtocols.has(parsed.protocol);
  } catch {
    return false;
  }
}
function serialize(node) {
  if (node.type === "text")
    return node.content ?? "";
  if (node.type === "root" || !node.tag) {
    return (node.children ?? []).map(serialize).join("");
  }
  const attrs = Object.entries(node.attrs ?? {}).map(([k, v]) => ` ${k}="${escAttr(v)}"`).join("");
  if (VOID_TAGS.has(node.tag))
    return `<${node.tag}${attrs}>`;
  const children = (node.children ?? []).map(serialize).join("");
  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}
function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// src/markdown.ts
var STYLE_TAG_LOOKAHEAD = 200;
var STYLE_TAG_MIN_LENGTH = 50;
function renderContent(rawHtml, charName) {
  let processed = rawHtml.replace(/\{\{char\}\}/gi, charName || "{{char}}").replace(/\{\{user\}\}/gi, "You");
  processed = processed.replace(/\r\n/g, `
`).replace(/\r/g, `
`);
  const hasStyleTagAtStart = new RegExp(`^[\\s\\S]{0,${STYLE_TAG_LOOKAHEAD}}<style[^>]*>[\\s\\S]{${STYLE_TAG_MIN_LENGTH},}<\\/style>`, "i").test(processed);
  if (hasStyleTagAtStart) {
    processed = processed.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)/g, (match, alt, src) => {
      if (!src.match(/^(https?:\/\/|\/)/i))
        return match;
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
      return `<img src="${src}"${altAttr} referrerpolicy="no-referrer" loading="lazy">`;
    });
  } else {
    processed = processed.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const cls = lang.trim() ? ` class="language-${lang.trim()}"` : "";
      return `<pre><code${cls}>${code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    });
    const blockPlaceholders = [];
    const blockTagNames = new Set(["div", "section", "article", "header", "footer", "aside", "nav", "main", "style", "table", "figure", "form", "fieldset", "details", "summary", "blockquote"]);
    let newProcessed = "";
    const tagScannerRe = /<(\/?)\s*([a-zA-Z0-9-]+)\b(?:[^>'"]|"[^"]*"|'[^']*')*>/g;
    let cursor = 0;
    while (cursor < processed.length) {
      tagScannerRe.lastIndex = cursor;
      const match = tagScannerRe.exec(processed);
      if (!match) {
        newProcessed += processed.slice(cursor);
        break;
      }
      const isClosing = match[1] === "/";
      const tagName = match[2].toLowerCase();
      if (!isClosing && blockTagNames.has(tagName)) {
        newProcessed += processed.slice(cursor, match.index);
        let depth = 1;
        const innerScannerRe = new RegExp(`<(/?)\\s*${tagName}\\b(?:[^>'"]|"[^"]*"|'[^']*')*>`, "gi");
        innerScannerRe.lastIndex = match.index + match[0].length;
        let blockEnd = match.index + match[0].length;
        let innerMatch;
        while (depth > 0 && (innerMatch = innerScannerRe.exec(processed)) !== null) {
          if (innerMatch[1] === "/") {
            depth--;
          } else {
            depth++;
          }
          if (depth === 0) {
            blockEnd = innerMatch.index + innerMatch[0].length;
          }
        }
        if (depth > 0) {
          blockEnd = processed.length;
        }
        const blockStr = processed.slice(match.index, blockEnd);
        const idx = blockPlaceholders.length;
        blockPlaceholders.push(blockStr);
        newProcessed += `\x00BLK${idx}\x00`;
        cursor = blockEnd;
      } else {
        newProcessed += processed.slice(cursor, match.index + match[0].length);
        cursor = match.index + match[0].length;
      }
    }
    processed = newProcessed;
    const inlinePlaceholders = [];
    processed = processed.replace(/<[^>]+>/g, (m) => {
      const idx = inlinePlaceholders.length;
      inlinePlaceholders.push(m);
      return `\x00INL${idx}\x00`;
    });
    processed = processed.replace(/^#{6}\s+(.+)$/gm, `

<h6>$1</h6>

`);
    processed = processed.replace(/^#{5}\s+(.+)$/gm, `

<h5>$1</h5>

`);
    processed = processed.replace(/^#{4}\s+(.+)$/gm, `

<h4>$1</h4>

`);
    processed = processed.replace(/^#{3}\s+(.+)$/gm, `

<h3>$1</h3>

`);
    processed = processed.replace(/^#{2}\s+(.+)$/gm, `

<h2>$1</h2>

`);
    processed = processed.replace(/^#{1}\s+(.+)$/gm, `

<h1>$1</h1>

`);
    processed = processed.replace(/^(?!\x00BLK\d+\x00)(.+)\n={3,}$/gm, `

<h1>$1</h1>

`);
    processed = processed.replace(/^(?!\x00BLK\d+\x00)(.+)\n-{3,}$/gm, `

<h2>$1</h2>

`);
    processed = processed.replace(/^(>\s?.*\n?)+/gm, (block) => {
      const inner = block.replace(/^>\s?/gm, "").trim();
      return `

<blockquote>${inner}</blockquote>

`;
    });
    processed = processed.replace(/^[-*_]{3,}\s*$/gm, `

<hr>

`);
    const listLines = processed.split(`
`);
    const listOutput = [];
    const listStack = [];
    for (const line of listLines) {
      const ulMatch = line.match(/^(\s*)[*+\-]\s+(.*)$/);
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (ulMatch) {
        if (!listStack.length || listStack[listStack.length - 1] !== "ul") {
          listOutput.push("<ul>");
          listStack.push("ul");
        }
        listOutput.push(`<li>${ulMatch[2]}</li>`);
      } else if (olMatch) {
        if (!listStack.length || listStack[listStack.length - 1] !== "ol") {
          listOutput.push("<ol>");
          listStack.push("ol");
        }
        listOutput.push(`<li>${olMatch[2]}</li>`);
      } else {
        while (listStack.length)
          listOutput.push(`</${listStack.pop()}>`);
        listOutput.push(line);
      }
    }
    while (listStack.length)
      listOutput.push(`</${listStack.pop()}>`);
    processed = listOutput.join(`
`);
    processed = processed.replace(/`([^`\n]+?)`/g, (_, c) => `<code>${c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
    processed = processed.replace(/\*{3}([^*\n]+?)\*{3}/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/\*{2}([^*\n]+?)\*{2}/g, "<strong>$1</strong>");
    processed = processed.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/(?<![\w])_{3}([^_\n]+?)_{3}(?![\w])/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/(?<![\w])_{2}([^_\n]+?)_{2}(?![\w])/g, "<strong>$1</strong>");
    processed = processed.replace(/(?<![\w])_([^_\n]+?)_(?![\w])/g, "<em>$1</em>");
    processed = processed.replace(/~~([^~\n]+?)~~/g, "<s>$1</s>");
    processed = processed.replace(/\[!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)\]\(([^)]+)\)/g, (_, alt, imgSrc, linkHref) => {
      if (!imgSrc.match(/^(https?:\/\/|\/)/i))
        return _;
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
      const safeLink = linkHref.match(/^https?:\/\//i) ? linkHref : "#";
      return `<a href="${safeLink}" target="_blank" rel="noopener"><img src="${imgSrc}"${altAttr} referrerpolicy="no-referrer" loading="lazy"></a>`;
    });
    processed = processed.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)/g, (match, alt, src) => {
      if (!src.match(/^(https?:\/\/|\/)/i))
        return match;
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
      return `<img src="${src}"${altAttr} referrerpolicy="no-referrer" loading="lazy">`;
    });
    processed = processed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const paragraphs = processed.split(/\n{2,}/);
    processed = paragraphs.map((para) => {
      para = para.trim();
      if (!para)
        return "";
      if (/^\x00BLK\d+\x00/.test(para))
        return para;
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|div|p|section|article|header|footer)[^>]*>/i.test(para))
        return para;
      if (/<(h[1-6]|ul|ol|blockquote|pre|hr|table)[^>]*>/i.test(para))
        return para;
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    }).join(`
`);
    processed = processed.replace(/\x00INL(\d+)\x00/g, (_, i) => inlinePlaceholders[+i]);
    processed = processed.replace(/\x00BLK(\d+)\x00/g, (_, i) => blockPlaceholders[+i]);
  }
  const safe = sanitize(processed);
  const hardened = safe.replace(/<img(?![^>]*referrerpolicy)\s/gi, '<img referrerpolicy="no-referrer" ').replace(/<video(?![^>]*referrerpolicy)\s/gi, '<video referrerpolicy="no-referrer" ').replace(/<audio(?![^>]*referrerpolicy)\s/gi, '<audio referrerpolicy="no-referrer" ');
  const hasOwnStyles = /<style[^>]*>[\s\S]*?<\/style>/i.test(hardened);
  const universalBase = `<style>
    *, *::before, *::after { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.2s ease; }
    *:hover, html:hover, body:hover { scrollbar-color: rgba(255,255,255,0.15) transparent; }
    ::-webkit-scrollbar { width:8px; height:8px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:transparent; border-radius:4px; }
    html:hover ::-webkit-scrollbar-thumb, body:hover ::-webkit-scrollbar-thumb, *:hover > ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); }
    ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.25) !important; }
    html { margin:0; padding:0; background:transparent !important; color-scheme:dark; }
    body { margin:0; padding:5px 16px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; color:#e0e0e0; background:transparent !important; line-height:1.5; overflow-wrap:break-word; word-wrap:break-word; font-size:0.95rem; }
    #content-wrapper { display:flow-root; width:100%; height:max-content; position:relative; z-index:1; }
    img, video { max-width:100%; }
    [style*="position:fixed"],[style*="position: fixed"],
    [style*="position:sticky"],[style*="position: sticky"] { position:static !important; }
    [style*="z-index"] { z-index:auto !important; }
    @media (max-width:768px) { body { font-size:0.88rem; padding:3px 12px; } }
  </style>`;
  const markdownDefaults = hasOwnStyles ? "" : `<style>
    img, video { display:block; margin:10px auto; border-radius:6px; }
    a { color:#4a9eff; text-decoration:none; }
    a:hover { text-decoration:underline; }
    h1 { color:#4a9eff; margin:12px 0 8px; font-size:1.6em; }
    h2 { color:#4a9eff; margin:12px 0 8px; font-size:1.4em; }
    h3 { color:#4a9eff; margin:10px 0 6px; font-size:1.2em; }
    h4,h5,h6 { color:#4a9eff; margin:8px 0 4px; font-size:1.1em; }
    strong, b { color:#fff; }
    em, i { color:#ddd; font-style:italic; }
    p { margin:0 0 0.8em; }
    blockquote { margin:10px 0; padding:10px 15px; border-left:3px solid #4a9eff; background:rgba(74,158,255,calc(0.06 * var(--cnv-opacity, 1))); border-radius:0 6px 6px 0; }
    pre { background:rgba(0,0,0,calc(0.3 * var(--cnv-opacity, 1))); padding:10px; border-radius:6px; overflow-x:auto; white-space:pre-wrap; word-wrap:break-word; }
    code { background:rgba(0,0,0,calc(0.3 * var(--cnv-opacity, 1))); padding:2px 6px; border-radius:4px; font-family:'Consolas','Monaco',monospace; }
    table { width:100%; border-collapse:collapse; margin:10px 0; background:rgba(0,0,0,calc(0.2 * var(--cnv-opacity, 1))); border-radius:6px; overflow:hidden; }
    td,th { padding:8px 12px; border:1px solid rgba(255,255,255,calc(0.1 * var(--cnv-opacity, 1))); }
    th { background:rgba(74,158,255,calc(0.15 * var(--cnv-opacity, 1))); color:#4a9eff; }
    hr { border:none; border-top:1px solid rgba(255,255,255,0.15); margin:15px 0; }
    ul,ol { padding-left:25px; margin:8px 0; }
    li { margin:4px 0; }
    .placeholder-user { color:#2ecc71; font-weight:bold; }
    .placeholder-char { color:#e74c3c; font-weight:bold; }
  </style>`;
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'none'; object-src 'none'; form-action 'none'; img-src * data: blob:; media-src * data: blob:; style-src 'unsafe-inline' https:; font-src * data: https:;">`;
  return `<!DOCTYPE html><html style="color-scheme:dark light;"><head><meta charset="UTF-8">${csp}${universalBase}${markdownDefaults}</head><body><div id="content-wrapper">${hardened}</div></body></html>`;
}

// src/widget.ts
var DEFAULT_WIDGET_WIDTH = 450;
var DEFAULT_WIDGET_HEIGHT = 650;
var PILL_WIDTH = 140;
var PILL_HEIGHT = 36;
var SNAP_THRESHOLD = 0;
var MIN_WIDGET_WIDTH = 250;
var MIN_WIDGET_HEIGHT = 200;
var widgetEl = null;
var pillEl = null;
var widgetIframe = null;
var fsBtn = null;
var lockBtn = null;
var pillBtn = null;
var closeBtn = null;
var currentDocHtml = "";
var isWidgetFullscreen = false;
var isWidgetLocked = false;
var isPillEnabled = true;
var widgetAbort = null;
var currentWidgetState = {
  widgetOpen: false,
  widgetLocked: false,
  widgetMinimized: false,
  pillEnabled: true,
  pillGeom: {
    left: 20,
    top: 80,
    width: PILL_WIDTH,
    height: PILL_HEIGHT
  },
  widgetGeom: {
    left: Math.max(20, (window.innerWidth - DEFAULT_WIDGET_WIDTH) / 2),
    top: Math.max(20, (window.innerHeight - DEFAULT_WIDGET_HEIGHT) / 2),
    width: DEFAULT_WIDGET_WIDTH,
    height: DEFAULT_WIDGET_HEIGHT
  },
  zoom: 100,
  opacity: 100
};
var spindleCtx = null;
function setSpindleContext(ctx) {
  spindleCtx = ctx;
}
function saveState() {
  if (spindleCtx) {
    spindleCtx.sendToBackend({
      type: "SAVE_STATE",
      state: currentWidgetState
    });
  }
  try {
    localStorage.setItem("cnv_widget_state_v2", JSON.stringify(currentWidgetState));
  } catch (_) {}
}
function restoreWidgetState(state, popOutBtn, initialDocHtml) {
  if (state && typeof state === "object") {
    currentWidgetState = {
      ...currentWidgetState,
      ...state,
      pillGeom: state.pillGeom ? { ...currentWidgetState.pillGeom, ...state.pillGeom } : currentWidgetState.pillGeom,
      widgetGeom: state.widgetGeom ? { ...currentWidgetState.widgetGeom, ...state.widgetGeom } : currentWidgetState.widgetGeom,
      zoom: typeof state.zoom === "number" ? state.zoom : currentWidgetState.zoom,
      opacity: typeof state.opacity === "number" ? state.opacity : currentWidgetState.opacity
    };
    isWidgetLocked = currentWidgetState.widgetLocked;
    isPillEnabled = currentWidgetState.pillEnabled !== false;
    if (!isPillEnabled) {
      currentWidgetState.widgetMinimized = false;
    }
    if (currentWidgetState.widgetOpen && !isWidgetActive()) {
      openWidget(popOutBtn, initialDocHtml);
    }
    if (widgetEl) {
      widgetEl.style.left = `${currentWidgetState.widgetGeom.left}px`;
      widgetEl.style.top = `${currentWidgetState.widgetGeom.top}px`;
      widgetEl.style.width = `${currentWidgetState.widgetGeom.width}px`;
      widgetEl.style.height = `${currentWidgetState.widgetGeom.height}px`;
      updatePillPresence();
      if (currentWidgetState.widgetMinimized && isPillEnabled) {
        widgetEl.style.display = "none";
        if (pillEl) {
          pillEl.classList.remove("transparent");
          pillEl.style.left = `${currentWidgetState.pillGeom.left}px`;
          pillEl.style.top = `${currentWidgetState.pillGeom.top}px`;
          pillEl.style.width = `${currentWidgetState.pillGeom.width}px`;
          pillEl.style.height = `${currentWidgetState.pillGeom.height}px`;
          adjustPillContent(currentWidgetState.pillGeom.width);
        }
      } else {
        widgetEl.style.display = "";
        if (pillEl) {
          pillEl.classList.add("transparent");
          pillEl.style.left = `${currentWidgetState.pillGeom.left}px`;
          pillEl.style.top = `${currentWidgetState.pillGeom.top}px`;
          pillEl.style.width = `${currentWidgetState.pillGeom.width}px`;
          pillEl.style.height = `${currentWidgetState.pillGeom.height}px`;
          adjustPillContent(currentWidgetState.pillGeom.width);
        }
      }
      updateLockBtnIcon();
      updatePillBtnIcon();
      updateCloseBtnTooltip();
    }
  }
}
function initializeLocalState() {
  try {
    const savedStateStr = localStorage.getItem("cnv_widget_state_v2");
    if (savedStateStr) {
      const parsed = JSON.parse(savedStateStr);
      if (parsed && typeof parsed === "object") {
        currentWidgetState = {
          ...currentWidgetState,
          ...parsed,
          pillGeom: parsed.pillGeom ? { ...currentWidgetState.pillGeom, ...parsed.pillGeom } : currentWidgetState.pillGeom,
          widgetGeom: parsed.widgetGeom ? { ...currentWidgetState.widgetGeom, ...parsed.widgetGeom } : currentWidgetState.widgetGeom,
          zoom: typeof parsed.zoom === "number" ? parsed.zoom : 100,
          opacity: typeof parsed.opacity === "number" ? parsed.opacity : 100
        };
        isWidgetLocked = currentWidgetState.widgetLocked;
        isPillEnabled = currentWidgetState.pillEnabled !== false;
        return;
      }
    }
  } catch (_) {}
  try {
    const savedLocked = localStorage.getItem("cnv_widget_locked");
    if (savedLocked !== null) {
      currentWidgetState.widgetLocked = savedLocked === "1";
      isWidgetLocked = currentWidgetState.widgetLocked;
    }
  } catch (_) {}
  try {
    const savedState = localStorage.getItem("cnv_widget_state");
    if (savedState !== null) {
      currentWidgetState.widgetMinimized = savedState === "minimized";
    }
  } catch (_) {}
  try {
    const savedPill = localStorage.getItem("cnv_pill_geom");
    if (savedPill) {
      const parsed = JSON.parse(savedPill);
      if (parsed.left && parsed.top) {
        const l = parseInt(parsed.left, 10);
        const t = parseInt(parsed.top, 10);
        if (!isNaN(l) && !isNaN(t)) {
          currentWidgetState.pillGeom.left = l;
          currentWidgetState.pillGeom.top = t;
        }
      }
      if (parsed.width && parsed.height) {
        const w = parseInt(parsed.width, 10);
        const h = parseInt(parsed.height, 10);
        if (!isNaN(w) && !isNaN(h)) {
          currentWidgetState.pillGeom.width = w;
          currentWidgetState.pillGeom.height = h;
        }
      }
    }
  } catch (_) {}
  try {
    const savedWidget = localStorage.getItem("cnv_widget_geom");
    if (savedWidget) {
      const parsed = JSON.parse(savedWidget);
      if (parsed.left && parsed.top && parsed.width && parsed.height) {
        const l = parseInt(parsed.left, 10);
        const t = parseInt(parsed.top, 10);
        const w = parseInt(parsed.width, 10);
        const h = parseInt(parsed.height, 10);
        if (!isNaN(l) && !isNaN(t) && !isNaN(w) && !isNaN(h)) {
          currentWidgetState.widgetGeom.left = l;
          currentWidgetState.widgetGeom.top = t;
          currentWidgetState.widgetGeom.width = w;
          currentWidgetState.widgetGeom.height = h;
        }
      }
    }
  } catch (_) {}
}
function isWidgetActive() {
  return pillEl !== null || widgetEl !== null;
}
function getZoom() {
  return currentWidgetState.zoom ?? 100;
}
function applyZoomToIframe(iframe, zoom) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.body) {
      doc.body.style.zoom = `${zoom}%`;
    }
  } catch (err) {
    console.error("Failed to apply zoom to iframe:", err);
  }
}
var zoomCallbacks = [];
function registerOnZoomChanged(cb) {
  zoomCallbacks.push(cb);
}
function unregisterOnZoomChanged(cb) {
  zoomCallbacks = zoomCallbacks.filter((c) => c !== cb);
}
function setZoom(newZoom) {
  const clampedZoom = Math.max(50, Math.min(250, newZoom));
  currentWidgetState.zoom = clampedZoom;
  saveState();
  if (widgetIframe) {
    applyZoomToIframe(widgetIframe, clampedZoom);
  }
  zoomCallbacks.forEach((cb) => {
    try {
      cb(clampedZoom);
    } catch (_) {}
  });
}
function getOpacity() {
  return currentWidgetState.opacity ?? 100;
}
function applyOpacityToIframe(iframe, opacity) {
  if (!iframe)
    return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.documentElement) {
      doc.documentElement.style.setProperty("--cnv-opacity", (opacity / 100).toString());
    }
  } catch (e) {}
}
function applyOpacityToWidget(el, opacity) {
  if (el) {
    el.style.setProperty("--cnv-bg-opacity", (opacity / 100).toString());
    if (widgetIframe) {
      applyOpacityToIframe(widgetIframe, opacity);
    }
  }
}
var opacityCallbacks = [];
function registerOnOpacityChanged(cb) {
  opacityCallbacks.push(cb);
}
function unregisterOnOpacityChanged(cb) {
  opacityCallbacks = opacityCallbacks.filter((c) => c !== cb);
}
function setOpacity(newOpacity) {
  const clampedOpacity = Math.max(20, Math.min(100, newOpacity));
  currentWidgetState.opacity = clampedOpacity;
  saveState();
  if (widgetEl) {
    applyOpacityToWidget(widgetEl, clampedOpacity);
  }
  opacityCallbacks.forEach((cb) => {
    try {
      cb(clampedOpacity);
    } catch (_) {}
  });
}
function createSettingsMenu(parent, button) {
  const menu = document.createElement("div");
  menu.className = "cnv-settings-menu";
  const title = document.createElement("div");
  title.className = "cnv-settings-title";
  title.innerText = "Settings";
  menu.appendChild(title);
  const zoomRow = document.createElement("div");
  zoomRow.className = "cnv-settings-row";
  const zoomHeader = document.createElement("div");
  zoomHeader.className = "cnv-settings-row-header";
  const zoomLabel = document.createElement("span");
  zoomLabel.innerText = "Zoom";
  const zoomValue = document.createElement("span");
  zoomValue.innerText = `${getZoom()}%`;
  zoomHeader.appendChild(zoomLabel);
  zoomHeader.appendChild(zoomValue);
  zoomRow.appendChild(zoomHeader);
  const zoomSlider = document.createElement("input");
  zoomSlider.type = "range";
  zoomSlider.className = "cnv-settings-slider";
  zoomSlider.min = "50";
  zoomSlider.max = "250";
  zoomSlider.step = "10";
  zoomSlider.value = getZoom().toString();
  zoomSlider.addEventListener("input", () => {
    const val = parseInt(zoomSlider.value, 10);
    setZoom(val);
    zoomValue.innerText = `${val}%`;
  });
  zoomRow.appendChild(zoomSlider);
  menu.appendChild(zoomRow);
  const opacityRow = document.createElement("div");
  opacityRow.className = "cnv-settings-row";
  const opacityHeader = document.createElement("div");
  opacityHeader.className = "cnv-settings-row-header";
  const opacityLabel = document.createElement("span");
  opacityLabel.innerText = "Opacity";
  const opacityValue = document.createElement("span");
  opacityValue.innerText = `${getOpacity()}%`;
  opacityHeader.appendChild(opacityLabel);
  opacityHeader.appendChild(opacityValue);
  opacityRow.appendChild(opacityHeader);
  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.className = "cnv-settings-slider";
  opacitySlider.min = "20";
  opacitySlider.max = "100";
  opacitySlider.step = "5";
  opacitySlider.value = getOpacity().toString();
  opacitySlider.addEventListener("input", () => {
    const val = parseInt(opacitySlider.value, 10);
    setOpacity(val);
    opacityValue.innerText = `${val}%`;
  });
  opacityRow.appendChild(opacitySlider);
  menu.appendChild(opacityRow);
  const onZoom = (z) => {
    zoomSlider.value = z.toString();
    zoomValue.innerText = `${z}%`;
  };
  const onOpacity = (o) => {
    opacitySlider.value = o.toString();
    opacityValue.innerText = `${o}%`;
  };
  registerOnZoomChanged(onZoom);
  registerOnOpacityChanged(onOpacity);
  menu._cleanup = () => {
    unregisterOnZoomChanged(onZoom);
    unregisterOnOpacityChanged(onOpacity);
  };
  return menu;
}
function updateWidgetContent(docHtml) {
  currentDocHtml = docHtml;
  if (widgetIframe) {
    widgetIframe.srcdoc = docHtml;
  }
}
function updateLockBtnIcon() {
  if (!lockBtn)
    return;
  if (isWidgetLocked) {
    lockBtn.setAttribute("data-tooltip", "Unlock position");
    lockBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `;
    lockBtn.style.color = "var(--lumiverse-primary, #4a9eff)";
  } else {
    lockBtn.setAttribute("data-tooltip", "Lock position");
    lockBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
    `;
    lockBtn.style.color = "";
  }
}
function updateFsBtnIcon() {
  if (!fsBtn)
    return;
  if (isWidgetFullscreen) {
    fsBtn.setAttribute("data-tooltip", "Exit Fullscreen (Esc)");
    fsBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14h6v6"/>
        <path d="M20 10h-6V4"/>
        <path d="M14 10l7-7"/>
        <path d="M10 14l-7 7"/>
      </svg>
    `;
  } else {
    fsBtn.setAttribute("data-tooltip", "Fullscreen");
    fsBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </svg>
    `;
  }
}
function toggleWidgetFullscreen() {
  if (!widgetEl)
    return;
  isWidgetFullscreen = !isWidgetFullscreen;
  updateFsBtnIcon();
  if (isWidgetFullscreen) {
    widgetEl.classList.add("fullscreen");
  } else {
    widgetEl.classList.remove("fullscreen");
    const savedW = currentWidgetState.widgetGeom.width;
    const savedH = currentWidgetState.widgetGeom.height;
    widgetEl.style.width = `${savedW}px`;
    widgetEl.style.height = `${savedH}px`;
  }
}
function saveWidgetGeom() {
  if (!widgetEl || isWidgetFullscreen)
    return;
  const parsedLeft = parseInt(widgetEl.style.left, 10);
  const parsedTop = parseInt(widgetEl.style.top, 10);
  const parsedWidth = parseInt(widgetEl.style.width, 10);
  const parsedHeight = parseInt(widgetEl.style.height, 10);
  currentWidgetState.widgetGeom = {
    left: !isNaN(parsedLeft) ? parsedLeft : currentWidgetState.widgetGeom.left,
    top: !isNaN(parsedTop) ? parsedTop : currentWidgetState.widgetGeom.top,
    width: !isNaN(parsedWidth) ? parsedWidth : currentWidgetState.widgetGeom.width,
    height: !isNaN(parsedHeight) ? parsedHeight : currentWidgetState.widgetGeom.height
  };
  saveState();
}
function adjustPillContent(width) {
  if (!pillEl)
    return;
  const textEl = pillEl.querySelector(".cnv-pill-text");
  if (!textEl)
    return;
  if (width >= 130) {
    textEl.textContent = "Creator's Notes";
    textEl.style.display = "";
  } else if (width >= 80) {
    textEl.textContent = "Notes";
    textEl.style.display = "";
  } else {
    textEl.textContent = "";
    textEl.style.display = "none";
  }
}
function handleGlobalKeyDown(e) {
  const key = e.key.toLowerCase();
  if (key === "escape" || key === "x") {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)) {
      return;
    }
    if (e.key === "Escape" && isWidgetFullscreen) {
      toggleWidgetFullscreen();
    } else {
      const popOutBtn = document.querySelector(".cnv-toolbar-btn[data-tooltip*='Pop out'], .cnv-toolbar-btn[data-tooltip*='Close Pop-out']");
      if (isPillEnabled && widgetEl && widgetEl.style.display !== "none") {
        toggleWidgetState();
      } else {
        closeWidget(popOutBtn);
      }
    }
  }
}
function updatePillBtnIcon() {
  if (!pillBtn)
    return;
  if (isPillEnabled) {
    pillBtn.setAttribute("data-tooltip", "Pill Mode: ON (Minimize to Pill)");
    pillBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" />
        <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" />
      </svg>
    `;
    pillBtn.style.color = "var(--lumiverse-primary, #4a9eff)";
  } else {
    pillBtn.setAttribute("data-tooltip", "Pill Mode: OFF (Close on Minimize)");
    pillBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" style="opacity: 0.5;"/>
        <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" style="opacity: 0.5;"/>
        <line x1="4" y1="4" x2="20" y2="20" stroke="var(--lumiverse-error, #ff4a4a)" stroke-width="2" />
      </svg>
    `;
    pillBtn.style.color = "";
  }
}
function updateCloseBtnTooltip() {
  if (!closeBtn)
    return;
  if (isPillEnabled) {
    closeBtn.setAttribute("data-tooltip", "Minimize to Pill (Esc, X)");
  } else {
    closeBtn.setAttribute("data-tooltip", "Close Widget (Esc, X)");
  }
}
function updatePillPresence() {
  if (isPillEnabled) {
    if (!pillEl && widgetEl) {
      createPillElement();
      if (!currentWidgetState.widgetMinimized) {
        pillEl.classList.add("transparent");
      } else {
        pillEl.classList.remove("transparent");
      }
    }
  } else {
    if (pillEl) {
      pillEl.remove();
      pillEl = null;
    }
  }
}
function createPillElement() {
  if (pillEl)
    return;
  pillEl = document.createElement("div");
  pillEl.className = "cnv-pill-launcher";
  let pLeft = currentWidgetState.pillGeom.left;
  let pTop = currentWidgetState.pillGeom.top;
  let pWidth = currentWidgetState.pillGeom.width;
  let pHeight = currentWidgetState.pillGeom.height;
  if (pLeft < -20 || pLeft > window.innerWidth - 20 || pTop < -20 || pTop > window.innerHeight - 20) {
    pLeft = 20;
    pTop = 80;
  }
  pillEl.style.left = `${pLeft}px`;
  pillEl.style.top = `${pTop}px`;
  pillEl.style.width = `${pWidth}px`;
  pillEl.style.height = `${pHeight}px`;
  const pillIcon = document.createElement("div");
  pillIcon.className = "cnv-pill-icon";
  pillIcon.innerHTML = `
    <span class="cnv-pill-text">Creator's Notes</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  `;
  pillEl.appendChild(pillIcon);
  adjustPillContent(pWidth);
  let isPillDragging = false;
  let pillDragStartX = 0, pillDragStartY = 0;
  let pillDragStartLeft = 0, pillDragStartTop = 0;
  let isPillClickCandidate = false;
  pillEl.addEventListener("mousedown", (e) => {
    isPillDragging = true;
    isPillClickCandidate = true;
    pillDragStartX = e.clientX;
    pillDragStartY = e.clientY;
    const rect = pillEl.getBoundingClientRect();
    pillDragStartLeft = rect.left;
    pillDragStartTop = rect.top;
    e.preventDefault();
  });
  const signal = widgetAbort?.signal;
  const onPillMouseMove = (e) => {
    if (!isPillDragging || !pillEl)
      return;
    const dx = e.clientX - pillDragStartX;
    const dy = e.clientY - pillDragStartY;
    if (isPillClickCandidate && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isPillClickCandidate = false;
    }
    pillEl.style.left = `${pillDragStartLeft + dx}px`;
    pillEl.style.top = `${pillDragStartTop + dy}px`;
  };
  const onPillMouseUp = () => {
    if (!isPillDragging)
      return;
    isPillDragging = false;
    let finalLeft = parseInt(pillEl.style.left, 10);
    let finalTop = parseInt(pillEl.style.top, 10);
    const currentW = parseInt(pillEl.style.width, 10) || PILL_WIDTH;
    const currentH = parseInt(pillEl.style.height, 10) || PILL_HEIGHT;
    if (finalLeft < SNAP_THRESHOLD)
      finalLeft = 0;
    else if (finalLeft + currentW > window.innerWidth - SNAP_THRESHOLD)
      finalLeft = window.innerWidth - currentW;
    if (finalTop < SNAP_THRESHOLD)
      finalTop = 0;
    else if (finalTop + currentH > window.innerHeight - SNAP_THRESHOLD)
      finalTop = window.innerHeight - currentH;
    finalLeft = Math.max(0, Math.min(window.innerWidth - currentW, finalLeft));
    finalTop = Math.max(0, Math.min(window.innerHeight - currentH, finalTop));
    pillEl.style.left = `${finalLeft}px`;
    pillEl.style.top = `${finalTop}px`;
    if (isPillClickCandidate) {
      toggleWidgetState();
    } else {
      currentWidgetState.pillGeom = {
        left: finalLeft,
        top: finalTop,
        width: currentW,
        height: currentH
      };
      saveState();
    }
  };
  if (signal) {
    window.addEventListener("mousemove", onPillMouseMove, { signal });
    window.addEventListener("mouseup", onPillMouseUp, { signal });
  }
  const MIN_PILL_WIDTH = 36;
  const MIN_PILL_HEIGHT = 24;
  const handleTypes = ["t", "b", "l", "r", "tl", "tr", "bl", "br"];
  handleTypes.forEach((type) => {
    const handle = document.createElement("div");
    handle.className = `cnv-resize-handle cnv-resize-${type}`;
    let isResizing = false;
    let rStartX = 0, rStartY = 0;
    let rStartWidth = 0, rStartHeight = 0;
    let rStartLeft = 0, rStartTop = 0;
    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      rStartX = e.clientX;
      rStartY = e.clientY;
      const rect = pillEl.getBoundingClientRect();
      rStartWidth = rect.width;
      rStartHeight = rect.height;
      rStartLeft = rect.left;
      rStartTop = rect.top;
      e.preventDefault();
      e.stopPropagation();
    });
    const onResizeMove = (e) => {
      if (!isResizing || !pillEl)
        return;
      const dx = e.clientX - rStartX;
      const dy = e.clientY - rStartY;
      let newWidth = rStartWidth;
      let newHeight = rStartHeight;
      let newLeft = rStartLeft;
      let newTop = rStartTop;
      if (type.includes("r")) {
        newWidth = Math.max(MIN_PILL_WIDTH, rStartWidth + dx);
      }
      if (type.includes("l")) {
        newWidth = rStartWidth - dx;
        if (newWidth < MIN_PILL_WIDTH) {
          newWidth = MIN_PILL_WIDTH;
          newLeft = rStartLeft + (rStartWidth - MIN_PILL_WIDTH);
        } else {
          newLeft = rStartLeft + dx;
        }
      }
      if (type.includes("b")) {
        newHeight = Math.max(MIN_PILL_HEIGHT, rStartHeight + dy);
      }
      if (type.includes("t")) {
        newHeight = rStartHeight - dy;
        if (newHeight < MIN_PILL_HEIGHT) {
          newHeight = MIN_PILL_HEIGHT;
          newTop = rStartTop + (rStartHeight - MIN_PILL_HEIGHT);
        } else {
          newTop = rStartTop + dy;
        }
      }
      pillEl.style.width = `${newWidth}px`;
      pillEl.style.height = `${newHeight}px`;
      pillEl.style.left = `${newLeft}px`;
      pillEl.style.top = `${newTop}px`;
      adjustPillContent(newWidth);
    };
    const onResizeUp = () => {
      if (isResizing) {
        isResizing = false;
        const parsedLeft = parseInt(pillEl.style.left, 10);
        const parsedTop = parseInt(pillEl.style.top, 10);
        const parsedWidth = parseInt(pillEl.style.width, 10);
        const parsedHeight = parseInt(pillEl.style.height, 10);
        currentWidgetState.pillGeom = {
          left: !isNaN(parsedLeft) ? parsedLeft : currentWidgetState.pillGeom.left,
          top: !isNaN(parsedTop) ? parsedTop : currentWidgetState.pillGeom.top,
          width: !isNaN(parsedWidth) ? parsedWidth : currentWidgetState.pillGeom.width,
          height: !isNaN(parsedHeight) ? parsedHeight : currentWidgetState.pillGeom.height
        };
        saveState();
      }
    };
    if (signal) {
      window.addEventListener("mousemove", onResizeMove, { signal });
      window.addEventListener("mouseup", onResizeUp, { signal });
    }
    pillEl.appendChild(handle);
  });
  document.body.appendChild(pillEl);
}
function toggleWidgetState() {
  if (!widgetEl || !pillEl)
    return;
  const isCurrentlyExpanded = widgetEl.style.display !== "none";
  if (isCurrentlyExpanded) {
    widgetEl.style.display = "none";
    pillEl.classList.remove("transparent");
    currentWidgetState.widgetMinimized = true;
  } else {
    widgetEl.style.display = "";
    pillEl.classList.add("transparent");
    currentWidgetState.widgetMinimized = false;
  }
  saveState();
}
function closeWidget(popOutBtn) {
  if (pillEl) {
    pillEl.remove();
    pillEl = null;
  }
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
    widgetIframe = null;
    fsBtn = null;
    lockBtn = null;
    pillBtn = null;
    closeBtn = null;
  }
  if (popOutBtn) {
    popOutBtn.setAttribute("data-tooltip", "Pop out Notes (⤢)");
  }
  widgetAbort?.abort();
  widgetAbort = null;
  if (currentWidgetState.widgetOpen) {
    currentWidgetState.widgetOpen = false;
    saveState();
  }
}
function openWidget(popOutBtn, initialDocHtml) {
  if (pillEl || widgetEl)
    return;
  popOutBtn.setAttribute("data-tooltip", "Close Pop-out Widget");
  currentDocHtml = initialDocHtml;
  widgetAbort = new AbortController;
  const { signal: widgetSignal } = widgetAbort;
  currentWidgetState.widgetOpen = true;
  saveState();
  if (isPillEnabled) {
    createPillElement();
  }
  widgetEl = document.createElement("div");
  widgetEl.className = "cnv-widget";
  let wLeft = currentWidgetState.widgetGeom.left;
  let wTop = currentWidgetState.widgetGeom.top;
  let wWidth = currentWidgetState.widgetGeom.width;
  let wHeight = currentWidgetState.widgetGeom.height;
  if (wLeft + wWidth < 50 || wLeft > window.innerWidth - 50 || wTop + wHeight < 50 || wTop > window.innerHeight - 50) {
    wWidth = DEFAULT_WIDGET_WIDTH;
    wHeight = DEFAULT_WIDGET_HEIGHT;
    wLeft = Math.max(20, (window.innerWidth - wWidth) / 2);
    wTop = Math.max(20, (window.innerHeight - wHeight) / 2);
  }
  widgetEl.style.left = `${wLeft}px`;
  widgetEl.style.top = `${wTop}px`;
  widgetEl.style.width = `${wWidth}px`;
  widgetEl.style.height = `${wHeight}px`;
  applyOpacityToWidget(widgetEl, getOpacity());
  const toolbar = document.createElement("div");
  toolbar.className = "cnv-widget-toolbar cnv-widget-edge cnv-edge-top";
  const leftEdge = document.createElement("div");
  leftEdge.className = "cnv-widget-edge cnv-edge-left";
  widgetEl.appendChild(leftEdge);
  const rightEdge = document.createElement("div");
  rightEdge.className = "cnv-widget-edge cnv-edge-right";
  widgetEl.appendChild(rightEdge);
  const bottomEdge = document.createElement("div");
  bottomEdge.className = "cnv-widget-edge cnv-edge-bottom";
  widgetEl.appendChild(bottomEdge);
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragStartLeft = 0, dragStartTop = 0;
  let isClickCandidate = false;
  widgetEl.addEventListener("mousedown", (e) => {
    const target = e.target;
    if (!target.closest(".cnv-widget-edge") || target.closest(".cnv-toolbar-btn"))
      return;
    if (isWidgetFullscreen)
      return;
    isDragging = true;
    isClickCandidate = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = widgetEl.getBoundingClientRect();
    dragStartLeft = rect.left;
    dragStartTop = rect.top;
    if (widgetIframe) {
      widgetIframe.style.pointerEvents = "none";
    }
    e.preventDefault();
  });
  const onMouseMove = (e) => {
    if (!isDragging || !widgetEl)
      return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (isClickCandidate && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isClickCandidate = false;
    }
    if (isWidgetLocked)
      return;
    widgetEl.style.left = `${dragStartLeft + dx}px`;
    widgetEl.style.top = `${dragStartTop + dy}px`;
  };
  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      if (widgetIframe) {
        widgetIframe.style.pointerEvents = "auto";
      }
      let finalLeft = parseInt(widgetEl.style.left, 10);
      let finalTop = parseInt(widgetEl.style.top, 10);
      const currentW = parseInt(widgetEl.style.width, 10) || DEFAULT_WIDGET_WIDTH;
      const currentH = parseInt(widgetEl.style.height, 10) || DEFAULT_WIDGET_HEIGHT;
      if (finalLeft < SNAP_THRESHOLD)
        finalLeft = 0;
      else if (finalLeft + currentW > window.innerWidth - SNAP_THRESHOLD)
        finalLeft = window.innerWidth - currentW;
      if (finalTop < SNAP_THRESHOLD)
        finalTop = 0;
      else if (finalTop + currentH > window.innerHeight - SNAP_THRESHOLD)
        finalTop = window.innerHeight - currentH;
      finalLeft = Math.max(0, Math.min(window.innerWidth - currentW, finalLeft));
      finalTop = Math.max(0, Math.min(window.innerHeight - currentH, finalTop));
      widgetEl.style.left = `${finalLeft}px`;
      widgetEl.style.top = `${finalTop}px`;
      if (isClickCandidate) {
        if (isPillEnabled) {
          toggleWidgetState();
        }
      } else {
        saveWidgetGeom();
      }
    }
  };
  window.addEventListener("mousemove", onMouseMove, { signal: widgetSignal });
  window.addEventListener("mouseup", onMouseUp, { signal: widgetSignal });
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "cnv-toolbar-btn cnv-tooltip cnv-tooltip-left";
  settingsBtn.setAttribute("data-tooltip", "Settings");
  settingsBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `;
  settingsBtn.style.marginLeft = "0";
  settingsBtn.style.marginRight = "auto";
  toolbar.appendChild(settingsBtn);
  let settingsMenuEl = null;
  const toggleSettingsMenu = (e) => {
    e.stopPropagation();
    if (settingsMenuEl) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    } else {
      settingsMenuEl = createSettingsMenu(widgetEl, settingsBtn);
      widgetEl.appendChild(settingsMenuEl);
    }
  };
  settingsBtn.addEventListener("click", toggleSettingsMenu);
  const onOutsideClick = (e) => {
    if (settingsMenuEl && !settingsMenuEl.contains(e.target) && !settingsBtn.contains(e.target)) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    }
  };
  document.addEventListener("mousedown", onOutsideClick);
  widgetSignal.addEventListener("abort", () => {
    document.removeEventListener("mousedown", onOutsideClick);
    if (settingsMenuEl) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl = null;
    }
  });
  lockBtn = document.createElement("button");
  lockBtn.className = "cnv-toolbar-btn cnv-tooltip";
  isWidgetLocked = currentWidgetState.widgetLocked;
  updateLockBtnIcon();
  lockBtn.addEventListener("click", () => {
    isWidgetLocked = !isWidgetLocked;
    currentWidgetState.widgetLocked = isWidgetLocked;
    saveState();
    updateLockBtnIcon();
  });
  toolbar.appendChild(lockBtn);
  pillBtn = document.createElement("button");
  pillBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updatePillBtnIcon();
  pillBtn.addEventListener("click", () => {
    isPillEnabled = !isPillEnabled;
    currentWidgetState.pillEnabled = isPillEnabled;
    saveState();
    updatePillBtnIcon();
    updatePillPresence();
    updateCloseBtnTooltip();
  });
  toolbar.appendChild(pillBtn);
  fsBtn = document.createElement("button");
  fsBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updateFsBtnIcon();
  fsBtn.addEventListener("click", () => {
    toggleWidgetFullscreen();
  });
  toolbar.appendChild(fsBtn);
  closeBtn = document.createElement("button");
  closeBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updateCloseBtnTooltip();
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
  closeBtn.addEventListener("click", () => {
    if (isPillEnabled) {
      toggleWidgetState();
    } else {
      closeWidget(popOutBtn);
    }
  });
  toolbar.appendChild(closeBtn);
  widgetEl.appendChild(toolbar);
  const content = document.createElement("div");
  content.className = "cnv-widget-content";
  widgetIframe = document.createElement("iframe");
  widgetIframe.setAttribute("sandbox", "allow-same-origin allow-popups allow-popups-to-escape-sandbox");
  widgetIframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;display:block;";
  widgetIframe.addEventListener("load", () => {
    if (widgetIframe) {
      applyZoomToIframe(widgetIframe, getZoom());
      applyOpacityToIframe(widgetIframe, getOpacity());
    }
  });
  if (currentDocHtml) {
    widgetIframe.srcdoc = currentDocHtml;
  }
  content.appendChild(widgetIframe);
  widgetEl.appendChild(content);
  const widgetHandleTypes = ["t", "b", "l", "r", "tl", "tr", "bl", "br"];
  widgetHandleTypes.forEach((type) => {
    const handle = document.createElement("div");
    handle.className = `cnv-resize-handle cnv-resize-${type}`;
    let isResizing = false;
    let rStartX = 0, rStartY = 0;
    let rStartWidth = 0, rStartHeight = 0;
    let rStartLeft = 0, rStartTop = 0;
    handle.addEventListener("mousedown", (e) => {
      if (isWidgetFullscreen || isWidgetLocked)
        return;
      isResizing = true;
      rStartX = e.clientX;
      rStartY = e.clientY;
      const rect = widgetEl.getBoundingClientRect();
      rStartWidth = rect.width;
      rStartHeight = rect.height;
      rStartLeft = rect.left;
      rStartTop = rect.top;
      if (widgetIframe) {
        widgetIframe.style.pointerEvents = "none";
      }
      e.preventDefault();
      e.stopPropagation();
    });
    const onResizeMove = (e) => {
      if (!isResizing || !widgetEl)
        return;
      const dx = e.clientX - rStartX;
      const dy = e.clientY - rStartY;
      let newWidth = rStartWidth;
      let newHeight = rStartHeight;
      let newLeft = rStartLeft;
      let newTop = rStartTop;
      if (type.includes("r")) {
        newWidth = Math.max(MIN_WIDGET_WIDTH, rStartWidth + dx);
      }
      if (type.includes("l")) {
        newWidth = rStartWidth - dx;
        if (newWidth < MIN_WIDGET_WIDTH) {
          newWidth = MIN_WIDGET_WIDTH;
          newLeft = rStartLeft + (rStartWidth - MIN_WIDGET_WIDTH);
        } else {
          newLeft = rStartLeft + dx;
        }
      }
      if (type.includes("b")) {
        newHeight = Math.max(MIN_WIDGET_HEIGHT, rStartHeight + dy);
      }
      if (type.includes("t")) {
        newHeight = rStartHeight - dy;
        if (newHeight < MIN_WIDGET_HEIGHT) {
          newHeight = MIN_WIDGET_HEIGHT;
          newTop = rStartTop + (rStartHeight - MIN_WIDGET_HEIGHT);
        } else {
          newTop = rStartTop + dy;
        }
      }
      widgetEl.style.width = `${newWidth}px`;
      widgetEl.style.height = `${newHeight}px`;
      widgetEl.style.left = `${newLeft}px`;
      widgetEl.style.top = `${newTop}px`;
    };
    const onResizeUp = () => {
      if (isResizing) {
        isResizing = false;
        if (widgetIframe) {
          widgetIframe.style.pointerEvents = "auto";
        }
        saveWidgetGeom();
      }
    };
    window.addEventListener("mousemove", onResizeMove, { signal: widgetSignal });
    window.addEventListener("mouseup", onResizeUp, { signal: widgetSignal });
    widgetEl.appendChild(handle);
  });
  const launcher = pillEl;
  if (!currentWidgetState.widgetMinimized || !isPillEnabled) {
    widgetEl.style.display = "";
    if (launcher)
      launcher.classList.add("transparent");
  } else {
    widgetEl.style.display = "none";
    if (launcher)
      launcher.classList.remove("transparent");
  }
  document.body.appendChild(widgetEl);
  window.addEventListener("keydown", handleGlobalKeyDown, { signal: widgetSignal });
}

// src/frontend.ts
function setup(ctx) {
  setSpindleContext(ctx);
  initializeLocalState();
  const tab = ctx.ui.registerDrawerTab({
    id: "creator_notes_viewer",
    title: "Creator's Notes",
    shortName: "Notes",
    description: "Live rich HTML/CSS preview of the active character's Creator Notes.",
    keywords: ["creator notes", "html", "css", "preview", "render"],
    headerTitle: "Creator's Notes",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`
  });
  const removeStyle = ctx.dom.addStyle(STYLES);
  const root = tab.root;
  root.style.cssText = "height:100%;width:100%;overflow:hidden;position:relative;";
  const iframeContainer = document.createElement("div");
  iframeContainer.style.cssText = "width:100%;height:100%;border:none;background:transparent;";
  root.appendChild(iframeContainer);
  const mainToolbar = document.createElement("div");
  mainToolbar.className = "cnv-toolbar";
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "cnv-toolbar-btn cnv-tooltip cnv-tooltip-left";
  settingsBtn.setAttribute("data-tooltip", "Settings");
  settingsBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `;
  settingsBtn.style.marginLeft = "0";
  settingsBtn.style.marginRight = "auto";
  mainToolbar.appendChild(settingsBtn);
  const popOutBtn = document.createElement("button");
  popOutBtn.className = "cnv-toolbar-btn cnv-tooltip";
  popOutBtn.setAttribute("data-tooltip", "Pop out Notes (⤢)");
  popOutBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  `;
  popOutBtn.addEventListener("click", () => {
    if (isWidgetActive()) {
      closeWidget(popOutBtn);
    } else {
      openWidget(popOutBtn, currentDocHtml2);
    }
  });
  mainToolbar.appendChild(popOutBtn);
  root.appendChild(mainToolbar);
  let settingsMenuEl = null;
  const toggleSettingsMenu = (e) => {
    e.stopPropagation();
    if (settingsMenuEl) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    } else {
      settingsMenuEl = createSettingsMenu(root, settingsBtn);
      settingsMenuEl.style.top = "38px";
      settingsMenuEl.style.right = "10px";
      root.appendChild(settingsMenuEl);
    }
  };
  settingsBtn.addEventListener("click", toggleSettingsMenu);
  const onOutsideClick = (e) => {
    if (settingsMenuEl && !settingsMenuEl.contains(e.target) && !settingsBtn.contains(e.target)) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    }
  };
  document.addEventListener("mousedown", onOutsideClick);
  registerOnZoomChanged((zoom) => {
    if (mainIframe) {
      applyZoomToIframe(mainIframe, zoom);
    }
  });
  registerOnOpacityChanged((opacity) => {
    if (mainIframe) {
      applyOpacityToIframe(mainIframe, opacity);
    }
  });
  let mainIframe = null;
  let currentDocHtml2 = "";
  let lastCreatorNotes = "";
  let lastCharName = "";
  function showError(msg) {
    mainIframe = null;
    lastCreatorNotes = "";
    lastCharName = "";
    iframeContainer.innerHTML = `<p style="color:#f87171;padding:12px;font-family:sans-serif;">${msg}</p>`;
  }
  function showPlaceholder(msg) {
    mainIframe = null;
    lastCreatorNotes = "";
    lastCharName = "";
    iframeContainer.innerHTML = `<p style="opacity:0.5;padding:12px;font-family:sans-serif;">${msg}</p>`;
  }
  async function loadCreatorNotes() {
    const activeChat = ctx.getActiveChat();
    const characterId = activeChat.characterId;
    if (!characterId) {
      showPlaceholder("Open a chat to see the character's Creator Notes here.");
      return;
    }
    try {
      const card = await ctx.characters.get(characterId);
      const creatorNotes = card?.creator_notes ?? card?.data?.creator_notes ?? "";
      const charName = card?.name ?? "";
      if (!creatorNotes) {
        showPlaceholder(`No Creator Notes for ${charName || "this character"}.`);
      } else if (creatorNotes === lastCreatorNotes && charName === lastCharName) {
        return;
      } else {
        lastCreatorNotes = creatorNotes;
        lastCharName = charName;
        const doc = renderContent(creatorNotes, charName);
        if (!mainIframe || mainIframe.parentElement !== iframeContainer) {
          iframeContainer.innerHTML = "";
          mainIframe = document.createElement("iframe");
          mainIframe.setAttribute("sandbox", "allow-same-origin allow-popups allow-popups-to-escape-sandbox");
          mainIframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;display:block;";
          mainIframe.addEventListener("load", () => {
            if (mainIframe) {
              applyZoomToIframe(mainIframe, getZoom());
              applyOpacityToIframe(mainIframe, getOpacity());
            }
          });
          iframeContainer.appendChild(mainIframe);
        }
        mainIframe.srcdoc = doc;
        currentDocHtml2 = doc;
        updateWidgetContent(doc);
      }
    } catch (err) {
      showError(`Failed to read Creator Notes: ${err}`);
    }
  }
  loadCreatorNotes();
  const unsubActivate = tab.onActivate(() => loadCreatorNotes());
  const unsubChatSwitched = ctx.events.on("CHAT_SWITCHED", () => loadCreatorNotes());
  const unsubCharEdited = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());
  const unsubMsg = ctx.onBackendMessage((payload) => {
    if (payload && payload.type === "STATE_DATA") {
      restoreWidgetState(payload.state, popOutBtn, currentDocHtml2);
    }
  });
  ctx.sendToBackend({ type: "LOAD_STATE" });
  return () => {
    try {
      unsubActivate();
    } catch (_) {}
    try {
      unsubChatSwitched();
    } catch (_) {}
    try {
      unsubCharEdited();
    } catch (_) {}
    try {
      unsubMsg();
    } catch (_) {}
    try {
      tab.destroy();
    } catch (_) {}
    try {
      removeStyle();
    } catch (_) {}
    try {
      closeWidget(popOutBtn);
    } catch (_) {}
    document.removeEventListener("mousedown", onOutsideClick);
    if (settingsMenuEl) {
      if (typeof settingsMenuEl._cleanup === "function") {
        settingsMenuEl._cleanup();
      }
      settingsMenuEl = null;
    }
  };
}
export {
  setup
};
