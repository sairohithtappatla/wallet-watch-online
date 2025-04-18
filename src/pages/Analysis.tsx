
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/analysis/StatCard";
import SpendingChart from "@/components/analysis/SpendingChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

const Analysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  
  // Fetch expenses from Supabase
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
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
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching expenses:', error);
          toast({
            variant: "destructive",
            title: "Failed to load expenses",
            description: error.message,
          });
          return;
        }
        
        // Format expenses for display
        const formattedExpenses = data?.map(expense => ({
          id: expense.id,
          amount: Math.abs(Number(expense.amount)),
          currency: expense.wallets?.currency || "USD",
          description: expense.description || "",
          category: expense.category || "Other",
          date: new Date(expense.date).toISOString().split('T')[0],
          walletId: expense.wallet_id,
          walletName: expense.wallets?.name || "Unknown",
          type: Number(expense.amount) >= 0 ? "income" as const : "expense" as const,
        })) || [];
        
        setExpenses(formattedExpenses);
        
        // Generate monthly summary
        generateMonthlySummary(formattedExpenses);
      } catch (error: any) {
        console.error('Failed to fetch expenses:', error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not load your expenses. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpenses();
  }, [user, toast]);
  
  // Generate monthly summary data
  const generateMonthlySummary = (expensesData: any[]) => {
    const months: Record<string, { income: number; expenses: number; savings: number }> = {};
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short' });
      months[monthKey] = { income: 0, expenses: 0, savings: 0 };
    }
    
    // Fill in with real data
    expensesData.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
      
      if (months[monthKey]) {
        if (expense.type === "income") {
          months[monthKey].income += expense.amount;
        } else {
          months[monthKey].expenses += expense.amount;
        }
      }
    });
    
    // Calculate savings for each month
    Object.keys(months).forEach(month => {
      months[month].savings = months[month].income - months[month].expenses;
    });
    
    // Convert to array for charts
    const summaryData = Object.keys(months).map(month => ({
      month,
      income: months[month].income,
      expenses: months[month].expenses,
      savings: months[month].savings
    }));
    
    setMonthlySummary(summaryData);
  };

  // Calculate total income and expenses
  const totalIncome = expenses
    .filter((e) => e.type === "income")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = expenses
    .filter((e) => e.type === "expense")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading analysis data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Spending Analysis</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome, "USD")}
          icon={<TrendingUp className="text-green-500" />}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses, "USD")}
          icon={<TrendingDown className="text-red-500" />}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings, "USD")}
          icon={<PiggyBank className={totalSavings >= 0 ? "text-green-500" : "text-red-500"} />}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<Wallet />}
          description="Percentage of income saved"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <SpendingChart expenses={expenses} />
        
        <Card className="h-[500px]">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              {monthlySummary.length > 0 ? (
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value), "USD")}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                  <Bar dataKey="savings" name="Savings" fill="#3B82F6" />
                </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    No data available. Add some transactions to see your monthly trends.
                  </p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Yearly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="income">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>
            <TabsContent value="income" className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {monthlySummary.length > 0 ? (
                  <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), "USD")}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10B981" />
                  </BarChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No income data available. Add income transactions to see your yearly overview.
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="expenses" className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {monthlySummary.length > 0 ? (
                  <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), "USD")}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                  </BarChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No expense data available. Add expense transactions to see your yearly overview.
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="savings" className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {monthlySummary.length > 0 ? (
                  <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), "USD")}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="savings" name="Savings" fill="#3B82F6" />
                  </BarChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No savings data available. Add income and expense transactions to calculate your savings.
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Analysis;
