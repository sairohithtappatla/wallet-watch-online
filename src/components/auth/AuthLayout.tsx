
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}
const AuthLayout = ({
  children,
  title,
  subtitle,
}: AuthLayoutProps) => {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-100 via-purple-50 to-blue-50 p-2 relative overflow-hidden">
      <div className="absolute left-0 top-0 h-[30vh] w-full bg-gradient-to-r from-[#ffdae6]/40 via-violet-200/50 to-sky-100/60 rounded-b-3xl blur-2xl pointer-events-none" />
      <main
        className={`relative z-20 w-full flex flex-col items-center mt-8 sm:mt-0 ${
          isMobile ? "max-w-[98%]" : "max-w-md"
        }`}
      >
        <section className="bg-white/90 border border-fuchsia-100 shadow-[0_10px_40px_-10px_rgba(130,0,255,0.08)] rounded-3xl p-7 sm:p-10 backdrop-blur-2xl animate-fade-in glassmorphism">
          <div className="text-center mb-6 px-4">
            <h1 className="text-4xl font-black text-fuchsia-700 bg-gradient-to-r from-fuchsia-600 to-purple-800 bg-clip-text text-transparent tracking-tight drop-shadow">
              {title}
            </h1>
            <p className="text-base mt-3 text-fuchsia-700/80">{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
};
export default AuthLayout;

