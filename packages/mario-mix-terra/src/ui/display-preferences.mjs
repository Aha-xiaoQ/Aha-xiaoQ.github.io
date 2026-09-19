/** Presentation preferences never touch the controls, saves or simulation state. */
export function createDisplayPreferences({storage, key = 'marioMix.presentation.v1'} = {}) {
  const defaults = () => ({text: 'normal', contrast: 'normal', motion: 'system'});
  const allowed = {text: ['normal', 'large'], contrast: ['normal', 'high'], motion: ['system', 'reduced']};
  let values = defaults(), persisted = false;
  try {
    const raw = storage?.getItem(key);
    if (raw && raw.length < 2048) {
      const data = JSON.parse(raw);
      if (data?.version === 1 && data.values && typeof data.values === 'object')
        {
          for (const k of Object.keys(allowed)) if (allowed[k].includes(data.values[k])) values[k] = data.values[k];
          persisted = Object.keys(allowed).every(k => allowed[k].includes(data.values[k]));
        }
    }
  } catch { /* A readable default works without localStorage. */ }
  function set(name, value) {
    if (!Object.hasOwn(allowed, name) || !allowed[name].includes(value)) throw new TypeError('Unknown display preference');
    values = {...values, [name]: value}; persisted = false;
    try {if (storage) {storage.setItem(key, JSON.stringify({version: 1, values})); persisted = true;}} catch { /* Current session remains usable. */ }
    return snapshot();
  }
  const snapshot = () => ({...values, persisted});
  return Object.freeze({set, snapshot});
}
