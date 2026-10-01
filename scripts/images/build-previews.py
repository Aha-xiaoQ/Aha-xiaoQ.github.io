from pathlib import Path
from PIL import Image
import json,hashlib,shutil
r=Path(__file__).resolve().parents[2]; dest=r/'assets/previews';dest.mkdir(exist_ok=True)
manifest={'schemaVersion':1,'encoder':'Pillow 12.3.0 / WebP quality 94 method 6','files':[]}
def preview(rel,name,width=None,crop=None,lossless=False):
 p=r/rel;im=Image.open(p); original=im.size
 if crop:
  assert im.size==(1536,2288), 'Sprite grid changed; review frame dimensions before rebuilding'
  im=im.crop(crop)
 if width and im.width>width: im=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
 out=(r/'assets/lab' if name in ['world-execute-me','bad-apple'] else dest)/(name+'.webp');im.save(out,'WEBP',quality=94,method=6,lossless=lossless)
 manifest['files'].append({'source':rel,'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourceBytes':p.stat().st_size,'sourceDimensions':original,'output':out.relative_to(r).as_posix(),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'dimensions':im.size,'lossless':lossless,'crop':crop})
 return out.relative_to(r).as_posix()
games={'mario-mix':'games/mario-mix/cover.jpg','mario-mix-2':'games/mario-mix-2/cover.jpg','mario-mix-3':'games/mario-mix-3/cover.png','mario-mix-4':'games/mario-mix-4/cover.png','mario-classic':'assets/games/mario-classic-cover.jpg','pipebound':'assets/games/pipebound-cover.jpg'}
variants={rel:[{'src':preview(rel,key+'-'+str(w),w),'width':w} for w in [640,1280]] for key,rel in games.items()}
preview('assets/backgrounds/bg-about-phone-teardown-r4.webp','about-scene')
preview('projects/q-mimi/spritesheet.webp','q-mimi-first-row',crop=(0,0,1536,208),lossless=True)
preview('tools/quina-optics/assets/preview.png','quina-optics',1280,lossless=True)
for key in ['world-execute-me','bad-apple']:preview('assets/lab/'+key+'-cover.jpg',key,1280)
(r/'content/image-previews.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
