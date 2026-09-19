import {wireShowcase} from '../showcase/wire.mjs';
/** Idempotent progressive enhancement wiring; preserve every existing page's body and native URLs. */
export function wireExperience(input){
 let s=input.replace(/<link\b[^>]*data-experience-css[^>]*>\s*/g,'').replace(/<script\b[^>]*data-experience-module[^>]*>[\s\S]*?<\/script>\s*/g,'');
 s=s.replace(/\s*<\/head>/i,'\n<link rel="stylesheet" data-experience-css href="/assets/experience/site-experience.css?v=site-r23">\n<script type="module" data-experience-module src="/assets/experience/runtime.mjs?v=site-r23"></script>\n</head>');
 s=s.replace(/<header\b[\s\S]*?<\/header>/i,header=>header.includes('data-site-search')?header:header.replace('</nav>','</nav><a class="q-search-launch" data-site-search href="/search/" aria-label="搜索全站">搜索</a>'));
 s=s.replace(/(assets\/(?:site-router|site-shell|promo)\.js)(?:\?[^"']*)?/g,'$1?v=workshop-r18');
 s=s.replace(/<link\b[^>]*data-journey-css[^>]*>\s*/g,'').replace(/<script\b[^>]*data-journey-(?:module|core|support)[^>]*>[\s\S]*?<\/script>\s*/g,'');
 s=s.replace(/\s*<\/head>/i,'\n<link rel="stylesheet" data-journey-css href="/assets/launch/journey.css?v=launch-r19">\n<script data-journey-support src="/content/game-support.js?v=launch-r19"></script>\n<script data-journey-core src="/assets/launch/journey.js?v=launch-r19"></script>\n<script type="module" data-journey-module src="/assets/launch/runtime.mjs?v=launch-r19"></script>\n</head>');
 s=s.replace(/(assets\/(?:site-router|site-shell)\.js)(?:\?[^"']*)?/g,'$1?v=workshop-r19');
 s=s.replace(/<link\b[^>]*data-chapters-css[^>]*>\s*/g,'');
 s=s.replace(/\s*<\/head>/i,'\n<link rel="stylesheet" data-chapters-css href="/assets/chapters/chapters.css?v=worlds-r21">\n</head>');
 s=s.replace(/(assets\/(?:site-router|site-shell)\.js)(?:\?[^"']*)?/g,'$1?v=workshop-r21');
 s=s.replace(/(assets\/(?:site-router|site-shell)\.js)(?:\?[^"']*)?/g,'$1?v=site-r23');
 return wireShowcase(s);
}
