import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function verifyPropertyOwnership(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  propertyId: string,
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError.message, status: 401 as const, isOwner: false, isAdmin: false };
  }
  const user = authData.user;
  if (!user) {
    return { error: "Login required.", status: 401 as const, isOwner: false, isAdmin: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    return { error: profileError.message, status: 400 as const, isOwner: false, isAdmin: false };
  }

  const propertyResult = await supabase
    .from("properties")
    .select("agent_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (propertyResult.error) {
    return { error: propertyResult.error.message, status: 400 as const, isOwner: false, isAdmin: false };
  }
  if (!propertyResult.data) {
    return { error: "Property not found.", status: 404 as const, isOwner: false, isAdmin: false };
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = propertyResult.data.agent_id === user.id;
  if (!isAdmin && !isOwner) {
    return { error: "Permission denied.", status: 403 as const, isOwner: false, isAdmin: false };
  }

  return { error: null, status: 200 as const, isOwner, isAdmin };
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const formData = await req.formData();
  const propertyId = String(formData.get("propertyId") ?? "").trim();
  const isPrimary = String(formData.get("isPrimary") ?? "false") === "true";
  const file = formData.get("file");

  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId." }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file." }, { status: 400 });
  }

  const ownership = await verifyPropertyOwnership(supabase, propertyId);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("property-images").upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600",
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: publicUrlData } = supabase.storage.from("property-images").getPublicUrl(path);
  if (!publicUrlData?.publicUrl) {
    return NextResponse.json({ error: "Unable to resolve image URL." }, { status: 500 });
  }

  const { error: imageError } = await supabase.from("property_images").insert({
    property_id: propertyId,
    image_url: publicUrlData.publicUrl,
    is_primary: isPrimary,
  });
  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 400 });
  }

  return NextResponse.json({ data: { imageUrl: publicUrlData.publicUrl } }, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const imageId = String(body.imageId ?? "").trim();
  const propertyId = String(body.propertyId ?? "").trim();
  const isPrimary = body.isPrimary === true;

  if (!imageId || !propertyId) {
    return NextResponse.json({ error: "Missing imageId or propertyId." }, { status: 400 });
  }

  const ownership = await verifyPropertyOwnership(supabase, propertyId);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  // If setting this image as primary, unset all others for this property
  if (isPrimary) {
    await supabase
      .from("property_images")
      .update({ is_primary: false })
      .eq("property_id", propertyId)
      .neq("id", imageId);
  }

  const { error } = await supabase.from("property_images").update({ is_primary: isPrimary }).eq("id", imageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { success: true } }, { status: 200 });
}

export async function DELETE(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const url = new URL(req.url);
  const imageId = url.searchParams.get("imageId")?.trim();
  const propertyId = url.searchParams.get("propertyId")?.trim();

  if (!imageId || !propertyId) {
    return NextResponse.json({ error: "Missing imageId or propertyId." }, { status: 400 });
  }

  const ownership = await verifyPropertyOwnership(supabase, propertyId);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  // Fetch the image to get the storage path
  const { data: imageData, error: fetchError } = await supabase
    .from("property_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }
  if (!imageData) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  // Delete from storage (extract path from URL)
  const storagePathMatch = imageData.image_url.match(/property-images%2F(.+?)(\?|$)/);
  if (storagePathMatch) {
    const storagePath = decodeURIComponent(storagePathMatch[1]);
    await supabase.storage.from("property-images").remove([storagePath]);
  }

  // Delete from database
  const { error: deleteError } = await supabase.from("property_images").delete().eq("id", imageId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
