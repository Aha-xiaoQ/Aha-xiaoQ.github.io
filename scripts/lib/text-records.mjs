/** Compare generated UTF-8 text across Git LF/CRLF checkouts; never ignore other edits.
 * Backups and update receipts still use exact raw-byte hashes.
 */
import {createHash} from 'node:crypto';
const digest = value => createHash('sha256').update(value).digest('hex');
export const normalizeText = value => (Buffer.isBuffer(value) ? value.toString('utf8') : String(value)).replace(/\r\n/g, '\n');
export const equalText = (a, b) => a !== null && a !== undefined && b !== null && b !== undefined && normalizeText(a) === normalizeText(b);
export const matchesTextHash = (value, expected) => value !== null && value !== undefined && typeof expected === 'string' && (digest(value) === expected || digest(normalizeText(value)) === expected);
