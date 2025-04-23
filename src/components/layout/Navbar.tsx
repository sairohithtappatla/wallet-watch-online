
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, User, CreditCard, Settings, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// Notification state using localStorage for persistence
const useNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("WW_Notifications");
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    localStorage.setItem("WW_Notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif) => setNotifications((prev) => [notif, ...prev]);
  const clearNotifications = () => setNotifications([]);
  return { notifications, addNotification, clearNotifications };
};

interface NavbarProps {
  userName: string;
  isLoading?: boolean;
  avatarUrl?: string;
}

// Listen for in-app notifications via toast, move them to bell icon
const Navbar = ({ userName, isLoading = false, avatarUrl }: NavbarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { notifications, clearNotifications, addNotification } = useNotifications();

  // Move app toast notifications to notifications bell
  useEffect(() => {
    const handler = (event: any) => {
      if (event.detail && event.detail.title) {
        addNotification({
          title: event.detail.title,
          description: event.detail.description,
          createdAt: new Date().toISOString(),
        });
      }
    };
    window.addEventListener("wwAppNotification", handler);
    return () => window.removeEventListener("wwAppNotification", handler);
  }, [addNotification]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === "User") return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-52 sm:w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 items-center justify-between">
        <Link to="/dashboard" className="hidden md:block">
          <div className="font-bold text-xl transition-colors" style={{ color: "#9b87f5" }}>
            Wallet Watch
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {/* Bell icon notification center */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <span className="relative">
                  <Bell className="h-5 w-5 text-purple-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 rounded-full h-4 w-4 text-xs flex items-center justify-center text-white animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 z-50 bg-white border overflow-hidden shadow-lg">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-purple-600 hover:underline ml-auto"
                  >
                    Clear all
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto flex flex-col divide-y">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-fuchsia-600" />
                        <span className="font-medium text-fuchsia-700">
                          {notif.title}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-6">
                        {notif.description}
                        <div className="mt-1 text-[10px] text-gray-400">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border-2 border-purple-300">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={userName} />
                  ) : (
                    <AvatarFallback>{isLoading ? "..." : getInitials(userName)}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  `Hi, ${userName}`
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/wallets")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Wallets</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
