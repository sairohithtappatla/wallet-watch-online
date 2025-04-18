
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ArrowLeft, 
  Home, 
  RefreshCw,
  ShieldAlert,
  Wifi,
  ServerOff,
  FileQuestion
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

const ErrorPage = ({
  status = 404,
  title = "Page not found",
  message = "Sorry, we couldn't find the page you're looking for.",
  children,
}: ErrorPageProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Log error for analytics
    console.error(`Error ${status}: ${title} - ${message}`);
    
    // For auth errors, check if it's an OAuth redirect error
    if (status === 401) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('error')) {
        console.error('OAuth error:', params.get('error'), params.get('error_description'));
      }
    }
  }, [status, title, message]);

  // Choose appropriate icon based on error status
  const getErrorIcon = () => {
    switch (true) {
      case status >= 500:
        return <ServerOff className="h-24 w-24 text-primary opacity-20" strokeWidth={1} />;
      case status === 401 || status === 403:
        return <ShieldAlert className="h-24 w-24 text-primary opacity-20" strokeWidth={1} />;
      case status === 404:
        return <FileQuestion className="h-24 w-24 text-primary opacity-20" strokeWidth={1} />;
      case status === 408 || status === 504:
        return <Wifi className="h-24 w-24 text-primary opacity-20" strokeWidth={1} />;
      default:
        return <AlertCircle className="h-24 w-24 text-primary opacity-20" strokeWidth={1} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative flex justify-center">
          <div className="relative">
            {getErrorIcon()}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        {children}

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 justify-center`}>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
