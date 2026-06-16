import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/apiWrapper";

export const POST = withErrorHandler(async () => {
    const response = NextResponse.json({ message: "Logged out successfully" });

    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });

    return response;
});
