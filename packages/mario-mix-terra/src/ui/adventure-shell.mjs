/** DOM presentation enhancement. Existing buttons are moved, never cloned; listeners survive. */
export function createAdventureShell({document: doc, preferences, makeLifetime, resetInput, focusGame, getBindings, keyLabel}) {
  const existing = doc.getElementById('m05Display');
  if (existing) throw new Error('Adventure shell is already mounted');
  const life = makeLifetime(), body = doc.body, header = doc.querySelector('.app > header'), panel = doc.querySelector('.panel');
  if (!panel || !header) throw new Error('M04 UI host is missing');
  body.dataset.terraUi = 'm07';
  const create = (tag, cls, text) => {const el = doc.createElement(tag); if (cls) el.className = cls; if (text) el.textContent = text; return el;};
  const focus = create('button', 'm05-focus', '专注画面'); focus.id = 'm05Focus'; focus.type = 'button';
  focus.dataset.terraDisplay = ''; focus.setAttribute('aria-pressed', 'false'); focus.setAttribute('aria-controls', 'm05GuidePanel');
  header.insertBefore(focus, header.querySelector('.offline'));
  panel.id = 'm05GuidePanel'; panel.setAttribute('aria-label', '冒险手册与设置');
  const chapter = create('div', 'm05-chapter');
  for (const el of [...panel.children]) if (el.matches('.kicker,h2')) chapter.append(el);
  panel.prepend(chapter);
  const eyebrow = chapter.querySelector('.kicker'); if (eyebrow) eyebrow.setAttribute('aria-hidden', 'true');
  const status = panel.querySelector('.status-card');
  if (status) {
    status.classList.add('m05-status');
    const details=create('details','m06-journey');details.append(create('summary','','旅途记录'));
    status.before(details);details.append(status);
  }
  const mark = header.querySelector('.mark'); if (mark) mark.textContent = 'Ⅲ';
  const actions = panel.querySelector('.buttons'); if (actions) actions.setAttribute('aria-label', '游戏操作');
  const settings = doc.getElementById('t21BindingButton'); if (settings) settings.classList.add('m05-settings-button');
  const prefs = create('details', 'm05-display'); prefs.id = 'm05Display'; prefs.dataset.terraDisplay = '';
  prefs.append(create('summary', '', '显示偏好'));
  const controls = create('div', 'm05-display-options'); prefs.append(controls);
  const options = [['text', '大号菜单文字', 'large', 'normal'], ['contrast', '高对比界面', 'high', 'normal'], ['motion', '减少界面动效', 'reduced', 'system']];
  const buttons = new Map();
  for (const [name, label, active, normal] of options) {
    const b = create('button', '', label); b.type = 'button'; b.id = 'm05Pref-' + name; b.dataset.preference = name;
    life.listen(b, 'click', () => {preferences.set(name, preferences.snapshot()[name] === active ? normal : active); apply();});
    buttons.set(name, b); controls.append(b);
  }
  prefs.append(create('p', 'm05-note', '大号文字用于菜单和说明。窄屏快捷栏会重排，不缩小文字；减少动效不关闭世界闪光或震动。'));
  const saveStatus = create('p', 'm05-note'); saveStatus.id = 'm05DisplayStatus'; saveStatus.setAttribute('role', 'status'); prefs.append(saveStatus);
  const after = settings || actions || status || chapter; after.after(prefs);
  const quick = create('div', 'm05-quick-guide'); quick.setAttribute('aria-label', '当前键盘快捷操作');
  const play = doc.querySelector('.play-column'); const touch = play.querySelector('.touchbar'); if (touch) touch.after(quick); else play.append(quick);
  function refreshHints() {
    quick.replaceChildren(); const actions = getBindings()?.actions;
    for (const [id, label] of [['jump', '跳跃'], ['attack', '使用工具'], ['pause', '暂停']]) {
      const box = create('span', 'm05-quick-item'), keys = actions?.[id]?.keys || [];
      box.append(create('kbd', '', keys.length ? keyLabel(keys[0]) : '未绑定'), create('span', '', label)); quick.append(box);
    }
  }
  function apply() {
    const p = preferences.snapshot(); body.dataset.terraText = p.text; body.dataset.terraContrast = p.contrast; body.dataset.terraMotion = p.motion;
    for (const [name, , active] of options) buttons.get(name).setAttribute('aria-pressed', String(p[name] === active));
    saveStatus.textContent = p.persisted ? '显示偏好已保存到本机。' : '显示设置仅用于本次访问；浏览器未保存这些偏好。';
  }
  life.listen(focus, 'click', () => {
    const active = body.dataset.terraFocus !== 'true'; body.dataset.terraFocus = String(active); focus.setAttribute('aria-pressed', String(active));
    focus.textContent = active ? '退出专注' : '专注画面'; resetInput(); focusGame();
  });
  life.listen(doc, 'focusin', e => {if (e.target?.closest?.('[data-terra-display]')) resetInput();});
  life.listen(doc.getElementById('t21Bindings'), 'close', refreshHints);
  life.listen(prefs, 'toggle', refreshHints);
  apply(); refreshHints();
  function handleKey(e) {
    const target = e.target?.closest?.('[data-terra-display]');
    if (!target || !['keydown', 'keyup'].includes(e.type) || e.code === 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.type === 'keydown' && !e.repeat) {
      if (['Space', 'Enter'].includes(e.code)) {
        const el = e.target.closest('button,summary');
        if (el?.tagName === 'SUMMARY') el.parentElement.open = !el.parentElement.open;
        else el?.click();
      } else if (e.code === 'Escape') {prefs.open = false; focusGame();}
    }
    return true; // The existing early input owner prevents gameplay leakage.
  }
  return Object.freeze({refreshHints, handleKey, snapshot: () => ({...preferences.snapshot(), focus: body.dataset.terraFocus === 'true'}), dispose: () => life.dispose()});
}
