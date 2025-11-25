export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || 'Internal server error',
    };
  }

  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
  };
}

export function createErrorResponse(statusCode: number, message: string) {
  return Response.json({ error: message }, { status: statusCode });
}
