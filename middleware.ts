import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/accept-invite", "/api/auth", "/api/billing/webhook"];

export default auth(async function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC.some(r => pathname === r || pathname.startsWith(r + "/"));
  if (isPublic) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Block AI for FREE plan
  if (session.user.company?.plan === "FREE" && pathname.startsWith("/api/ai")) {
    return NextResponse.json({ error: "AI features require a paid plan." }, { status: 402 });
  }

  // Inject user context headers
  const headers = new Headers(req.headers);
  headers.set("x-user-id",    session.user.id);
  headers.set("x-company-id", session.user.companyId);
  headers.set("x-user-role",  session.user.role);

  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
};
