import { NextRequest, NextResponse } from "next/server";

import { createInquiry } from "@/services/inquiryService";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { propertyId?: string; message?: string };

  if (!body.propertyId || !body.message) {
    return NextResponse.json(
      { error: "propertyId and message are required." },
      { status: 400 },
    );
  }

  const result = await createInquiry(body.propertyId, body.message.trim());
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
