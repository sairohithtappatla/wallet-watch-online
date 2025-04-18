
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/contexts/ErrorContext";

interface FormSubmitOptions<T> {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  redirectOnSuccess?: string;
}

export function useFormSubmit<T>(
  submitFn: (data: T) => Promise<any>,
  options: FormSubmitOptions<T> = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitFn(data);
      
      if (options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error("Form submission error:", error);
      
      if (options.errorMessage) {
        toast({
          variant: "destructive",
          title: "Error",
          description: options.errorMessage || "An error occurred. Please try again.",
        });
      }
      
      if (options.onError) {
        options.onError(error as Error);
      } else {
        handleError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}
