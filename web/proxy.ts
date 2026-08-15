import { type NextRequest, NextResponse } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/callback",
  "/leaderboard",
  "/api/leaderboard",
]);

// Paths that authenticated users should be redirected away from
const AUTH_ONLY_PATHS = new Set(["/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("sliit_session")?.value;
  const isAuthenticated = Boolean(sessionCookie);

  // Handle root "/" directly at proxy layer to avoid 307 redirect hops
  if (pathname === "/") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = isAuthenticated ? "/learn" : "/login";
    return NextResponse.redirect(targetUrl);
  }

  // Redirect unauthenticated users away from protected routes to /login
  if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login to /learn
  if (isAuthenticated && AUTH_ONLY_PATHS.has(pathname)) {
    const learnUrl = request.nextUrl.clone();
    learnUrl.pathname = "/learn";
    return NextResponse.redirect(learnUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|assets).*)"],
};
