
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "./AuthLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Eye, EyeOff, KeyRound } from "lucide-react";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [isValidLink, setIsValidLink] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Password validation
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    // Check if the reset token exists in the URL
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const type = params.get("type");
    
    if (token && type === "recovery") {
      setIsValidLink(true);
    } else {
      setFeedback({
        type: "error",
        message: "Invalid or expired password reset link. Please request a new one."
      });
    }
  }, [location]);
  
  useEffect(() => {
    // Validate password as user types
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidLink) {
      return;
    }
    
    // Check password strength
    const isStrongPassword = Object.values(passwordStrength).every(Boolean);
    if (!isStrongPassword) {
      setFeedback({
        type: "error",
        message: "Password does not meet all strength requirements"
      });
      return;
    }
    
    // Check passwords match
    if (password !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "Passwords do not match"
      });
      return;
    }
    
    setIsLoading(true);
    setFeedback(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setFeedback({
        type: "success",
        message: "Your password has been updated successfully. You can now log in."
      });
      
      window.dispatchEvent(
        new CustomEvent("wwAppNotification", {
          detail: {
            title: "Password updated",
            description: "Your password has been reset successfully."
          }
        })
      );
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setFeedback({
        type: "error",
        message: error.message || "Failed to reset password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Create a new secure password for your account"
    >
      <div className="space-y-6">
        {feedback && (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="animate-fade-in">
            {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}

        {isValidLink ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicators */}
              <div className="mt-2 space-y-1 text-xs">
                <p className={`flex items-center ${passwordStrength.length ? 'text-green-500' : 'text-gray-500'}`}>
                  {passwordStrength.length ? '✓' : '○'} At least 8 characters
                </p>
                <p className={`flex items-center ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
                  {passwordStrength.uppercase ? '✓' : '○'} At least one uppercase letter
                </p>
                <p className={`flex items-center ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
                  {passwordStrength.lowercase ? '✓' : '○'} At least one lowercase letter
                </p>
                <p className={`flex items-center ${passwordStrength.number ? 'text-green-500' : 'text-gray-500'}`}>
                  {passwordStrength.number ? '✓' : '○'} At least one number
                </p>
                <p className={`flex items-center ${passwordStrength.special ? 'text-green-500' : 'text-gray-500'}`}>
                  {passwordStrength.special ? '✓' : '○'} At least one special character
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
              disabled={isLoading || !isValidLink}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => navigate("/forgot-password")}
              variant="outline"
              className="mt-4"
            >
              Request New Reset Link
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordForm;
