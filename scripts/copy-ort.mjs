// Copies the ONNX Runtime WebAssembly files used for background removal into
// public/ort, so the admin panel loads them from this site instead of a CDN.
// Runs automatically after `npm install`.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = join("node_modules", "onnxruntime-web", "dist");
const dest = join("public", "ort");
const files = ["ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm"];

if (!existsSync(src)) process.exit(0);
mkdirSync(dest, { recursive: true });
for (const f of files) copyFileSync(join(src, f), join(dest, f));
console.log(`copied ${files.length} onnxruntime files to ${dest}`);
