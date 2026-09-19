/** Resolves physical keys into legacy logical codes. The bridge owns side effects.
 * Releases use the code captured on key-down, even if a binding changes while held.
 */
export function createKeyboardRouter({definitions, getBindings, canonicalKeys}) {
  const held = new Map();
  function route(e, mode) {
    if (!['keydown', 'keyup'].includes(e.type)) return {kind: 'pass'};
    const bindings = getBindings();
    if (mode === 'paused' && e.type === 'keydown' && !e.repeat && bindings.pause.keys.includes(e.code)) return {kind: 'resume'};
    if (!['playing', 'flag'].includes(mode) && !held.has(e.code)) return {kind: 'pass'};
    const action = Object.keys(bindings).find(k => bindings[k].keys.includes(e.code));
    const mapped = held.get(e.code) || (action && definitions[action].code);
    if (mapped) {
      if (e.type === 'keydown') held.set(e.code, mapped); else held.delete(e.code);
      return {kind: 'mapped', event: {type: e.type, code: mapped, key: e.key, target: e.target,
        repeat: e.repeat, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey}};
    }
    if (canonicalKeys.has(e.code) && !/^Digit[1-6]$|^Key[CR]$|^Enter$/.test(e.code)) return {kind: 'consume'};
    return {kind: 'pass'};
  }
  return Object.freeze({route, clear: () => held.clear(), snapshot: () => [...held]});
}
