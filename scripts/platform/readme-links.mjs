#!/usr/bin/env node
/** README entry languages are explicit; filenames are not a browser preference.
 * Also used by the video block generator so rebuilding cannot undo the choice.
 * Independent works and downloadable files retain their original URLs.
 */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readOptional} from '../lib/safe-path.mjs';
import {decodeAttribute} from '../lib/html-resources.mjs';
import {renderMarkdown} from '../../assets/journal/markdown.mjs';
export const SITE_ORIGIN = 'https://aha-xiaoq.github.io';
export const README_LOCALES = Object.freeze({'README.md':'zh', 'README.en.md':'en'});
const repositoryBase = 'https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/blob/main/';
const root = fileURLToPath(new URL('../../', import.meta.url));

export function isLocalizedPage(href) {
  let url;
  try { url = new URL(href, SITE_ORIGIN); } catch { return false; }
  if (url.origin !== SITE_ORIGIN || url.username || url.password) return false;
  const p = url.pathname;
  // Those entries are independently maintained applications, not the site's locale UI.
  if (/^\/(?:packages|downloads|assets|content|experiments)(?:\/|$)/.test(p) ||
      /\/play(?:\.html)?$/.test(p) || /^\/tools\/quina-optics(?:\/|$)/.test(p)) return false;
  return /\/$/.test(p) || /\.html$/.test(p);
}

export function readmeSiteURL(href, locale) {
  if (!['zh', 'en'].includes(locale)) throw Error('Unsupported README locale: ' + locale);
  if (typeof href !== 'string' || !href) throw Error('Expected a README link');
  if (!isLocalizedPage(href)) return href;
  const url = new URL(href, SITE_ORIGIN);
  url.searchParams.set('lang', locale);
  return url.href;
}

export function readmeLinks(text) {
  if (typeof text !== 'string') throw Error('Expected README Markdown');
  const html = renderMarkdown(text.replace(/<!--[\s\S]*?-->/g, ''), {
    resolveLink: value => new URL(value, repositoryBase).href,
  });
  // Only anchors emitted by our HTML-free Markdown renderer; code remains escaped.
  return [...html.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)].map(match => ({
    href: decodeAttribute(match[1]),
    label: decodeAttribute(match[2].replace(/<[^>]*>/g, '')).trim(),
  }));
}

export function assertReadmeLanguage(text, file) {
  const locale = README_LOCALES[file];
  if (!locale) throw Error('Unregistered README: ' + file);
  const links = readmeLinks(text), pages = [];
  for (const link of links) {
    const url = new URL(link.href);
    if (url.origin !== SITE_ORIGIN) continue;
    if (isLocalizedPage(link.href)) {
      if (!link.label || url.searchParams.getAll('lang').length !== 1 || url.searchParams.get('lang') !== locale) {
        throw Error(`${file}: expected lang=${locale} for "${link.label}": ${link.href}`);
      }
      pages.push({...link, locale});
    } else if (url.searchParams.has('lang')) {
      throw Error(`${file}: independent work or download must keep its original URL: ${link.href}`);
    }
  }
  for (const p of ['/', '/notes/']) {
    const matches = pages.filter(link => new URL(link.href).pathname === p);
    if (matches.length !== 1) throw Error(`${file}: expected one visible ${p} entry`);
  }
  const switchLabel = locale === 'zh' ? 'English' : '简体中文';
  const switchFile = locale === 'zh' ? 'README.en.md' : 'README.md';
  const switches = links.filter(link => link.label === switchLabel);
  if (switches.length !== 1 || switches[0].href !== repositoryBase + switchFile) {
    throw Error(`${file}: language switch must open ${switchFile}, not switch the website entry`);
  }
  return pages;
}

export function checkReadmeLinks(workspace = root) {
  const entries = Object.entries(README_LOCALES).map(([file, locale]) => {
    const bytes = readOptional(workspace, file);
    if (!bytes) throw Error('Missing README: ' + file);
    return {file, locale, links: assertReadmeLanguage(bytes.toString('utf8'), file)};
  });
  const destinations = entry => entry.links.map(link => {
    const u = new URL(link.href); u.searchParams.delete('lang'); return u.href;
  }).sort();
  if (JSON.stringify(destinations(entries[0])) !== JSON.stringify(destinations(entries[1]))) {
    throw Error('Chinese and English README website destinations differ beyond language');
  }
  return entries;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw Error('Usage: node scripts/platform/readme-links.mjs');
    console.log(checkReadmeLinks().map(({file, locale, links}) => ({file, locale, websiteLinks: links.length})));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
