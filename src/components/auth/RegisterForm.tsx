
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "./AuthLayout";
import { FcGoogle } from "react-icons/fc";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, User, KeyRound, Eye, EyeOff, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const isMobile = useIsMobile();

  // Password validation
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const [passwordScore, setPasswordScore] = useState(0);
  
  useEffect(() => {
    // Validate password as user types
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordStrength(strength);
    
    // Calculate score (0-5)
    const score = Object.values(strength).filter(Boolean).length;
    setPasswordScore(score);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password strength
    if (passwordScore < 4) {
      setAuthError("Please create a stronger password that meets at least 4 requirements");
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);

    try {
      await signUp(email, password, firstName, lastName);
      window.dispatchEvent(
        new CustomEvent("wwAppNotification", {
          detail: {
            title: "Welcome to Wallet Watch!",
            description: "Your account has been created successfully.",
          },
        })
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthError(error.message || "Failed to create account");
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
      title="Create Account 🚀"
      subtitle="Join us to manage your finances better"
    >
      <div className="space-y-6">
        {authError && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                  autoComplete="given-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center justify-between">
              <span>Password</span>
              <span className="text-xs flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Strength: 
                <span className={`ml-1 font-medium ${
                  passwordScore < 2 ? 'text-red-500' : 
                  passwordScore < 4 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {passwordScore < 2 ? 'Weak' : 
                   passwordScore < 4 ? 'Medium' : 
                   'Strong'}
                </span>
              </span>
            </Label>
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
                {passwordStrength.uppercase ? '✓' : '○'} At least one uppercase letter (A-Z)
              </p>
              <p className={`flex items-center ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
                {passwordStrength.lowercase ? '✓' : '○'} At least one lowercase letter (a-z)
              </p>
              <p className={`flex items-center ${passwordStrength.number ? 'text-green-500' : 'text-gray-500'}`}>
                {passwordStrength.number ? '✓' : '○'} At least one number (0-9)
              </p>
              <p className={`flex items-center ${passwordStrength.special ? 'text-green-500' : 'text-gray-500'}`}>
                {passwordStrength.special ? '✓' : '○'} At least one special character (!@#$%^&*)
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-fuchsia-600 hover:text-fuchsia-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterForm;
