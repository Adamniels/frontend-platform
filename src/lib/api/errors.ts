export type ApiErrorBody = {
  message?: string;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { status: number; code?: string; details?: unknown; cause?: unknown },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function normalizeFetchError(
  status: number,
  body: unknown,
  fallbackMessage: string,
): ApiError {
  if (body && typeof body === "object" && "message" in body) {
    const b = body as ApiErrorBody;
    return new ApiError(b.message ?? fallbackMessage, {
      status,
      code: b.code,
      details: b.details,
    });
  }
  return new ApiError(fallbackMessage, { status, details: body });
}
