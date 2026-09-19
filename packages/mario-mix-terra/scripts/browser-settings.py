"""M02 settings interaction checks. Executes the full candidate in an offline DOM.
External requests are blocked; no policy workarounds. Not HTTP/ESM or device acceptance.
Requires preinstalled Python Playwright + Chromium. No automatic install.
"""
from pathlib import Path
import argparse,json,shutil,hashlib
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'.local/browser-settings'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--chromium',default=shutil.which('chromium'));args=ap.parse_args()
 OUT.mkdir(exist_ok=True,parents=True);checks=[];errors=[]
 def check(label,ok):
  checks.append({'name':label,'passed':bool(ok)})
  if not ok: raise AssertionError(label)
 with sync_playwright() as p:
  opts={'headless':True,'args':['--no-sandbox']}
  if args.chromium:opts['executable_path']=args.chromium
  browser=p.chromium.launch(**opts);page=browser.new_page(viewport={'width':1280,'height':800})
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://**/*',lambda r:r.abort());page.route('http://**/*',lambda r:r.abort())
  text=(ROOT/'dist/MarioMix_Terraria_M07.html').read_text().replace('<html lang="zh-CN">','<html lang="zh-CN" data-test="1">')
  page.set_content(text,wait_until='domcontentloaded',timeout=25000)
  page.wait_for_function('() => !!(window.__terraSettingsTest && window.__trioTest)',timeout=15000)
  page.evaluate('window.__trioTest.ready');page.evaluate('window.__trioTest.r06AssetReady');page.wait_for_timeout(400)
  page.evaluate('window.__trioTest.start()')
  page.locator('#t21BindingButton').click()
  check('dialog renders 15 action rows',page.locator('#t21BindRows tr').count()==15)
  check('one owned polling resource',page.evaluate('__terraSettingsTest.session().resources')==1)
  check('reopening already-open settings is idempotent',page.evaluate('__terraSettingsTest.open()')==False)
  check('dialog buttons have accessible action names',page.locator('[data-binding="jump"][data-source="keys"]').get_attribute('aria-label').startswith('跳跃'))
  page.locator('[data-binding="jump"][data-source="keys"]').click();page.keyboard.press('t')
  check('real keyboard capture binds KeyT',page.evaluate('__terraSettingsTest.config().actions.jump.keys')==['KeyT'])
  page.locator('[data-binding="attack"][data-source="keys"]').click();page.keyboard.press('t')
  check('conflicting keyboard assignment is rejected',page.evaluate('__terraSettingsTest.config().actions.attack.keys')!=['KeyT'])
  check('conflict names action owner','已被' in page.locator('#t21BindingStatus').inner_text())
  page.locator('[data-binding="jump"][data-source="keys"]').click();page.keyboard.press('Escape')
  check('Escape first cancels capture and keeps settings open',page.evaluate('__terraSettingsTest.capture().active===null && document.getElementById("t21Bindings").open'))
  page.keyboard.press('Escape')
  check('Escape without capture closes and releases poll',page.evaluate('!__terraSettingsTest.session().open && __terraSettingsTest.session().resources===0'))
  page.locator('#t21BindingButton').click();page.locator('#t21BindReset').click()
  check('reset restores shipped jump keys',page.evaluate('__terraSettingsTest.config().actions.jump.keys')==['Space','KeyK','KeyZ'])
  exported=page.evaluate('__terraSettingsTest.config()');page.evaluate('(d)=>__terraSettingsTest.load(d)',exported)
  check('default configuration survives import exactly',page.evaluate('__terraSettingsTest.config()')==exported)
  before=page.evaluate('__terraSettingsTest.config()')
  invalid={**before,'actions':{**before['actions'],'jump':{'keys':[],'pad':[0]}}}
  check('failed load is reported without partial state',page.evaluate('d=>{try{__terraSettingsTest.load(d);return false;}catch{return true;}}',invalid) and page.evaluate('__terraSettingsTest.config()')==before)
  page.locator('[data-binding="mount"][data-source="pad"]').click()
  result=page.evaluate('()=>{__terraSettingsTest.poll([]);const p=Array(32).fill(false);p[20]=true;return __terraSettingsTest.poll(p);}')
  check('virtual pad edge binds selected action',result and result['ok'] and page.evaluate('__terraSettingsTest.config().actions.mount.pad')==[20])
  check('same held button does not repeatedly bind',page.evaluate('()=>{const p=Array(32).fill(false);p[20]=true;return __terraSettingsTest.poll(p)===null;}'))
  page.locator('#t21BindReset').click();page.locator('#t21BindClose').click()
  check('native dialog close cleans lifetime',page.evaluate('()=>{__terraSettingsTest.open();document.getElementById("t21Bindings").close();return true;}'))
  page.wait_for_timeout(50);check('native close leaves no session timer',page.evaluate('__terraSettingsTest.session().resources')==0)
  page.evaluate('()=>{for(let i=0;i<30;i++){__terraSettingsTest.open();__terraSettingsTest.close();}}')
  check('30 open/close cycles leave no poll resource',page.evaluate('__terraSettingsTest.session().resources')==0)
  check('repeated rendering keeps only one dialog and table',page.locator('#t21Bindings').count()==1 and page.locator('#t21BindRows').count()==1)
  check('persistent UI listener count stays bounded',page.evaluate('__terraSettingsTest.view().resources')==10)
  # Late imports belong to one overlay generation; controlled delayed file object.
  page.evaluate('''()=>{__terraSettingsTest.open();const file=document.getElementById('t21BindFile');const d=__terraSettingsTest.config();d.actions.jump.keys=['KeyY'];window.__lateConfig=d;Object.defineProperty(file,'files',{configurable:true,get:()=>[{size:200,text:()=>new Promise(r=>window.__resolveFile=r)}]});file.dispatchEvent(new Event('change'));}''')
  page.evaluate('__terraSettingsTest.close();__terraSettingsTest.open();window.__resolveFile(JSON.stringify(window.__lateConfig));');page.wait_for_timeout(60)
  check('late file import cannot affect a reopened session',page.evaluate('__terraSettingsTest.config().actions.jump.keys')!=['KeyY'])
  for width in [320,390,768,1280]:
   page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(40)
   check('settings layout fits viewport '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
  page.screenshot(path=str(OUT/'settings-desktop.png'),full_page=True)
  page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'settings-mobile.png'),full_page=True)
  page.evaluate('__terraSettingsTest.close();');check('all settings checks have no uncaught script errors',not errors)
  browser.close()
 report={'result':'pass','mode':'offline-full-candidate-with-DOM-events','checks':checks,'pageErrors':errors,'candidateSha256':hashlib.sha256((ROOT/'dist/MarioMix_Terraria_M07.html').read_bytes()).hexdigest(),'scope':'Real DOM events, full candidate, embedded game assets. Pad samples and delayed File are controlled fixtures. No real gamepad, persistent storage, HTTP/ESM, audio listening or natural completion claim.'}
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
