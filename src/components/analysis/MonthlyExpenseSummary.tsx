
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { HandshakeIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
  category: string;
  amount: number;
  color?: string;
}

interface MonthlyExpenseSummaryProps {
  expenses: any[];
  isLoading?: boolean;
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", 
  "#d0ed57", "#83a6ed", "#8dd1e1", "#a4add3", "#d85555"
];

const MonthlyExpenseSummary = ({ expenses, isLoading = false }: MonthlyExpenseSummaryProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7) // Current month in YYYY-MM format
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalMonthlyExpense, setTotalMonthlyExpense] = useState<number>(0);
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState<number>(0);
  
  // Get available months from expenses
  const availableMonths = [...new Set(expenses.map(expense => {
    const date = new Date(expense.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort((a, b) => b.localeCompare(a)); // Sort in descending order
  
  useEffect(() => {
    if (expenses.length === 0) return;
    
    // Filter expenses for the selected month
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonth === selectedMonth;
    });
    
    // Calculate monthly totals
    let incomeTotal = 0;
    let expenseTotal = 0;
    
    filteredExpenses.forEach(expense => {
      if (expense.type === "income") {
        incomeTotal += expense.amount;
      } else {
        expenseTotal += expense.amount;
      }
    });
    
    setTotalMonthlyIncome(incomeTotal);
    setTotalMonthlyExpense(expenseTotal);
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    
    filteredExpenses.filter(exp => exp.type === "expense").forEach(expense => {
      const category = expense.category || "Other";
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });
    
    // Convert to array format for chart
    const chartData = Object.keys(expensesByCategory).map((category, index) => ({
      category,
      amount: expensesByCategory[category],
      color: COLORS[index % COLORS.length]
    }));
    
    // Sort by amount (descending)
    chartData.sort((a, b) => b.amount - a.amount);
    
    setMonthlyData(chartData);
  }, [expenses, selectedMonth]);
  
  // Format month for display (e.g., "2023-05" to "May 2023")
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <HandshakeIcon className="mr-2" /> Monthly Summary
          </CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue>{formatMonthDisplay(selectedMonth)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableMonths.length > 0 ? (
                availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {formatMonthDisplay(month)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={selectedMonth}>
                  {formatMonthDisplay(selectedMonth)}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Income:</span>
            <span className="font-medium text-green-600">{formatCurrency(totalMonthlyIncome, "INR")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Expenses:</span>
            <span className="font-medium text-red-600">{formatCurrency(totalMonthlyExpense, "INR")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Savings:</span>
            <span className={`font-medium ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalMonthlyIncome - totalMonthlyExpense, "INR")}
            </span>
          </div>
        </div>
        
        <div className="h-[300px] mt-4">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value), "INR")}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  name="Amount" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                No expense data available for {formatMonthDisplay(selectedMonth)}.
                <br />
                Add some transactions to see your monthly breakdown.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpenseSummary;
