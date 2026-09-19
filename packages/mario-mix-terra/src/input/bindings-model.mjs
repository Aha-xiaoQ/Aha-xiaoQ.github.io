/** Binding policy. No DOM/storage/game globals; failures never partially commit.
 * The browser adapter owns persistence under the unchanged marioMix.controls.v1 key.
 */
export function createBindingsModel({definitions, assignMount}) {
  if (!definitions || typeof assignMount !== 'function') throw new TypeError('Binding dependencies required');
  const actions = structuredClone(definitions);
  const copy = x => structuredClone(x);
  const defaults = () => Object.fromEntries(Object.entries(actions).map(([k, v]) =>
    [k, {keys: [...v.keys], pad: [...v.pad]}]));
  let bindings = defaults();
  const keyOK = x => typeof x === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(x);
  const padOK = x => Number.isInteger(x) && x >= 0 && x <= 31;
  const reserved = new Set(['Tab', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight']);
  function shared(a, b, source, value) {
    if (source !== 'pad') return false;
    if ((a === 'toolNext' && b === 'recall') || (a === 'recall' && b === 'toolNext')) return true;
    // Deliberate M02 correction: the shipped defaults contain this contextual pair.
    // M01 exported them but then rejected its own file on import. No key is moved.
    return value === 6 && ((a === 'interact' && b === 'recall') || (a === 'recall' && b === 'interact'));
  }
  function load(data) {
    if (!data || data.version !== 1 || !data.actions || typeof data.actions !== 'object' || Array.isArray(data.actions))
      throw Error('不是有效的按键配置');
    const next = defaults();
    for (const [k, v] of Object.entries(data.actions)) {
      if (!Object.hasOwn(actions, k)) continue;
      if (!v || !Array.isArray(v.keys) || !Array.isArray(v.pad) || v.keys.some(x => !keyOK(x)) || v.pad.some(x => !padOK(x)))
        throw Error('按键数据无效');
      next[k] = {keys: [...new Set(v.keys)].slice(0, 6), pad: [...new Set(v.pad)].slice(0, 4)};
    }
    const needsSave = data.controlLayout !== 6;
    if (needsSave) {
      for (const [k, v] of Object.entries(next)) if (k !== 'recall' && v.pad.includes(6)) {
        v.pad = v.pad.filter(i => i !== 6);
        if (!v.pad.length) {
          const used = i => Object.entries(next).some(([owner, b]) => owner !== k && b.pad.includes(i));
          const fallback = [...actions[k].pad, 11, 3, 10, 4, 5, 2, 1, 0, 7, 8, 9, 12, 13, 14, 15].find(i => i !== 6 && !used(i));
          if (fallback !== undefined) v.pad = [fallback];
        }
      }
      next.recall.pad = [6];
    }
    for (const source of ['keys', 'pad']) {
      const owners = new Map();
      for (const [k, v] of Object.entries(next)) for (const x of v[source]) {
        const prior = owners.get(x);
        if (prior && !shared(k, prior, source, x)) throw Error('同一按键绑定了多个动作');
        if (!prior) owners.set(x, k);
      }
    }
    if (!next.jump.keys.length || !next.attack.keys.length || !next.jump.pad.length || !next.attack.pad.length)
      throw Error('跳跃和攻击不能留空');
    const deadzone = Number.isFinite(data.deadzone) ? Math.max(.12, Math.min(.4, data.deadzone)) : undefined;
    bindings = next;
    return {needsSave, deadzone};
  }
  function bind(action, source, value) {
    if (!Object.hasOwn(actions, action) || !['keys', 'pad'].includes(source) ||
        (source === 'keys' && (!keyOK(value) || reserved.has(value))) || (source === 'pad' && !padOK(value)))
      return {ok: false, reason: 'invalid'};
    const next = copy(bindings);
    if (action === 'mount' && source === 'pad') {
      if (!assignMount(next, value)) return {ok: false, reason: 'full'};
    } else {
      const conflict = Object.entries(next).find(([k, v]) => k !== action && v[source].includes(value) && !shared(action, k, source, value));
      if (conflict) return {ok: false, reason: 'conflict', owner: conflict[0]};
      next[action][source] = [value];
    }
    bindings = next;
    return {ok: true};
  }
  return Object.freeze({defaults, load, bind, snapshot: () => copy(bindings),
    reset: () => {bindings = defaults(); return copy(bindings);},
    config: deadzone => ({version: 1, controlLayout: 6, actions: copy(bindings), deadzone})});
}
