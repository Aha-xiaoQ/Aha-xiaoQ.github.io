"""M05 real game script + embedded assets in an offline DOM; no HTTP or device claim.
Read-only UI geometry tests use the original diagnostic controls. No CSP relaxation.
"""
from pathlib import Path
import json, shutil, hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.local/ui';OUT.mkdir(parents=True,exist_ok=True)
def main():
    checks=[];errors=[];html=(ROOT/'dist/MarioMix_Terraria_M07.html').read_text()
    def check(name,value):
        checks.append({'name':name,'pass':bool(value)})
        if not value:raise AssertionError(name)
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        def load(diagnostic=True,width=1440):
            page=b.new_page(viewport={'width':width,'height':1000})
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.route('http://**/*',lambda r:r.abort());page.route('https://**/*',lambda r:r.abort())
            t=html.replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">') if diagnostic else html
            page.set_content(t,wait_until='domcontentloaded',timeout=25000)
            page.wait_for_function('() => document.body.dataset.terraUi === \"m05\"',timeout=15000)
            if diagnostic:
                page.evaluate('window.__trioTest.ready');page.evaluate('window.__trioTest.r06AssetReady')
            page.wait_for_timeout(700)
            return page
        # Preview normal entry, without enabling the dev/test-only lab button.
        preview=load(False)
        check('Default entry has the new UI and one primary start button',preview.locator('body').get_attribute('data-terra-ui')=='m05' and preview.locator('#mainAction').count()==1)
        check('Default entry retains six inherited character cards',preview.locator('#heroPicker button').count()==6)
        preview.screenshot(path=str(OUT/'M05-Menu-Desktop.png'),full_page=True)
        preview.locator('#mainAction').click();preview.wait_for_timeout(650)
        check('Original start button enters gameplay',preview.locator('#overlay').evaluate('(e)=>e.hidden||getComputedStyle(e).display==="none"'))
        preview.screenshot(path=str(OUT/'M05-Game-Desktop.png'),full_page=True)
        preview.locator('#m05Focus').click();preview.wait_for_timeout(150)
        check('Focus hides only rail, keeps game canvas and exit control',not preview.locator('.panel').is_visible() and preview.locator('#game').is_visible() and preview.locator('#m05Focus').inner_text()=='退出专注')
        preview.screenshot(path=str(OUT/'M05-Focus-Desktop.png'),full_page=True)
        preview.locator('#m05Focus').click();check('Focus can be exited',preview.locator('.panel').is_visible())
        preview.locator('#t21BindingButton').click();check('Existing binding dialog opens',preview.locator('#t21Bindings').evaluate('(e)=>e.open'))
        preview.screenshot(path=str(OUT/'M05-Settings-Desktop.png'),full_page=True)
        preview.locator('#t21BindClose').click();preview.set_viewport_size({'width':390,'height':844});preview.wait_for_timeout(100)
        preview.screenshot(path=str(OUT/'M05-Game-Mobile.png'),full_page=True);preview.close()
        page=load(True);page.evaluate('window.__trioTest.start()')
        initial=page.evaluate('window.__trioTest.state().p')
        page.locator('#m05Display summary').click()
        page.locator('#m05Pref-text').click();check('Large menus use 20 CSS px',page.evaluate('getComputedStyle(document.querySelector("#t21Bindings table")).fontSize')=='20px')
        page.locator('#m05Pref-contrast').click();check('Contrast state applied',page.locator('body').get_attribute('data-terra-contrast')=='high')
        page.locator('#m05Pref-motion').focus();page.keyboard.press('Space');check('Keyboard can toggle the motion preference',page.locator('#m05Pref-motion').get_attribute('aria-pressed')=='true')
        after=page.evaluate('window.__trioTest.state().p');check('Display controls did not move the player',initial==after)
        check('Display controls did not enter pause or restart',page.evaluate('window.__trioTest.state().mode')=='playing')
        check('Reduced UI transitions disabled',page.evaluate('getComputedStyle(document.getElementById("m05Pref-motion")).transitionDuration')=='0s')
        page.keyboard.press('Escape');check('Escape closes display section, focuses game',not page.locator('#m05Display').evaluate('(e)=>e.open') and page.evaluate('document.activeElement.id')=='game')
        page.locator('#t21BindingButton').click();check('Settings still own pause',page.evaluate('window.__trioTest.state().mode')=='paused')
        rows=page.locator('#t21BindRows tr').count();check('All actions visible in settings',rows>=10)
        # Use real binding UI to change a currently unused key; popup lifecycle stays original.
        page.locator('#t21BindRows button[data-binding="jump"][data-source="keys"]').click();page.keyboard.press('u')
        check('Actual binding model updated from keyboard UI',page.evaluate('window.__terraSettingsTest.config().actions.jump.keys[0]')=='KeyU')
        page.locator('#t21BindClose').click();page.wait_for_function('() => document.querySelector(".m05-quick-guide").textContent.includes("U")');check('Quick hints follow saved binding rather than hardcoded keys','U' in page.locator('.m05-quick-guide').inner_text())
        check('Closing settings restores play without changing position',page.evaluate('window.__trioTest.state().mode')=='playing' and initial==page.evaluate('window.__trioTest.state().p'))
        # HUD and clickboxes share the same geometry, then use real click to select tool #2.
        page.evaluate('window.__trioTest.step(1,{})')
        page.locator('#t15HudHits button[data-t15-tool="1"]').click()
        check('Original clickable tool region remains usable',page.locator('#t15HudHits button[data-t15-tool="1"]').get_attribute('aria-pressed')=='true')
        check('Source disclaimer remains reachable',page.locator('.source-note').count()>=2)
        # Supported portrait widths and a low landscape viewport, normal and enlarged menus.
        layouts=[]
        for w,h in [(320,844),(390,844),(768,1024),(1440,1000),(844,390)]:
            page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100)
            layout=page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,ratio:document.querySelector("#game").getBoundingClientRect().width/document.querySelector("#game").getBoundingClientRect().height})')
            layouts.append(layout);check(f'No horizontal overflow {w}x{h}',layout['scroll']<=w+1)
            check(f'World aspect ratio preserved {w}',abs(layout['ratio']-16/15)<.03)
            page.locator('#t21BindingButton').click();page.wait_for_timeout(80)
            rect=page.locator('#t21Bindings').bounding_box();check(f'Large binding dialog fits viewport {w}',rect['x']>=0 and rect['x']+rect['width']<=w+1)
            page.locator('#t21BindClose').click()
        page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'M05-Game-Mobile-Large-Test.png'),full_page=True)
        page.close();b.close()
    report={'result':'pass' if not errors else 'fail','checks':checks,'count':len(checks),'pageErrors':errors,'layouts':layouts,'mode':'offline full M05 script; native DOM clicks and keyboard; remote requests blocked','candidateSha256':hashlib.sha256((ROOT/'dist/MarioMix_Terraria_M07.html').read_bytes()).hexdigest(),'unverified':['real HTTP/ESM','Windows','physical gamepads','audio listening','full natural playthrough','persistent storage refresh']}
    (OUT/'ui-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
    if errors:raise AssertionError(errors)
if __name__=='__main__':main()
