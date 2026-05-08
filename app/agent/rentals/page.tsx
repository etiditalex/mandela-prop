"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type PropertyWithImagesRow = PropertyRow & { property_images: PropertyImageRow[] | null };

const rentalUnitTypes = [
  "Ensuite",
  "1 Bedroom",
  "2 Bedrooms",
  "3 Bedrooms",
  "4 Bedrooms",
  "Own compound",
] as const;
type RentalUnitType = (typeof rentalUnitTypes)[number];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatListingPrice(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function friendlySupabaseError(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("failed to fetch")) {
    return (
      "Upload failed (network/CORS/proxy). Try again on a stable connection, disable VPN/proxy/adblock for Supabase, and ensure Supabase Storage is enabled."
    );
  }
  if (msg.includes("invalid input syntax for type numeric")) {
    return (
      "A numeric field was rejected by the database. " +
      "Confirm rent/bedrooms/bathrooms are plain numbers (e.g. 45000), then try again."
    );
  }
  if (msg.includes("invalid input syntax for type integer")) {
    return "Bedrooms/bathrooms must be whole numbers (no decimals). Example: 1, 2, 3.";
  }
  if (msg.includes("duplicate key") && msg.includes("properties_slug_key")) {
    return "A property with the same title/slug already exists. Try a slightly different title.";
  }
  if (msg.includes("row-level security") || msg.includes("violates row-level security")) {
    return "Permission denied by Supabase RLS. Make sure your profile role is 'agent' or 'admin'.";
  }
  if (msg.includes("bucket") && msg.includes("property-images")) {
    return "Storage bucket is missing. Ensure the `property-images` bucket exists and policies from `supabase/schema.sql` are applied.";
  }
  return message;
}

function parseNumberInput(value: unknown): number {
  if (typeof value === "number") return value;
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const normalized = raw.replace(/[, ]+/g, "");
  return Number(normalized);
}

