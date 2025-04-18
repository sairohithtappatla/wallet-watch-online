
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
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
          setUserName(fullName || user.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar userName={userName} />
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        </ScrollArea>
        <MobileFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;
