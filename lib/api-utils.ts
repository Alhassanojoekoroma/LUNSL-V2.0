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

// ========== Frontend Error Utilities ==========
import { AxiosError } from 'axios';

/**
 * Get user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    const message = error.response?.data?.error || error.response?.data?.message;
    if (message) {
      return typeof message === 'string' ? message : JSON.stringify(message);
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Cannot connect to server. Please check if the backend is running.';
    }
    return error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    return status ? [408, 429, 500, 502, 503, 504].includes(status) : false;
  }
  return false;
};

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error)) {
        throw error;
      }
      if (i < maxRetries - 1) {
        const backoffDelay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError;
};
