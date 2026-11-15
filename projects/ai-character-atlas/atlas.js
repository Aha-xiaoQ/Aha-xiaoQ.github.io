/* Display-only gallery: local curated files and the website's shared locale. */
(() => {
  'use strict';
  const cast=window.CAST, names={q:'Q 版',normal:'常规版',real:'真人版'};
  const $=id=>document.getElementById(id);
  if(!cast?.length || !$('art')) return;
  let current=cast[0], variant='q';
  const t=s=>globalThis.SITE_I18N?.translate(s)||s;
  function readHash(){
    const [id,v]=location.hash.slice(1).split('/');
    current=cast.find(c=>c.id===id)||cast[0]; variant=Object.hasOwn(names,v)?v:'q';
  }
  function render(){
    if(!current.assets[variant])variant='q';
    const c=current, asset=c.assets[variant], file='images/'+c.paths[variant], caption=t(c.name)+' · '+t(names[variant]);
    $('character-name').textContent=c.name;
    $('character-index').textContent=String(cast.indexOf(c)+1).padStart(2,'0')+' / '+c.id.toUpperCase();
    $('character-description').textContent=c.description;
    $('source-name').textContent=c.source;
    $('source').href=c.link;
    $('art').alt=caption;
    if($('art').getAttribute('src')!==file){$('image-error').hidden=true;$('art').src=file;}
    $('full-image').href=asset.main.original;$('image-link').href=asset.main.original;
    $('asset-id').textContent=asset.id;
    $('download-main').href=asset.main.original;
    $('download-bundle').href=asset.bundle;
    $('bundle-size').textContent='PNG · ZIP '+(asset.bundleBytes/1048576).toFixed(1)+' MB';
    if($('asset-license')){
      $('asset-license').textContent=t(c.license.label);
      $('asset-license-link').href='rights.html#'+c.id;
      $('character-archive').href='archive.html#'+c.id;
      $('character-archive').hidden=!['claude','doubao','deepseek'].includes(c.id);
    }
    $('variant-note').hidden=!asset.note;
    $('variant-note').textContent=asset.note||'';
    $('art').style.aspectRatio=asset.main.dimensions.join(' / ');
    $('stage-caption').textContent=caption;
    document.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===c.id)));
    document.querySelectorAll('[data-variant]').forEach(b=>{b.disabled=!c.assets[b.dataset.variant];b.setAttribute('aria-pressed',String(b.dataset.variant===variant));});
    const sheets=document.querySelector('.atlas-sheets');sheets.replaceChildren();
    for(const ref of asset.references){
      const el=document.createElement('figure'),link=document.createElement('a'),img=document.createElement('img'),label=document.createElement('figcaption');
      link.href=ref.original;link.target='_blank';link.rel='noopener';
      img.src='images/'+ref.preview;img.alt=caption+' · '+t(ref.label);img.loading='lazy';img.width=ref.dimensions[0];img.height=ref.dimensions[1];
      label.textContent=t(ref.label);link.append(img);el.append(link,label);sheets.append(el);
    }
    const extra=asset.references.length;
    $('extra-designs').hidden=!extra;
    document.querySelector('.atlas-sheets').classList.toggle('single-sheet',extra===1);
    $('atlas-announcement').textContent=t('已切换素材')+'：'+caption;
    globalThis.SITE_I18N?.apply();
  }
  function navigate(){history.replaceState(null,'','#'+current.id+'/'+variant);render();}
  $('cast-list').addEventListener('click',event=>{const b=event.target.closest('[data-character]');if(!b)return;current=cast.find(c=>c.id===b.dataset.character);navigate();});
  $('variant-nav').addEventListener('click',event=>{const b=event.target.closest('[data-variant]');if(!b)return;variant=b.dataset.variant;navigate();});
  $('art').addEventListener('error',()=>{$('image-error').hidden=false;});
  $('art').addEventListener('load',()=>{$('image-error').hidden=true;});
  window.addEventListener('hashchange',()=>{readHash();render();});
  document.addEventListener('site-language-change',render);
  readHash();render();
})();
