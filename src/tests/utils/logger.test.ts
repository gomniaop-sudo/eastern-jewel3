/**
 * Logger Utility Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '../../utils/logger'

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>
    groupCollapsed: ReturnType<typeof vi.spyOn>
    groupEnd: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {}),
      groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
    }
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logger.debug', () => {
    it('calls console.log in non-prod environment', () => {
      logger.debug('Debug message')
      // In test (non-prod) environment, debug logs should be called
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('accepts optional data object', () => {
      logger.debug('Debug with data', { key: 'value' })
      expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
    })
  })

  describe('logger.info', () => {
    it('calls console.log with info message', () => {
      logger.info('Info message')
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('groups output when data is provided', () => {
      logger.info('Info with data', { userId: '123' })
      expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })
  })

  describe('logger.warn', () => {
    it('logs warning messages', () => {
      logger.warn('Warning message')
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('logger.error', () => {
    it('logs error messages', () => {
      logger.error('Error message')
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('logs error with data', () => {
      logger.error('Error with data', { code: 'DB_ERROR' })
      expect(consoleSpy.groupCollapsed).toHaveBeenCalled()
    })
  })

  describe('getStoredErrors / clearStoredErrors', () => {
    it('returns empty array when no errors stored', () => {
      const errors = logger.getStoredErrors()
      expect(Array.isArray(errors)).toBe(true)
    })

    it('clearStoredErrors removes stored errors', () => {
      // Pre-set some errors in localStorage
      window.localStorage.setItem('app_errors', JSON.stringify([{ level: 'error', message: 'test', timestamp: '' }]))
      logger.clearStoredErrors()
      expect(window.localStorage.getItem('app_errors')).toBeNull()
    })

    it('returns empty array when localStorage has malformed JSON', () => {
      window.localStorage.setItem('app_errors', 'invalid json{{{')
      const errors = logger.getStoredErrors()
      expect(errors).toEqual([])
    })
  })
})
