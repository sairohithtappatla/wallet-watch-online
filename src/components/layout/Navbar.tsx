import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, CreditCard, PlusCircle, Settings, User, Loader2 } from "lucide-react";
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
import { useState } from "react";

// Simple notification store (could be made global/context if needed)
const useNotifications = () => {
  // Example: notifications stored as state for UI demo purposes (replace with db/fetch for real app)
  const [notifications, setNotifications] = useState([
    // Start with empty or fetch from API accordingly
  ]);
  const addNotification = (notif) => setNotifications((prev) => [notif, ...prev]);
  const clearNotifications = () => setNotifications([]);
  return { notifications, addNotification, clearNotifications };
};

interface NavbarProps {
  userName: string;
  isLoading?: boolean;
  avatarUrl?: string;
}

const Navbar = ({ userName, isLoading = false, avatarUrl }: NavbarProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const { notifications, clearNotifications } = useNotifications();

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

          {/* Notification Bell with Drop-down */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                {/* bell-dot for unread, use counter for count */}
                <span className="relative">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405C18.218 15.37 18 14.7 18 14V11c0-3.07-2.13-5.64-5-6.32V4a1 1 0 10-2 0v.68C8.13 5.36 6 7.92 6 11v3c0 .7-.218 1.37-.595 1.595L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 rounded-full h-4 w-4 text-xs flex items-center justify-center text-white animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 z-50 bg-white border">
              <DropdownMenuLabel>
                Notifications
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="float-right text-xs text-purple-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-60 overflow-y-auto flex flex-col divide-y">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="px-4 py-2 text-sm text-gray-700">
                      <span className="font-medium text-purple-600">{notif.title}</span>
                      <div className="text-xs text-gray-500">{notif.description}</div>
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
