
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

// Mock data
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
  {
    id: "e4",
    amount: 75,
    currency: "USD",
    description: "Shopping",
    category: "Shopping",
    date: "2025-04-03",
    walletId: "w1",
    walletName: "Cash",
    type: "expense" as const,
  },
  {
    id: "e5",
    amount: 30,
    currency: "USD",
    description: "Gas",
    category: "Transport",
    date: "2025-04-07",
    walletId: "w2",
    walletName: "Bank",
    type: "expense" as const,
  },
];

// Mock monthly summary data
const monthlySummary = [
  { month: "Jan", income: 3200, expenses: 2800, savings: 400 },
  { month: "Feb", income: 3500, expenses: 2500, savings: 1000 },
  { month: "Mar", income: 3200, expenses: 2900, savings: 300 },
  { month: "Apr", income: 3800, expenses: 2600, savings: 1200 },
  { month: "May", income: 3400, expenses: 3000, savings: 400 },
  { month: "Jun", income: 3700, expenses: 2800, savings: 900 },
  { month: "Jul", income: 3300, expenses: 2900, savings: 400 },
  { month: "Aug", income: 3900, expenses: 2700, savings: 1200 },
  { month: "Sep", income: 3600, expenses: 3100, savings: 500 },
  { month: "Oct", income: 3500, expenses: 3200, savings: 300 },
  { month: "Nov", income: 3900, expenses: 2800, savings: 1100 },
  { month: "Dec", income: 4200, expenses: 3600, savings: 600 },
];

const Analysis = () => {
  // Calculate total income, expenses, and savings
  const totalIncome = mockExpenses
    .filter((e) => e.type === "income")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = mockExpenses
    .filter((e) => e.type === "expense")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Spending Analysis</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome, "USD")}
          icon={<TrendingUp className="text-expense-income" />}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses, "USD")}
          icon={<TrendingDown className="text-expense-expense" />}
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings, "USD")}
          icon={<PiggyBank />}
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<Wallet />}
          description="Percentage of income saved"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <SpendingChart expenses={mockExpenses} />
        
        <Card className="h-[500px]">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, ""]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                <Bar dataKey="savings" name="Savings" fill="#3B82F6" />
              </BarChart>
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
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Income"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="expenses" className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Expenses"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="savings" className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Savings"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="savings" name="Savings" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Analysis;
