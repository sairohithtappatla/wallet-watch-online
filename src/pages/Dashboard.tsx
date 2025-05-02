
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/wallet/WalletCard";
import ExpenseCard from "@/components/expense/ExpenseCard";
import StatCard from "@/components/analysis/StatCard";
import { formatCurrency, calculateTotalBalance } from "@/lib/utils";
import { Plus, Wallet, ArrowDownUp, Activity, TrendingUp, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import SpendingChart from "@/components/analysis/SpendingChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import ExpenseCalendar from "@/components/expense/ExpenseCalendar";

const Dashboard = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (walletsError) throw walletsError;
        
        setWallets(walletsData || []);
        
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            id,
            amount,
            description,
            category,
            date,
            wallet_id,
            wallets (
              name,
              currency
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(3);
        
        if (expensesError) throw expensesError;
        
        const formattedExpenses = expensesData?.map(expense => ({
          id: expense.id,
          amount: Math.abs(Number(expense.amount)),
          currency: "INR",
          description: expense.description || "",
          category: expense.category || "Other",
          date: new Date(expense.date).toISOString().split('T')[0],
          walletId: expense.wallet_id,
          walletName: expense.wallets?.name || "Unknown",
          type: Number(expense.amount) >= 0 ? "income" as const : "expense" as const,
          onEdit: () => {},
          onDelete: () => {},
        })) || [];
        
        setExpenses(formattedExpenses);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not load your dashboard data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const totalBalance = useMemo(() => calculateTotalBalance(wallets), [wallets]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return expenses.reduce(
      (acc, curr) => {
        if (curr.type === "income") {
          acc.totalIncome += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [expenses]);

  const handleAddExpense = () => {
    navigate("/expenses");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-expense-form'));
    }, 100);
  };

  const handleTransferFunds = () => {
    navigate("/wallets");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-transfer-form'));
    }, 100);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleTransferFunds}>
            <ArrowLeftRight className="h-4 w-4" /> Transfer
          </Button>
          <Button size="sm" className="gap-1" onClick={handleAddExpense}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance, "INR")}
          icon={<Wallet />}
        />
        <StatCard
          title="Income"
          value={formatCurrency(totalIncome, "INR")}
          icon={<TrendingUp />}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(totalExpense, "INR")}
          icon={<ArrowDownUp />}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalIncome - totalExpense, "INR")}
          icon={<Activity />}
        />
      </div>

      <div className="mt-6">
        <ExpenseCalendar />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Wallets</CardTitle>
              <Link to="/wallets">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallets.length > 0 ? (
              wallets.slice(0, 3).map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  id={wallet.id}
                  name={wallet.name}
                  balance={wallet.balance}
                  currency="INR"
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No wallets found</p>
                <Button size="sm" onClick={() => navigate("/wallets")}>Add Wallet</Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <SpendingChart expenses={expenses.map(e => ({ ...e, onEdit: undefined, onDelete: undefined }))} />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Link to="/expenses">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    {...expense}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No transactions found</p>
                <Button size="sm" onClick={handleAddExpense}>Add Transaction</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
