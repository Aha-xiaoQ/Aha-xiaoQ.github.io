/** Read-only display helper used by both binding UI and guide. */
export function keyLabel(k){return ({Space:'空格',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',BracketLeft:'[',BracketRight:']',Escape:'Esc',ShiftLeft:'左 Shift',ShiftRight:'右 Shift'}[k]||k.replace(/^Key|^Digit/,''));}
