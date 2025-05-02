
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ErrorContextProps {
  handleError: (error: unknown, redirectTo?: string) => void;
  setGlobalError: (error: GlobalError | null) => void;
  globalError: GlobalError | null;
}

export interface GlobalError {
  status?: number;
  title: string;
  message: string;
  critical?: boolean;
}

const ErrorContext = createContext<ErrorContextProps | undefined>(undefined);

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useErrorHandler must be used within an ErrorProvider");
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleError = (error: unknown, redirectTo?: string) => {
    console.error("Error caught by error handler:", error);
    
    // Format error message based on error type
    let errorMessage = "An unexpected error occurred";
    let errorTitle = "Error";
    let status = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String((error as any).message);
      if ("status" in error) {
        status = Number((error as any).status) || 500;
      }
    }
    
    // Show toast notification for non-critical errors
    toast({
      variant: "destructive",
      title: errorTitle,
      description: errorMessage,
    });
    
    // Redirect if specified
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const value = {
    handleError,
    setGlobalError,
    globalError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};
