import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-400 mb-4">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="primary"
                  icon={RefreshCw}
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left w-full">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-400 bg-black/50 p-3 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    // You can add custom error reporting here
    // e.g., send to error tracking service
  };
}

// Async error boundary wrapper
export function AsyncBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        fallback || (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">Failed to load: {error.message}</p>
            <button
              onClick={reset}
              className="text-sm text-red-300 hover:text-red-200 mt-2"
            >
              Retry
            </button>
          </div>
        )
      )}
    >
      {children}
    </ErrorBoundary>
  );
}