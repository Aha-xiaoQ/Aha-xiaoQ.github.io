"""Optional Chromium DOM-fixture tests, NOT network/CSP/gameplay integration tests.
Requires an existing Python Playwright install and Chromium. No automatic installs.
The fixture deliberately removes resource tags/CSP and injects local source text.
Run: python tests/browser_fixture.py [--screenshots /path/outside/repo]
"""
from pathlib import Path
import argparse,json,os,re,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--screenshots');args=parser.parse_args()
results=[]
def check(name,condition):
    assert condition,name
    results.append(name)
def load_fixture(page,storage=None):
    page.set_default_timeout(5000)
    text=(ROOT/'dev/index.html').read_text()
    text=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]+>','',text)
    text=re.sub(r'<link rel="stylesheet"[^>]+>','',text)
    text=re.sub(r'<script src="[^"]+" defer></script>','',text)
    page.set_content(text)
    css=re.sub(r'@font-face\s*\{[^}]+\}', '',(ROOT/'dev/center.css').read_text())
    page.add_style_tag(content=css)
    if storage is not None:
        page.evaluate('''(initial)=>{const store={...initial};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}});window.__fixtureStorage=store;}''',storage)
    for name in ['model.js','project-data.js','app.js']:
        page.add_script_tag(content=(ROOT/'dev'/name).read_text())
    return page
