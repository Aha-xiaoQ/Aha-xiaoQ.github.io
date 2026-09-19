/** Pure intent; deliberately consume the chord edge even while airborne.
 * This preserves the old rule: holding down+jump before landing does NOT
 * trigger a descent on landing. Release and press again to create an edge.
 */
export function billDescentIntent(input, previousHeld, player, room) {
  const held = !!input.down && !!input.jump;
  return { held, attempt: !!(held && !previousHeld && player.grounded && room === 'surface') };
}

/** Exact legacy platform eligibility. Row 13 (ground) is never passable. */
export function isBillPassablePlatform(tile) {
  return !tile.hidden && tile.y < 13 && (tile.type === 'brick' || tile.type === 'question');
}
