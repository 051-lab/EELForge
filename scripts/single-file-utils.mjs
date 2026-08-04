export function replaceOnceLiteral(source, marker, replacement) {
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Required HTML marker was not found: ${marker}`);
  return source.slice(0, index) + replacement + source.slice(index + marker.length);
}
