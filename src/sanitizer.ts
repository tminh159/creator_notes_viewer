// Sanitizer ported from creator_notes_html_renderer by Ptolemaios.
// Uses a proper parse → walk → serialize pipeline instead of fragile regex substitution.

const ALLOWED_TAGS = new Set([
  "a", "abbr", "address", "article", "aside", "audio",
  "b", "bdi", "bdo", "blockquote", "br",
  "caption", "center", "cite", "code", "col", "colgroup",
  "data", "datalist", "dd", "del", "details", "dfn", "div", "dl", "dt",
  "em",
  "fieldset", "figcaption", "figure", "footer",
  "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr",
  "i", "img", "ins",
  "kbd",
  "label", "legend", "li",
  "main", "map", "mark", "meter",
  "nav",
  "ol", "optgroup", "option", "output",
  "p", "picture", "pre", "progress",
  "q",
  "rp", "rt", "ruby",
  "s", "samp", "section", "small", "source", "span", "strong",
  "style", "sub", "summary", "sup",
  "table", "tbody", "td", "tfoot", "th", "thead", "time", "tr", "track",
  "u", "ul",
  "var", "video",
  "wbr",
]);

const BLOCKED_TAGS = new Set([
  "script", "svg", "math", "noscript", "iframe", "embed", "object",
  "applet", "base", "template", "meta", "title",
  // "link" is handled specially below — only allow rel=stylesheet with safe href
]);

const ALLOWED_ATTRS = new Set([
  "href", "src", "alt", "title", "class", "id", "style",
  "width", "height", "target", "rel", "loading", "decoding",
  "colspan", "rowspan", "span", "headers", "scope",
  "type", "value", "placeholder", "disabled", "readonly",
  "name", "for", "label",
  "start", "reversed", "cite", "datetime", "wrap",
  "open", "max", "min", "low", "high", "optimum",
  "controls", "loop", "muted", "preload",
  "poster", "playsinline", "referrerpolicy", "align",
  // data-* handled separately in walkAndFilter — allow all data-* through
]);

const URL_ATTRS = new Set(["href", "src", "poster", "data", "action", "formaction"]);
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:", "data:image/"]);

