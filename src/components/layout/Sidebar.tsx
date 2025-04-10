
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Wallet,
  BarChart2,
  Settings,
  Menu,
  X,
  CreditCard,
  History,
  PlusCircle,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Navigation links with icons
  const navItems = [
    { 
      href: "/dashboard", 
      icon: <Home className="h-5 w-5" />, 
      label: "Dashboard" 
    },
    { 
      href: "/wallets", 
      icon: <Wallet className="h-5 w-5" />, 
      label: "Wallets" 
    },
    { 
      href: "/expenses", 
      icon: <CreditCard className="h-5 w-5" />, 
      label: "Expenses" 
    },
    { 
      href: "/transactions", 
      icon: <History className="h-5 w-5" />, 
      label: "Transactions" 
    },
    { 
      href: "/analysis", 
      icon: <BarChart2 className="h-5 w-5" />, 
      label: "Analysis" 
    },
    { 
      href: "/settings", 
      icon: <Settings className="h-5 w-5" />, 
      label: "Settings" 
    },
  ];

  // Quick actions
  const quickActions = [
    { 
      href: "/expenses/new", 
      icon: <PlusCircle className="h-5 w-5" />, 
      label: "Add Expense" 
    },
    { 
      href: "/wallets/transfer", 
      icon: <CircleDollarSign className="h-5 w-5" />, 
      label: "Transfer Money" 
    },
  ];

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="py-4 px-3 flex items-center justify-between lg:justify-center">
        <h1 className="text-lg font-bold">Wallet Watch</h1>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">
              Quick Actions
            </h2>
            <div className="space-y-1">
              {quickActions.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4">
        <p className="text-xs text-muted-foreground">
          © 2025 Wallet Watch
        </p>
      </div>
    </div>
  );

  // Mobile version with overlay
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-40"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />
        )}
        
        <div
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-[270px] bg-background transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop version
  return (
    <div className={cn("hidden lg:block h-screen w-[270px] border-r", className)}>
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
