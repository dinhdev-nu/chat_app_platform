import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isChatPage = request.nextUrl.pathname.startsWith("/chat");

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (isChatPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/chat/:path*"],
};
