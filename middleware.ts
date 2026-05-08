import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const fullPath = `${pathname}${request.nextUrl.search}`;

  // Performance: avoid Supabase session lookups on public routes.
  // Only `/agent/*` is protected and `/login` needs the "already logged in" redirect.
  const needsAuthGate = pathname === "/login" || pathname.startsWith("/agent");
  if (!needsAuthGate) {
    return NextResponse.next();
  }

  const { response, user, role } = await updateSession(request);

  // Admin-only dashboard: only users with profile role "admin" may access `/agent/*`.
  // If role lookup fails/timeouts, treat as not authorized (safer default for admin areas).
  const isAdmin = role === "admin";

  if (pathname === "/login" && user && isAdmin) {
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

    if (!isAdmin) {
      const staffOnly = new URL("/staff-only", request.url);
      const redirectResponse = NextResponse.redirect(staffOnly);
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
