
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Wallet, ChartBar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Wallet, label: "Wallets", path: "/wallets" },
    { icon: ChartBar, label: "Analysis", path: "/analysis" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t px-4 py-2">
        <nav className="flex items-center justify-around">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center px-3 py-2 relative group"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg transition-colors duration-300 group-hover:bg-primary/5",
                    isActive && "bg-primary/10"
                  )}
                />
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
      </div>
    </div>
  );
};

export default MobileFooter;
