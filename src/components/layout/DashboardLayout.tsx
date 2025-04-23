import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileFooter from "./MobileFooter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkDailySpending = async () => {
      if (!user) return;
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: dailyExpenses, error: dailyError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', today.toISOString())
          .lt('amount', 0);
        
        if (dailyError) {
          console.error('Error fetching daily expenses:', dailyError);
          return;
        }
        
        const dailyTotal = dailyExpenses?.reduce((sum, expense) => 
          sum + Math.abs(Number(expense.amount)), 0) || 0;
        
        if (dailyTotal > 500) {
          window.dispatchEvent(
            new CustomEvent("wwAppNotification", {
              detail: {
                title: "Daily Spending Alert",
                description: `You've spent ₹${dailyTotal.toFixed(2)} today, which exceeds your ₹500 daily threshold.`,
              },
            })
          );
        }
        
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { data: weeklyExpenses, error: weeklyError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', lastWeek.toISOString())
          .lt('amount', 0);
        
        if (weeklyError) {
          console.error('Error fetching weekly expenses:', weeklyError);
          return;
        }
        
        const weeklyTotal = weeklyExpenses?.reduce((sum, expense) => 
          sum + Math.abs(Number(expense.amount)), 0) || 0;
        
        if (weeklyTotal > 2000) {
          window.dispatchEvent(
            new CustomEvent("wwAppNotification", {
              detail: {
                title: "Weekly Spending Alert",
                description: `You've spent ₹${weeklyTotal.toFixed(2)} this week, which exceeds your ₹2000 weekly threshold.`,
              },
            })
          );
        }
      } catch (error) {
        console.error('Failed to check spending thresholds:', error);
      }
    };
    
    if (user) {
      checkDailySpending();
    }
  }, [user]);
  
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
