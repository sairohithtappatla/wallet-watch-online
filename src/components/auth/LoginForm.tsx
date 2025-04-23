
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await signIn(email, password);
      // Raise an event for in-app notifications
      window.dispatchEvent(
        new CustomEvent("wwAppNotification", {
          detail: {
            title: "Sign-in successful",
            description: "Welcome back to Wallet Watch.",
          },
        })
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthError(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back! 🔐"
      subtitle="Sign in to access your Indian wallet universe."
    >
      <div className="space-y-8">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-fuchsia-50/70 border-fuchsia-200 focus-visible:ring-fuchsia-500"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white shadow-purple-200 shadow transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-white/70 px-4 text-xs text-fuchsia-500 font-semibold shadow rounded-full">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-fuchsia-200 hover:bg-fuchsia-50 bg-white/80 transition-all duration-200"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" /> Sign in with Google
        </Button>

        <div
          className={`text-center text-base mt-8 ${isMobile ? "pb-3" : ""}`}
        >
          Need an account?{" "}
          <Link
            to="/register"
            className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline"
          >
            Register now
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
