
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  center?: boolean;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({
  size = "md",
  className,
  center = false,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    xs: "h-3 w-3 border-2",
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
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

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
        {text && <p className="mt-4 text-sm font-medium text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (center) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-8">
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
