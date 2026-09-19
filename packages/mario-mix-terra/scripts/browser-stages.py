"""Complete candidate + real DOM events. Offline mode does not certify HTTP/ESM,
Windows, hardware input, licensed assets, or natural full-game completion."""
from pathlib import Path
import json, shutil, sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.local/stage-browser'

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    result={'mode':'offline-complete-candidate','checks':[], 'errors':[]}
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1280,'height':850})
        page=context.new_page()
        page.on('pageerror',lambda e:result['errors'].append(str(e)))
        page.route('https://**/*',lambda r:r.abort());page.route('http://**/*',lambda r:r.abort())
        html=(ROOT/'dist/MarioMix_Terraria_M07.html').read_text().replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">')
        page.set_content(html,wait_until='domcontentloaded',timeout=30000)
        page.wait_for_function('() => !!(window.__terraStageTest && window.__trioTest)',timeout=15000)
        page.evaluate('window.__trioTest.ready');page.wait_for_timeout(700)
        def check(name,expr):
            assert page.evaluate(expr), name
            result['checks'].append(name)
        page.locator('#terraStageLauncherButton').click()
        check('launcher opens', 'document.querySelector("#terraStageLauncher").open')
        page.locator('#terraStageSelect').select_option('lab-platforms')
        check('two character adapters selectable','document.querySelectorAll("#terraCharacterSelect option").length===2')
        page.locator('#terraCharacterSelect').select_option('lab-scout')
        check('chooser keyboard does not activate a legacy game', 'window.__terraStageTest.view().status==="idle"')
        page.locator('#terraStageDrafts').focus();page.keyboard.press('Space')
        check('native checkbox works while gameplay keys are isolated', 'document.querySelector("#terraStageDrafts").checked && window.__terraStageTest.view().status==="idle"')
        page.keyboard.press('Space')
        page.locator('#terraStageGo').click()
        check('real host activates custom stage','window.__terraStageTest.view().stageId==="lab-platforms"')
        check('launcher closes','!document.querySelector("#terraStageLauncher").open')
        x=page.evaluate('window.__terraStageTest.view().scene.p.x')
        page.keyboard.down('d');page.evaluate('window.__test.nativeStep(30)');page.keyboard.up('d')
        assert page.evaluate('window.__terraStageTest.view().scene.p.x')>x+20;result['checks'].append('physical keyboard dispatch reaches shared-action stage driver')
        page.keyboard.press('p');check('pause owns stage','window.__terraStageTest.view().status==="paused"')
        tick=page.evaluate('window.__terraStageTest.view().scene.tick');page.evaluate('window.__test.nativeStep(20)')
        assert page.evaluate('window.__terraStageTest.view().scene.tick')==tick;result['checks'].append('paused legacy ticks do not advance the extension')
        page.keyboard.press('p');check('resume','window.__terraStageTest.view().status==="running"')
        page.locator('#t21BindingButton').click();check('shared M02 settings opens','document.querySelector("#t21Bindings").open')
        check('settings also pauses extension','window.__terraStageTest.view().status==="paused"')
        page.locator('#t21BindClose').click();check('settings close restores owned pause','window.__terraStageTest.view().status==="running"')
        page.evaluate('window.__terraStageTest.step(15,{jump:true,x:1})')
        page.screenshot(path=str(OUT/'M03-Stage-Lab.png'),full_page=True)
        page.locator('#terraStageLauncherButton').click()
        check('return to chooser pauses active stage','window.__terraStageTest.view().status==="paused"')
        page.locator('#terraCharacterSelect').select_option('lab-runner');page.locator('#terraStageGo').click()
        check('new character owns a fresh independent scene','window.__terraStageTest.view().characterId==="lab-runner" && window.__terraStageTest.view().scene.coins===0')
        page.keyboard.press('c');check('menu exit disposes scene','window.__terraStageTest.view().status==="idle"')
        page.locator('#terraStageLauncherButton').click();page.locator('#terraStageSelect').select_option('terra-1-3');page.locator('#terraStageGo').click()
        check('legacy selected through catalog is actual third game','window.__terraStageTest.view().status==="idle" && window.__trioTest.state().hero==="sandboxTrio"')
        for width in [320,390,768,1440]:
            page.set_viewport_size({'width':width,'height':850});page.locator('#terraStageLauncherButton').click()
            check('launcher fits '+str(width),'document.documentElement.scrollWidth<=innerWidth')
            page.locator('#terraStageClose').click()
        browser.close()
    assert not result['errors'],result['errors']
    result['result']='pass';result['count']=len(result['checks'])
    (OUT/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
