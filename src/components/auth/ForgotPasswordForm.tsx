
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "./AuthLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";

const illustrationUrl =
  "/lovable-uploads/0849a869-9b68-4dc6-b283-d2e6f7c4d618.png";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      await resetPassword(email);
      setFeedback({ type: "success", message: "Check your email inbox for a password reset link." });
      window.dispatchEvent(
        new CustomEvent("wwAppNotification", {
          detail: {
            title: "Password reset requested",
            description: "Check your email to reset your password.",
          },
        })
      );
    } catch (error: any) {
      setFeedback({ type: "error", message: error.message || "Failed to send reset link." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your registered email and we'll send you a reset link."
      illustrationUrl={illustrationUrl}
    >
      <div className="space-y-8">
        {feedback && (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
            {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="email">Registered Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-fuchsia-50/70 border-fuchsia-200 focus-visible:ring-fuchsia-500"
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:from-fuchsia-800 hover:to-purple-800 text-white shadow shadow-purple-200/30 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
        <div className="text-center mt-5">
          <Link to="/login" className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline">Back to Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
