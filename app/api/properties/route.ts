import { NextResponse } from "next/server";

import { getAllProperties } from "@/services/propertyService";

export async function GET() {
  const properties = await getAllProperties();
  return NextResponse.json({ data: properties });
}
