// ============================================================
// AYRA — Image Generation API
// Stable Diffusion (A1111) & ComfyUI integration
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const runtime  = "nodejs";
export const dynamic  = "force-dynamic";

const GenerateSchema = z.object({
  userId:         z.string().default("default"),
  prompt:         z.string().min(1),
  negativePrompt: z.string().default("ugly, blurry, low quality"),
  model:          z.string().optional(),
  steps:          z.number().min(1).max(150).default(20),
  cfgScale:       z.number().min(1).max(30).default(7),
  width:          z.number().default(512),
  height:         z.number().default(512),
  seed:           z.number().default(-1),
  sampler:        z.string().default("DPM++ 2M Karras"),
  engine:         z.enum(["STABLE_DIFFUSION", "COMFYUI", "DALLE"]).default("STABLE_DIFFUSION"),
});

export async function POST(req: NextRequest) {
  const body = GenerateSchema.parse(await req.json());
  const sdHost    = process.env.SD_HOST    ?? "http://localhost:7860";
  const comfyHost = process.env.COMFY_HOST ?? "http://localhost:8188";

  let imageBase64: string;
  let width  = body.width;
  let height = body.height;

  if (body.engine === "STABLE_DIFFUSION") {
    // ── A1111 API ──────────────────────────────────────────
    const res = await fetch(`${sdHost}/sdapi/v1/txt2img`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:           body.prompt,
        negative_prompt:  body.negativePrompt,
        steps:            body.steps,
        cfg_scale:        body.cfgScale,
        width:            body.width,
        height:           body.height,
        seed:             body.seed,
        sampler_name:     body.sampler,
        save_images:      false,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `SD API error: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    imageBase64 = data.images?.[0];

    // Parse actual dimensions from info
    try {
      const info = JSON.parse(data.info ?? "{}");
      width  = info.width  ?? body.width;
      height = info.height ?? body.height;
    } catch { /* use defaults */ }

  } else if (body.engine === "COMFYUI") {
    // ── ComfyUI API ────────────────────────────────────────
    // Basic txt2img workflow
    const workflow = buildComfyWorkflow(body);
    const promptRes = await fetch(`${comfyHost}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });
    if (!promptRes.ok) {
      return NextResponse.json({ error: "ComfyUI unavailable" }, { status: 502 });
    }
    // For brevity, return a placeholder (full ComfyUI websocket polling omitted)
    return NextResponse.json({ error: "ComfyUI streaming not yet implemented" }, { status: 501 });
  } else {
    return NextResponse.json({ error: "Engine not supported" }, { status: 400 });
  }

  // Save image to disk
  const uploadsDir = path.join(process.cwd(), "uploads", "studio");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, Buffer.from(imageBase64, "base64"));
  const url = `/uploads/studio/${filename}`;

  // Save to DB
  const image = await prisma.studioImage.create({
    data: {
      userId:         body.userId,
      prompt:         body.prompt,
      negativePrompt: body.negativePrompt,
      engine:         body.engine,
      url,
      width,
      height,
      steps:    body.steps,
      cfgScale: body.cfgScale,
      sampler:  body.sampler,
      seed:     body.seed === -1 ? null : BigInt(body.seed),
    },
  });

  return NextResponse.json({ ...image, seed: image.seed?.toString() });
}

function buildComfyWorkflow(params: z.infer<typeof GenerateSchema>): Record<string, unknown> {
  // Minimal KSampler workflow for ComfyUI
  return {
    "3": { class_type: "KSampler", inputs: { seed: params.seed, steps: params.steps, cfg: params.cfgScale, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 1, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0] } },
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: params.model ?? "v1-5-pruned-emaonly.safetensors" } },
    "5": { class_type: "EmptyLatentImage", inputs: { batch_size: 1, height: params.height, width: params.width } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: params.prompt, clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: params.negativePrompt, clip: ["4", 1] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "ayra", images: ["8", 0] } },
  };
}
