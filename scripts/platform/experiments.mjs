/** Only explicitly registered original artifacts enter the lab. Read-only and deterministic. */
import {createHash} from 'node:crypto';
import {readOptional} from '../lib/safe-path.mjs';
import {validateExperiment,validateExperimentCatalog,experimentVideoURL} from '../../assets/platform/contracts.mjs';
export const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export function loadExperiments(root, {reader = p => readOptional(root,p)} = {}) {
  const get = p => { const bytes = reader(p); if (!bytes) throw Error('Missing experiment input: '+p); return bytes; };
  const catalog = validateExperimentCatalog(JSON.parse(get('content/experiments/catalog.json')));
  const entries = [], records = [], artifacts = new Set();
  for (const row of catalog.entries) {
    const record = validateExperiment(JSON.parse(get(row.file)));
    const target = record.kind === 'video' ? experimentVideoURL(record.video) : record.artifact.href;
    if (record.id !== row.id || artifacts.has(target)) throw Error('Experiment identity or artifact duplication');
    artifacts.add(target); records.push(record);
    if (record.kind !== 'video') {
      const bytes = get(record.artifact.href.slice(1));
      if (bytes.length !== record.artifact.bytes || sha(bytes) !== record.artifact.sha256) throw Error('Original experiment changed: '+record.id);
    }
    if (record.visibility !== 'draft') entries.push(record);
  }
  for (const record of records) if (record.relatedExperimentId) {
    const related=records.find(row=>row.id===record.relatedExperimentId);
    if (!related || (record.visibility !== 'draft' && related.visibility === 'draft')) throw Error('Related experiment is unavailable: '+record.id);
  }
  return {catalog,entries};
}
