"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, Home, Layers, RefreshCw, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { landCategoryList, type LandListingTitle } from "@/lib/land";
import { properties as demoProperties } from "@/lib/properties";
import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Database } from "@/types/database";
import { Property } from "@/types/property";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type PropertyWithImagesRow = PropertyRow & { property_images: PropertyImageRow[] | null };

type DemoPropertyRow = Property & {
  status?: PropertyRow["status"];
  listingKind?: PropertyRow["listing_kind"];
};

const residentialPropertyTypes = ["Apartment", "Villa", "Penthouse", "Townhouse"] as const;
type ResidentialPropertyType = (typeof residentialPropertyTypes)[number];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isLandType(value: string) {
  return landCategoryList.some((c) => c.title === value);
}

function formatListingPrice(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function friendlySupabaseError(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("row-level security") || msg.includes("violates row-level security")) {
    return (
      "Permission denied by Supabase RLS. Make sure you are logged in with an account whose " +
      "profile role is 'agent' or 'admin', then try again."
    );
  }
  if (msg.includes("foreign key") && msg.includes("agent_id")) {
    return (
      "Your staff profile is missing in `public.profiles`. Ensure the signup trigger created it, " +
      "or insert a profile row for this user in Supabase, then try again."
    );
  }
  if (msg.includes("duplicate key") && msg.includes("properties_slug_key")) {
    return "A property with the same title/slug already exists. Try a slightly different title.";
  }
  if (msg.includes("bucket") && msg.includes("property-images")) {
    return (
      "Image upload is not configured in Supabase Storage. Ensure the `property-images` bucket exists " +
      "and the storage policies from `supabase/schema.sql` are applied."
    );
  }
  return message;
}

