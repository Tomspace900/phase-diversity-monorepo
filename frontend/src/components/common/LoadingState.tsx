import React from "react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <div className="relative mb-6">
        {/* Spinner */}
        <div className="border-primary inline-block h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
      <p className="text-muted-foreground text-center text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
