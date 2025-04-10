
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <Card className="w-full max-w-md p-6 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;
