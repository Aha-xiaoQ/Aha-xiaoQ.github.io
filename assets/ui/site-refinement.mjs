/** R23: improve the existing shell; no route ownership, scroll lock, or added navigation destinations. */
export const MENU_QUERY = '(max-width: 720px)';
const controllers = new Map();
let menuSerial = 0;
const language = doc => doc.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'zh';
export function mainSection(pathname) {
  const path = String(pathname || '/').replace(/\/index\.html$/, '/');
  if (path === '/') return 'home';
  const first = path.split('/').filter(Boolean)[0];
  return ({projects:'projects',games:'games',tools:'tools',notes:'notes',dev:'notes',about:'about'})[first] || null;
}
function createNavigation(header, nav, doc) {
  const win = doc.defaultView;
  const media = win.matchMedia(MENU_QUERY);
  const button = doc.createElement('button');
  button.type = 'button'; button.className = 'q-menu-toggle';
  button.dataset.siteMenu = ''; button.dataset.i18nSkip = '';
  const original = {id:nav.getAttribute('id'), hidden:nav.hidden};
  if (!nav.id) { do { nav.id = 'q-site-navigation-' + (++menuSerial); } while (doc.querySelectorAll('#' + nav.id).length > 1); }
  button.setAttribute('aria-controls', nav.id);
  const tools = header.querySelector('.q-header-tools');
  if (!tools) return null;
  tools.append(button); header.dataset.navEnhanced = '';
  let opened = false, disposed = false;
  const apply = ({focusToggle=false} = {}) => {
    const small = media.matches, en = language(doc) === 'en';
    button.hidden = !small;
    const text=en ? (opened ? 'Close' : 'Menu') : (opened ? '收起' : '菜单');
    if(button.textContent!==text)button.textContent=text;
    button.setAttribute('aria-label', en ? (opened ? 'Close main navigation' : 'Open main navigation') : (opened ? '收起主导航' : '展开主导航'));
    button.setAttribute('aria-expanded', String(small && opened));
    nav.hidden = small && !opened;
    if (small && !opened && (focusToggle || nav.contains(doc.activeElement))) button.focus({preventScroll:true});
  };
  const close = (focusToggle=false) => { if (!opened) return; opened=false;apply({focusToggle}); };
  const toggle = () => {opened=!opened;apply();};
  const escape = e => { if (e.key === 'Escape' && !e.defaultPrevented && opened && header.contains(doc.activeElement)) {e.preventDefault();close(true);} };
  // Native links handle navigation. Never preventDefault or fake link activation here.
  const follow = e => {if(e.target.closest?.('a[href]') && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button===0) close();};
  const outside = e => {if(opened && !header.contains(e.target)) close();};
  const focusOutside = e => {if(opened && !header.contains(e.target)) close();};
  const resize = () => {const wasButton = doc.activeElement === button;opened=false;apply();if(!media.matches && wasButton)(nav.querySelector('[aria-current="page"]') || nav.querySelector('a[href]'))?.focus({preventScroll:true});};
  button.addEventListener('click',toggle);header.addEventListener('keydown',escape);nav.addEventListener('click',follow);
  doc.addEventListener('pointerdown',outside);doc.addEventListener('focusin',focusOutside);media.addEventListener('change',resize);
  apply();
  return {nav,button,refresh(){if(!disposed)apply();},dispose(){
    if(disposed)return;disposed=true;
    button.removeEventListener('click',toggle);header.removeEventListener('keydown',escape);nav.removeEventListener('click',follow);
    doc.removeEventListener('pointerdown',outside);doc.removeEventListener('focusin',focusOutside);media.removeEventListener('change',resize);
    nav.hidden=original.hidden;if(original.id===null)nav.removeAttribute('id');else nav.id=original.id;
    delete header.dataset.navEnhanced;button.remove();
  }};
}
/** Idempotent across soft navigation, language changes, and back/forward cache restores. */
export function mountNavigation(scope=globalThis.document) {
  if(!scope)return;
  const doc=scope.ownerDocument || scope;
  for(const [header,c] of controllers) if(!header.isConnected){c.dispose();controllers.delete(header);}
  scope.querySelectorAll('.site-header .bar,.topbar').forEach(header=>{
    const nav=Array.from(header.children).find(n=>n.tagName==='NAV' && n.querySelector('a[data-nav-key]'));
    if(!nav || !header.querySelector('.q-header-tools'))return;
    const section=mainSection(doc.defaultView.location.pathname);
    if(section)nav.querySelectorAll('a[data-nav-key]').forEach(a=>{if(a.dataset.navKey===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const current=controllers.get(header);
    if(current && (current.nav!==nav || !current.button.isConnected)){current.dispose();controllers.delete(header);}
    if(!controllers.has(header)) {const c=createNavigation(header,nav,doc);if(c)controllers.set(header,c);}
    controllers.get(header)?.refresh();
  });
}
export function disposeNavigation() { for(const c of controllers.values())c.dispose();controllers.clear(); }
/** A narrow observer predicate: content typing/toasts do not trigger another whole-header scan. */
export function headerMutation(records) {
  return records.some(record=>{
    if(record.target?.closest?.('.site-header,.topbar'))return true;
    return [...record.addedNodes].some(n=>n.nodeType===1 && (n.matches?.('.site-header,.topbar,.site-language') || n.querySelector?.('.site-header,.topbar')));
  });
}
