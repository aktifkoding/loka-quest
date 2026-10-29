export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function successResponse<T>(
  data: T,
  statusCode = 200
): Response {
  return Response.json({ success: true, data }, { status: statusCode });
}

export function errorResponse(
  statusCode: number,
  message: string,
  details?: Record<string, unknown>
): Response {
  return Response.json(
    { success: false, error: message, details },
    { status: statusCode }
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }

  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(400, error.message);
    }
    throw new ApiError(400, "Validation failed");
  }
}
