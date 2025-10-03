import React, { ErrorInfo, ReactNode } from 'react';
import ErrorState from './states/ErrorState';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  info?: ErrorInfo;
}

const IS_DEV: boolean = (() => {
  try {
    return Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
  } catch {
    return false;
  }
})();

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info);
    this.setState({ info });
  }

  handleRetry = () => {
    if (IS_DEV) {
      // In dev, allow continuing without a full reload for faster iteration
      this.setState({ hasError: false, error: undefined, info: undefined });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-3">
          <ErrorState message={this.state.error?.message} />
          <div className="card card-padding flex items-center gap-2">
            <Button variant="primary" onClick={this.handleRetry}>
              Retry
            </Button>
            {IS_DEV && (
              <details className="mt-2 w-full">
                <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                  Show technical details (dev)
                </summary>
                <pre
                  className="mt-2 whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300"
                  aria-live="polite"
                >
                  {String(this.state.error?.stack ?? '')}
                  {'\n'}
                  {String(this.state.info?.componentStack ?? '')}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