function parseRequiredNumber(label: string, value: unknown) {
  const raw = String(value ?? "").trim();
  const parsed = parseNumberInput(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a number. You entered: "${raw || "(empty)"}".`);
  }
  return parsed;
}

function parseRequiredInteger(label: string, value: unknown) {
  const raw = String(value ?? "").trim();
  const parsed = parseNumberInput(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a whole number. You entered: "${raw || "(empty)"}".`);
  }
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be a whole number (no decimals). You entered: "${raw}".`);
  }
  return parsed;
}

function parseOptionalInteger(label: string, value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const parsed = parseNumberInput(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a whole number. You entered: "${raw}".`);
  }
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be a whole number (no decimals). You entered: "${raw}".`);
  }
  return parsed;
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, timeoutMessage: string) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

function assertImageAcceptable(file: File) {
  const maxBytes = 12 * 1024 * 1024; // 12MB
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
  const isPng = typeLower.includes("png") || nameLower.endsWith(".png");
  const isGif = typeLower.includes("gif") || nameLower.endsWith(".gif");
  if (isPng || isGif) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1400;
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
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.78);
    });
    if (!blob) return file;
    if (blob.size >= file.size) return file;

    const compressedName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], compressedName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function listingStatusClass(status: PropertyRow["status"]) {
  switch (status) {
    case "available":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
    case "sold":
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    case "rented":
      return "bg-amber-50 text-amber-800 ring-1 ring-amber-100";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

function RentalEditModal({
  rental,
  onClose,
  onSaved,
  onRefresh,
}: {
  rental: PropertyWithImagesRow;
  onClose: () => void;
  onSaved: () => void;
  onRefresh: () => void;
}) {
  const [title, setTitle] = useState(rental.title);
  const [description, setDescription] = useState(rental.description);
  const [location, setLocation] = useState(rental.location);
  const [price, setPrice] = useState(String(rental.price));
  const [bedrooms, setBedrooms] = useState(String(rental.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(rental.bathrooms));
  const [size, setSize] = useState(String(rental.size));
  const [status, setStatus] = useState<PropertyRow["status"]>(rental.status);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const images = (rental.property_images ?? []).slice().sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  const onUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalError(null);
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const filesArray = Array.from(files);
      await runWithConcurrency(filesArray, 3, async (original, index) => {
        await withTimeout(
          (async () => {
            assertImageAcceptable(original);
            const uploadFile = await compressImageForUpload(original);
            assertImageAcceptable(uploadFile);

            const extension = uploadFile.name.split(".").pop() || "jpg";
            const path = `${rental.id}/${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await withTimeout(
              supabase.storage.from("property-images").upload(path, uploadFile, {
                upsert: false,
                contentType: uploadFile.type,
                cacheControl: "3600",
              }),
              300000,
              "Image upload is taking too long. Try again, or refresh and add images later.",
            );
            if (uploadError) throw new Error(friendlySupabaseError(uploadError.message));

            const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
            const { error: imageError } = await withTimeout<{
              data: unknown;
              error: { message: string } | null;
            }>(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase as any).from("property_images").insert({
                property_id: rental.id,
                image_url: publicUrlData.publicUrl,
                is_primary: images.length === 0 && index === 0,
              }),
              20000,
              "Image save timed out. Refresh and try again.",
            );
            if (imageError) throw new Error(friendlySupabaseError(imageError.message));
          })(),
          420000,
          "Image processing/upload is taking too long. Try again, or upload fewer images at once.",
        );
      });
      await withTimeout(Promise.resolve(onRefresh()), 15000, "Uploaded, but refresh timed out. Click Refresh to reload.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setLocalError(null);

    let priceNum = NaN;
    let bedroomsNum = NaN;
    let bathroomsNum = NaN;
    try {
      priceNum = parseRequiredNumber("Monthly rent", price);
      bedroomsNum = parseRequiredInteger("Bedrooms", bedrooms);
      bathroomsNum = parseRequiredInteger("Bathrooms", bathrooms);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Invalid numeric value.");
      setSaving(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/properties", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: rental.id,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          price: priceNum,
          bedrooms: bedroomsNum,
          bathrooms: bathroomsNum,
          size: size.trim(),
          property_type: rental.property_type,
          listing_kind: "rent",
          status,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutHandle));

      const json = (await response.json().catch(() => null)) as
        | { data?: { id: string; slug: string }; error?: string; code?: string }
        | null;

      if (!response.ok) {
        const details = json?.code ? `code=${json.code}` : null;
        const message = json?.error || `Failed to update rental (HTTP ${response.status}).`;
        setLocalError(friendlySupabaseError([message, details].filter(Boolean).join(" | ")));
        setSaving(false);
        return;
      }

      onSaved();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to update rental.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit rental" panelClassName="max-h-[90vh] max-w-3xl overflow-y-auto">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2 space-y-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Images</p>
              <p className="text-xs text-slate-500">Upload and manage rental photos.</p>
            </div>
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60">
              {uploading ? "Uploading..." : "Add images"}
              <input
                className="hidden"
                type="file"
                id={`r_images_${rental.id}`}
                name="rental_images"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(event) => void onUploadImages(event.target.files)}
              />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url ?? ""} alt="Rental" className="h-20 w-full object-cover" loading="lazy" />
                  {img.is_primary ? (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No images yet.</p>
          )}
        </div>

        <Input id="r_title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input id="r_location" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Input
          id="r_price"
          label="Monthly rent"
          type="text"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          id="r_beds"
          label="Bedrooms"
          type="text"
          inputMode="numeric"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          required
        />
        <Input
          id="r_baths"
          label="Bathrooms"
          type="text"
          inputMode="numeric"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          required
        />
        <Input id="r_size" label="Size (optional)" value={size} onChange={(e) => setSize(e.target.value)} />

        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="r_status">
          <span className="font-medium">Status</span>
          <select
            id="r_status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyRow["status"])}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="sold">Sold</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="r_description">
          <span className="font-medium">Description</span>
          <textarea
            id="r_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            required
          />
        </label>

        {localError ? <p className="md:col-span-2 text-sm text-red-600">{localError}</p> : null}
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AgentRentalsPage() {
  const [rows, setRows] = useState<PropertyWithImagesRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [unitType, setUnitType] = useState<RentalUnitType>("1 Bedroom");
  const [editTarget, setEditTarget] = useState<PropertyWithImagesRow | null>(null);
  const [createTitle, setCreateTitle] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [createBathrooms, setCreateBathrooms] = useState("");
  const [createBedroomsOverride, setCreateBedroomsOverride] = useState("");
  const [createSize, setCreateSize] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const load = async ({ preserveError = false }: { preserveError?: boolean } = {}) => {
    try {
      if (!preserveError) setError(null);
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/agent/properties", { signal: controller.signal }).finally(() =>
        clearTimeout(timeoutHandle),
      );
      const json = (await response.json().catch(() => null)) as
        | { data?: PropertyWithImagesRow[]; error?: string; code?: string }
        | null;

      if (!response.ok) {
        const message =
          json?.error ||
          (response.status === 401 ? "Login required." : `Failed to load rentals (HTTP ${response.status}).`);
        setError(friendlySupabaseError(message));
        return;
      }

      const all = json?.data ?? [];
      setRows(all.filter((p) => (p.listing_kind ?? "sale") === "rent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load rentals.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const available = rows.filter((r) => r.status === "available").length;
    const rented = rows.filter((r) => r.status === "rented").length;
    return { total, available, rented };
  }, [rows]);

  const uploadImageForProperty = async (propertyId: string, file: File, isPrimary: boolean) => {
    assertImageAcceptable(file);
    const supabase = createSupabaseBrowserClient();
    const uploadFile = await compressImageForUpload(file);
    assertImageAcceptable(uploadFile);
    const extension = uploadFile.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage.from("property-images").upload(path, uploadFile, {
        upsert: false,
        contentType: uploadFile.type,
        cacheControl: "3600",
      }),
      120000,
      "Image upload is taking too long. Try again, or refresh and add images later.",
    );
    if (uploadError) throw new Error(friendlySupabaseError(uploadError.message));

    const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const { error: imageError } = await withTimeout<{
      data: unknown;
      error: { message: string } | null;
    }>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("property_images").insert({
        property_id: propertyId,
        image_url: publicUrlData.publicUrl,
        is_primary: isPrimary,
      }),
      20000,
      "Image save timed out. Refresh and try again.",
    );
    if (imageError) throw new Error(friendlySupabaseError(imageError.message));
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      const title = createTitle.trim();
      const location = createLocation.trim();
      const description = createDescription.trim();
      const price = parseRequiredNumber("Monthly rent", createPrice);
      const bathrooms = parseRequiredInteger("Bathrooms", createBathrooms);

      const inferredBedrooms =
        unitType === "Ensuite" ? 0 :
        unitType === "1 Bedroom" ? 1 :
        unitType === "2 Bedrooms" ? 2 :
        unitType === "3 Bedrooms" ? 3 :
        unitType === "4 Bedrooms" ? 4 : 0;

      const bedroomsOverride = parseOptionalInteger("Bedrooms (override)", createBedroomsOverride);
      const bedrooms = Number.isFinite(bedroomsOverride) ? bedroomsOverride : inferredBedrooms;

      if (title.length < 3 || location.length < 2 || description.length < 10) {
        throw new Error("Title, location, and description are required (description min 10 chars).");
      }
      if (!Number.isFinite(bedrooms) || bedrooms < 0) throw new Error("Bedrooms must be a valid non-negative number.");
      if (!Number.isFinite(bathrooms) || bathrooms < 0) throw new Error("Bathrooms must be a valid non-negative number.");

      const payload = {
        title,
        slug: slugify(title),
        description,
        price,
        location,
        property_type: unitType,
        bedrooms,
        bathrooms,
        size: createSize.trim(),
        listing_kind: "rent" as const,
        status: "available" as const,
      };

      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutHandle));

      const json = (await response.json().catch(() => null)) as
        | { data?: { id: string; slug: string }; error?: string; code?: string }
        | null;

      if (!response.ok) {
        const details = json?.code ? `code=${json.code}` : null;
        const message = json?.error || `Failed to create rental (HTTP ${response.status}).`;
        throw new Error(friendlySupabaseError([message, details].filter(Boolean).join(" | ")));
      }

      const insertedId = json?.data?.id;
      if (insertedId && createImages.length) {
        setMessage("Rental created. Uploading images in background…");
        const filesToUpload = [...createImages];
        void (async () => {
          const failures: string[] = [];
          try {
            await withTimeout(
              (async () => {
                for (let index = 0; index < filesToUpload.length; index += 1) {
                  const file = filesToUpload[index];
                  try {
                    await uploadImageForProperty(insertedId, file, index === 0);
                  } catch (err) {
                    failures.push(err instanceof Error ? err.message : "An image failed to upload.");
                  }
                }
              })(),
              420000,
              "Image uploads are taking too long. You can refresh and add images later.",
            );
          } catch (err) {
            failures.push(err instanceof Error ? err.message : "Image upload timed out.");
          }

          if (failures.length > 0) {
            const first = failures[0] ?? "One or more images failed to upload.";
            setError(first);
            setMessage(`Rental created, but ${failures.length} image(s) failed to upload.`);
            await load({ preserveError: true });
            return;
          }
          setMessage("Rental created successfully.");
          await load();
        })();
      } else {
        setMessage("Rental created successfully.");
      }

      setCreateTitle("");
      setCreateLocation("");
      setCreatePrice("");
      setCreateBathrooms("");
      setCreateBedroomsOverride("");
      setCreateSize("");
      setCreateDescription("");
      setCreateImages([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create rental.");
    } finally {
      setCreating(false);
    }
  };

  const getPrimaryImage = (property: PropertyWithImagesRow) => {
    const images = property.property_images ?? [];
    if (images.length === 0) return null;
    return [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0]?.image_url ?? null;
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {editTarget ? (
        <RentalEditModal
          key={editTarget.id}
          rental={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            void load();
            setEditTarget(null);
          }}
          onRefresh={() => load()}
        />
      ) : null}

      <AgentPageHeader title="Rentals" breadcrumb="Dashboard / Rentals" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Available</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.available}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Rented</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.rented}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">New rental</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Add house to rent</h3>
          </div>

          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-1" onSubmit={onCreate}>
            <label className="grid gap-2 text-sm text-zinc-700" htmlFor="rental_type">
              <span className="font-medium">Rental type</span>
              <select
                id="rental_type"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as RentalUnitType)}
                className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {rentalUnitTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <Input
              id="title"
              name="title"
              label="Title"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              required
            />
            <Input
              id="location"
              name="location"
              label="Location"
              value={createLocation}
              onChange={(e) => setCreateLocation(e.target.value)}
              required
            />
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              label="Monthly rent"
              value={createPrice}
              onChange={(e) => setCreatePrice(e.target.value)}
              required
            />
            <Input
              id="bathrooms"
              name="bathrooms"
              type="text"
              inputMode="numeric"
              label="Bathrooms"
              value={createBathrooms}
              onChange={(e) => setCreateBathrooms(e.target.value)}
              required
            />
            <Input
              id="bedrooms"
              name="bedrooms"
              type="text"
              inputMode="numeric"
              label="Bedrooms (optional override)"
              placeholder="Auto from rental type"
              value={createBedroomsOverride}
              onChange={(e) => setCreateBedroomsOverride(e.target.value)}
            />
            <Input
              id="size"
              name="size"
              label="Size (optional)"
              placeholder="e.g., 1200 sqft"
              value={createSize}
              onChange={(e) => setCreateSize(e.target.value)}
            />

            <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="description">
              <span className="font-medium">Description</span>
              <textarea
                id="description"
                name="description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                required
                rows={4}
                className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="rental_images">
              <span className="font-medium">Images (optional)</span>
              <input
                id="rental_images"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setCreateImages(Array.from(event.target.files ?? []))}
                className="rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors file:mr-3 file:rounded-sm file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {createImages.length > 0 ? (
                <p className="text-xs text-zinc-500">
                  {createImages.length} image{createImages.length === 1 ? "" : "s"} selected.
                </p>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={creating}
              className="md:col-span-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Add rental"}
            </button>
          </form>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">Inventory</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Rental listings</h3>
            <p className="mt-1 text-sm text-slate-500">Edit details, upload images, and mark rentals as rented.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Rental</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Rent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((rental) => (
                  <tr key={rental.id} className="border-b border-slate-50 transition hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      {getPrimaryImage(rental) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPrimaryImage(rental) ?? ""}
                          alt={rental.title}
                          className="h-12 w-16 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] font-medium text-slate-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{rental.title}</p>
                      <p className="text-xs text-slate-500">{rental.property_type}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rental.location}</td>
                    <td className="px-4 py-3 text-slate-600">{rental.bedrooms} bed • {rental.bathrooms} bath</td>
                    <td className="px-4 py-3 font-medium text-slate-900">KSh {formatListingPrice(Number(rental.price))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${listingStatusClass(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href="/rental-management"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          View page
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditTarget(rental)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                      No rentals yet. Add one on the left.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