with sync_playwright() as p:
    executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
    options={'headless':True}
    if executable: options['executable_path']=executable
    browser=p.chromium.launch(**options)
    page=browser.new_page(viewport={'width':1440,'height':1050},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    load_fixture(page,{})
    check('initial render: 15 tasks / 6 ready / 3 episodes',page.locator('.task-card').count()==6 and page.locator('#count-total').inner_text()=='15' and page.locator('.episode').count()==3)
    page.locator('[data-filter="all"]').click();check('all filter renders 15 tasks',page.locator('.task-card').count()==15)
    page.locator('#search').fill('SRC-001');check('search matches exact task',page.locator('.task-card').count()==1)
    page.locator('.task-open').click();check('details dialog opens with acceptance criteria',page.locator('#task-dialog').evaluate('(e)=>e.open') and page.locator('#dialog-acceptance li').count()>0)
    page.locator('#edit-details summary').click();page.locator('#edit-status').select_option('done');page.locator('#edit-evidence').fill('');page.locator('#task-form button[type=submit]').click()
    check('done without evidence is rejected',bool(page.locator('#edit-error').inner_text()) and page.locator('#task-dialog').evaluate('(e)=>e.open'))
    page.locator('#edit-status').select_option('in_progress');page.locator('#edit-owner').fill('fixture-tester');page.locator('#edit-notes').fill('DOM fixture only');page.locator('#task-form button[type=submit]').click()
    check('edit is visibly a local draft',page.locator('#draft-banner').is_visible() and 'fixture-tester' in page.locator('.task-bottom').inner_text())
    check('canonical embedded source stays unchanged',page.evaluate("MM_PROJECT.tasks.find(t=>t.id==='SRC-001').owner")== '')
    draft=page.evaluate('window.__fixtureStorage')
    with page.expect_download() as info:page.locator('#export-draft').click()
    downloaded=info.value
    exported=json.loads(Path(downloaded.path()).read_text())
    check('export is valid JSON with edited task, not a GitHub write',exported['tasks'][5]['id']!='' and next(t for t in exported['tasks'] if t['id']=='SRC-001')['owner']=='fixture-tester')
    page.locator('.task-open').click();page.locator('#copy-task').click()
    check('clipboard fallback closes dialog and selects text',not page.locator('#task-dialog').evaluate('(e)=>e.open') and page.locator('#copy-fallback').is_visible() and 'SRC-001' in page.locator('#copy-text').input_value())
    page.on('dialog',lambda d:d.accept())
    page.locator('#discard-draft').click();check('restore canonical state clears local draft',not page.locator('#draft-banner').is_visible())
    page.locator('#import-draft').set_input_files({'name':'project.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
    page.wait_for_function("!document.getElementById('draft-banner').hidden")
    check('valid imported draft is displayed',page.locator('#draft-banner').is_visible())
    invalid={**exported,'baseCommit':'b'*40}
    page.locator('#import-draft').set_input_files({'name':'wrong.json','mimeType':'application/json','buffer':json.dumps(invalid).encode()})
    page.wait_for_function("document.getElementById('toast').textContent.includes('导入失败')")
    check('wrong-baseline import is rejected','基线' in page.locator('#toast').inner_text())
    stale=browser.new_page();load_fixture(stale,{next(iter(draft)):json.dumps({'sourceFingerprint':'old','project':exported})})
    check('stale draft is not silently applied','旧版草稿' in stale.locator('#draft-label').inner_text() and stale.locator('[data-task="SRC-001"] .task-bottom').inner_text().startswith('等待认领'))
    stale.close()
    restored=browser.new_page();load_fixture(restored,draft);restored.locator('[data-filter="all"]').click()
    check('same-source browser draft is restored',restored.locator('#draft-banner').is_visible() and 'fixture-tester' in restored.locator('[data-task="SRC-001"] .task-bottom').inner_text())
    restored.close()
    clean=browser.new_page(viewport={'width':1440,'height':1050});load_fixture(clean,{})
    clean.locator('#copy-handoff-top').click();check('handoff includes authoritative paths and next task','AGENTS.md' in clean.locator('#copy-text').input_value() and 'OPS-001' in clean.locator('#copy-text').input_value())
    clean.locator('#copy-fallback').evaluate('(e)=>e.hidden=true');clean.locator('#toast').evaluate('(e)=>e.hidden=true');clean.evaluate('window.scrollTo(0,0)')
    if args.screenshots:
        out=Path(args.screenshots);out.mkdir(parents=True,exist_ok=True)
        clean.screenshot(path=str(out/'developer-center-desktop.png'),full_page=True)
        clean.screenshot(path=str(out/'developer-center-top.png'),full_page=False)
    clean.set_viewport_size({'width':390,'height':844})
    check('mobile has no horizontal overflow',clean.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    if args.screenshots:clean.screenshot(path=str(out/'developer-center-mobile.png'),full_page=True)
    # Real site-shell source executed with synthetic data and a synthetic currentScript URL.
    shell=browser.new_page();shell.on('pageerror',lambda e:errors.append(str(e)))
    shell.set_content('<html lang="zh-CN"><body data-page="notes" data-base="../"><div id="app" data-prerendered="true"><nav class="site-nav"><a data-nav-key="about">关于</a></nav><main id="main"><div class="shell"><p id="original-note">保留旧笔记</p></div></main></div></body></html>')
    shell.evaluate('''()=>{window.SITE_TAXONOMY={gameCategories:[]};window.SITE_DATA={profile:{displayName:'Fixture',links:[]},notes:[],evidence:[],items:['mario-mix','mario-mix-2','mario-mix-3'].map(slug=>({id:slug,slug,primaryType:'game',visibility:'public',lifecycleStatus:'released',title:slug,summary:'fixture',evidenceIds:[],tags:[],categories:[],cover:'fixture.png',localUrl:'games/'+slug+'/play.html',detailUrl:'games/'+slug+'/'}))};}''')
    shell.evaluate('''source=>{const s=document.createElement('script');Object.defineProperty(s,'src',{value:'https://fixture.invalid/assets/site-shell.js'});s.textContent=source;document.head.append(s);}''',(ROOT/'assets/site-shell.js').read_text())
    check('site integration preserves prerendered notes and adds one developer entry',shell.locator('#original-note').count()==1 and shell.locator('[data-dev-entry]').count()==1)
    for route in ['notes','games','detail','notes','detail']:
        slug='mario-mix-3' if route=='detail' else ''
        shell.evaluate("({route,slug})=>SITE_SHELL_RENDER({nextPage:route,nextBase:route==='detail'?'../../':'../',nextItemSlug:slug})",{'route':route,'slug':slug})
        check('re-render '+route+' has exactly one developer entry ('+str(len(results))+')',shell.locator('[data-dev-entry]').count()==1)
        expected='../../dev/index.html' if route=='detail' else '../dev/index.html'
        check('relative developer path is correct after '+route,shell.locator('[data-dev-entry] a').get_attribute('href')==expected)
    check('no browser JavaScript errors in tested main UI/shell fixtures',not errors)
    print(json.dumps({'kind':'DOM fixture only; no network/CSP/real font/game verification','checks':len(results),'passed':results,'pageErrors':errors},ensure_ascii=False,indent=2))
    browser.close()
