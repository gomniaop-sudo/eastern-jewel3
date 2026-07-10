import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the logger before importing the module under test.
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  createServiceError,
  logServiceError,
  handleServiceError,
  ErrorCodes,
} from '../../utils/errors';
import { logger } from '../../utils/logger';

describe('errors utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ErrorCodes', () => {
    it('exports all expected error code constants', () => {
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCodes.TIMEOUT).toBe('TIMEOUT');
      expect(ErrorCodes.UNKNOWN).toBe('UNKNOWN');
    });
  });

  describe('createServiceError', () => {
    it('maps a message containing "network" to NETWORK_ERROR', () => {
      const result = createServiceError(new Error('A network failure occurred'));
      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(result.message).toBe('A network failure occurred');
      expect(result.originalError).toBeInstanceOf(Error);
    });

    it('maps a message containing "fetch" to NETWORK_ERROR', () => {
      const result = createServiceError(new Error('Failed to fetch resource'));
      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
    });

    it('maps a message containing "unauthorized" to UNAUTHORIZED', () => {
      const result = createServiceError(new Error('You are unauthorized'));
      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    it('maps a message containing "401" to UNAUTHORIZED', () => {
      const result = createServiceError(new Error('Request returned 401'));
      expect(result.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    it('maps a message containing "forbidden" to FORBIDDEN', () => {
      const result = createServiceError(new Error('Access forbidden'));
      expect(result.code).toBe(ErrorCodes.FORBIDDEN);
    });

    it('maps a message containing "403" to FORBIDDEN', () => {
      const result = createServiceError(new Error('Server responded 403'));
      expect(result.code).toBe(ErrorCodes.FORBIDDEN);
    });

    it('maps a message containing "not found" to NOT_FOUND', () => {
      const result = createServiceError(new Error('Resource not found'));
      expect(result.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('maps a message containing "404" to NOT_FOUND', () => {
      const result = createServiceError(new Error('Error 404 occurred'));
      expect(result.code).toBe(ErrorCodes.NOT_FOUND);
    });

    it('maps a generic Error (no keywords) to UNKNOWN', () => {
      const result = createServiceError(new Error('Something went wrong'));
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.message).toBe('Something went wrong');
    });

    it('uses defaultMessage when the Error has an empty message', () => {
      const result = createServiceError(new Error(''), 'Fallback message');
      expect(result.message).toBe('Fallback message');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
    });

    it('uses the custom defaultMessage for non-Error inputs (string)', () => {
      const result = createServiceError('just a string', 'Default fallback');
      expect(result.message).toBe('Default fallback');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.originalError).toBe('just a string');
    });

    it('uses default defaultMessage ("An error occurred") for non-Error without one', () => {
      const result = createServiceError(42);
      expect(result.message).toBe('An error occurred');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.originalError).toBe(42);
    });

    it('returns UNKNOWN for null input with defaultMessage', () => {
      const result = createServiceError(null, 'Null happened');
      expect(result.message).toBe('Null happened');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(result.originalError).toBeNull();
    });

    it('returns UNKNOWN for undefined input', () => {
      const result = createServiceError(undefined);
      expect(result.message).toBe('An error occurred');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
    });
  });

  describe('logServiceError', () => {
    it('returns a ServiceError and calls logger.error', () => {
      const error = new Error('network down');
      const result = logServiceError('galleryService', 'getAll', error);

      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(result.message).toBe('network down');
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('passes the service and operation into the log message', () => {
      const error = new Error('404 not found');
      logServiceError('journalService', 'getById', error);

      expect(logger.error).toHaveBeenCalledTimes(1);
      const [message, data] = (logger.error as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(message).toBe('[journalService] getById failed');
      expect(data).toMatchObject({
        code: ErrorCodes.NOT_FOUND,
        message: '404 not found',
      });
    });

    it('handles non-Error inputs and still logs', () => {
      const result = logServiceError('authService', 'signIn', 'string error');
      expect(result.code).toBe(ErrorCodes.UNKNOWN);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleServiceError', () => {
    it('returns the fallback value', () => {
      const fallback = { ok: false, items: [] };
      const result = handleServiceError(new Error('boom'), fallback);
      expect(result).toBe(fallback);
    });

    it('calls logServiceError when service and operation are provided', () => {
      handleServiceError(new Error('oops'), 42, 'settingsService', 'getValue');
      expect(logger.error).toHaveBeenCalledTimes(1);
      const [message] = (logger.error as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(message).toBe('[settingsService] getValue failed');
    });

    it('logs a generic message when service/operation are not provided', () => {
      handleServiceError(new Error('oops'), 'fallback');
      expect(logger.error).toHaveBeenCalledTimes(1);
      const [message] = (logger.error as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(message).toBe('Service error');
    });

    it('returns fallback for non-Error inputs', () => {
      const result = handleServiceError('a string', 'default-val');
      expect(result).toBe('default-val');
      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('preserves the exact fallback reference', () => {
      const fallback = ['a', 'b', 'c'];
      const result = handleServiceError(new Error('err'), fallback, 'svc', 'op');
      expect(result).toBe(fallback);
      expect(result).toHaveLength(3);
    });
  });
});
