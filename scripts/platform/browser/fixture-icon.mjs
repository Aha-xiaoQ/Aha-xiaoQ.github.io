/** Icon owned by the temporary component site, never by the published website.
 * All component documents share it, including the ESM-identity page and iframe.
 * Return fresh bytes so a caller cannot alter another run's fixture.
 */
export const FIXTURE_ICON_LINK = '<link rel="icon" type="image/vnd.microsoft.icon" sizes="16x16" href="/favicon.ico">';
export function fixtureIcon() {
  const size = 16, pixelBytes = size * size * 4, maskBytes = size * 4;
  const imageBytes = 40 + pixelBytes + maskBytes;
  const icon = Buffer.alloc(22 + imageBytes);
  icon.writeUInt16LE(1, 2); // ICO, not CUR.
  icon.writeUInt16LE(1, 4); // One image.
  icon[6] = size; icon[7] = size;
  icon.writeUInt16LE(1, 10); icon.writeUInt16LE(32, 12);
  icon.writeUInt32LE(imageBytes, 14); icon.writeUInt32LE(22, 18);
  icon.writeUInt32LE(40, 22); // BITMAPINFOHEADER.
  icon.writeInt32LE(size, 26); icon.writeInt32LE(size * 2, 30);
  icon.writeUInt16LE(1, 34); icon.writeUInt16LE(32, 36);
  icon.writeUInt32LE(pixelBytes, 42);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const offset = 62 + (y * size + x) * 4;
    const tone = (x >= 4 && x < 12 && y >= 4 && y < 12) ? 220 : 48;
    icon[offset] = tone; icon[offset + 1] = tone; icon[offset + 2] = tone;
    icon[offset + 3] = 255;
  }
  return icon;
}
