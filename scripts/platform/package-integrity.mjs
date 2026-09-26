#!/usr/bin/env node
/** Canonical transport manifest: distinct from the schema-v2 source delta.
 * Pure entry checks + an explicitly read-only directory CLI. No network or Git.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const INTEGRITY_SCHEMA_VERSION = 1;
const INDEX = 'integrity.json';
const REQUIRED = ['bootstrap.ps1', 'update.mjs', 'manifest.json', 'START.cmd', 'CHECK_ONLY.cmd'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { throw new Error('Package integrity: ' + message); };
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);

export function validatePackagePath(value) {
  if (typeof value !== 'string' || !value || value.length > 512 ||
      /[\\:\x00-\x1f\x7f]/u.test(value) || value.startsWith('/') ||
      value.split('/').some(p => !p || p === '.' || p === '..' || /[ .]$/u.test(p) ||
        /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p))) {
    fail('unsafe file path: ' + String(value));
  }
  return value;
}

/** Never coerce a dictionary, an empty list, or a schema-v2 delta into v1. */
export function validateIntegrity(index) {
  if (!object(index) || index.schemaVersion !== INTEGRITY_SCHEMA_VERSION) {
    fail('integrity.json requires schemaVersion: 1 (not the source-delta version)');
  }
  if (!Array.isArray(index.files) || !index.files.length || index.files.length > 20000) {
    fail('files must be a nonempty array of {path, sha256} records');
  }
  const seen = new Set();
  for (const row of index.files) {
    if (!object(row)) fail('invalid file record');
    const p = validatePackagePath(row.path), key = p.toLowerCase();
    if (key === INDEX || seen.has(key)) fail('duplicate, case-colliding or self-referencing file: ' + p);
    if (typeof row.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(row.sha256)) fail('invalid SHA-256: ' + p);
    seen.add(key);
  }
  for (const p of REQUIRED) if (!index.files.some(x => x.path === p)) fail('missing startup record: ' + p);
  return index;
}

function entriesMap(entries, allowIndex) {
  if (!Array.isArray(entries) || entries.length > 20001) fail('invalid entries');
  const out = new Map(), seen = new Set();
  for (const pair of entries) {
    if (!Array.isArray(pair) || pair.length !== 2) fail('invalid entry pair');
    const [p, b] = pair; validatePackagePath(p);
    if (!Buffer.isBuffer(b)) fail('file bytes must be a Buffer: ' + p);
    if (seen.has(p.toLowerCase())) fail('duplicate or case-colliding archive file: ' + p);
    if (!allowIndex && p.toLowerCase() === INDEX) fail('remove old integrity.json before generating a new manifest');
    seen.add(p.toLowerCase()); out.set(p, b);
  }
  return out;
}

/** Used by the normal packer and the repair-package producer. Hash final CRLF bytes. */
export function createIntegrity(entries) {
  const files = [...entriesMap(entries, false)].map(([p, b]) => ({path: p, sha256: digest(b)}));
  files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return validateIntegrity({schemaVersion: INTEGRITY_SCHEMA_VERSION, files});
}

/** Verifies exact closure as well as hashes: no unchecked helper or payload file. */
export function verifyIntegrityEntries(entries) {
  const all = entriesMap(entries, true), bytes = all.get(INDEX);
  if (!bytes) fail('missing integrity.json');
  let index;
  try { index = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes)); }
  catch { fail('integrity.json must be valid UTF-8 JSON'); }
  validateIntegrity(index);
  if (index.files.length !== all.size - 1) fail('file list does not cover the complete package');
  let totalBytes = 0;
  for (const row of index.files) {
    const b = all.get(row.path);
    if (!b) fail('missing file: ' + row.path);
    if (digest(b) !== row.sha256) fail('SHA-256 mismatch: ' + row.path);
    totalBytes += b.length;
  }
  return {schemaVersion: INTEGRITY_SCHEMA_VERSION, files: index.files.length, bytes: totalBytes,
    ok: true, scope: 'Transport format and exact file hashes only; not site verification or push approval'};
}

export function readPackageEntries(root) {
  root = path.resolve(root);
  // Reject a linked root or ancestor before recursing into an untrusted bundle.
  let at = root;
  while (true) {
    const s = fs.lstatSync(at);
    if (s.isSymbolicLink() || !s.isDirectory()) fail('unsafe package root/ancestor');
    const parent = path.dirname(at); if (parent === at) break; at = parent;
  }
  const entries = [];
  function walk(rel) {
    const dir = path.join(root, rel);
    for (const name of fs.readdirSync(dir).sort()) {
      const p = rel ? rel + '/' + name : name; validatePackagePath(p);
      const target = path.join(root, p), s = fs.lstatSync(target);
      if (s.isSymbolicLink()) fail('symbolic link in package: ' + p);
      if (s.isDirectory()) walk(p);
      else if (s.isFile()) {
        if (entries.length >= 20001) fail('too many package files');
        entries.push([p, fs.readFileSync(target)]);
      } else fail('not a regular package file: ' + p);
    }
  }
  walk(''); return entries;
}
export const verifyPackageDirectory = root => verifyIntegrityEntries(readPackageEntries(root));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--check') {
      fail('Usage: node scripts/platform/package-integrity.mjs --check <extracted-package-directory>');
    }
    console.log(JSON.stringify(verifyPackageDirectory(process.argv[3]), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
