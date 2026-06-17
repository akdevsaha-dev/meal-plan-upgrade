import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { ip } = await req.json();

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    const result = await checkAuthRateLimit(ip);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Internal rate limit error:", err);
    return NextResponse.json({
      allowed: true,
      limit: 15,
      remaining: 15,
    });
  }
}
