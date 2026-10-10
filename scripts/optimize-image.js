import { existsSync } from "fs"
import sharp from "sharp"

/** Writes a .webp next to the image; markdown references are rewritten to .webp at build. */
export async function optimizeImage(img) {
  if (!existsSync(img) || img.endsWith(".webp")) {
    return
  }
  await sharp(img)
    .webp({ quality: 82 })
    .toFile(img.replace(/\.(png|jpe?g)$/i, ".webp"))
}
