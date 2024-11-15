import { betterFetch } from "@better-fetch/fetch";
import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "./lib/auth-types";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("kedai.session_token");

    if (!sessionCookie) {
      const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
          baseURL: request.nextUrl.origin,
          headers: {
            //get the cookie from the request
            cookie: request.headers.get("cookie") ?? "",
          },
        },
      );
      if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (err) {
    if (isDynamicServerError(err)) {
      throw err;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/no-organization"],
};
