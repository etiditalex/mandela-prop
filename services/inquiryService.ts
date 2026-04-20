import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createInquiry(propertyId: string, message: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return { ok: false, error: "You must be logged in to send an inquiry." };
  }

  const { error } = await supabase.from("inquiries").insert({
    property_id: propertyId,
    user_id: user.id,
    message,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
