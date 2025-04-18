
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ErrorPage from "./ErrorPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <ErrorPage 
      status={404}
      title="Page Not Found"
      message={`The page at ${location.pathname} could not be found.`}
    >
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Navigation Error</AlertTitle>
        <AlertDescription>
          The requested URL was not found on this server. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    </ErrorPage>
  );
};

export default NotFound;
