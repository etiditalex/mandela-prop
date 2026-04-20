import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const fullPath = `${pathname}${request.nextUrl.search}`;

  const isStaff = role === "agent" || role === "admin";

  if (pathname === "/login" && user && isStaff) {
    const nextParam = request.nextUrl.searchParams.get("next");
    let target = "/agent/properties";
    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
      target = nextParam;
    }
    const redirectResponse = NextResponse.redirect(new URL(target, request.url));
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (pathname.startsWith("/agent")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", fullPath || "/agent/properties");
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    if (!isStaff) {
      const staffOnly = new URL("/staff-only", request.url);
      const redirectResponse = NextResponse.redirect(staffOnly);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    const isUsersArea = pathname === "/agent/users" || pathname.startsWith("/agent/users/");
    if (isUsersArea && role !== "admin") {
      const redirectResponse = NextResponse.redirect(new URL("/agent/properties", request.url));
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static assets so middleware never interferes with CSS/JS chunks.
     * See: https://supabase.com/docs/guides/auth/server-side/nextjs
     */
    "/((?!_next/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
