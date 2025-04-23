import { useState, useEffect } from "react";
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
      title="Welcome Back, Financier"
      subtitle="Enter your details to access your wallet universe."
    >
      <div className="w-full max-w-lg mx-auto space-y-8 p-8 rounded-2xl border shadow-2xl bg-gradient-to-br from-white/90 to-fuchsia-50/60 backdrop-blur-2xl animate-fade-in relative">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-white/70 border-fuchsia-200 focus-visible:ring-fuchsia-400"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 hover:underline"
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
              className="w-full bg-white/70 border-fuchsia-200 focus-visible:ring-fuchsia-400"
              autoComplete="current-password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-200 transition-all duration-200"
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none ">
            <span className="bg-white/80 px-4 text-xs text-fuchsia-500 font-medium shadow rounded-full">
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
        
        <div className={`text-center text-base mt-8 ${isMobile ? 'pb-4' : ''}`}>
          Need an account?{" "}
          <Link to="/register" className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline">Register now</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
