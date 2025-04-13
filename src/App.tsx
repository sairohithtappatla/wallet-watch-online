
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallets from "./pages/Wallets";
import Expenses from "./pages/Expenses";
import Transactions from "./pages/Transactions";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import ErrorPage from "./pages/ErrorPage";

// Protected route component
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

// Public route component that redirects to dashboard if user is authenticated
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
  // Add meta viewport tag for better mobile rendering
  useEffect(() => {
    // Check if the meta viewport tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set the viewport content for optimal mobile experience
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    
    // Add mobile web app capable meta tags for iOS
    const appleMeta = document.createElement('meta');
    appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
    appleMeta.setAttribute('content', 'yes');
    document.head.appendChild(appleMeta);
    
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    statusBarMeta.setAttribute('content', 'black-translucent');
    document.head.appendChild(statusBarMeta);
    
    // Add theme color for Android
    const themeMeta = document.createElement('meta');
    themeMeta.setAttribute('name', 'theme-color');
    themeMeta.setAttribute('content', '#ffffff');
    document.head.appendChild(themeMeta);
  }, []);

  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      {/* Redirect to dashboard if user tries to access these routes directly */}
      <Route path="/expenses/new" element={<Navigate to="/expenses" replace />} />
      <Route path="/wallets/transfer" element={<Navigate to="/wallets" replace />} />
      
      {/* Error routes */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/unauthorized" element={
        <ErrorPage 
          status={401} 
          title="Unauthorized" 
          message="You don't have permission to access this resource." 
        />
      } />
      
      {/* 404 route */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

// Fix: Create a new instance of QueryClient outside of the component
const queryClient = new QueryClient();

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
