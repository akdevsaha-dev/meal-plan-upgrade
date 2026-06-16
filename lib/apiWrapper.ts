import { NextRequest, NextResponse } from "next/server";

export type ApiRouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error("[API ERROR]:", error);

      let message = "An unexpected error occurred";
      let status = 500;

      if (error instanceof Error) {
        message = error.message;
      }

      if (error.code && typeof error.code === "string" && error.code.startsWith("P")) {
        message = "Database operation failed";
        status = 400;
      }

      return NextResponse.json({ error: message }, { status });
    }
  };
}
