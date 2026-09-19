/** One capture owner, independent of DOM and timers. Pad buttons already held when
 * capture starts are ignored until released. Newly assigned buttons are masked.
 */
export function createBindingCapture({assign, mask, unmask}) {
  let active = null, previous = [];
  const releasing = new Set();
  function begin(action, source, buttons = []) {
    if (!['keys', 'pad'].includes(source)) throw Error('Unknown capture source');
    active = {action, source}; previous = [...buttons];
  }
  function key(e) {
    if (!active || e.type !== 'keydown') return null;
    if (e.code === 'Escape') {active = null; return {kind: 'cancel'};}
    if (active.source === 'keys' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const capture = active; active = null;
      return {kind: 'binding', ok: assign(capture.action, 'keys', e.code), value: e.code};
    }
    return {kind: 'waiting'};
  }
  function poll(buttons) {
    for (const i of [...releasing]) if (!buttons[i]) {releasing.delete(i); unmask(i);}
    let result = null;
    if (!releasing.size && active?.source === 'pad') {
      const i = buttons.findIndex((v, n) => v && !previous[n]);
      if (i >= 0) {
        const capture = active; active = null;
        const ok = assign(capture.action, 'pad', i);
        if (ok) {releasing.add(i); mask(i);}
        result = {kind: 'binding', ok, value: i};
      }
    }
    previous = [...buttons]; return result;
  }
  function clear() {active = null; previous = []; releasing.clear();}
  return Object.freeze({begin, key, poll, clear, cancel: () => {active = null;},
    pending: () => active ? {...active} : null, snapshot: () => ({active: active ? {...active} : null, previous: [...previous], releasing: [...releasing]})});
}
