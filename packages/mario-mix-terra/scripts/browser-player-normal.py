from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib
root=Path(__file__).resolve().parents[1];out=root/'.local/player-normal';out.mkdir(parents=True,exist_ok=True)
html=(root/'dist/MarioMix_Terraria_M07.html').read_text();errors=[];checks=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1024},device_scale_factor=1)
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.set_default_timeout(6000)
 page.route('**/*',lambda r:r.abort())
 # Normal player mode. No test attributes, changed bindings, game fixtures or injected notices.
 page.set_content(html,wait_until='load',timeout=15000)
 page.wait_for_selector('body[data-terra-ui="m07"]');page.wait_for_timeout(800)
 page.locator('#overlay:not(.hidden)').wait_for();page.screenshot(path=str(out/'Menu.png'))
 for hero,chapter in [('mario','1-1'),('bill','1-1'),('megaman','1-1'),('ryu','1-2'),('tank','1-2'),('sandboxTrio','1-3')]:
  page.locator(f'#heroPicker [data-hero="{hero}"]').click();page.locator('#mainAction').click();page.wait_for_timeout(160)
  assert page.locator('body').get_attribute('data-player-mode')=='playing', hero
  assert chapter in page.locator('.app > header .offline').text_content(), hero
  checks.append({'hero':hero,'expectedChapter':chapter,'mode':page.locator('body').get_attribute('data-player-mode'),'visiblePause':page.locator('#pauseButton').is_visible()})
  if hero!='sandboxTrio':
   page.locator('#charactersButton').click();page.locator('#m07ConfirmAccept').click();page.wait_for_timeout(120)
 # While normally running; all future snapshots pause using actual UI, not state manipulation.
 page.screenshot(path=str(out/'Game-Desktop.png'),full_page=True)
 page.locator('#m07OptionsButton').click();page.screenshot(path=str(out/'Settings.png'));page.locator('#m07OptionsClose').click()
 page.locator('#t21BindingButton').click();page.screenshot(path=str(out/'Bindings.png'));page.keyboard.press('Escape')
 page.locator('#m06HelpButton').click();page.screenshot(path=str(out/'Help.png'));page.keyboard.press('Escape')
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(180);page.screenshot(path=str(out/'Game-Mobile.png'),full_page=True)
 page.locator('#charactersButton').click();page.locator('#m07ConfirmAccept').click();page.wait_for_timeout(100);page.screenshot(path=str(out/'Menu-Mobile.png'))
 checks.append({'ordinaryPlayerHasNoDevLauncher':not page.locator('#terraStageLauncherButton').count() or not page.locator('#terraStageLauncherButton').is_visible()})
 browser.close()
result={'candidateSha256':hashlib.sha256(html.encode()).hexdigest(),'scope':'Normal player mode, default bindings, complete embedded candidate, offline network blocked. Six starts, not complete playthrough.','checks':checks,'pageErrors':errors}
(out/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2));assert not errors
assert checks[-1]['ordinaryPlayerHasNoDevLauncher']
