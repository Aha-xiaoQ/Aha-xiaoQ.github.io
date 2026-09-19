/** Settings overlay lifecycle. Only the pause this session acquired is resumed.
 * UI, clock, input and focus are injected ports; the module never reads the DOM.
 */
export function createSettingsSession({makeLifetime, getMode, togglePause, resetInput, render, show, hide, focus, poll}) {
  let scope = null, open = false, ownsPause = false, generation = 0;
  function start() {
    if (open) return false;
    generation++;
    ownsPause = getMode() === 'playing';
    if (ownsPause) togglePause();
    scope = makeLifetime();
    try {
      resetInput(); render(); show(); open = true;
      poll(); scope.interval(poll, 16); return true;
    } catch (e) {
      open = false;
      try {scope.dispose();} finally {scope = null; hide(); if (ownsPause && getMode() === 'paused') togglePause(); ownsPause = false;}
      throw e;
    }
  }
  function close({resume = true, restoreFocus = true} = {}) {
    if (!open && !scope) return false;
    open = false; generation++;
    try {scope?.dispose();} finally {
      scope = null; hide(); resetInput();
      if (resume && ownsPause && getMode() === 'paused') togglePause();
      ownsPause = false; if (restoreFocus) focus();
    }
    return true;
  }
  return Object.freeze({open: start, close, isOpen: () => open,
    snapshot: () => ({open, ownsPause, generation, resources: scope?.snapshot().resources || 0})});
}