const RAW_TEXT_ELEMENTS = new Set(["style"]);

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: "\u00A0", ensp: "\u2002", emsp: "\u2003",
  thinsp: "\u2009", zwnj: "\u200C", zwj: "\u200D",
  lrm: "\u200E", rlm: "\u200F",
  ndash: "\u2013", mdash: "\u2014",
  lsquo: "\u2018", rsquo: "\u2019",
  ldquo: "\u201C", rdquo: "\u201D",
  bull: "\u2022", hellip: "\u2026",
  prime: "\u2032", Prime: "\u2033",
  copy: "\u00A9", reg: "\u00AE", trade: "\u2122",
  laquo: "\u00AB", raquo: "\u00BB",
  deg: "\u00B0", plusmn: "\u00B1",
  micro: "\u00B5", para: "\u00B6",
  middot: "\u00B7", frac12: "\u00BD",
  times: "\u00D7", divide: "\u00F7",
  euro: "\u20AC", pound: "\u00A3", yen: "\u00A5", cent: "\u00A2",
  iexcl: "\u00A1", curren: "\u00A4",
  brvbar: "\u00A6", sect: "\u00A7",
  uml: "\u00A8", ordf: "\u00AA",
  not: "\u00AC", shy: "\u00AD",
  macr: "\u00AF", ordm: "\u00BA",
  sup1: "\u00B9", sup2: "\u00B2", sup3: "\u00B3",
  acute: "\u00B4", cedil: "\u00B8",
  iquest: "\u00BF",
  Agrave: "\u00C0", Aacute: "\u00C1", Acirc: "\u00C2",
  Atilde: "\u00C3", Auml: "\u00C4", Aring: "\u00C5",
  AElig: "\u00C6", Ccedil: "\u00C7",
  Egrave: "\u00C8", Eacute: "\u00C9", Ecirc: "\u00CA", Euml: "\u00CB",
  Igrave: "\u00CC", Iacute: "\u00CD", Icirc: "\u00CE", Iuml: "\u00CF",
  ETH: "\u00D0", Ntilde: "\u00D1",
  Ograve: "\u00D2", Oacute: "\u00D3", Ocirc: "\u00D4",
  Otilde: "\u00D5", Ouml: "\u00D6",
  Oslash: "\u00D8", Ugrave: "\u00D9",
  Uacute: "\u00DA", Ucirc: "\u00DB", Uuml: "\u00DC",
  Yacute: "\u00DD", THORN: "\u00DE", szlig: "\u00DF",
  agrave: "\u00E0", aacute: "\u00E1", acirc: "\u00E2",
  atilde: "\u00E3", auml: "\u00E4", aring: "\u00E5",
  aelig: "\u00E6", ccedil: "\u00E7",
  egrave: "\u00E8", eacute: "\u00E9", ecirc: "\u00EA", euml: "\u00EB",
  igrave: "\u00EC", iacute: "\u00ED", icirc: "\u00EE", iuml: "\u00EF",
  eth: "\u00F0", ntilde: "\u00F1",
  ograve: "\u00F2", oacute: "\u00F3", ocirc: "\u00F4",
  otilde: "\u00F5", ouml: "\u00F6",
  oslash: "\u00F8", ugrave: "\u00F9",
  uacute: "\u00FA", ucirc: "\u00FB", uuml: "\u00FC",
  yacute: "\u00FD", thorn: "\u00FE", yuml: "\u00FF",
  OElig: "\u0152", oelig: "\u0153",
  Scaron: "\u0160", scaron: "\u0161",
  Yuml: "\u0178", fnof: "\u0192",
  circ: "\u02C6", tilde: "\u02DC",
  Alpha: "\u0391", Beta: "\u0392", Gamma: "\u0393", Delta: "\u0394",
  Epsilon: "\u0395", Zeta: "\u0396", Eta: "\u0397", Theta: "\u0398",
  Iota: "\u0399", Kappa: "\u039A", Lambda: "\u039B", Mu: "\u039C",
  Nu: "\u039D", Xi: "\u039E", Omicron: "\u039F", Pi: "\u03A0",
  Rho: "\u03A1", Sigma: "\u03A3", Tau: "\u03A4", Upsilon: "\u03A5",
  Phi: "\u03A6", Chi: "\u03A7", Psi: "\u03A8", Omega: "\u03A9",
  alpha: "\u03B1", beta: "\u03B2", gamma: "\u03B3", delta: "\u03B4",
  epsilon: "\u03B5", zeta: "\u03B6", eta: "\u03B7", theta: "\u03B8",
  iota: "\u03B9", kappa: "\u03BA", lambda: "\u03BB", mu: "\u03BC",
  nu: "\u03BD", xi: "\u03BE", omicron: "\u03BF", pi: "\u03C0",
  rho: "\u03C1", sigmaf: "\u03C2", sigma: "\u03C3", tau: "\u03C4",
  upsilon: "\u03C5", phi: "\u03C6", chi: "\u03C7", psi: "\u03C8", omega: "\u03C9",
  thetasym: "\u03D1", upsih: "\u03D2", piv: "\u03D6",
  larr: "\u2190", uarr: "\u2191", rarr: "\u2192", darr: "\u2193",
  harr: "\u2194", crarr: "\u21B5",
  lArr: "\u21D0", uArr: "\u21D1", rArr: "\u21D2", dArr: "\u21D3", hArr: "\u21D4",
  forall: "\u2200", part: "\u2202", exist: "\u2203", empty: "\u2205",
  nabla: "\u2207", isin: "\u2208", notin: "\u2209", ni: "\u220B",
  prod: "\u220F", sum: "\u2211", minus: "\u2212", lowast: "\u2217",
  radic: "\u221A", prop: "\u221D", infin: "\u221E", ang: "\u2220",
  and: "\u2227", or: "\u2228", cap: "\u2229", cup: "\u222A",
  int: "\u222B", there4: "\u2234", sim: "\u223C", cong: "\u2245",
  asymp: "\u2248", ne: "\u2260", equiv: "\u2261", le: "\u2264",
  ge: "\u2265", sub: "\u2282", sup: "\u2283", nsub: "\u2284",
  sube: "\u2286", supe: "\u2287",
  oplus: "\u2295", otimes: "\u2297", perp: "\u22A5",
  sdot: "\u22C5",
  lceil: "\u2308", rceil: "\u2309", lfloor: "\u230A", rfloor: "\u230B",
  lang: "\u2329", rang: "\u232A",
  loz: "\u25CA", spades: "\u2660", clubs: "\u2663",
  hearts: "\u2665", diams: "\u2666",
};

export function sanitize(raw: string): string {
  const stripped = stripDangerousConstructs(raw);
  const doc = parseHTML(stripped);
  walkAndFilter(doc, ALLOWED_TAGS, BLOCKED_TAGS, ALLOWED_ATTRS, URL_ATTRS, SAFE_PROTOCOLS);
  return serialize(doc);
}

function decodeEntities(html: string): string {
  let result = html;
  result = result.replace(/&#x([0-9A-Fa-f]+);?/g, (_, hex) => {
    const cp = parseInt(hex, 16);
    return cp > 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : `\uFFFD`;
  });
  result = result.replace(/&#(\d+);?/g, (_, dec) => {
    const cp = parseInt(dec, 10);
    return cp > 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : `\uFFFD`;
  });
  result = result.replace(/&([A-Za-z0-9]+);/g, (full, name) => {
    return NAMED_ENTITIES[name] ?? full;
  });
  return result;
}