async function getAuthenticatedUserOrThrow() {
  const supabase = createSupabaseBrowserClient();

  // `getSession()` should usually be instant (local), but on some environments it can be slow.
  // Give it more time, then fall back to `getUser()` as a second attempt.
  try {
    const { data: sessionData, error: sessionError } = await withTimeout(
      supabase.auth.getSession(),
      8000,
      "Session lookup timed out",
    );
    if (sessionError) {
      throw sessionError;
    }
    const userFromSession = sessionData.session?.user ?? null;
    if (userFromSession) return userFromSession;
  } catch {
    // ignore and fall back below
  }

  const { data: userData, error: userError } = await withTimeout(
    supabase.auth.getUser(),
    12000,
    "User lookup timed out",
  );
  if (userError) {
    throw new Error(userError.message);
  }
  const user = userData.user ?? null;
  if (!user) {
    throw new Error("You are not logged in. Please sign in again.");
  }
  return user;
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

function DemoPropertyEditModal({
  property,
  onClose,
  onCreated,
}: {
  property: DemoPropertyRow;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [location, setLocation] = useState(property.location);
  const [price, setPrice] = useState(String(property.price));
  const [bedrooms, setBedrooms] = useState(String(property.beds ?? 0));
  const [bathrooms, setBathrooms] = useState(String(property.baths ?? 0));
  const [size, setSize] = useState(String(property.areaSqFt ?? ""));
  const [residentialType, setResidentialType] = useState<ResidentialPropertyType>(
    residentialPropertyTypes.includes(property.type as ResidentialPropertyType)
      ? (property.type as ResidentialPropertyType)
      : residentialPropertyTypes[0],
  );
  const [listingKind, setListingKind] = useState<PropertyRow["listing_kind"]>(
    property.listingKind ?? "sale",
  );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setLocalError(null);

    const priceNum = Number(price);
    const bedroomsNum = Number(bedrooms);
    const bathroomsNum = Number(bathrooms);
    if (Number.isNaN(priceNum) || Number.isNaN(bedroomsNum) || Number.isNaN(bathroomsNum)) {
      setLocalError("Price, bedrooms, and bathrooms must be valid numbers.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const user = await getAuthenticatedUserOrThrow();

      const titleTrimmed = title.trim();
      if (titleTrimmed.length < 3) {
        setLocalError("Title must be at least 3 characters.");
        setSaving(false);
        return;
      }
      if (description.trim().length < 10) {
        setLocalError("Description must be at least 10 characters.");
        setSaving(false);
        return;
      }
      const slug = slugify(titleTrimmed);

      const { data: insertedProperty, error: insertError } = await withTimeout(
        supabase
          .from("properties")
          .insert({
            title: titleTrimmed,
            slug,
            description: description.trim(),
            price: priceNum,
            location: location.trim(),
            property_type: residentialType,
            bedrooms: bedroomsNum,
            bathrooms: bathroomsNum,
            size: String(size),
            listing_kind: listingKind,
            status: "available",
            agent_id: user.id,
          })
          .select("id")
          .single(),
        20000,
        "Saving timed out. Check your Supabase connection and try again.",
      );

      if (insertError) {
        setLocalError(friendlySupabaseError(insertError.message));
        setSaving(false);
        return;
      }

      if (insertedProperty?.id && property.coverImage) {
        const { error: imageError } = await withTimeout(
          supabase.from("property_images").insert({
            property_id: insertedProperty.id,
            image_url: property.coverImage,
            is_primary: true,
          }),
          15000,
          "Image save timed out. The listing may still be created—refresh to confirm.",
        );
        if (imageError) {
          setLocalError(`Listing created, but image failed: ${friendlySupabaseError(imageError.message)}`);
          setSaving(false);
          return;
        }
      }

      await withTimeout(
        Promise.resolve(onCreated()),
        12000,
        "Saved, but refresh timed out. Click Refresh to reload listings.",
      );
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("Unable to create listing from demo property.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit demo listing"
      panelClassName="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="demo_listing_kind">
          <span className="font-medium">Listing type</span>
          <select
            id="demo_listing_kind"
            value={listingKind}
            onChange={(event) => setListingKind(event.target.value as PropertyRow["listing_kind"])}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="demo_property_type">
          <span className="font-medium">Property type</span>
          <select
            id="demo_property_type"
            value={residentialType}
            onChange={(event) => setResidentialType(event.target.value as ResidentialPropertyType)}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {residentialPropertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <Input id="demo_title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          id="demo_location"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <Input id="demo_price" label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <Input
          id="demo_bedrooms"
          label="Bedrooms"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          required
        />
        <Input
          id="demo_bathrooms"
          label="Bathrooms"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          required
        />
        <Input
          id="demo_size"
          label="Size (sqft)"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          required
        />
        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="demo_description">
          <span className="font-medium">Description</span>
          <textarea
            id="demo_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        {localError && <p className="md:col-span-2 text-sm text-red-600">{localError}</p>}
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save & create in database"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PropertyEditModal({
  property,
  onClose,
  onSaved,
}: {
  property: PropertyRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const landInitially = isLandType(property.property_type);
  const [listingCategory, setListingCategory] = useState<"property" | "land">(
    landInitially ? "land" : "property",
  );
  const [listingKind, setListingKind] = useState<PropertyRow["listing_kind"]>(
    property.listing_kind ?? "sale",
  );
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [location, setLocation] = useState(property.location);
  const [price, setPrice] = useState(String(property.price));
  const [bedrooms, setBedrooms] = useState(String(property.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(property.bathrooms));
  const [size, setSize] = useState(String(property.size));
  const [status, setStatus] = useState<PropertyRow["status"]>(property.status);
  const [residentialType, setResidentialType] = useState<ResidentialPropertyType>(
    residentialPropertyTypes.includes(property.property_type as ResidentialPropertyType)
      ? (property.property_type as ResidentialPropertyType)
      : residentialPropertyTypes[0],
  );
  const [landType, setLandType] = useState<LandListingTitle>(
    landInitially
      ? (property.property_type as LandListingTitle)
      : landCategoryList[0].title,
  );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (listingCategory === "land") {
      setBedrooms("0");
      setBathrooms("0");
    }
  }, [listingCategory]);

  const propertyTypeValue =
    listingCategory === "land" ? landType : residentialType;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setLocalError(null);

    const priceNum = Number(price);
    const bedroomsNum = listingCategory === "land" ? 0 : Number(bedrooms);
    const bathroomsNum = listingCategory === "land" ? 0 : Number(bathrooms);
    const sizeStr = size;
    if (
      Number.isNaN(priceNum) ||
      (listingCategory !== "land" && Number.isNaN(bedroomsNum)) ||
      (listingCategory !== "land" && Number.isNaN(bathroomsNum))
    ) {
      setLocalError("Price, bedrooms, and bathrooms must be valid numbers.");
      setSaving(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          title: title.trim(),
          slug: slugify(title),
          description: description.trim(),
          location: location.trim(),
          price: priceNum,
          bedrooms: bedroomsNum,
          bathrooms: bathroomsNum,
          size: sizeStr,
          property_type: propertyTypeValue,
          listing_kind: listingKind,
          status,
        })
        .eq("id", property.id);

      if (updateError) {
        setLocalError(updateError.message);
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setLocalError("Unable to update listing.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit listing"
      panelClassName="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="edit_listing_category">
          <span className="font-medium">Listing category</span>
          <select
            id="edit_listing_category"
            value={listingCategory}
            onChange={(event) => setListingCategory(event.target.value as "property" | "land")}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="property">Property</option>
            <option value="land">Land</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="edit_listing_kind">
          <span className="font-medium">Listing type</span>
          <select
            id="edit_listing_kind"
            value={listingKind}
            onChange={(event) => setListingKind(event.target.value as PropertyRow["listing_kind"])}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>
        <Input id="edit_title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          id="edit_location"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        {listingCategory === "land" ? (
          <label className="grid gap-2 text-sm text-zinc-700" htmlFor="edit_land_type">
            <span className="font-medium">Land type</span>
            <select
              id="edit_land_type"
              value={landType}
              onChange={(event) => setLandType(event.target.value as LandListingTitle)}
              className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {landCategoryList.map((category) => (
                <option key={category.slug} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="grid gap-2 text-sm text-zinc-700" htmlFor="edit_residential_type">
            <span className="font-medium">Property type</span>
            <select
              id="edit_residential_type"
              value={residentialType}
              onChange={(event) =>
                setResidentialType(event.target.value as ResidentialPropertyType)
              }
              className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {residentialPropertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        )}
        <Input
          id="edit_price"
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <label className="grid gap-2 text-sm text-zinc-700" htmlFor="edit_status">
          <span className="font-medium">Status</span>
          <select
            id="edit_status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PropertyRow["status"])}
            className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </label>
        {listingCategory !== "land" && (
          <Input
            id="edit_bedrooms"
            label="Bedrooms"
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            required
          />
        )}
        {listingCategory !== "land" && (
          <Input
            id="edit_bathrooms"
            label="Bathrooms"
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            required
          />
        )}
        <Input
          id="edit_size"
          label={listingCategory === "land" ? "Size (e.g., 50*100, quarter, half, acre)" : "Size (sqft)"}
          type={listingCategory === "land" ? "text" : "number"}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder={listingCategory === "land" ? "e.g., 50*100" : ""}
          required
        />
        <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="edit_description">
          <span className="font-medium">Description</span>
          <textarea
            id="edit_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        {localError && <p className="md:col-span-2 text-sm text-red-600">{localError}</p>}
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

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithImagesRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [editTarget, setEditTarget] = useState<PropertyRow | null>(null);
  const [demoEditTarget, setDemoEditTarget] = useState<DemoPropertyRow | null>(null);
  const [listingCategory, setListingCategory] = useState<"property" | "land">("property");
  const [listingKind, setListingKind] = useState<PropertyRow["listing_kind"]>("sale");
  const [selectedPropertyType, setSelectedPropertyType] = useState<ResidentialPropertyType>(
    residentialPropertyTypes[0],
  );
  const [selectedLandType, setSelectedLandType] = useState<LandListingTitle>(
    landCategoryList[0].title,
  );

  const seedFrontendProperties = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;

    if (!user) {
      throw new Error("Login required to import frontend properties.");
    }

    const payload = demoProperties.map((property) => ({
      title: property.title,
      slug: property.slug,
      description: property.description,
      price: property.price,
      location: property.location,
      property_type: property.type,
      bedrooms: property.beds,
      bathrooms: property.baths,
      size: String(property.areaSqFt),
      status: "available" as const,
      agent_id: user.id,
    }));

    const { data: upsertedRows, error: upsertError } = await supabase
      .from("properties")
      .upsert(payload, {
        onConflict: "slug",
        ignoreDuplicates: true,
      })
      .select("id");
    if (upsertError) {
      throw new Error(upsertError.message);
    }

    // Keep import fast and reliable: images can be attached later in inventory.
    return upsertedRows?.length ?? 0;
  };

  const load = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: queryError } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }
      const rows = (data as PropertyWithImagesRow[] | null) ?? [];

      setProperties(rows);
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError("Unable to load properties.");
      }
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // (uses the file-level `withTimeout` helper)

  const onImportFrontendListings = async () => {
    setError(null);
    setMessage(null);
    setImporting(true);
    try {
      const importedCount = await withTimeout(
        seedFrontendProperties(),
        60000,
        "Import timed out. Check your internet and Supabase connection, then try again.",
      );
      await withTimeout(
        load(),
        12000,
        "Imported, but refresh timed out. Click Refresh to reload listings.",
      );
      if (importedCount > 0) {
        setMessage(`${importedCount} frontend listing(s) imported into inventory.`);
      } else {
        setMessage("Frontend listings were already imported.");
      }
    } catch (importError) {
      if (importError instanceof Error) {
        setError(importError.message);
      } else {
        setError("Unable to import frontend listings.");
      }
    } finally {
      setImporting(false);
    }
  };

  const uploadImageForProperty = async (propertyId: string, file: File, isPrimary: boolean) => {
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw new Error(friendlySupabaseError(uploadError.message));
    }

    const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
    const { error: imageError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      image_url: publicUrlData.publicUrl,
      is_primary: isPrimary,
    });

    if (imageError) {
      throw new Error(friendlySupabaseError(imageError.message));
    }
  };

  const insertPropertyWithUniqueSlug = async (payload: Database["public"]["Tables"]["properties"]["Insert"]) => {
    const supabase = createSupabaseBrowserClient();
    const baseSlug = payload.slug;
    const maxAttempts = 6;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const { data, error: insertError } = await supabase
        .from("properties")
        .insert({ ...payload, slug })
        .select("id, slug")
        .single();

      if (!insertError) return data;

      const code = (insertError as unknown as { code?: string }).code;
      const isUniqueViolation =
        code === "23505" ||
        insertError.message.toLowerCase().includes("duplicate key") ||
        insertError.message.toLowerCase().includes("properties_slug_key");

      if (!isUniqueViolation) {
        throw new Error(friendlySupabaseError(insertError.message));
      }
    }

    throw new Error("Could not generate a unique URL slug for this property. Try a different title.");
  };

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    try {
      const user = await getAuthenticatedUserOrThrow();

      const title = String(formData.get("title") ?? "").trim();
      if (title.length < 3) {
        setError("Title must be at least 3 characters.");
        setCreating(false);
        return;
      }
      const slug = slugify(title);
      const propertyType =
        listingCategory === "land" ? selectedLandType : selectedPropertyType;
      const description = String(formData.get("description") ?? "").trim();
      if (description.length < 10) {
        setError("Description must be at least 10 characters.");
        setCreating(false);
        return;
      }
      const location = String(formData.get("location") ?? "").trim();
      if (location.length < 2) {
        setError("Location is required.");
        setCreating(false);
        return;
      }
      const priceNum = Number(formData.get("price") ?? 0);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setError("Price must be a valid non-negative number.");
        setCreating(false);
        return;
      }

      const bedroomsNum = listingCategory === "land" ? 0 : Number(formData.get("bedrooms") ?? 0);
      const bathroomsNum = listingCategory === "land" ? 0 : Number(formData.get("bathrooms") ?? 0);
      if (
        listingCategory !== "land" &&
        (!Number.isFinite(bedroomsNum) || bedroomsNum < 0 || !Number.isFinite(bathroomsNum) || bathroomsNum < 0)
      ) {
        setError("Bedrooms and bathrooms must be valid non-negative numbers.");
        setCreating(false);
        return;
      }

      const payload = {
        title,
        slug,
        description,
        price: priceNum,
        location,
        property_type: propertyType,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        size: String(formData.get("size") ?? ""),
        listing_kind: listingKind,
        status: "available" as const,
        agent_id: user.id,
      };

      const insertedProperty = await withTimeout(
        insertPropertyWithUniqueSlug(payload),
        20000,
        "Creating timed out while saving the listing. Check your Supabase connection and try again.",
      );

      if (insertedProperty && createImages.length) {
        const failures: string[] = [];
        await withTimeout(
          (async () => {
            for (let index = 0; index < createImages.length; index += 1) {
              const file = createImages[index];
              try {
                // Ensure at least one image is primary.
                await uploadImageForProperty(insertedProperty.id, file, index === 0);
              } catch (err) {
                failures.push(err instanceof Error ? err.message : "An image failed to upload.");
              }
            }
          })(),
          45000,
          "Creating timed out while uploading images. The listing may be created—refresh to confirm.",
        );

        if (failures.length > 0) {
          setMessage(
            `Property created, but ${failures.length} image(s) failed to upload. You can add them from the inventory list.`,
          );
        }
      }

      (event.currentTarget as HTMLFormElement).reset();
      setListingCategory("property");
      setListingKind("sale");
      setSelectedPropertyType(residentialPropertyTypes[0]);
      setSelectedLandType(landCategoryList[0].title);
      setCreateImages([]);
      await withTimeout(load(), 12000, "Created, but refresh timed out. Click Refresh to reload.");
      if (!message) {
        setMessage("Property created successfully.");
      }
    } catch (createError) {
      if (createError instanceof Error) {
        setError(friendlySupabaseError(createError.message));
      } else {
        setError("Unable to create property.");
      }
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("properties").delete().eq("id", id);
    if (deleteError) {
      setError(friendlySupabaseError(deleteError.message));
      return;
    }
    await load();
  };

  const onUploadImage = async (propertyId: string, file: File) => {
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(path, file, {
        upsert: false,
      });

    if (uploadError) {
      setError(friendlySupabaseError(uploadError.message));
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(path);

    const { error: imageError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      image_url: publicUrlData.publicUrl,
      is_primary: false,
    });

    if (imageError) {
      setError(friendlySupabaseError(imageError.message));
      return;
    }
    await load();
  };

  const landListingsCount = properties.filter((property) =>
    landCategoryList.some((category) => category.title === property.property_type),
  ).length;
  const totalListingsCount = properties.length > 0 ? properties.length : demoProperties.length;
  const getPrimaryImage = (property: PropertyWithImagesRow) => {
    const images = property.property_images ?? [];
    if (images.length === 0) return null;
    return [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0]?.image_url ?? null;
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {editTarget && (
        <PropertyEditModal
          key={editTarget.id}
          property={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            void load();
            setEditTarget(null);
          }}
        />
      )}
      {demoEditTarget && (
        <DemoPropertyEditModal
          key={demoEditTarget.id}
          property={demoEditTarget}
          onClose={() => setDemoEditTarget(null)}
          onCreated={() => {
            void load();
            setDemoEditTarget(null);
          }}
        />
      )}

      <AgentPageHeader
        title="Properties"
        breadcrumb="Dashboard / Properties"
        actions={
          <>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void onImportFrontendListings()}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {importing ? "Importing..." : "Import frontend listings"}
            </button>
            <a
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
              aria-label="Site settings shortcut"
              title="Public site"
            >
              <Home className="h-5 w-5" />
            </a>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Layers className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalListingsCount}</p>
            <p className="text-sm font-medium text-slate-500">Total listings</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{landListingsCount}</p>
            <p className="text-sm font-medium text-slate-500">Land listings</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold text-emerald-700">Live</p>
            <p className="text-sm font-medium text-slate-500">Inventory sync</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">New listing</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Add property</h3>
              </div>

              <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-1" onSubmit={onCreate}>
                <label className="grid gap-2 text-sm text-zinc-700" htmlFor="listing_category">
                  <span className="font-medium">Listing Category</span>
                  <select
                    id="listing_category"
                    name="listing_category"
                    value={listingCategory}
                    onChange={(event) =>
                      setListingCategory(event.target.value as "property" | "land")
                    }
                    className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="property">Property</option>
                    <option value="land">Land</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-zinc-700" htmlFor="listing_kind">
                  <span className="font-medium">Listing type</span>
                  <select
                    id="listing_kind"
                    name="listing_kind"
                    value={listingKind}
                    onChange={(event) => setListingKind(event.target.value as PropertyRow["listing_kind"])}
                    className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="sale">For sale</option>
                    <option value="rent">For rent</option>
                  </select>
                </label>
                <Input id="title" name="title" label="Title" required />
                <Input id="location" name="location" label="Location" required />
                {listingCategory === "land" ? (
                  <label className="grid gap-2 text-sm text-zinc-700" htmlFor="property_type_land">
                    <span className="font-medium">Land Type</span>
                    <select
                      id="property_type_land"
                      name="property_type_land"
                      value={selectedLandType}
                      onChange={(event) =>
                        setSelectedLandType(event.target.value as LandListingTitle)
                      }
                      className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {landCategoryList.map((category) => (
                        <option key={category.slug} value={category.title}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="grid gap-2 text-sm text-zinc-700" htmlFor="property_type">
                    <span className="font-medium">Property Type</span>
                    <select
                      id="property_type"
                      name="property_type"
                      value={selectedPropertyType}
                      onChange={(event) =>
                        setSelectedPropertyType(event.target.value as ResidentialPropertyType)
                      }
                      className="h-11 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-black outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {residentialPropertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <Input id="price" name="price" type="number" label="Price" required />
                {listingCategory !== "land" && (
                  <Input id="bedrooms" name="bedrooms" type="number" label="Bedrooms" required />
                )}
                {listingCategory !== "land" && (
                  <Input id="bathrooms" name="bathrooms" type="number" label="Bathrooms" required />
                )}
                <Input
                  id="size"
                  name="size"
                  type={listingCategory === "land" ? "text" : "number"}
                  label={listingCategory === "land" ? "Size (e.g., 50*100, quarter, half, acre)" : "Size (sqft)"}
                  placeholder={listingCategory === "land" ? "e.g., 50*100" : ""}
                  required
                />
                <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="description">
                  <span className="font-medium">Description</span>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="rounded-sm border border-zinc-300 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-2 text-sm text-zinc-700 md:col-span-2" htmlFor="property_images">
                  <span className="font-medium">Images from device (optional)</span>
                  <input
                    id="property_images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => setCreateImages(Array.from(event.target.files ?? []))}
                    className="rounded-sm border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition-colors file:mr-3 file:rounded-sm file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {createImages.length > 0 && (
                    <p className="text-xs text-zinc-500">
                      {createImages.length} image{createImages.length === 1 ? "" : "s"} selected.
                    </p>
                  )}
                </label>
                <button
                  type="submit"
                  disabled={creating}
                  className="md:col-span-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Add property"}
                </button>
              </form>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
            </div>

            <div
              id="inventory"
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
                  Inventory
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Current listings</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload images, edit details, or remove listings from the live site.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="px-4 py-3 font-medium">Image</th>
                      <th className="px-4 py-3 font-medium">Property</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Listing</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(properties.length > 0 ? properties : []).map((property) => (
                      <tr
                        key={property.id}
                        className="border-b border-slate-50 transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3">
                          {getPrimaryImage(property) ? (
                            <img
                              src={getPrimaryImage(property) ?? ""}
                              alt={property.title}
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
                          <p className="font-semibold text-slate-900">{property.title}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{property.location}</td>
                        <td className="px-4 py-3 text-slate-600">{property.property_type}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {property.listing_kind === "rent" ? "Rental" : "Sale"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          KSh {formatListingPrice(Number(property.price))}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${listingStatusClass(property.status)}`}
                          >
                            {property.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <a
                              href={`/properties/${property.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Preview
                            </a>
                            <label className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50">
                              Image
                              <input
                                className="hidden"
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) void onUploadImage(property.id, file);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditTarget(property)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(property.id)}
                              className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {properties.length === 0 &&
                      demoProperties.map((property) => (
                        <tr
                          key={property.id}
                          className="border-b border-slate-50 bg-slate-50/50 transition hover:bg-slate-50/80"
                        >
                          <td className="px-4 py-3">
                            {property.coverImage ? (
                              <img
                                src={property.coverImage}
                                alt={property.title}
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
                            <p className="font-semibold text-slate-900">{property.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Demo listing</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{property.location}</td>
                          <td className="px-4 py-3 text-slate-600">{property.type}</td>
                          <td className="px-4 py-3 text-slate-600">Sale</td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            KSh {formatListingPrice(Number(property.price))}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              demo
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <a
                                href={`/properties/${property.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                              >
                                Preview
                              </a>
                              <button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-400 opacity-70"
                                title="Import frontend listings to manage these."
                              >
                                Image
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDemoEditTarget({
                                    ...property,
                                    listingKind: "sale",
                                    status: "available",
                                  })
                                }
                                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled
                                className="cursor-not-allowed rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-300 opacity-70"
                                title="Import frontend listings to manage these."
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {properties.length === 0 ? <div className="border-t border-slate-100" /> : null}
            </div>
      </div>
    </div>
  );
}
