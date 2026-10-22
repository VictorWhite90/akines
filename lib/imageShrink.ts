/**
 * Shrinks a photo on the device before upload (upright, at most `maxSide` px, JPEG) so a 4 MB phone photo costs
 * a few hundred KB of data. The server still checks, crops and re-encodes it. Formats the browser can't decode
 * (e.g. HEIC on some Android browsers) are sent as they are, and the server explains if it can't use them.
 */
export async function shrinkImage(file: Blob, maxSide = 1280): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.88));
  } catch {
    return file;
  }
}
