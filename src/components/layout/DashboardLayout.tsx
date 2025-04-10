
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar userName="John Doe" />
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardLayout;
