/** Shared static wiring. The three files are content-independent and route-neutral. */
export function wireShowcase(input) {
  let s = input.replace(/<link\b[^>]*data-showcase-css[^>]*>\s*/g,'').replace(/<script\b[^>]*data-showcase-(?:core|support)[^>]*>[\s\S]*?<\/script>\s*/g,'');
  if(!/<\/head>/i.test(s)) throw Error('Missing head for showcase assets');
  s=s.replace(/\s*<\/head>/i,'\n<link rel="stylesheet" data-showcase-css href="/assets/ui/site-showcase.css?v=showcase-r25">\n<script data-showcase-support src="/content/about-support.js?v=showcase-r25"></script>\n<script data-showcase-core src="/assets/ui/site-showcase.js?v=showcase-r25"></script>\n</head>');
  return s.replace(/(assets\/(?:site-shell|workshop-cards|launch\/journey)\.js)(?:\?[^"']*)?/g,'$1?v=showcase-r25');
}
