import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PieChart, LineChart, Wallet, ShieldCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Navigation */}
      <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Wallet Watch</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Take Control of Your <span className="text-primary">Finances</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Track expenses in <span className="font-semibold text-black/90">₹</span>, manage wallets, and analyze your spending with our secure and easy-to-use personal finance app.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="text-md px-8">
                  Get Started — It's Free
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="text-md px-8">
                  Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg">
                All the tools you need to manage your personal finances effectively.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 transition-all hover:shadow-md">
              <Wallet className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Wallet Management</h3>
              <p className="text-center text-gray-500">
                Create multiple wallets to track your cash, bank accounts, credit cards, and savings.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 transition-all hover:shadow-md">
              <LineChart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Expense Tracking</h3>
              <p className="text-center text-gray-500">
                Log and categorize your income and expenses to understand your spending habits.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 transition-all hover:shadow-md">
              <PieChart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Spending Analysis</h3>
              <p className="text-center text-gray-500">
                Visualize your financial data with intuitive charts and reports.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 transition-all hover:shadow-md">
              <ShieldCheck className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Secure & Private</h3>
              <p className="text-center text-gray-500">
                Your financial data is encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Managing Your Money Better?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/90 md:text-lg">
                Join thousands of users who have taken control of their finances with Wallet Watch.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link to="/register">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-white/90"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 md:py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              © 2025 Wallet Watch. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
