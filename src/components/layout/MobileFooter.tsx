
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Wallet, ChartBar, Settings, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const footerRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Wallets", path: "/wallets" },
    { icon: ChartBar, label: "Analysis", path: "/analysis" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  // Fix for touch events not working after some time
  useEffect(() => {
    const currentFooter = footerRef.current;
    
    if (currentFooter) {
      // This will reset any potential touch listeners issues
      const resetTouchListeners = () => {
        currentFooter.style.display = 'none';
        // Force reflow
        void currentFooter.offsetHeight;
        currentFooter.style.display = '';
      };
      
      // Reset every 5 minutes to prevent touch issues
      const intervalId = setInterval(resetTouchListeners, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" ref={footerRef}>
      <motion.div 
        className="bg-white border-t px-4 py-2 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/dashboard' && location.pathname === '/') ||
                            (item.path === '/wallets' && location.pathname.includes('/wallet/')) ||
                            (location.pathname === '/expenses' && item.path === '/wallets');
                            
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center px-3 py-2 relative group touch-manipulation"
                whileTap={{ scale: 0.9 }}
                // Make touch target bigger
                style={{ touchAction: 'manipulation' }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 mb-1 transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground",
                    "group-hover:text-primary"
                  )}
                />
                <span
                  className={cn(
                    "text-xs transition-colors duration-300",
                    isActive ? "text-primary font-medium" : "text-muted-foreground",
                    "group-hover:text-primary"
                  )}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
};

export default MobileFooter;
