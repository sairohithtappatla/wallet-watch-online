
import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileFooter from "./MobileFooter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
          setUserName(fullName || user.email?.split('@')[0] || 'User');
        } else {
          // If no profile exists yet, set default from email
          setUserName(user.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar userName={userName} isLoading={isLoading} />
        <ScrollArea className="flex-1 overflow-auto">
          <main className="p-4 md:p-6 pb-28 md:pb-6">{children}</main>
        </ScrollArea>
        <MobileFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
