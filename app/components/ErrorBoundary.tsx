// File: app/components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'app' | 'feature' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch React errors and display fallback UI
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * With custom fallback:
 * <ErrorBoundary fallback={CustomErrorFallback}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    logger.error('React Error Boundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI based on level
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  private renderDefaultFallback() {
    const { level = 'component' } = this.props;
    const { error, errorInfo } = this.state;

    switch (level) {
      case 'app':
        return <AppLevelFallback error={error!} reset={this.resetError} />;
      case 'feature':
        return <FeatureLevelFallback error={error!} reset={this.resetError} />;
      case 'component':
      default:
        return (
          <ComponentLevelFallback
            error={error!}
            errorInfo={errorInfo}
            reset={this.resetError}
          />
        );
    }
  }
}

/**
 * App-level error fallback (full page)
 */
const AppLevelFallback = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-300 mb-6">
          We encountered an unexpected error. The development team has been notified.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-900/20 border border-red-500 rounded p-4 mb-6 text-left">
            <p className="text-red-300 font-mono text-sm break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Feature-level error fallback (partial page)
 */
const FeatureLevelFallback = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Feature Unavailable</h3>
          <p className="mt-2 text-sm text-red-700">
            This feature encountered an error and is temporarily unavailable.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-xs font-mono text-red-600 break-words">
              {error.message}
            </p>
          )}

          <button
            onClick={reset}
            className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component-level error fallback (inline)
 */
const ComponentLevelFallback = ({
  error,
  errorInfo,
  reset,
}: {
  error: Error;
  errorInfo: ErrorInfo | null;
  reset: () => void;
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 my-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-yellow-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm font-medium text-yellow-800">
            Component Error
          </span>
        </div>

        <button
          onClick={reset}
          className="text-sm text-yellow-700 hover:text-yellow-600 underline"
        >
          Retry
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-yellow-600 hover:text-yellow-700"
          >
            {showDetails ? '▼' : '▶'} Details
          </button>

          {showDetails && (
            <div className="mt-2 bg-yellow-100 rounded p-2">
              <p className="text-xs font-mono text-yellow-900 break-words">
                {error.message}
              </p>
              {errorInfo?.componentStack && (
                <pre className="mt-2 text-xs text-yellow-800 overflow-x-auto">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hook to use Error Boundary functionality in function components
 * Note: This is a helper, actual error boundary must be a class component
 */
export function useErrorHandler() {
  const [, setError] = React.useState();

  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
}

// Export specialized error boundaries
export const AppErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary level="app">{children}</ErrorBoundary>
);

export const FeatureErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary level="feature">{children}</ErrorBoundary>
);

export const ComponentErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);

export default ErrorBoundary;
