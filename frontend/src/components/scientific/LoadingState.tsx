import React from "react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 ${className}`}
    >
      <div className="relative mb-6">
        {/* Spinner */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
      <p className="text-sm text-muted-foreground font-medium text-center">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
