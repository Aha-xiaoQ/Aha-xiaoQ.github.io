export function expandWall(bounds, note, margin = 64) {
  const left = note.x < bounds.x ? note.x - margin : bounds.x;
  const top = note.y < bounds.y ? note.y - margin : bounds.y;
  const right = note.x + note.width > bounds.x + bounds.width ? note.x + note.width + margin : bounds.x + bounds.width;
  const bottom = note.y + note.height > bounds.y + bounds.height ? note.y + note.height + margin : bounds.y + bounds.height;
  return { x: left, y: top, width: right - left, height: bottom - top };
}
export function contentBounds(notes) {
  if (!notes.length) return { x: 0, y: 0, width: 1200, height: 800 };
  const left = Math.min(...notes.map(n => n.x)) - 100;
  const top = Math.min(...notes.map(n => n.y)) - 100;
  return { x: left, y: top,
    width: Math.max(...notes.map(n => n.x + n.width)) + 100 - left,
    height: Math.max(...notes.map(n => n.y + n.height)) + 100 - top };
}
export function fitCamera(bounds, width, height) {
  const scale = Math.max(.0001, Math.min(1, width / bounds.width, height / bounds.height));
  return { scale, tx: width / 2 - (bounds.x + bounds.width / 2) * scale,
    ty: height / 2 - (bounds.y + bounds.height / 2) * scale };
}
