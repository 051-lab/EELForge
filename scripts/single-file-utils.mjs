export function normalizeLineEndings(text) {
  return text.replace(/\r\n?/g, '\n');
}

export function normalizeBuiltHtml(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '');
}

export function replaceOnceLiteral(source, marker, replacement) {
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Required HTML marker was not found: ${marker}`);
  return source.slice(0, index) + replacement + source.slice(index + marker.length);
}
