
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<any>; // Added method to manually refresh session
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {}, 
  updatePassword: async () => {}, // Added update password method
  signOut: async () => {},
  refreshSession: async () => {}, // Added refresh session method
});

export const useAuth = () => useContext(AuthContext);

// Session timeout duration in milliseconds - 30 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Function to check if session is expired based on user activity
  const checkSessionTimeout = () => {
    const currentTime = Date.now();
    if (session && (currentTime - lastActivity > SESSION_TIMEOUT)) {
      console.log("Session expired due to inactivity");
      signOut();
    }
  };
  
  // Update last activity timestamp on user interactions
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reset activity timer when auth state changes
        if (session) {
          setLastActivity(Date.now());
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    // Set up activity tracking for session timeout
    if (typeof window !== 'undefined') {
      // Add event listeners for user activity
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
      window.addEventListener('touchstart', updateActivity);
      
      // Check session timeout periodically (every minute)
      const intervalId = setInterval(checkSessionTimeout, 60000);
      
      return () => {
        // Clean up event listeners and interval
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('touchstart', updateActivity);
        clearInterval(intervalId);
        subscription.unsubscribe();
      };
    }
    
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Set last activity when user signs in
      setLastActivity(Date.now());
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw error;
    }
  };
  
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        }
      });
      
      if (error) throw error;
      
      // Create profile if signup successful and user is created
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            created_at: new Date().toISOString(),
          });
          
        if (profileError) throw profileError;
      }
      
      // Set last activity when user signs up
      setLastActivity(Date.now());
      
      return data;
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw error;
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };
  
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Error updating password:", error);
      throw error;
    }
  };
  
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      // Update the session state with the refreshed session
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Reset activity timer
      setLastActivity(Date.now());
      
      return { success: true };
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
