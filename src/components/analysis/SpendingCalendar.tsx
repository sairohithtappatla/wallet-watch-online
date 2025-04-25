import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval } from "date-fns";
import type { ExpenseProps } from "../expense/ExpenseCard";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

interface SpendingCalendarProps {
  expenses: Omit<ExpenseProps, "onEdit" | "onDelete">[];
  isLoading?: boolean;
}

const SpendingCalendar = ({ expenses, isLoading = false }: SpendingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

  const dateRange = useMemo(() => {
    if (!selectedDate) return { start: new Date(), end: new Date() };

    switch (viewMode) {
      case "weekly":
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        };
      case "monthly":
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        };
      case "daily":
      default:
        return {
          start: selectedDate,
          end: selectedDate,
        };
    }
  }, [selectedDate, viewMode]);

  const filteredExpenses = useMemo(() => {
    if (!selectedDate) return [];

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      
      if (viewMode === "daily") {
        return isSameDay(expenseDate, dateRange.start);
      }
      
      return isWithinInterval(expenseDate, {
        start: dateRange.start,
        end: dateRange.end,
      });
    });
  }, [expenses, dateRange, viewMode, selectedDate]);

  const totals = useMemo(() => {
    const income = filteredExpenses
      .filter((e) => e.type === "income")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const expense = filteredExpenses
      .filter((e) => e.type === "expense")
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filteredExpenses]);

  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    filteredExpenses
      .filter((e) => e.type === "expense")
      .forEach((expense) => {
        if (categories[expense.category]) {
          categories[expense.category] += expense.amount;
        } else {
          categories[expense.category] = expense.amount;
        }
      });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const dateRangeText = useMemo(() => {
    if (!selectedDate) return "";

    switch (viewMode) {
      case "weekly":
        return `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`;
      case "monthly":
        return format(selectedDate, "MMMM yyyy");
      case "daily":
      default:
        return format(selectedDate, "EEEE, MMMM d, yyyy");
    }
  }, [selectedDate, dateRange, viewMode]);

  if (isLoading) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Spending Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading calendar data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Spending Calendar
        </CardTitle>
        <Tabs
          defaultValue="daily"
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "daily" | "weekly" | "monthly")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-lg">{dateRangeText}</h3>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Income</p>
                  <p className="text-green-700 font-bold">
                    {formatCurrency(totals.income, "INR")}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Expense</p>
                  <p className="text-red-700 font-bold">
                    {formatCurrency(totals.expense, "INR")}
                  </p>
                </div>
                <div className={`${totals.net >= 0 ? "bg-blue-50" : "bg-amber-50"} p-3 rounded-lg`}>
                  <p className={`text-xs ${totals.net >= 0 ? "text-blue-600" : "text-amber-600"} font-medium`}>Net</p>
                  <p className={`${totals.net >= 0 ? "text-blue-700" : "text-amber-700"} font-bold`}>
                    {formatCurrency(Math.abs(totals.net), "INR")}
                  </p>
                </div>
              </div>
            </div>
            
            {filteredExpenses.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium">Top Spending Categories</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {expensesByCategory.map(({ category, amount }) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{category}</span>
                      <span className="font-medium text-red-600">{formatCurrency(amount, "INR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground text-center">
                  No transactions found for this {viewMode} period.
                  <br />
                  Select a different date or view mode.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingCalendar;
