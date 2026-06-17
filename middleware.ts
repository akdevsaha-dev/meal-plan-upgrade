import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/api/auth/login",
    "/api/auth/register",
  ],
};

export async function middleware(req: NextRequest) {
  // Only apply rate limiting to POST requests (e.g. login and registration actions)
  if (req.method !== "POST") {
    return NextResponse.next();
  }

  // Get client IP address with proper header fallback support
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "127.0.0.1";

  const rateLimitUrl = new URL("/api/internal/rate-limit", req.url);

  try {
    const res = await fetch(rateLimitUrl.href, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip }),
    });

    if (res.ok) {
      const data = await res.json();

      if (!data.allowed) {
        const errorBody = {
          error: "Too many authentication attempts",
          limit: data.limit,
          remaining: data.remaining,
          retryAfter: data.retryAfter,
        };

        return new NextResponse(JSON.stringify(errorBody), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(data.retryAfter || 60),
            "X-RateLimit-Limit": String(data.limit),
            "X-RateLimit-Remaining": String(data.remaining),
            "X-RateLimit-Reset": String(data.retryAfter || 60),
          },
        });
      }
    }
  } catch (err) {
    console.error("Auth middleware rate limiting loopback failed, failing open for safety:", err);
  }

  return NextResponse.next();
}
