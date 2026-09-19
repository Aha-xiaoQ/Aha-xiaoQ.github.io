"""Author-automated fresh-copy contribution exercise, not a real external PR.
Creates data with the CLI, leaves all src files unchanged, and selects it via actual DOM.
Uses offline full candidate. Requires Node, Python Playwright and Chromium already installed.
"""
from pathlib import Path
import hashlib,json,shutil,subprocess,tempfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent

def main():
    out=ROOT/'.local/new-content';out.mkdir(parents=True,exist_ok=True)
    checks=[];errors=[]
    with tempfile.TemporaryDirectory(prefix='terra-new-content-') as temp:
        r=Path(temp)/'project'
        shutil.copytree(ROOT,r,ignore=shutil.ignore_patterns('.local','dist','.git','node_modules','SOURCE_SHA256SUMS.txt'))
        def digest():
            return {str(p.relative_to(r)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (r/'src').rglob('*') if p.is_file()}
        before=digest()
        def run(*args):subprocess.run([shutil.which('node'),*args],cwd=r,check=True,capture_output=True,text=True,timeout=45)
        run('scripts/stages.mjs','--new','--id','review-level','--title','内容接入自动验证','--apply')
        run('scripts/stages.mjs','--new','--kind','character','--id','review-hero','--title','匿名角色配置','--apply')
        f=r/'content/extensions/stages/review-level/stage.json';d=json.loads(f.read_text());d['characters'].append('review-hero');f.write_text(json.dumps(d,ensure_ascii=False,indent=2))
        run('scripts/stages.mjs');run('scripts/build.mjs')
        assert before==digest();checks.append('CLI and manifest edits leave every src byte unchanged')
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1280,'height':850});page.on('pageerror',lambda e:errors.append(str(e)))
            page.route('https://**/*',lambda q:q.abort());page.route('http://**/*',lambda q:q.abort())
            h=(r/'dist/MarioMix_Terraria_M07.html').read_text().replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">')
            page.set_content(h,wait_until='domcontentloaded');page.wait_for_function('() => !!(window.__terraStageTest)');page.wait_for_timeout(500)
            page.locator('#terraStageLauncherButton').click()
            assert page.locator('#terraStageSelect option[value="review-level"]').count()==0;checks.append('new drafts are hidden by default')
            page.locator('#terraStageDrafts').check();page.locator('#terraStageSelect').select_option('review-level');page.locator('#terraCharacterSelect').select_option('review-hero');checks.append('anonymous new stage and character appear with explicit draft opt-in')
            page.locator('#terraStageGo').click();v=page.evaluate('window.__terraStageTest.view()');assert v['stageId']=='review-level' and v['characterId']=='review-hero';checks.append('real host launches new data without a core switch statement')
            x=v['scene']['p']['x'];page.keyboard.down('d');page.evaluate('window.__test.nativeStep(30)');page.keyboard.up('d');assert page.evaluate('__terraStageTest.view().scene.p.x')>x+10;checks.append('physical keyboard event advances the new scene')
            page.keyboard.press('c');assert page.evaluate('__terraStageTest.view().status')=='idle';checks.append('new scene exits through the shared menu path')
            browser.close()
    assert not errors;checks.append('no uncaught errors in fresh-copy browser flow')
    report={'result':'pass','checks':checks,'errors':errors,'scope':'Author-automated fresh-copy exercise, actual CLI/build/DOM, original geometric sample content; not a real external contributor or original 1-4, no HTTP/Windows/device acceptance.'}
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
