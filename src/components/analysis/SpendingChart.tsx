
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ExpenseProps } from "../expense/ExpenseCard";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpendingChartProps {
  expenses: Omit<ExpenseProps, "onEdit" | "onDelete">[];
  isLoading?: boolean;
}

const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
  "#82CA9D", "#FF6B6B", "#6A6AFF", "#FFD700", "#FFA500"
];

// Function to get a color for a category (consistent mapping)
const getCategoryColor = (category: string, index: number) => {
  // Use the index for consistent color mapping
  return CHART_COLORS[index % CHART_COLORS.length];
};

const SpendingChart = ({ expenses, isLoading = false }: SpendingChartProps) => {
  const [activeTab, setActiveTab] = useState("categories");

  // Category-based data processing
  const categoryData = useMemo(() => {
    const expensesOnly = expenses.filter(e => e.type === "expense");
    const categoryMap: Record<string, number> = {};
    
    expensesOnly.forEach(expense => {
      if (categoryMap[expense.category]) {
        categoryMap[expense.category] += expense.amount;
      } else {
        categoryMap[expense.category] = expense.amount;
      }
    });
    
    return Object.keys(categoryMap).map((category, index) => ({
      name: category,
      value: categoryMap[category],
      color: getCategoryColor(category, index)
    }));
  }, [expenses]);

  // Monthly data processing
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short' });
      months[monthKey] = { income: 0, expense: 0 };
    }
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
      
      // Only include data from the last 6 months
      if (months[monthKey]) {
        if (expense.type === "income") {
          months[monthKey].income += expense.amount;
        } else {
          months[monthKey].expense += expense.amount;
        }
      }
    });
    
    return Object.keys(months).map(month => ({
      name: month,
      Income: months[month].income,
      Expense: months[month].expense
    }));
  }, [expenses]);

  // Custom tooltip for the pie chart
  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>
            Amount: {formatCurrency(payload[0].value, "USD")}
          </p>
          <p>
            Percentage: {((payload[0].percent || 0) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Spending Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Spending Analysis</CardTitle>
        <Tabs
          defaultValue="categories"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            <CardContent className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No expense data available. Add some expenses to see your spending breakdown.
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="monthly">
            <CardContent className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {monthlyData.length > 0 ? (
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value), "USD")} />
                    <Legend />
                    <Bar dataKey="Income" fill="#10B981" />
                    <Bar dataKey="Expense" fill="#EF4444" />
                  </BarChart>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No monthly data available. Add transactions to see your monthly trends.
                    </p>
                  </div>
                )}
              </ResponsiveContainer>
            </CardContent>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default SpendingChart;
