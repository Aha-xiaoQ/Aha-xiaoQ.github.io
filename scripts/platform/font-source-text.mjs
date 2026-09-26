/** Extract potential display strings without executing JavaScript.
 * RegExp syntax, comments and escaped source notation are not rendered glyphs.
 * This is deliberately conservative for ordinary string values. The two known
 * locale lookup maps are different: keys match source text, values are output.
 * Chinese output of keyed messages and actual page text are still collected.
 */
import {parse} from './vendor/acorn/acorn.mjs';

/** HTML entities only. Never interpret a literal backslash-u in rendered text. */
export function decodeEntities(source) {
  if (typeof source !== 'string') throw new TypeError('Font text must be a string');
  const named = {nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
  return source.replace(/&#(?:x([0-9a-f]+)|(\d+));?|&(nbsp|amp|lt|gt|quot|apos);/gi,
    (raw,hex,decimal,name) => {
      if (name) return named[name.toLowerCase()];
      const n = parseInt(hex || decimal, hex ? 16 : 10);
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff)
        ? String.fromCodePoint(n) : '\ufffd';
    });
}
function member(node, object, property) {
  return node?.type === 'MemberExpression' && node.object?.type === 'Identifier' &&
    node.object.name === object && (node.computed
      ? node.property.type === 'Literal' && node.property.value === property
      : node.property.type === 'Identifier' && node.property.name === property);
}
function unwrapFrozen(node) {
  if (node?.type === 'CallExpression' && member(node.callee,'Object','freeze') &&
      node.arguments.length === 1) return node.arguments[0];
  return node;
}
function propertyName(node) {
  return node?.type === 'Property' && !node.computed
    ? node.key.type === 'Identifier' ? node.key.name : node.key.value : undefined;
}
function parseSource(source, file) {
  if (typeof source !== 'string') throw new TypeError('Font JavaScript input must be a string');
  try { return parse(source,{ecmaVersion:'latest',sourceType:'module',allowHashBang:true}); }
  catch (moduleError) {
    // Ordinary classic scripts may contain legacy octal escapes or with().
    try { return parse(source,{ecmaVersion:'latest',sourceType:'script',allowHashBang:true}); }
    catch { throw new Error('Cannot parse font corpus JavaScript: '+file+': '+moduleError.message); }
  }
}

export function javascriptText(source, {file='<JavaScript>'}={}) {
  const ast = parseSource(source,file), strings=[];
  const add = value => { if (typeof value === 'string') strings.push(decodeEntities(value)); };
  function mapValues(node) {
    node=unwrapFrozen(node);
    // Unknown shapes use the ordinary conservative scan, never an empty result.
    if (node?.type !== 'ObjectExpression') { walk(node); return; }
    for (const prop of node.properties) {
      if (prop.type === 'Property' && !prop.computed && prop.kind === 'init' && !prop.method) {
        walk(prop.value); // dictionary lookup key is not output text
      } else walk(prop);
    }
  }
  function localeMessages(node) {
    node=unwrapFrozen(node);
    if (node?.type !== 'ObjectExpression') { walk(node); return; }
    for (const prop of node.properties) {
      if (propertyName(prop)==='en' && prop.kind==='init' && !prop.method) mapValues(prop.value);
      else walk(prop);
    }
  }
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const item of node) walk(item); return; }
    if (node.type==='AssignmentExpression' && node.operator==='=') {
      if (member(node.left,'globalThis','SITE_EN')) { mapValues(node.right); return; }
      if (member(node.left,'globalThis','SITE_LOCALE_MESSAGES')) { localeMessages(node.right); return; }
    }
    if (node.type==='Literal') {
      if (!node.regex) add(node.value); // Acorn cooks string escapes once; RegExp stays RegExp
      return;
    }
    if (node.type==='TemplateLiteral') {
      for (const part of node.quasis) add(part.value.cooked ?? part.value.raw);
      for (const expression of node.expressions) walk(expression);
      return;
    }
    if (node.type==='TaggedTemplateExpression' && member(node.tag,'String','raw')) {
      for (const part of node.quasi.quasis) add(part.value.raw);
      for (const expression of node.quasi.expressions) walk(expression);
      return;
    }
    if ((node.type==='NewExpression' || node.type==='CallExpression') &&
        node.callee?.type==='Identifier' && node.callee.name==='RegExp') {
      // Only literal pattern/flag arguments are classified as pattern syntax.
      // Expressions are still visited in case they contain other display copy.
      for (const argument of node.arguments) {
        if (argument.type==='Literal' && typeof argument.value==='string') continue;
        if (argument.type==='TemplateLiteral' && !argument.expressions.length) continue;
        walk(argument);
      }
      return;
    }
    for (const [key,value] of Object.entries(node)) {
      if (key==='start' || key==='end' || key==='loc' || key==='raw') continue;
      if (value && typeof value==='object') walk(value);
    }
  }
  walk(ast);
  return strings.join('\n');
}

/** JSON is decoded once. Keep ordinary map keys too: applications may display them. */
export function jsonText(source,{file='<JSON>'}={}) {
  let data;
  try { data=JSON.parse(source); }
  catch (error) { throw new Error('Cannot parse font corpus JSON: '+file+': '+error.message); }
  const strings=[];
  function walk(value) {
    if (typeof value==='string') strings.push(decodeEntities(value));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value==='object') for(const [key,item] of Object.entries(value)) {
      walk(key); walk(item);
    }
  }
  walk(data);
  return strings.join('\n');
}
