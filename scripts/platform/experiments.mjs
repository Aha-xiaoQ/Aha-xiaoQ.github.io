/** Only explicitly registered original artifacts enter the lab. Read-only and deterministic. */
import {createHash} from 'node:crypto';
import {readOptional} from '../lib/safe-path.mjs';
import {validateExperiment,validateExperimentCatalog} from '../../assets/platform/contracts.mjs';
export const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function loadExperiments(root, {reader = p => readOptional(root,p)} = {}) {
  const get = p => { const bytes = reader(p); if (!bytes) throw Error('Missing experiment input: '+p); return bytes; };
  const catalog = validateExperimentCatalog(JSON.parse(get('content/experiments/catalog.json')));
  const entries = [], artifacts = new Set();
  for (const row of catalog.entries) {
    const record = validateExperiment(JSON.parse(get(row.file)));
    if (record.id !== row.id || artifacts.has(record.artifact.href)) throw Error('Experiment identity or artifact duplication');
    artifacts.add(record.artifact.href);
    const bytes = get(record.artifact.href.slice(1));
    if (bytes.length !== record.artifact.bytes || sha(bytes) !== record.artifact.sha256) throw Error('Original experiment changed: '+record.id);
    if (record.visibility !== 'draft') entries.push(record);
  }
  return {catalog,entries};
}
