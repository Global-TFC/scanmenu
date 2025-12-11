"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ProductErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Product Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="py-6 bg-red-50 border-y-[4px] border-red-500 my-4">
          <div className="px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
              <AlertTriangle className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight text-red-800">
              Something went wrong
            </h2>
            <p className="text-red-700 text-sm mb-4 font-bold">
              {this.state.error?.message || "An unexpected error occurred while loading products"}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for FlashDeals component
export function FlashDealsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ProductErrorBoundary
      fallback={
        <div className="py-6 bg-yellow-100 border-y-[4px] border-yellow-500 my-4">
          <div className="px-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <p className="text-yellow-800 text-sm font-bold uppercase">
              Flash Deals temporarily unavailable
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ProductErrorBoundary>
  );
}

// Specific error boundary for Product Grid component
export function ProductGridErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ProductErrorBoundary
      fallback={
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
            <AlertTriangle className="text-white" size={28} />
          </div>
          <p className="text-red-800 text-lg font-black uppercase mb-2">
            Failed to load products
          </p>
          <p className="text-red-700 text-sm font-bold uppercase">
            Please refresh the page to try again
          </p>
        </div>
      }
    >
      {children}
    </ProductErrorBoundary>
  );
}