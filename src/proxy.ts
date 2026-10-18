import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  const password = process.env.APP_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
    return new NextResponse("Service access is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const username = process.env.APP_USERNAME || "coach";
  const authorization = request.headers.get("authorization") || "";
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
  if (match) {
    const supplied = createHash("sha256")
      .update(Buffer.from(match[1], "base64"))
      .digest();
    const expected = createHash("sha256")
      .update(`${username}:${password}`)
      .digest();

    if (timingSafeEqual(supplied, expected)) {
      const origin = request.headers.get("origin");
      if (origin && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        let sameHost = false;
        try {
          sameHost = new URL(origin).host === (request.headers.get("host") || request.nextUrl.host);
        } catch {}
        if (!sameHost) {
          return new NextResponse("Cross-origin writes are not allowed.", {
            status: 403,
            headers: { "Cache-Control": "no-store" },
          });
        }
      }
      const response = NextResponse.next();
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Interview Coach", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
