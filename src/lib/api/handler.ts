import { ApiError } from "./response";

type Handler = () => Promise<Response>;

/**
 * Wraps a route handler with consistent error mapping:
 * - Unauthorized / Forbidden auth guards -> 401 / 403
 * - Zod validation failures -> 400
 * - Everything else -> 500 without leaking internals
 */
export async function withErrorHandling(handler: Handler): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return Response.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "Forbidden") {
        return Response.json(
          { success: false, error: "You do not have access to this resource" },
          { status: 403 }
        );
      }
      if (error.name === "ZodError") {
        return Response.json(
          { success: false, error: "Validation failed" },
          { status: 400 }
        );
      }
    }

    // Log server-side, return generic error to client
    console.error("[api] unhandled error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
