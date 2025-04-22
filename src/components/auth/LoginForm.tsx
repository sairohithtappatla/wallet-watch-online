
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
      title="Welcome Back"
      subtitle="Log in to your account to continue"
    >
      <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-gradient-to-br from-white to-purple-50 rounded-lg shadow-xl animate-fade-in">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-white/50 backdrop-blur-sm border-purple-100 focus-visible:ring-purple-400"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
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
              className="w-full bg-white/50 backdrop-blur-sm border-purple-100 focus-visible:ring-purple-400"
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-2 text-xs text-gray-500">
              OR CONTINUE WITH
            </span>
          </div>
        </div>
        
        <Button 
          type="button"
          variant="outline" 
          className="w-full border-purple-100 hover:bg-purple-50 transition-all duration-200" 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" /> Sign in with Google
        </Button>
        
        <div className={`text-center text-sm mt-6 ${isMobile ? 'pb-4' : ''}`}>
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-600 font-medium hover:text-purple-700 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
