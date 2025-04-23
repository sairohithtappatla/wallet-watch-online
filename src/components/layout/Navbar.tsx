
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, User, CreditCard, Settings, Loader2, X } from "lucide-react";
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

type NotificationType = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type?: string;
};

const generateNotifId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getStoredNotifications = (): NotificationType[] => {
  try {
    const stored = localStorage.getItem("WW_Notifications");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>(getStoredNotifications());

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem("WW_Notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Add a notification only if it doesn't exist (by id)
  const addNotification = (notif: Omit<NotificationType, "id" | "createdAt"> & Partial<NotificationType>) => {
    setNotifications(prev => {
      // Prevent duplicate by checking title+description+type
      const exists = prev.some(
        n => n.title === notif.title &&
             n.description === notif.description &&
            (n.type || "") === (notif.type || "")
      );
      if (exists) return prev;
      return [
        {
          id: generateNotifId(),
          title: notif.title,
          description: notif.description,
          createdAt: new Date().toISOString(),
          type: notif.type,
        },
        ...prev,
      ];
    });
  };

  const clearAllNotifications = () => setNotifications([]);
  const clearNotification = (id: string) =>
    setNotifications(notifications => notifications.filter(n => n.id !== id));

  return { notifications, addNotification, clearAllNotifications, clearNotification };
};

interface NavbarProps {
  userName: string;
  isLoading?: boolean;
  avatarUrl?: string;
}

const Navbar = ({ userName, isLoading = false, avatarUrl }: NavbarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { notifications, addNotification, clearAllNotifications, clearNotification } = useNotifications();

  useEffect(() => {
    // Handler for generic app notifications (like daily/weekly spending from dashboard)
    const handleAppNotification = (event: any) => {
      if (event.detail && event.detail.title) {
        addNotification({
          title: event.detail.title,
          description: event.detail.description,
        });
      }
    };
    // Handler for high expense etc (from transactions)
    const handleExpenseAlert = (event: any) => {
      if (event.detail && event.detail.message) {
        addNotification({
          title: "Expense Alert",
          description: event.detail.message,
          type: 'alert',
        });
      }
    };
    window.addEventListener("wwAppNotification", handleAppNotification);
    window.addEventListener("expense-alert", handleExpenseAlert);
    return () => {
      window.removeEventListener("wwAppNotification", handleAppNotification);
      window.removeEventListener("expense-alert", handleExpenseAlert);
    };
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
            <span className="sr-only">Toggle navigation menu</span>
            <span>
              <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
            </span>
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
        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <span className="relative">
                  <Bell className="h-5 w-5 text-purple-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 rounded-full h-4 w-4 text-xs flex items-center justify-center text-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-80 max-w-xs sm:max-w-sm rounded-xl bg-white border overflow-hidden shadow-xl z-50 p-0">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
                <span className="font-semibold text-base sm:text-lg">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-purple-600 hover:underline ml-auto"
                  >
                    Clear all
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 min-h-[64px] overflow-y-auto flex flex-col divide-y">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex gap-2 px-4 py-3 items-start bg-white hover:bg-purple-50 transition duration-75 group relative"
                      style={{ wordBreak: 'break-word' }}
                    >
                      <Bell className="h-4 w-4 mt-[2px] text-fuchsia-600 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-fuchsia-700 text-sm sm:text-base">
                          {notif.title}
                        </span>
                        <div className="text-xs text-gray-600">
                          {notif.description}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                            : ""}
                        </div>
                      </div>
                      <button
                        className="rounded p-1 text-gray-400 hover:text-red-600 absolute top-2 right-2"
                        aria-label="Clear notification"
                        onClick={() => clearNotification(notif.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