function stripDangerousConstructs(html: string): string {
  let out = html;
  out = out.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
  out = out.replace(/<!DOCTYPE[^>]*>/gi, "");
  out = out.replace(/<\?[\s\S]*?\?>/g, "");
  out = out.replace(/<title\b[\s\S]*?<\/title\s*>/gi, "");
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

interface SimpleNode {
  type: "element" | "text" | "root";
  tag?: string;
  attrs?: Record<string, string>;
  children?: SimpleNode[];
  content?: string;
}

function parseHTML(html: string): SimpleNode {
  const root: SimpleNode = { type: "root", children: [] };
  const stack: SimpleNode[] = [root];

  const tagRe = /<(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>'"\s]+\s*(?:=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let last = 0;
  let m: RegExpExecArray | null;

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
      while (i > 0 && stack[i].tag !== tagLower) i--;
      if (i > 0) stack.length = i;
    } else {
      // Auto-close implicit <li ...> or <p ...> when a sibling opens
      if (tagLower === "li") {
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tag === "ul" || stack[i].tag === "ol") break;
          if (stack[i].tag === "li") {
            stack.length = i;
            break;
          }
        }
      } else if (tagLower === "p" && stack[stack.length - 1].tag === "p") {
        stack.pop();
      }

      const el: SimpleNode = {
        type: "element",
        tag: tagLower,
        attrs: parseAttrs(attrStr),
        children: [],
      };
      const parent = stack[stack.length - 1];
      (parent.children ??= []).push(el);
      if (!selfClose && !VOID_TAGS.has(tagLower) && !RAW_TEXT_ELEMENTS.has(tagLower)) {
        stack.push(el);
      } else if (RAW_TEXT_ELEMENTS.has(tagLower)) {
        const afterOpenIdx = m.index + m[0].length;
        const closeRe = new RegExp(`<\\/\\s*${tagLower}\\s*>`, "i");
        const closeMatch = closeRe.exec(html.slice(afterOpenIdx));
        if (closeMatch) {
          const rawEnd = afterOpenIdx + closeMatch.index;
          const innerContent = html.slice(afterOpenIdx, rawEnd);
          el.children = [{ type: "text", content: innerContent }];
          tagRe.lastIndex = rawEnd + closeMatch[0].length;
          last = tagRe.lastIndex;
          continue;
        } else {
          const innerContent = html.slice(afterOpenIdx);
          el.children = [{ type: "text", content: innerContent }];
          tagRe.lastIndex = html.length;
          last = html.length;
          break;
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

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_][\w:.%-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    // Preserve data-* attribute names as-is (don't lowercase so data-Label stays data-Label)
    const rawKey = m[1];
    const key = rawKey.toLowerCase();
    if (key.startsWith("on")) continue;
    const rawVal = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[rawKey] = decodeEntities(rawVal);
  }
  return attrs;
}

function walkAndFilter(
  node: SimpleNode,
  allowedTags: Set<string>,
  blockedTags: Set<string>,
  allowedAttrs: Set<string>,
  urlAttrs: Set<string>,
  safeProtocols: Set<string>,
): void {
  if (node.type !== "element" && node.type !== "root") return;
  if (!node.children) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === "text") {
      if (node.type === "element" && node.tag === "style") {
        child.content = sanitizeCSS(child.content ?? "");
      }
      return [child];
    }
    if (child.type !== "element") return [];
    if (!child.tag || blockedTags.has(child.tag)) return [];
    // Allow <link rel="stylesheet" href="https://..."> for external fonts/CSS
    if (child.tag === "link") {
      const rel = (child.attrs?.rel ?? "").toLowerCase().trim();
      const href = resolveRelativeUrl(child.attrs?.href ?? "");
      if (rel === "stylesheet" && isSafeURL(href, new Set(["http:", "https:"]))) {
        child.attrs = { rel: "stylesheet", href };
        child.children = [];
        return [child];
      }
      return []; // block all other <link> variants
    }
    // Unwrap unknown non-blocked tags (e.g. <Space>) so valid child nodes inside/after them are preserved
    if (!allowedTags.has(child.tag)) {
      walkAndFilter(child, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols);
      return child.children ?? [];
    }

    const filteredAttrs: Record<string, string> = {};
    if (child.attrs) {
      for (const [k, v] of Object.entries(child.attrs)) {
        const kLower = k.toLowerCase();
        // Pass data-* attributes through freely — they carry CSS custom property
        // values (e.g. --r, --y) used by character card layout tricks
        if (kLower.startsWith("data-")) {
          filteredAttrs[k] = v;
          continue;
        }
        if (!allowedAttrs.has(kLower)) continue;
        if (kLower === "style") {
          filteredAttrs[kLower] = sanitizeCSS(v);
          continue;
        }
        if (urlAttrs.has(kLower)) {
          const resolvedUrl = resolveRelativeUrl(v);
          if (!isSafeURL(resolvedUrl, safeProtocols)) continue;
          filteredAttrs[kLower] = resolvedUrl;
          continue;
        }
        filteredAttrs[kLower] = v;
      }
    }

    if (child.tag === "a") {
      const href = (filteredAttrs["href"] ?? "").trim();
      if (href.startsWith("#")) {
        delete filteredAttrs["target"];
        delete filteredAttrs["rel"];
      } else if (href) {
        filteredAttrs["target"] = "_blank";
        filteredAttrs["rel"] = "noopener noreferrer";
      }
    } else if (child.tag === "img" || child.tag === "video" || child.tag === "audio") {
      filteredAttrs["referrerpolicy"] = "no-referrer";
    }

    child.attrs = filteredAttrs;

    walkAndFilter(child, allowedTags, blockedTags, allowedAttrs, urlAttrs, safeProtocols);
    return [child];
  });
}

