/** Small explicit cleanup scope. No scene engine, event bus or hidden globals.
 * Disposers run in reverse order; all are attempted even if one throws.
 */
export function createLifetime({scheduleInterval, cancelInterval}) {
  let disposed = false;
  const disposers = [];
  function defer(fn) {
    if (typeof fn !== 'function') throw new TypeError('Cleanup must be a function');
    if (disposed) throw Error('Lifetime already disposed');
    let used = false;
    const once = () => {if (used) return; used = true; fn();};
    disposers.push(once); return once;
  }
  function interval(fn, ms) {
    if (disposed) throw Error('Lifetime already disposed');
    const id = scheduleInterval(() => {if (!disposed) fn();}, ms);
    defer(() => cancelInterval(id)); return id;
  }
  function listen(target, type, fn, options) {
    if (disposed) throw Error('Lifetime already disposed');
    target.addEventListener(type, fn, options);
    return defer(() => target.removeEventListener(type, fn, options));
  }
  function dispose() {
    if (disposed) return;
    disposed = true; const errors = [];
    for (const fn of disposers.reverse()) try {fn();} catch (e) {errors.push(e);}
    disposers.length = 0;
    if (errors.length) throw new AggregateError(errors, 'Lifecycle cleanup failed');
  }
  return Object.freeze({defer, interval, listen, dispose, snapshot: () => ({disposed, resources: disposers.length})});
}
