import { NextResponse } from "next/server";
// import { auth } from "@/auth"
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const environment = "production"; // test | production
// function midd(request) {
//   if (environment === "test") {
//     console.log("middleware bypass:", request.url)
//     return NextResponse.next()
//   }

//   console.log("isAuthenticated", request.auth)

//   // const redirectURL = new URL("/signin", request.url)
//   // console.log('new URL("/signin", request.url)', redirectURL)
//   // return NextResponse.redirect(redirectURL)
//   return NextResponse.next()
// }

// export default auth(midd)
const { auth } = NextAuth(authConfig); // use config without database adapter

export default auth((req) => {
  console.log("middleware inside:", req.url);
  if (!req.auth) {
    // && req.nextUrl.pathname !== "/signin"
    console.log("needs auth");
    const newUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  } else {
    console.log("already auth or on signin page");
    NextResponse.next();
  }
});

// export function middleware(request) {
//   console.log("middleware")
//   return NextResponse.next()
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    // "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
    // "/api/chat/:path*",
  ],
};