function getHostOrigin(): string {
  try {
    if (typeof window !== "undefined" && window.location?.origin && /^https?:\/\//i.test(window.location.origin)) {
      return window.location.origin.replace(/\/+$/, "");
    }
  } catch {
    // ignore
  }
  return "";
}

function resolveRelativeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^\/(?!\/)/.test(trimmed)) {
    const origin = getHostOrigin();
    if (origin) return `${origin}${trimmed}`;
  }
  return trimmed;
}

function sanitizeCSS(css: string): string {
  // Strip CSS comments and decode CSS hex escapes so obfuscated constructs cannot bypass regexes
  let out = css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, "");
  out = out.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => {
    const cp = parseInt(hex, 16);
    return cp > 0 && cp <= 0x10FFFF ? String.fromCodePoint(cp) : "";
  });

  // Resolve root-relative url(/...) against host origin so local assets work inside about:srcdoc
  const origin = getHostOrigin();
  if (origin) {
    out = out.replace(/url\(\s*(["']?)(\/(?!\/)[^)"'\s]+)\1\s*\)/gi, `url($1${origin}$2$1)`);
  }

  // Only allow @import url("https://...") or @import url('http://...')
  out = out.replace(/@import\s+(?!url\s*\(\s*["']?https?:\/\/)/gi, "/* removed */ ");
  out = out.replace(/expression\s*\(/gi, "/* removed */(");
  out = out.replace(/behavior\s*:/gi, "/* removed */:");
  out = out.replace(/-moz-binding\s*:/gi, "/* removed */:");
  out = out.replace(/javascript\s*:/gi, "/* removed */:");
  out = out.replace(/vbscript\s*:/gi, "/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*javascript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*vbscript\s*:/gi, "url($1/* removed */:");
  out = out.replace(/url\s*\(\s*(["']?)\s*data\s*:\s*(?!image\/)/gi, "url($1/* removed */:");
  // Prevent breaking out of <style> tag
  out = out.replace(/<\/\s*style/gi, "/* removed */");
  // Neutralize text-align:justify — cards designed for wide viewports use justify, but in
  // our narrow panel the browser creates extreme word-spacing to fill short lines.
  // Replace with left (= start) alignment for readable rendering at any panel width.
  out = out.replace(/\btext-align\s*:\s*justify\b/gi, "text-align: left");
  return out;
}

function isSafeURL(url: string, safeProtocols: Set<string>): boolean {
  const decoded = decodeEntities(url).replace(/[\u0000-\u0020]+/g, "");
  const lower = decoded.toLowerCase();
  if (lower.startsWith("#") || lower.startsWith("data:image/")) return true;
  if (/^\/(?!\/)/.test(decoded)) return safeProtocols.has("http:") || safeProtocols.has("https:");
  if (decoded.startsWith("//")) return false;
  try {
    const parsed = new URL(decoded);
    return safeProtocols.has(parsed.protocol);
  } catch {
    return false;
  }
}

function serialize(node: SimpleNode, inRawText = false): string {
  if (node.type === "text") {
    const content = node.content ?? "";
    if (inRawText) return content;
    return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (node.type === "root" || !node.tag) {
    return (node.children ?? []).map(c => serialize(c, false)).join("");
  }

  const attrs = Object.entries(node.attrs ?? {})
    .map(([k, v]) => ` ${k}="${escAttr(v)}"`)
    .join("");

  if (VOID_TAGS.has(node.tag)) return `<${node.tag}${attrs}>`;

  const isRaw = RAW_TEXT_ELEMENTS.has(node.tag);
  const children = (node.children ?? []).map(c => serialize(c, isRaw)).join("");
  return `<${node.tag}${attrs}>${children}</${node.tag}>`;
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
