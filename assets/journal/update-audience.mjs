/** Public display policy only; never edits an update's status, date or revision. */
export function isPublicUpdate(update, project) {
  if (!update || typeof update !== 'object') return false;
  // An explicit private designation wins over release status and opt-in flags.
  if (update.public === false || ['maintenance', 'internal'].includes(update.audience)) return false;
  return update.public === true ||
    update.status === 'released' || update.status === 'planned' ||
    (typeof project?.currentRelease?.updateId === 'string' &&
     update.id === project.currentRelease.updateId);
}
