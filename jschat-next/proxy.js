import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const environment = "production"; // test | production

// export default auth(midd)
const { auth } = NextAuth(authConfig); // use config without database adapter

export const proxy = auth((req) => {
  // console.log("middleware inside:", req.url);
  // Allow landing page without auth
  if (req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }
  if (!req.auth) {
    console.log("needs auth");
    const newUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  } else {
    console.log("already auth or on signin page");
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
