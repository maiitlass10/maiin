"use client";

import { browserClient } from "@/lib/supabase/browser";

async function loadBitmap(src: Blob): Promise<ImageBitmap> {
  return createImageBitmap(src, { imageOrientation: "from-image" });
}

function canvasToWebp(canvas: HTMLCanvasElement, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/webp", quality));
}

/** Shrinks a photo to at most `max` px on its long side and re-encodes it as WebP. */
export async function toWebp(file: Blob, max = 1400): Promise<Blob> {
  const bmp = await loadBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvasToWebp(canvas);
}

/** Uploads to the public "products" bucket and returns the public URL. Staff only (enforced by storage policies). */
export async function uploadImage(blob: Blob, folder: string): Promise<string> {
  const supabase = browserClient();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from("products").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
}

// ---------- Background removal (U²-Netp, Apache-2.0, runs in the browser) ----------

type Ort = typeof import("onnxruntime-web/wasm");
let session: Promise<{ ort: Ort; s: import("onnxruntime-web/wasm").InferenceSession }> | null = null;
const SIZE = 320;

function getSession() {
  session ??= (async () => {
    const ort = await import("onnxruntime-web/wasm");
    ort.env.wasm.wasmPaths = "/ort/";
    ort.env.wasm.numThreads = 1;
    const s = await ort.InferenceSession.create("/models/u2netp.onnx", { executionProviders: ["wasm"] });
    return { ort, s };
  })();
  return session;
}

/**
 * Cuts the garment out of a photo taken against a plain background, trims the
 * empty edges and returns a transparent WebP no larger than `max` px.
 */
export async function removeBackground(file: Blob, max = 960): Promise<Blob> {
  const { ort, s } = await getSession();
  const bmp = await loadBitmap(file);

  // Model input: 320x320, scaled to 0..1 by the brightest value, ImageNet mean/std.
  const small = document.createElement("canvas");
  small.width = small.height = SIZE;
  const sctx = small.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(bmp, 0, 0, SIZE, SIZE);
  const px = sctx.getImageData(0, 0, SIZE, SIZE).data;
  let peak = 1;
  for (let i = 0; i < px.length; i += 4) peak = Math.max(peak, px[i], px[i + 1], px[i + 2]);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  const input = new Float32Array(3 * SIZE * SIZE);
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    for (let c = 0; c < 3; c++) input[c * SIZE * SIZE + p] = (px[i + c] / peak - mean[c]) / std[c];
  }
  const out = await s.run({ [s.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]) });
  const m = out[s.outputNames[0]].data as Float32Array;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < SIZE * SIZE; i++) {
    lo = Math.min(lo, m[i]);
    hi = Math.max(hi, m[i]);
  }

  // Mask at model size, then scaled up to the photo with smoothing.
  const maskSmall = document.createElement("canvas");
  maskSmall.width = maskSmall.height = SIZE;
  const mctx = maskSmall.getContext("2d")!;
  const mimg = mctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const a = Math.round(((m[i] - lo) / (hi - lo || 1)) * 255);
    mimg.data[i * 4 + 3] = a < 12 ? 0 : a;
  }
  mctx.putImageData(mimg, 0, 0);

  const scale = Math.min(1, (max * 1.4) / Math.max(bmp.width, bmp.height));
  const W = Math.round(bmp.width * scale);
  const H = Math.round(bmp.height * scale);
  const full = document.createElement("canvas");
  full.width = W;
  full.height = H;
  const fctx = full.getContext("2d", { willReadFrequently: true })!;
  fctx.imageSmoothingQuality = "high";
  fctx.drawImage(maskSmall, 0, 0, W, H);
  fctx.globalCompositeOperation = "source-in";
  fctx.drawImage(bmp, 0, 0, W, H);

  // Trim transparent edges.
  const data = fctx.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 <= x0 || y1 <= y0) throw new Error("nothing found");
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const fit = Math.min(1, max / Math.max(cw, ch));
  const outCanvas = document.createElement("canvas");
  outCanvas.width = Math.round(cw * fit);
  outCanvas.height = Math.round(ch * fit);
  outCanvas.getContext("2d")!.drawImage(full, x0, y0, cw, ch, 0, 0, outCanvas.width, outCanvas.height);
  return canvasToWebp(outCanvas, 0.86);
}
