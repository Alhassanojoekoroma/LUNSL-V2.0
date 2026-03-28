import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const successResponse = <T>(data: T, statusCode = 200): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
};

export const errorResponse = (
  error: unknown,
  statusCode = 500
): NextResponse<ApiResponse> => {
  let message = 'An unexpected error occurred';
  let code = 'INTERNAL_ERROR';

  if (error instanceof AppError) {
    message = error.message;
    code = error.code;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
};

export const notFoundError = (resource: string): AppError => {
  return new AppError(404, `${resource} not found`, 'NOT_FOUND');
};

export const unauthorizedError = (message = 'Unauthorized'): AppError => {
  return new AppError(401, message, 'UNAUTHORIZED');
};

export const forbiddenError = (message = 'Forbidden'): AppError => {
  return new AppError(403, message, 'FORBIDDEN');
};

export const validationError = (message: string): AppError => {
  return new AppError(400, message, 'VALIDATION_ERROR');
};

export const conflictError = (message: string): AppError => {
  return new AppError(409, message, 'CONFLICT');
};
