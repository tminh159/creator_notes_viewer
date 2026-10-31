import { sanitize } from "./sanitizer.js";

// Heuristics constants
const STYLE_TAG_LOOKAHEAD = 200;
const STYLE_TAG_MIN_LENGTH = 50;

function applyInlineMarkdown(input: string): string {
  let out = input;

  // Inline code
  out = out.replace(/`([^`\n]+?)`/g, (_, c) =>
    `<code>${c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`
  );
  // Bold / Italic / Strikethrough
  out = out.replace(/\*{3}([^*\n]+?)\*{3}/g, "<strong><em>$1</em></strong>");
  out = out.replace(/\*{2}([^*\n]+?)\*{2}/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  out = out.replace(/(?<![\w_])_{3}([^_\n]*[\p{L}\p{N}][^_\n]*?)_{3}(?![\w_])/gu, "<strong><em>$1</em></strong>");
  out = out.replace(/(?<![\w_])_{2}([^_\n]*[\p{L}\p{N}][^_\n]*?)_{2}(?![\w_])/gu, "<strong>$1</strong>");
  out = out.replace(/(?<![\w_])_([^_\n]*[\p{L}\p{N}][^_\n]*?)_(?![\w_])/gu, "<em>$1</em>");
  out = out.replace(/~~([^~\n]+?)~~/g, "<s>$1</s>");

  // Markdown linked images, images, and links (supporting balanced parens in URLs)
  out = out.replace(
    /\[!\[([^\]]*)\]\(((?:[^\s()]+|\([^\s()]*\))+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)\]\(((?:[^\s()]+|\([^\s()]*\))+)\)/g,
    (match, alt, imgSrc, linkHref) => {
      if (!/^(https?:\/\/|\/(?!\/)|data:image\/)/i.test(imgSrc)) return match;
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
      if (/^#/.test(linkHref)) {
        return `<a href="${linkHref}"><img src="${imgSrc}"${altAttr} referrerpolicy="no-referrer" loading="lazy"></a>`;
      }
      const safeLink = /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(linkHref) ? linkHref : "#";
      const targetAttr = safeLink.startsWith("#") ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${safeLink}"${targetAttr}><img src="${imgSrc}"${altAttr} referrerpolicy="no-referrer" loading="lazy"></a>`;
    }
  );
  out = out.replace(
    /!\[([^\]]*)\]\(((?:[^\s()]+|\([^\s()]*\))+)(?:\s*=[^)]*)?(?:\s+"[^"]*")?\)/g,
    (match, alt, src) => {
      if (!/^(https?:\/\/|\/(?!\/)|data:image\/)/i.test(src)) return match;
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
      return `<img src="${src}"${altAttr} referrerpolicy="no-referrer" loading="lazy">`;
    }
  );
  out = out.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|\/(?!\/)|mailto:|#)(?:[^\s()]+|\([^\s()]*\))*)\)/gi,
    (_, text, href) => {
      if (href.startsWith("#")) {
        return `<a href="${href}">${text}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
  );

  return out;
}

function processHtmlBlockInlineMarkdown(blockHtml: string): string {
  if (/^<\s*(style|pre|code)\b/i.test(blockHtml)) {
    return blockHtml;
  }
  const rawChunks: string[] = [];
  let protectedHtml = blockHtml.replace(/<(style|pre|code)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, (m) => {
    const idx = rawChunks.length;
    rawChunks.push(m);
    return `\x01RAW${idx}\x01`;
  });

  // Convert inline code spans before lifting HTML tags so `<tag>` inside backticks is not treated as HTML
  protectedHtml = protectedHtml.replace(/`([^`\n]+?)`/g, (_, c) => {
    const idx = rawChunks.length;
    rawChunks.push(`<code>${c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
    return `\x01RAW${idx}\x01`;
  });

  const tagChunks: string[] = [];
  protectedHtml = protectedHtml.replace(/<[^>]+>/g, (m) => {
    const idx = tagChunks.length;
    tagChunks.push(m);
    return `\x01TAG${idx}\x01`;
  });

  protectedHtml = applyInlineMarkdown(protectedHtml);

  if (protectedHtml.includes("\n\n")) {
    protectedHtml = protectedHtml
      .split(/\n{2,}/)
      .map((chunk) => {
        const trimmed = chunk.trim();
        if (!trimmed) return "";
        if (!/\x01TAG\d+\x01/.test(trimmed)) {
          return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
        }
        return chunk;
      })
      .join("\n\n");
  }

  protectedHtml = protectedHtml.replace(/\x01TAG(\d+)\x01/g, (_, i) => tagChunks[+i]);
  protectedHtml = protectedHtml.replace(/\x01RAW(\d+)\x01/g, (_, i) => rawChunks[+i]);
  return protectedHtml;
}

/**
 * Renders a simple placeholder or error document for use inside the sandboxed iframe.
 */
export function renderStatusContent(message: string, isError = false): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const style = isError
    ? "color:#f87171;padding:12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;"
    : "color:#e0e0e0;opacity:0.5;padding:12px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;";
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">`;
  return `<!DOCTYPE html><html style="color-scheme:dark light;background:transparent;"><head><meta charset="UTF-8">${csp}</head><body style="margin:0;background:transparent;"><p style="${style}">${escaped}</p></body></html>`;
}

/**
 * Processes creator notes raw HTML/markdown, substitutes placeholders,
 * runs the markdown pipeline if applicable, sanitizes HTML, and returns
 * a complete sandboxed document string.
 */
export function renderContent(rawHtml: string, charName: string): string {
  const rawCharName = charName || "{{char}}";
  const escapedCharName = rawCharName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const substituteMacrosRaw = (s: string) =>
    s.replace(/\{\{char\}\}/gi, () => rawCharName).replace(/\{\{user\}\}/gi, () => "You");
  const substituteMacrosHtml = (s: string) =>
    s.replace(/\{\{char\}\}/gi, () => escapedCharName).replace(/\{\{user\}\}/gi, () => "You");

  // Normalise line endings up front (works for all modes)
  let processed = rawHtml.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Detect content type — mirrors CharacterLibrary's formatRichText heuristics.
  //    Only the ultra-CSS mode (style tag within first STYLE_TAG_LOOKAHEAD chars with ≥STYLE_TAG_MIN_LENGTH chars of CSS)
  //    bypasses block-level markdown (<p>/<br> wrapping). Everything else — plain markdown, mixed HTML+markdown, or
  //    style-tag-at-the-end cards — runs the full markdown pipeline.
  const hasStyleTagAtStart = new RegExp(`^[\\s\\S]{0,${STYLE_TAG_LOOKAHEAD}}<style[^>]*>[\\s\\S]{${STYLE_TAG_MIN_LENGTH},}<\\/style>`, "i").test(processed);

  if (hasStyleTagAtStart) {
    // ── Ultra-CSS mode: preserve HTML layout & whitespace while converting inline Markdown ──
    const rawChunks: string[] = [];
    processed = processed.replace(/<(style|pre|code)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, (m) => {
      const idx = rawChunks.length;
      rawChunks.push(substituteMacrosRaw(m));
      return `\x01RAW${idx}\x01`;
    });
    processed = processed.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const cls = lang.trim() ? ` class="language-${lang.trim()}"` : "";
      const sub = substituteMacrosRaw(code).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const idx = rawChunks.length;
      rawChunks.push(`<pre><code${cls}>${sub}</code></pre>`);
      return `\x01RAW${idx}\x01`;
    });
    processed = processed.replace(/`([^`\n]+?)`/g, (_, c) => {
      const sub = substituteMacrosRaw(c).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const idx = rawChunks.length;
      rawChunks.push(`<code>${sub}</code>`);
      return `\x01RAW${idx}\x01`;
    });

    processed = substituteMacrosHtml(processed);
    processed = processed.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
    processed = processed.replace(/<!DOCTYPE[^>]*>/gi, "");
    processed = processed.replace(/<\?[\s\S]*?\?>/g, "");
    processed = processed.replace(/<title\b[\s\S]*?<\/title\s*>/gi, "");
    processed = processed.replace(/<meta\b[^>]*>/gi, "");
    processed = processed.replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "");
    processed = processed.replace(/<(https?:\/\/[^\s<>]+)>/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    const tagChunks: string[] = [];
    processed = processed.replace(/<[^>]+>/g, (m) => {
      const idx = tagChunks.length;
      tagChunks.push(m);
      return `\x01TAG${idx}\x01`;
    });

    processed = applyInlineMarkdown(processed);

    processed = processed.replace(/\x01TAG(\d+)\x01/g, (_, i) => tagChunks[+i]);
    processed = processed.replace(/\x01RAW(\d+)\x01/g, (_, i) => rawChunks[+i]);
  } else {
    // ── Full markdown pipeline (plain text, mixed HTML+markdown, trailing style) ──

    // Step A-pre: Fenced code blocks and inline code spans FIRST — before comment stripping
    // and placeholder lifting so `<pre>` and `<code>` contents are escaped and untouched.
    processed = processed.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const cls = lang.trim() ? ` class="language-${lang.trim()}"` : "";
      const sub = substituteMacrosRaw(code).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return `<pre><code${cls}>${sub}</code></pre>`;
    });
    processed = processed.replace(/`([^`\n]+?)`/g, (_, c) => {
      const sub = substituteMacrosRaw(c).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<code>${sub}</code>`;
    });

    processed = substituteMacrosHtml(processed);

    // Strip HTML comments, DOCTYPE, XML declarations, <title>, <meta>, and document shell tags (<html>, <head>, <body>)
    processed = processed.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
    processed = processed.replace(/<!DOCTYPE[^>]*>/gi, "");
    processed = processed.replace(/<\?[\s\S]*?\?>/g, "");
    processed = processed.replace(/<title\b[\s\S]*?<\/title\s*>/gi, "");
    processed = processed.replace(/<meta\b[^>]*>/gi, "");
    processed = processed.replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "");

    // Convert Markdown autolinks <https://...> before HTML tag lifting so they aren't parsed as tags
    processed = processed.replace(/<(https?:\/\/[^\s<>]+)>/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Isolate <details>, </details>, <summary>...</summary>, and <link> as paragraph boundaries
    // while allowing block markdown inside <details> bodies.
    processed = processed
      .replace(/<details\b[^>]*>/gi, "\n\n$&\n\n")
      .replace(/<\/details\s*>/gi, "\n\n$&\n\n")
      .replace(/<summary\b[^>]*>[\s\S]*?<\/summary\s*>/gi, "\n\n$&\n\n")
      .replace(/<link\b[^>]*>/gi, "\n\n$&\n\n");

    // Step A: Protect existing HTML tags and complete block elements so the markdown
    // passes don't corrupt them. We lift out full block-level HTML elements first,
    // then lift remaining inline tags.
    const blockPlaceholders: string[] = [];
    const blockTagNames = new Set(["div", "section", "article", "header", "footer", "aside", "nav", "main", "style", "pre", "table", "figure", "form", "fieldset", "summary"]);
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
          if (tagName === "style" || tagName === "pre") {
            blockEnd = processed.length;
          } else {
            // Unclosed container tag (e.g. an unclosed <div>): isolate the opening tag
            // and continue scanning so inner balanced blocks and markdown paragraphs still render.
            newProcessed += `\n\n${match[0]}\n\n`;
            cursor = match.index + match[0].length;
            continue;
          }
        }
        
        const blockStr = processHtmlBlockInlineMarkdown(processed.slice(match.index, blockEnd));
        const idx = blockPlaceholders.length;
        blockPlaceholders.push(blockStr);
        newProcessed += `\n\n\x00BLK${idx}\x00\n\n`;
        
        cursor = blockEnd;
      } else {
        newProcessed += processed.slice(cursor, match.index + match[0].length);
        cursor = match.index + match[0].length;
      }
    }
    processed = newProcessed;
    // Lift inline <code>...</code> spans and remaining inline/void tags
    const inlinePlaceholders: string[] = [];
    processed = processed.replace(/<code\b[^>]*>[\s\S]*?<\/code\s*>|<[^>]+>/gi, (m) => {
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
    processed = processed.replace(/^(?!\x00(?:BLK|INL)\d+\x00)(.+)\n={3,}$/gm, "\n\n<h1>$1</h1>\n\n");
    processed = processed.replace(/^(?!\x00(?:BLK|INL)\d+\x00)(.+)\n-{3,}$/gm, "\n\n<h2>$1</h2>\n\n");

    // Step D: Blockquotes — wrap with \n\n for isolation
    processed = processed.replace(/^(>\s?.*\n?)+/gm, (block) => {
      const inner = block.replace(/^>\s?/gm, "").trim();
      return `\n\n<blockquote>${inner}</blockquote>\n\n`;
    });

    // Step E: Horizontal rules — wrap with \n\n so they are always isolated chunks.
    processed = processed.replace(/^[-*_]{3,}\s*$/gm, "\n\n<hr>\n\n");

    // Step F: Lists (with nested indentation and blank-line continuity)
    const listLines = processed.split("\n");
    const listOutput: string[] = [];
    const listStack: Array<{ type: "ul" | "ol"; indent: number }> = [];
    const matchListLine = (ln: string): { type: "ul" | "ol"; indent: number; num?: number; content: string } | null => {
      const ul = ln.match(/^(\s*)[*+\-]\s+(.*)$/);
      if (ul) return { type: "ul", indent: ul[1].replace(/\t/g, "  ").length, content: ul[2] };
      const ol = ln.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (ol) return { type: "ol", indent: ol[1].replace(/\t/g, "  ").length, num: parseInt(ol[2], 10), content: ol[3] };
      return null;
    };
    const openListTag = (type: "ul" | "ol", num?: number) => {
      if (type === "ol" && num !== undefined && num !== 1) return `<ol start="${num}">`;
      return `<${type}>`;
    };
    for (let i = 0; i < listLines.length; i++) {
      const line = listLines[i];
      const item = matchListLine(line);
      if (item) {
        if (listStack.length === 0) {
          listOutput.push("");
          listOutput.push(openListTag(item.type, item.num));
          listStack.push({ type: item.type, indent: item.indent });
        } else {
          while (listStack.length > 1 && item.indent < listStack[listStack.length - 1].indent) {
            listOutput.push(`</${listStack.pop()!.type}>`);
          }
          const top = listStack[listStack.length - 1];
          if (item.indent >= top.indent + 2) {
            listOutput.push(openListTag(item.type, item.num));
            listStack.push({ type: item.type, indent: item.indent });
          } else if (top.type !== item.type) {
            listOutput.push(`</${listStack.pop()!.type}>`);
            if (listStack.length === 0) listOutput.push("");
            listOutput.push(openListTag(item.type, item.num));
            listStack.push({ type: item.type, indent: item.indent });
          }
        }
        listOutput.push(`<li>${item.content}</li>`);
      } else if (listStack.length > 0 && line.trim() === "") {
        // Keep list open across a single blank line if the next line is another list item
        const nextLine = i + 1 < listLines.length ? listLines[i + 1] : "";
        if (matchListLine(nextLine)) {
          continue;
        }
        while (listStack.length) listOutput.push(`</${listStack.pop()!.type}>`);
        listOutput.push("");
        listOutput.push(line);
      } else {
        if (listStack.length > 0) {
          while (listStack.length) listOutput.push(`</${listStack.pop()!.type}>`);
          listOutput.push("");
        }
        listOutput.push(line);
      }
    }
    if (listStack.length > 0) {
      while (listStack.length) listOutput.push(`</${listStack.pop()!.type}>`);
      listOutput.push("");
    }
    processed = listOutput.join("\n");

    // Step G & H: Inline formatting, markdown images, and links
    processed = applyInlineMarkdown(processed);

    // Step I: Paragraphs and line breaks.
    const paragraphs = processed.split(/\n{2,}/);
    processed = paragraphs.map(para => {
      para = para.trim();
      if (!para) return "";
      if (/^\x00BLK\d+\x00$/.test(para) || /^\x00BLK\d+\x00/.test(para)) return para;
      const leadingInlMatch = para.match(/^\x00INL(\d+)\x00/);
      if (leadingInlMatch) {
        const tag = inlinePlaceholders[+leadingInlMatch[1]] || "";
        if (/^<\/?(p|details|blockquote|div|section|article|header|footer|hr|link|ul|ol|li|table|h[1-6])\b/i.test(tag)) {
          return para;
        }
      }
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|div|p|section|article|header|footer)[^>]*>/i.test(para)) return para;
      if (/<(h[1-6]|ul|ol|blockquote|pre|hr|table)[^>]*>/i.test(para)) return para;
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    }).join("\n");

    // Step J: Restore placeholders (inline first, then blocks)
    processed = processed.replace(/\x00INL(\d+)\x00/g, (_, i) => inlinePlaceholders[+i]);
    processed = processed.replace(/\x00BLK(\d+)\x00/g, (_, i) => blockPlaceholders[+i]);
  }

  // 3. Parser-based HTML sanitize (also enforces referrerpolicy="no-referrer" and rel="noopener noreferrer")
  const hardened = sanitize(processed);

  // 4. Build styles
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
    strong, b { font-weight:bold; }
    em, i { font-style:italic; }
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
