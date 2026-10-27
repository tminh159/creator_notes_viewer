import { sanitize } from "./sanitizer.js";

// Heuristics constants
const STYLE_TAG_LOOKAHEAD = 200;
const STYLE_TAG_MIN_LENGTH = 50;

/**
 * Processes creator notes raw HTML/markdown, substitutes placeholders,
 * runs the markdown pipeline if applicable, sanitizes HTML, and returns
 * a complete sandboxed document string.
 */
export function renderContent(rawHtml: string, charName: string): string {
  // 1. Macro substitution ({{char}}, {{user}})
  let processed = rawHtml
    .replace(/\{\{char\}\}/gi, charName || "{{char}}")
    .replace(/\{\{user\}\}/gi, "You");

  // Normalise line endings up front (works for all modes)
  processed = processed.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Detect content type — mirrors CharacterLibrary's formatRichText heuristics.
  //    Only the ultra-CSS mode (style tag within first STYLE_TAG_LOOKAHEAD chars with ≥STYLE_TAG_MIN_LENGTH chars of CSS)
  //    bypasses markdown. Everything else — plain markdown, mixed HTML+markdown, or
  //    style-tag-at-the-end cards — runs the full markdown pipeline.
  const hasStyleTagAtStart = new RegExp(`^[\\s\\S]{0,${STYLE_TAG_LOOKAHEAD}}<style[^>]*>[\\s\\S]{${STYLE_TAG_MIN_LENGTH},}<\\/style>`, "i").test(processed);

  if (hasStyleTagAtStart) {
    // ── Ultra-CSS mode: touch almost nothing ────────────────────────────────
    // Only convert markdown images (safe — won't be inside CSS)
    processed = processed.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)/g,
      (match, alt, src) => {
        if (!src.match(/^(https?:\/\/|\/)/i)) return match;
        const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
        return `<img src="${src}"${altAttr} referrerpolicy="no-referrer" loading="lazy">`;
      }
    );

  } else {
    // ── Full markdown pipeline (plain text, mixed HTML+markdown, trailing style) ──

    // Step A-pre: Fenced code blocks FIRST — before placeholder lifting so the resulting
    // <pre>...</pre> gets captured as a block placeholder and won't be paragraph-split.
    processed = processed.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const cls = lang.trim() ? ` class="language-${lang.trim()}"` : "";
      return `<pre><code${cls}>${code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code></pre>`;
    });

    // Step A: Protect existing HTML tags and complete block elements so the markdown
    // passes don't corrupt them. We lift out full block-level HTML elements first,
    // then lift remaining inline tags.
    const blockPlaceholders: string[] = [];
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
        while (depth > 0 && ((innerMatch = innerScannerRe.exec(processed)) !== null)) {
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
    // Lift remaining inline/void tags
    const inlinePlaceholders: string[] = [];
    processed = processed.replace(/<[^>]+>/g, (m) => {
      const idx = inlinePlaceholders.length;
      inlinePlaceholders.push(m);
      return `\x00INL${idx}\x00`;
    });


    // Step C: ATX headings — wrap with \n\n so each heading is its own paragraph chunk
    processed = processed.replace(/^#{6}\s+(.+)$/gm, "\n\n<h6>$1</h6>\n\n");
    processed = processed.replace(/^#{5}\s+(.+)$/gm, "\n\n<h5>$1</h5>\n\n");
    processed = processed.replace(/^#{4}\s+(.+)$/gm, "\n\n<h4>$1</h4>\n\n");
    processed = processed.replace(/^#{3}\s+(.+)$/gm, "\n\n<h3>$1</h3>\n\n");
    processed = processed.replace(/^#{2}\s+(.+)$/gm, "\n\n<h2>$1</h2>\n\n");
    processed = processed.replace(/^#{1}\s+(.+)$/gm, "\n\n<h1>$1</h1>\n\n");

    // Setext headings — same isolation. Avoid matching block placeholders.
    processed = processed.replace(/^(?!\x00BLK\d+\x00)(.+)\n={3,}$/gm, "\n\n<h1>$1</h1>\n\n");
    processed = processed.replace(/^(?!\x00BLK\d+\x00)(.+)\n-{3,}$/gm, "\n\n<h2>$1</h2>\n\n");

    // Step D: Blockquotes — wrap with \n\n for isolation
    processed = processed.replace(/^(>\s?.*\n?)+/gm, (block) => {
      const inner = block.replace(/^>\s?/gm, "").trim();
      return `\n\n<blockquote>${inner}</blockquote>\n\n`;
    });

    // Step E: Horizontal rules — wrap with \n\n so they are always isolated chunks.
    processed = processed.replace(/^[-*_]{3,}\s*$/gm, "\n\n<hr>\n\n");

    // Step F: Lists
    const listLines = processed.split("\n");
    const listOutput: string[] = [];
    const listStack: Array<"ul" | "ol"> = [];
    for (const line of listLines) {
      const ulMatch = line.match(/^(\s*)[*+\-]\s+(.*)$/);
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (ulMatch) {
        if (!listStack.length || listStack[listStack.length-1] !== "ul") { listOutput.push("<ul>"); listStack.push("ul"); }
        listOutput.push(`<li>${ulMatch[2]}</li>`);
      } else if (olMatch) {
        if (!listStack.length || listStack[listStack.length-1] !== "ol") { listOutput.push("<ol>"); listStack.push("ol"); }
        listOutput.push(`<li>${olMatch[2]}</li>`);
      } else {
        while (listStack.length) listOutput.push(`</${listStack.pop()}>`);
        listOutput.push(line);
      }
    }
    while (listStack.length) listOutput.push(`</${listStack.pop()}>`);
    processed = listOutput.join("\n");

    // Step G: Inline formatting
    processed = processed.replace(/`([^`\n]+?)`/g, (_, c) =>
      `<code>${c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</code>`
    );
    processed = processed.replace(/\*{3}([^*\n]+?)\*{3}/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/\*{2}([^*\n]+?)\*{2}/g, "<strong>$1</strong>");
    processed = processed.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/(?<![\w])_{3}([^_\n]+?)_{3}(?![\w])/g, "<strong><em>$1</em></strong>");
    processed = processed.replace(/(?<![\w])_{2}([^_\n]+?)_{2}(?![\w])/g, "<strong>$1</strong>");
    processed = processed.replace(/(?<![\w])_([^_\n]+?)_(?![\w])/g, "<em>$1</em>");
    processed = processed.replace(/~~([^~\n]+?)~~/g, "<s>$1</s>");

    // Step H: Markdown images and links
    processed = processed.replace(
      /\[!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)\]\(([^)]+)\)/g,
      (_, alt, imgSrc, linkHref) => {
        if (!imgSrc.match(/^(https?:\/\/|\/)/i)) return _;
        const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
        const safeLink = linkHref.match(/^https?:\/\//i) ? linkHref : "#";
        return `<a href="${safeLink}" target="_blank" rel="noopener"><img src="${imgSrc}"${altAttr} referrerpolicy="no-referrer" loading="lazy"></a>`;
      }
    );
    processed = processed.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)/g,
      (match, alt, src) => {
        if (!src.match(/^(https?:\/\/|\/)/i)) return match;
        const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
        return `<img src="${src}"${altAttr} referrerpolicy="no-referrer" loading="lazy">`;
      }
    );
    processed = processed.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

    // Step I: Paragraphs and line breaks.
    const paragraphs = processed.split(/\n{2,}/);
    processed = paragraphs.map(para => {
      para = para.trim();
      if (!para) return "";
      if (/^\x00BLK\d+\x00/.test(para)) return para;
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|div|p|section|article|header|footer)[^>]*>/i.test(para)) return para;
      if (/<(h[1-6]|ul|ol|blockquote|pre|hr|table)[^>]*>/i.test(para)) return para;
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    }).join("\n");

    // Step J: Restore placeholders (inline first, then blocks)
    processed = processed.replace(/\x00INL(\d+)\x00/g, (_, i) => inlinePlaceholders[+i]);
    processed = processed.replace(/\x00BLK(\d+)\x00/g, (_, i) => blockPlaceholders[+i]);
  }

  // 3. Parser-based HTML sanitize
  const safe = sanitize(processed);

  // 4. Add referrerpolicy to remaining bare media
  const hardened = safe
    .replace(/<img(?![^>]*referrerpolicy)\s/gi, '<img referrerpolicy="no-referrer" ')
    .replace(/<video(?![^>]*referrerpolicy)\s/gi, '<video referrerpolicy="no-referrer" ')
    .replace(/<audio(?![^>]*referrerpolicy)\s/gi, '<audio referrerpolicy="no-referrer" ');

  // 5. Build styles
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
