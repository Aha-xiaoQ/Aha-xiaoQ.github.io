"""Check public candidate hides experiment access. Offline DOM, no HTTP/real-device claim."""
from pathlib import Path
import json,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent

def main():
    out=ROOT/'.local/publication-browser';out.mkdir(parents=True,exist_ok=True)
    checks=[];errors=[]
    html=(ROOT/'dist/MarioMix_Terraria_M07.html').read_text()
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':1280,'height':850});page.on('pageerror',lambda e:errors.append(str(e)))
        page.route('https://**/*',lambda q:q.abort());page.route('http://**/*',lambda q:q.abort())
        page.set_content(html,wait_until='domcontentloaded');page.wait_for_selector('#terraStageLauncherButton',state='attached')
        assert page.locator('#terraStageLauncherButton').is_hidden();checks.append('Ordinary player build hides prototype stage entry')
        assert page.evaluate('typeof window.__terraStageTest')=='undefined';checks.append('Ordinary build does not expose stage developer test interface')
        assert page.locator('#charactersButton').is_visible();checks.append('Existing character selector remains accessible')
        page.close()
        page=browser.new_page(viewport={'width':1280,'height':850});page.on('pageerror',lambda e:errors.append(str(e)))
        page.route('https://**/*',lambda q:q.abort());page.route('http://**/*',lambda q:q.abort())
        page.set_content(html.replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">'),wait_until='domcontentloaded')
        page.wait_for_function('() => !!(window.__terraStageTest)');assert page.locator('#terraStageLauncherButton').is_visible();checks.append('Explicit test context keeps stage lab usable')
        page.locator('#terraStageLauncherButton').click();assert page.locator('#terraStageSelect').is_visible();checks.append('Lab launcher remains interactive')
        assert not errors;checks.append('No uncaught script errors in public or explicit test context')
        browser.close()
    result={'passed':len(checks),'checks':checks,'errors':errors,'scope':'Real full-candidate DOM, network blocked. data-test used to opt into lab. Actual ?dev=1 URL, natural play, physical devices and HTTP resources are not validated.'}
    (out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
