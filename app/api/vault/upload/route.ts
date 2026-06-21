// ============================================================
// AYRA — Vault File Upload API (Vercel Blob)
// Falls back to local disk when BLOB_READ_WRITE_TOKEN is absent
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime  = "nodejs";
export const dynamic  = "force-dynamic";

// Vercel Blob is optional — falls back to local /uploads
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: NextRequest) {
  const form    = await req.formData();
  const file    = form.get("file") as File | null;
  const userId  = (form.get("userId") as string) ?? "default";
  const folderId = form.get("folderId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? "52428800"); // 50 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  let url: string;

  if (USE_BLOB) {
    // ── Vercel Blob storage ──────────────────────────────────
    const { put } = await import("@vercel/blob");
    const blob = await put(`vault/${userId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    url = blob.url;
  } else {
    // ── Local disk fallback ─────────────────────────────────
    const path  = await import("path");
    const fs    = await import("fs/promises");
    const dir   = path.join(process.cwd(), "uploads", "vault", userId);
    await fs.mkdir(dir, { recursive: true });
    const fname = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "_")}`;
    const fpath = path.join(dir, fname);
    const buf   = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fpath, buf);
    url = `/uploads/vault/${userId}/${fname}`;
  }

  // Determine vault item type from MIME
  const type = inferVaultType(file.type, file.name);

  // Extract text content for PDFs and text files
  let content: string | undefined;
  let pageCount: number | undefined;

  if (file.type === "application/pdf") {
    try {
      const arrayBuf = await file.arrayBuffer();
      const pdfParse = (await import("pdf-parse")).default;
      const data     = await pdfParse(Buffer.from(arrayBuf));
      content        = data.text.slice(0, 50_000); // cap at 50k chars
      pageCount      = data.numpages;
    } catch { /* skip extraction */ }
  } else if (file.type.startsWith("text/")) {
    content = await file.text();
  }

  // Save to DB
  const item = await prisma.vaultItem.create({
    data: {
      userId,
      folderId: folderId ?? undefined,
      type,
      title:    file.name,
      url,
      filename: file.name,
      mimeType: file.type,
      size:     file.size,
      pageCount,
      content,
      isProcessed: !!content,
      processedAt: content ? new Date() : undefined,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

function inferVaultType(mime: string, name: string) {
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/"))  return "IMAGE";
  if (mime.startsWith("text/") || name.endsWith(".md")) return "DOCUMENT";
  if ([".doc",".docx"].some(e => name.endsWith(e))) return "DOCUMENT";
  if ([".js",".ts",".py",".rs",".go"].some(e => name.endsWith(e))) return "CODE";
  return "OTHER";
}
