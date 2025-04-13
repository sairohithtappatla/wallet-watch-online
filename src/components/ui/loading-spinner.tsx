
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  center?: boolean;
  text?: string;
}

const LoadingSpinner = ({
  size = "md",
  className,
  center = false,
  text,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-solid border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  if (center) {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        {spinner}
        {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
