import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const outPath = join(outDir, "entry.png");
mkdirSync(outDir, { recursive: true });
copyFileSync(join(here, "poster.png"), outPath);

// Verify the written output matches the competition gate before declaring success.
const data = readFileSync(outPath);

function fail(check, detail) {
  console.error(`entry check failed: ${check} — ${detail}`);
  process.exit(1);
}

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (data.length < 33 || !data.subarray(0, 8).equals(pngSignature)) {
  fail("png-signature", "entry.png does not start with the PNG signature");
}
if (data.toString("ascii", 12, 16) !== "IHDR") {
  fail("png-ihdr", "entry.png has no IHDR chunk where expected");
}
const width = data.readUInt32BE(16);
const height = data.readUInt32BE(20);
if (width !== 1024 || height !== 576) {
  fail("dimensions", `entry.png is ${width}x${height}, expected 1024x576`);
}
if (data.length > 1048576) {
  fail("size", `entry.png is ${data.length} bytes, over the 1048576 byte limit`);
}
console.log(`wrote entry.png (${width}x${height}, ${data.length} bytes)`);
