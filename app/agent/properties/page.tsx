"use client";

import { FormEvent, useEffect, useState } from "react";
import { Building2, Home, Layers, RefreshCw, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { landCategoryList, type LandListingTitle } from "@/lib/land";
import { AgentPageHeader } from "@/components/admin/AgentPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Database } from "@/types/database";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

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

  const propertyTypeValue =
    listingCategory === "land" ? landType : residentialType;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setLocalError(null);

    const priceNum = Number(price);
    const bedroomsNum = Number(bedrooms);
    const bathroomsNum = Number(bathrooms);
    const sizeNum = Number(size);
    if (
      Number.isNaN(priceNum) ||
      Number.isNaN(bedroomsNum) ||
      Number.isNaN(bathroomsNum) ||
      Number.isNaN(sizeNum)
    ) {
      setLocalError("Price, bedrooms, bathrooms, and size must be valid numbers.");
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
          size: sizeNum,
          property_type: propertyTypeValue,
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
        <Input
          id="edit_bedrooms"
          label="Bedrooms"
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          required
        />
        <Input
          id="edit_bathrooms"
          label="Bathrooms"
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          required
        />
        <Input
          id="edit_size"
          label="Size (sqft)"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
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
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<PropertyRow | null>(null);
  const [listingCategory, setListingCategory] = useState<"property" | "land">("property");
  const [selectedPropertyType, setSelectedPropertyType] = useState<ResidentialPropertyType>(
    residentialPropertyTypes[0],
  );
  const [selectedLandType, setSelectedLandType] = useState<LandListingTitle>(
    landCategoryList[0].title,
  );

  const load = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: queryError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return;
      }
      setProperties(data ?? []);
    } catch {
      setError("Supabase env vars are missing.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setError("Login as agent to create listings.");
        setLoading(false);
        return;
      }

      const title = String(formData.get("title") ?? "");
      const slug = slugify(title);
      const propertyType =
        listingCategory === "land" ? selectedLandType : selectedPropertyType;
      const payload = {
        title,
        slug,
        description: String(formData.get("description") ?? ""),
        price: Number(formData.get("price") ?? 0),
        location: String(formData.get("location") ?? ""),
        property_type: propertyType,
        bedrooms: Number(formData.get("bedrooms") ?? 0),
        bathrooms: Number(formData.get("bathrooms") ?? 0),
        size: Number(formData.get("size") ?? 0),
        status: "available" as const,
        agent_id: authData.user.id,
      };

      const { error: insertError } = await supabase.from("properties").insert(payload);
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
      (event.currentTarget as HTMLFormElement).reset();
      setListingCategory("property");
      setSelectedPropertyType(residentialPropertyTypes[0]);
      setSelectedLandType(landCategoryList[0].title);
      await load();
    } catch {
      setError("Unable to create property.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("properties").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await load();
  };

  const onUploadImage = async (propertyId: string, file: File) => {
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop();
    const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(path, file, {
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
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
      setError(imageError.message);
      return;
    }
    await load();
  };

  const landListingsCount = properties.filter((property) =>
    landCategoryList.some((category) => category.title === property.property_type),
  ).length;

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

      <AgentPageHeader
        title="Listings"
        breadcrumb="Dashboard / Listings"
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
            <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Information</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          When the <code className="rounded bg-white/10 px-1">properties</code> table has rows, the
          public site uses them. If empty, visitors see sample listings until you add data here or run{" "}
          <code className="rounded bg-white/10 px-1">seed_featured_residential.sql</code> in Supabase.
        </p>
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
                <Input id="bedrooms" name="bedrooms" type="number" label="Bedrooms" required />
                <Input id="bathrooms" name="bathrooms" type="number" label="Bathrooms" required />
                <Input id="size" name="size" type="number" label="Size (sqft)" required />
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
                <button
                  type="submit"
                  disabled={loading}
                  className="md:col-span-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Add property"}
                </button>
              </form>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
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
                      <th className="px-4 py-3 font-medium">Property</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr
                        key={property.id}
                        className="border-b border-slate-50 transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{property.title}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{property.location}</td>
                        <td className="px-4 py-3 text-slate-600">{property.property_type}</td>
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
                  </tbody>
                </table>
              </div>

              {properties.length === 0 && (
                <div className="border-t border-slate-100 px-6 py-14 text-center text-sm text-slate-500">
                  No properties yet. Add your first listing using the form.
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
