
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const isMobile = useIsMobile();
  // Use a more unique, modern look for the auth layouts
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-fuchsia-100 via-white to-purple-50 p-4 relative">
      {/* Artisan background blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#fbf6ff] to-[#cdb4fe] opacity-40 blur-3xl animate-spin-slow z-0"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-gradient-to-tr from-[#d0bcf8] to-[#eeccff] opacity-30 blur-2xl animate-spin-slower z-0"></div>
      <div className={`relative z-10 w-full ${isMobile ? 'max-w-[98%]' : 'max-w-xl'}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-600 to-purple-900 bg-clip-text text-transparent shadow-xl drop-shadow-sm">{title}</h1>
          <p className="text-base text-purple-800 mt-3">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};
export default AuthLayout;
