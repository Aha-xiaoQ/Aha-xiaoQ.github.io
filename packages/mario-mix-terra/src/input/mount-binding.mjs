/** Pure transactional reassignment. Mutates the supplied table only on success.
 * Kept separate because mount historically displaces occupied pad buttons.
 */
export function assignMountBinding(binds, button) {
  const next = structuredClone(binds);
  const freed = next.mount.pad.filter(i => i !== button);
  for (const [key, binding] of Object.entries(next)) {
    if (key === 'mount' || !binding.pad.includes(button)) continue;
    binding.pad = binding.pad.filter(i => i !== button);
    if (!binding.pad.length) {
      const candidates = [...freed, 11, 3, 10, 4, 6, ...Array.from({length: 32}, (_, i) => i)];
      const available = candidates.find(i => i !== button &&
        !Object.entries(next).some(([k, v]) => k !== 'mount' && v.pad.includes(i)));
      if (available === undefined) return false;
      binding.pad = [available];
    }
  }
  next.mount.pad = [button];
  Object.assign(binds, next);
  return true;
}
