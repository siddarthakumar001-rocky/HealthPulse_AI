import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[System Recovery Engine] Uncaught UI exception caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-card/60 backdrop-blur-xl border border-destructive/20 rounded-3xl shadow-2xl m-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-4 shadow-lg shadow-destructive/10 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold font-display text-foreground mb-2">
            {this.props.fallbackTitle || "System Telemetry Interface Recovered"}
          </h2>

          <p className="text-sm text-muted-foreground max-w-md mb-4 leading-relaxed font-sans">
            A visual rendering constraint was intercepted safely. All underlying healthcare data streams, telemetry records, and services remain fully secure.
          </p>

          {this.state.error && (
            <div className="w-full bg-slate-950/80 text-teal-400 p-3 rounded-xl font-mono text-xs overflow-x-auto text-left mb-6 border border-teal-500/20 max-h-32">
              <code>{this.state.error.message || String(this.state.error)}</code>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={this.handleReload}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 h-10 rounded-xl flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              Re-sync View
            </Button>
            <Button
              variant="outline"
              onClick={this.handleGoHome}
              className="border-border text-foreground hover:bg-muted font-semibold px-5 h-10 rounded-xl flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
