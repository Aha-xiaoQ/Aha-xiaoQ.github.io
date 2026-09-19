/** First extracted gameplay leaf. No DOM, canvas, audio, timers or global state.
 * Directions: x right=+1; y down=+1. Keep legacy priority, including down+up.
 * Input is the existing logical action object, not raw key or gamepad codes.
 * New key-binding behavior belongs in a separate change, not this extraction.
 */
export function resolveBillAim(input, player) {
  const horizontal = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const y = input.down && (!player.grounded || horizontal)
    ? 1 : input.up && !input.down ? -1 : 0;
  return { x: y ? horizontal : player.facing, y };
}
