/**
 * Service Error Handler
 * Normalized error structure for all services
 */

import { logger } from './logger';

export interface ServiceError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  originalError?: unknown;
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

export function createServiceError(
  error: unknown,
  defaultMessage = 'An error occurred'
): ServiceError {
  if (error instanceof Error) {
    const message = error.message || defaultMessage;

    // Map common errors to codes
    if (message.includes('network') || message.includes('fetch')) {
      return {
        message,
        code: ErrorCodes.NETWORK_ERROR,
        originalError: error,
      };
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        message,
        code: ErrorCodes.UNAUTHORIZED,
        originalError: error,
      };
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return {
        message,
        code: ErrorCodes.FORBIDDEN,
        originalError: error,
      };
    }

    if (message.includes('not found') || message.includes('404')) {
      return {
        message,
        code: ErrorCodes.NOT_FOUND,
        originalError: error,
      };
    }

    return {
      message,
      code: ErrorCodes.UNKNOWN,
      originalError: error,
    };
  }

  return {
    message: defaultMessage,
    code: ErrorCodes.UNKNOWN,
    originalError: error,
  };
}

export function logServiceError(
  service: string,
  operation: string,
  error: unknown
): ServiceError {
  const serviceError = createServiceError(error);
  logger.error(`[${service}] ${operation} failed`, {
    code: serviceError.code,
    message: serviceError.message,
  });
  return serviceError;
}

export function handleServiceError<T>(
  error: unknown,
  fallback: T,
  service?: string,
  operation?: string
): T {
  if (service && operation) {
    logServiceError(service, operation, error);
  } else {
    logger.error('Service error', { error: String(error) });
  }
  return fallback;
}

export default createServiceError;
