import { Component, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title?: string;
  description?: string;
  errorMessage?: string;
  errorStatus?: number | string;
  errorStack?: string;
  eventId?: string | null;
  onReload: () => void;
  onGoHome: () => void;
  onReportIssue?: () => void;
}

export function ErrorView({
  title = "Something went wrong",
  description = "We ran into a minor hiccup. Try refreshing the page. If the error persists, don't worry—we've automatically sent the details to our support team.",
  errorMessage,
  errorStatus,
  errorStack,
  eventId,
  onReload,
  onGoHome,
  onReportIssue,
}: ErrorViewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const detailString = JSON.stringify(
      {
        status: errorStatus,
        message: errorMessage,
        stack: errorStack,
        eventId: eventId,
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(detailString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800 font-sans p-6">
      <div className="relative w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-lg space-y-6 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertCircle className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>

          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={onReload}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-medium py-2.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </Button>

          <div className="flex gap-2 w-full">
            <Button
              onClick={onGoHome}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-2.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>

            {eventId && onReportIssue && (
              <Button
                onClick={onReportIssue}
                className="flex-1 bg-amber-500 hover:bg-amber-600 border-amber-500 text-white font-medium py-2.5 cursor-pointer flex items-center justify-center gap-2"
              >
                Report Issue
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Technical Details */}
        {(errorMessage || errorStack || eventId) && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium cursor-pointer"
            >
              <span>Diagnostics info</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <div className="mt-3 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500">
                    {errorStatus ? `Error Code: ${errorStatus}` : eventId ? `Event ID: ${eventId}` : "Error Details"}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-800 font-mono cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <pre className="max-h-32 overflow-y-auto bg-gray-50 rounded p-3 font-mono text-[10px] text-gray-600 whitespace-pre-wrap select-all border border-gray-200">
                  {errorMessage}
                  {errorStack && `\n\nStack:\n${errorStack}`}
                  {eventId && `\n\nSentry Event ID:\n${eventId}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  eventId: string | null;
  onReset?: () => void;
}

export function ErrorBoundaryFallback({ error, eventId, onReset }: ErrorBoundaryFallbackProps) {
  const handleReload = () => {
    if (onReset) onReset();
    window.location.reload();
  };

  const handleGoHome = () => {
    if (onReset) onReset();
    window.location.href = "/";
  };

  const handleReportIssue = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId });
    }
  };

  return (
    <ErrorView
      errorMessage={error?.message || "Unknown rendering error"}
      errorStatus={error?.name || "Error"}
      errorStack={error?.stack}
      eventId={eventId}
      onReload={handleReload}
      onGoHome={handleGoHome}
      onReportIssue={handleReportIssue}
    />
  );
}

class RouterErrorBoundaryInner extends Component<{ error: unknown }, { eventId: string | null }> {
  public state = { eventId: null as string | null };

  public componentDidMount() {
    const errorObject = this.props.error instanceof Error ? this.props.error : new Error(String(this.props.error));
    const eventId = Sentry.captureException(errorObject);
    this.setState({ eventId });
  }

  public render() {
    const { error } = this.props;

    let errorMessage = "An unexpected error has occurred.";
    let errorStatus: number | string = "Error";
    let errorStack: string | undefined = undefined;

    if (isRouteErrorResponse(error)) {
      errorStatus = error.status;
      errorMessage = error.statusText || (error.data as { message?: string })?.message || JSON.stringify(error.data) || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      errorMessage = "message" in error && typeof (error as Record<string, unknown>).message === "string"
        ? (error as Record<string, string>).message
        : JSON.stringify(error);
    }

    const handleReload = () => {
      window.location.reload();
    };

    const handleGoHome = () => {
      window.location.href = "/";
    };

    const handleReportIssue = () => {
      if (this.state.eventId) {
        Sentry.showReportDialog({ eventId: this.state.eventId });
      }
    };

    return (
      <ErrorView
        errorMessage={errorMessage}
        errorStatus={errorStatus}
        errorStack={errorStack}
        eventId={this.state.eventId}
        onReload={handleReload}
        onGoHome={handleGoHome}
        onReportIssue={handleReportIssue}
      />
    );
  }
}

export function RouterErrorFallback() {
  const error = useRouteError();
  return <RouterErrorBoundaryInner error={error} />;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = Sentry.captureException(error, { extra: { errorInfo } });
    this.setState({ eventId });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          eventId={this.state.eventId}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
