"""Full candidate, offline DOM checks. Synthetic BFCache lifecycle and gamepad samples only.
Does not relax CSP or browser policy, fetch remote assets, send reports, or approve publication.
"""
from pathlib import Path
import json,shutil,hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'.local/polish';OUT.mkdir(parents=True,exist_ok=True)
def main():
    checks=[];errors=[];layouts=[];html=(ROOT/'dist/MarioMix_Terraria_M07.html').read_text()
    def check(name,ok):
        checks.append({'name':name,'pass':bool(ok)})
        if not ok:raise AssertionError(name)
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        def load(test=True,w=1440,h=1000):
            page=browser.new_page(viewport={'width':w,'height':h})
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.route('http://**/*',lambda r:r.abort());page.route('https://**/*',lambda r:r.abort())
            text=html.replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">') if test else html
            page.set_content(text,wait_until='domcontentloaded',timeout=25000)
            page.wait_for_selector('#m06HelpButton');page.wait_for_timeout(400)
            if test:page.evaluate('window.__trioTest.ready');page.evaluate('window.__trioTest.r06AssetReady')
            return page
        normal=load(False)
        check('No forced help modal at first entry',not normal.locator('#m06Help').evaluate('(e)=>e.open'))
        check('Help entry is keyboard focusable',normal.locator('#m06HelpButton').evaluate('(e)=>e.tabIndex===0'))
        check('Player entry has no experiment button',normal.locator('#terraStageLauncherButton').count()==0 or not normal.locator('#terraStageLauncherButton').is_visible())
        check('Secondary journey status is collapsed',not normal.locator('.m06-journey').evaluate('(e)=>e.open'))
        check('One original status widget is retained',normal.locator('#stateLabel').count()==1)
        normal.screenshot(path=str(OUT/'M06-Menu-Desktop.png'),full_page=True)
        normal.locator('#m06HelpButton').click();check('User can open the named native dialog',normal.locator('#m06Help').evaluate('(e)=>e.open&&e.getAttribute("aria-labelledby")==="m06HelpTitle"'))
        check('Dialog starts focus at its title',normal.locator('#m06HelpTitle').evaluate('(e)=>e===document.activeElement'))
        check('Six short contextual cards',normal.locator('.m06-help-card').count()==6)
        normal.screenshot(path=str(OUT/'M06-Help-Desktop.png'),full_page=True)
        # Native modal containment, not a custom fake focus trap.
        for _ in range(12):normal.keyboard.press('Tab')
        check('Tab remains inside the open modal',normal.evaluate('!!document.activeElement.closest("#m06Help")'))
        normal.keyboard.press('Shift+Tab');check('Shift-Tab remains inside modal',normal.evaluate('!!document.activeElement.closest("#m06Help")'))
        normal.locator('.m06-feedback summary').click();normal.locator('#m06CopyFeedback').click();normal.wait_for_timeout(100)
        check('Clipboard failure gives a selectable fallback',normal.locator('.m06-copy-status').inner_text().startswith('剪贴板不可用') and normal.locator('#m06FeedbackText').evaluate('(e)=>e.selectionEnd>e.selectionStart'))
        report=normal.locator('#m06FeedbackText').input_value();check('Feedback includes version but no saved data',report.startswith('开发版本：0.4.2') and 'localStorage' not in report and 'e134fdee' not in report)
        normal.keyboard.press('Escape');normal.wait_for_timeout(60)
        check('Escape closes modal',not normal.locator('#m06Help').evaluate('(e)=>e.open'))
        check('Menu help restores its opener',normal.locator('#m06HelpButton').evaluate('(e)=>e===document.activeElement'))
        normal.locator('#m06DismissHelp').click();check('Optional first-visit strip dismisses without a forced tutorial',not normal.locator('.m06-first-steps').is_visible())
        normal.locator('#m06HelpButton').click();check('Permanent help remains after dismiss',normal.locator('#m06Help').evaluate('(e)=>e.open'));normal.locator('#m06HelpClose').click()
        normal.locator('#mainAction').click();normal.wait_for_timeout(350)
        normal.screenshot(path=str(OUT/'M06-Game-Desktop.png'),full_page=True)
        normal.close()
        page=load(True);page.evaluate('window.__trioTest.start()');page.locator('#m06HelpButton').click()
        check('Help owns pause only from playing',page.evaluate('window.__terraHelpTest.snapshot().ownsPause&&window.__trioTest.state().mode==="paused"'))
        before=page.evaluate('window.__trioTest.state().p');page.keyboard.press('KeyD');page.keyboard.press('Space');page.evaluate('window.__trioTest.native(20)')
        check('Help keys cannot move or jump the game',page.evaluate('window.__trioTest.state().p')==before)
        page.locator('[data-guide-device="gamepad"]').click();check('Gamepad guide shows current pad labels','A / ×' in page.locator('.m06-help-grid').inner_text())
        page.locator('#m06HelpClose').click();page.wait_for_timeout(60)
        check('Closing owned pause resumes',page.evaluate('window.__trioTest.state().mode==="playing"'))
        page.evaluate('window.__trioTest.pause()');page.locator('#m06HelpButton').click();check('Already paused game not owned',not page.evaluate('window.__terraHelpTest.snapshot().ownsPause'))
        page.locator('#m06HelpClose').click();page.wait_for_timeout(60);check('Closing help does not resume an existing pause',page.evaluate('window.__trioTest.state().mode==="paused"'))
        # The experimental driver follows the same pause/guide ownership contract.
        page.evaluate('window.__terraStageTest.launch("lab-platforms","lab-scout")')
        page.locator('#m06HelpButton').click();lab=page.evaluate('window.__terraStageTest.view()')
        check('Experimental host is paused by help',lab['status']=='paused')
        page.keyboard.press('KeyD');page.evaluate('window.__trioTest.native(10)')
        check('Experimental scene does not progress behind help',page.evaluate('window.__terraStageTest.view()')==lab)
        page.locator('#m06HelpClose').click();check('Experimental pause resumes only on explicit close',page.evaluate('window.__terraStageTest.view().status')=='running')
        page.evaluate('window.__terraStageTest.leave();window.__trioTest.start();window.__trioTest.pause()')
        # Change a genuine binding through the existing diagnostic adapter, then display that model.
        page.evaluate('window.__terraSettingsTest.bind("jump","keys","KeyY")')
        page.locator('#m06HelpButton').click();page.locator('[data-guide-device="keyboard"]').click()
        check('Guide reflects changed gameplay binding','Y' in page.locator('.m06-help-card').nth(1).inner_text())
        # Synthetic pagehide matches BFCache frozen semantics; not a real browser history test.
        page.evaluate('window.dispatchEvent(new PageTransitionEvent("pagehide",{persisted:true}))');page.wait_for_timeout(100)
        check('Page cache suspension closes help without auto-resume',not page.evaluate('window.__terraHelpTest.snapshot().open') and page.evaluate('window.__trioTest.state().mode==="paused"'))
        check('Persisted page keeps help alive',not page.evaluate('window.__terraHelpTest.snapshot().disposed'))
        page.locator('#m06HelpButton').click();check('Help listener still works after cache suspension',page.locator('#m06Help').evaluate('(e)=>e.open'));page.locator('#m06HelpClose').click()
        page.locator('#m05Focus').click();check('Display listener still works after cache suspension',not page.locator('.panel').is_visible());page.locator('#m05Focus').click()
        page.locator('#t21BindingButton').click();check('Settings has a named dialog',page.locator('#t21Bindings').get_attribute('aria-labelledby')=='t21BindingsTitle');page.locator('#t21BindClose').click()
        for w,h in [(1440,1000),(768,1000),(390,844),(320,700),(844,390)]:
            page.set_viewport_size({'width':w,'height':h});page.locator('#m06HelpButton').click();page.wait_for_timeout(80)
            rect=page.locator('#m06Help').bounding_box();layout=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');layouts.append(layout)
            check(f'Page fits width {w}',layout['scroll']<=w+1)
            check(f'Modal fits viewport {w}x{h}',rect['x']>=0 and rect['y']>=0 and rect['x']+rect['width']<=w+1 and rect['height']<=h+1)
            if w==390:page.screenshot(path=str(OUT/'M06-Help-Mobile.png'),full_page=True)
            page.locator('#m06HelpClose').click()
        page.set_viewport_size({'width':390,'height':844});page.locator('#m05Display summary').click();page.locator('#m05Pref-text').click();page.locator('#m06HelpButton').click()
        check('Large-menu preference still fits help',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
        page.locator('#m06HelpClose').click();page.evaluate('window.dispatchEvent(new PageTransitionEvent("pagehide",{persisted:false}))')
        check('Nonpersisted teardown removes owned nodes',page.locator('#m06Help').count()==0 and page.locator('#m06HelpButton').count()==0)
        page.close();browser.close()
    check('No uncaught script errors',not errors)
    report={'result':'pass','count':len(checks),'checks':checks,'pageErrors':errors,'layouts':layouts,'candidateSha256':hashlib.sha256((ROOT/'dist/MarioMix_Terraria_M07.html').read_bytes()).hexdigest(),'scope':'offline full candidate; native DOM and key events; synthetic persisted pagehide; no real HTTP/BFCache, Windows or physical device validation'}
    (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
