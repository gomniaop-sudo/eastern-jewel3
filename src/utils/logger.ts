/**
 * Structured Logger Utility
 * Environment-aware logging with consistent formatting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}

const isProd = import.meta.env.PROD;

const LOG_COLORS: Record<LogLevel, string> = {
  debug: 'color: #6b7280',
  info: 'color: #3b82f6',
  warn: 'color: #f59e0b',
  error: 'color: #ef4444',
};

const LOG_LABELS: Record<LogLevel, string> = {
  debug: '[DEBUG]',
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
};

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  const entry: LogEntry = {
    timestamp: formatTimestamp(),
    level,
    message,
  };
  if (data) {
    entry.data = data;
  }
  return entry;
}

function shouldLog(level: LogLevel): boolean {
  if (isProd && level === 'debug') {
    return false;
  }
  return true;
}

function consoleLog(level: LogLevel, entry: LogEntry): void {
  if (!shouldLog(level)) return;

  const style = LOG_COLORS[level];
  const label = LOG_LABELS[level];
  const timestamp = entry.timestamp.split('T')[1]?.split('.')[0] || entry.timestamp;

  const prefix = `%c${label} ${timestamp}`;

  if (entry.data) {
    console.groupCollapsed(prefix, style);
    console.log('Message:', entry.message);
    console.log('Data:', entry.data);
    if (entry.stack) {
      console.log('Stack:', entry.stack);
    }
    console.groupEnd();
  } else {
    console.log(prefix, style, entry.message);
  }
}

function storeError(entry: LogEntry): void {
  if (!isProd) return;

  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(entry);
    if (errors.length > 50) {
      errors.shift();
    }
    localStorage.setItem('app_errors', JSON.stringify(errors.slice(-20)));
  } catch {
    // Silently fail
  }
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    const entry = formatLogEntry('debug', message, data);
    consoleLog('debug', entry);
  },

  info(message: string, data?: Record<string, unknown>): void {
    const entry = formatLogEntry('info', message, data);
    consoleLog('info', entry);
  },

  warn(message: string, data?: Record<string, unknown>): void {
    const entry = formatLogEntry('warn', message, data);
    consoleLog('warn', entry);
  },

  error(message: string, data?: Record<string, unknown>): void {
    const entry = formatLogEntry('error', message, data);
    if (data?.stack) {
      entry.stack = data.stack as string;
    }
    consoleLog('error', entry);
    storeError(entry);
  },

  getStoredErrors(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  },

  clearStoredErrors(): void {
    localStorage.removeItem('app_errors');
  },
};

export type { LogEntry, LogLevel };
export default logger;
