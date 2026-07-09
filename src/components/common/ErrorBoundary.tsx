/**
 * Error Boundary Component
 * Catches runtime React errors with elegant fallback
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { TriangleAlert as AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = generateErrorId();
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorId } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-luxury-dark border border-luxury-light/20 rounded-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-display text-white mb-4">
              Something went wrong
            </h1>

            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Please try again or refresh the page.
            </p>

            {errorId && (
              <p className="text-gray-500 text-xs mb-4 font-mono">
                Error ID: {errorId}
              </p>
            )}

            {isDev && error && (
              <div className="mb-6 p-4 bg-luxury-black rounded-sm text-left overflow-auto max-h-48">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <Bug className="w-4 h-4" />
                  <span className="text-sm font-medium">Error Details (Dev Only)</span>
                </div>
                <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-luxury-light hover:bg-luxury-gray text-white font-medium rounded-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-luxury-black font-medium rounded-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go Home
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
