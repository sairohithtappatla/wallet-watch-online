
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Import all page components
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Wallets from "@/pages/Wallets";
import Expenses from "@/pages/Expenses";
import Transactions from "@/pages/Transactions";
import Analysis from "@/pages/Analysis";
import Settings from "@/pages/Settings";
import ErrorPage from "@/pages/ErrorPage";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

const AppContent = () => {
  useEffect(() => {
    // Set viewport meta tags for better mobile experience
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    
    // Add meta tags for PWA capabilities
    const appleMeta = document.createElement('meta');
    appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
    appleMeta.setAttribute('content', 'yes');
    document.head.appendChild(appleMeta);
    
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    statusBarMeta.setAttribute('content', 'black-translucent');
    document.head.appendChild(statusBarMeta);
    
    const themeMeta = document.createElement('meta');
    themeMeta.setAttribute('name', 'theme-color');
    themeMeta.setAttribute('content', '#ffffff');
    document.head.appendChild(themeMeta);
    
    // Update browserslist database (this will run only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Attempting to update browserslist database...');
        // This is just a notification, the actual update happens via postinstall script
      } catch (error) {
        console.warn('Could not update browserslist database:', error);
      }
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="/expenses/new" element={<Navigate to="/expenses" replace />} />
      <Route path="/wallets/transfer" element={<Navigate to="/wallets" replace />} />
      
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/unauthorized" element={
        <ErrorPage 
          status={401} 
          title="Unauthorized" 
          message="You don't have permission to access this resource." 
        />
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </ErrorProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
