
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Decorative elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-fuchsia-100 to-violet-200 blur-3xl opacity-70" />
        <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-purple-200 blur-3xl opacity-70" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`w-full ${isMobile ? "max-w-[95%]" : "max-w-md"}`}>
          {/* Glass Card */}
          <div className="relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/20 p-8 overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="mt-2 text-gray-600">{subtitle}</p>
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
