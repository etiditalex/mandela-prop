import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }
  const user = authData.user;
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const propertyResult = await supabase
    .from("properties")
    .select("agent_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (propertyResult.error) {
    return NextResponse.json({ error: propertyResult.error.message }, { status: 400 });
  }
  if (!propertyResult.data) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = propertyResult.data.agent_id === user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Permission denied." }, { status: 403 });
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
