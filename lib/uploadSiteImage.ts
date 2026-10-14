"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function assertImageAcceptable(file: File) {
  const maxBytes = 12 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `Image is too large (${Math.ceil(file.size / (1024 * 1024))}MB). Please upload an image under 12MB.`,
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
}

async function compressImageForUpload(file: File) {
  if (file.size <= 900 * 1024) return file;
  const typeLower = file.type.toLowerCase();
  const nameLower = file.name.toLowerCase();
  if (typeLower.includes("png") || nameLower.endsWith(".png") || typeLower.includes("gif") || nameLower.endsWith(".gif")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((next) => resolve(next), "image/jpeg", 0.82);
    });
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadSiteImage(file: File, folder: "hero" | "portfolio") {
  assertImageAcceptable(file);
  const uploadFile = await compressImageForUpload(file);
  assertImageAcceptable(uploadFile);
  const supabase = createSupabaseBrowserClient();
  const extension = uploadFile.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("property-images").upload(path, uploadFile, {
    upsert: false,
    contentType: uploadFile.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}
