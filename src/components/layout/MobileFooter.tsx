
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Wallet, ChartBar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Wallets", path: "/wallets" },
    { icon: ChartBar, label: "Analysis", path: "/analysis" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <motion.div 
        className="bg-white border-t px-4 py-2 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/dashboard' && location.pathname === '/');
                            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center px-3 py-2 relative group",
                  "touch-none select-none" // Improved touch handling
                )}
                style={{ touchAction: "manipulation" }} // Better touch behavior
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
              </button>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
};

export default MobileFooter;
