function hasMedia(node) {
  return Boolean(node.querySelector("img, video, iframe"));
}

export function normalizeEditorValue(html) {
  if (!html || html === "<p><br></p>") {
    return "";
  }

  return html;
}

export function isRichTextEmpty(html) {
  if (!html) {
    return true;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const text = doc.body.textContent?.replace(/\u00a0/g, " ").trim();

  return !text && !hasMedia(doc.body);
}
