
import { useState, useMemo } from "react";
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

// Mock data
const mockWallets = [
  { id: "w1", name: "Cash", balance: 850, currency: "USD" },
  { id: "w2", name: "Bank", balance: 3500, currency: "USD" },
  { id: "w3", name: "Savings", balance: 12000, currency: "USD" },
];

const mockExpenses = [
  {
    id: "e1",
    amount: 125,
    currency: "USD",
    description: "Grocery Shopping",
    category: "Food",
    date: "2025-04-08",
    walletId: "w1",
    walletName: "Cash",
    type: "expense" as const,
  },
  {
    id: "e2",
    amount: 2500,
    currency: "USD",
    description: "Monthly Salary",
    category: "Salary",
    date: "2025-04-01",
    walletId: "w2",
    walletName: "Bank",
    type: "income" as const,
  },
  {
    id: "e3",
    amount: 50,
    currency: "USD",
    description: "Movie Night",
    category: "Entertainment",
    date: "2025-04-05",
    walletId: "w1",
    walletName: "Cash",
    type: "expense" as const,
  },
];

const Dashboard = () => {
  const [wallets] = useState(mockWallets);
  const [expenses] = useState(mockExpenses);
  const navigate = useNavigate();

  // Calculate total balance across all wallets
  const totalBalance = useMemo(() => calculateTotalBalance(wallets), [wallets]);

  // Calculate total income and expenses
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

  // Quick action handlers
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleTransferFunds}>
            <ArrowLeftRight className="h-4 w-4" /> Transfer
          </Button>
          <Button size="sm" className="gap-1" onClick={handleAddExpense}>
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance, "USD")}
          icon={<Wallet />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Income"
          value={formatCurrency(totalIncome, "USD")}
          icon={<TrendingUp />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(totalExpense, "USD")}
          icon={<ArrowDownUp />}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalIncome - totalExpense, "USD")}
          icon={<Activity />}
        />
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
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                {...wallet}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
          <SpendingChart expenses={expenses} />
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Link to="/transactions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
