/** Settings table owns presentation only. Values go through textContent and the
 * one delegated listener is explicitly removable; no input model is mutated here.
 */
export function createBindingsView({document: doc, table, definitions, keyLabel, padLabel, onChoose, lifetime}) {
  if (!doc || !table) throw new TypeError('Binding view requires a document and table');
  const release = lifetime.listen(table, 'click', e => {
    const button = e.target?.closest?.('button[data-binding]');
    if (!button || !table.contains(button)) return;
    const {binding, source} = button.dataset;
    if (Object.hasOwn(definitions, binding) && ['keys', 'pad'].includes(source)) onChoose(binding, source);
  });
  function render(bindings) {
    table.replaceChildren();
    for (const [key, action] of Object.entries(definitions)) {
      const row = doc.createElement('tr'), name = doc.createElement('td'); name.textContent = action.name; row.append(name);
      for (const source of ['keys', 'pad']) {
        const cell = doc.createElement('td'), button = doc.createElement('button');
        button.type = 'button'; button.dataset.binding = key; button.dataset.source = source;
        button.textContent = bindings[key][source].map(v => source === 'keys' ? keyLabel(v) : padLabel(v)).join(' / ') || '未绑定';
        button.setAttribute('aria-label', action.name + '：' + (source === 'keys' ? '键盘 ' : '手柄 ') + button.textContent);
        cell.append(button); row.append(cell);
      }
      table.append(row);
    }
  }
  return Object.freeze({render, dispose: release});
}
