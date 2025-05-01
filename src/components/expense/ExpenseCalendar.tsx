
import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { format, isEqual, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ExpenseData {
  date: Date;
  totalExpense: number;
  totalIncome: number;
}

const ExpenseCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<ExpenseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch expense data for the selected month
  useEffect(() => {
    const fetchMonthlyExpenses = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        
        const { data: expensesData, error } = await supabase
          .from('expenses')
          .select('amount, date')
          .eq('user_id', user.id)
          .gte('date', start.toISOString())
          .lte('date', end.toISOString());
        
        if (error) {
          console.error('Error fetching expenses:', error);
          return;
        }
        
        // Create a map of date to expenses/incomes
        const dailyTotals = new Map<string, { expense: number; income: number }>();
        
        // Initialize all days of the month with zero values
        const daysInMonth = eachDayOfInterval({ start, end });
        daysInMonth.forEach(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          dailyTotals.set(dateString, { expense: 0, income: 0 });
        });
        
        // Populate with actual data
        expensesData?.forEach(expense => {
          const expenseDate = new Date(expense.date);
          const dateString = format(expenseDate, 'yyyy-MM-dd');
          
          const currentTotal = dailyTotals.get(dateString) || { expense: 0, income: 0 };
          
          if (Number(expense.amount) < 0) {
            currentTotal.expense += Math.abs(Number(expense.amount));
          } else {
            currentTotal.income += Number(expense.amount);
          }
          
          dailyTotals.set(dateString, currentTotal);
        });
        
        // Convert map to array
        const formattedData: ExpenseData[] = [];
        dailyTotals.forEach((value, key) => {
          formattedData.push({
            date: new Date(key),
            totalExpense: value.expense,
            totalIncome: value.income
          });
        });
        
        setExpenseData(formattedData);
        
        // Update selected day data if it's within this month
        if (date >= start && date <= end) {
          const selectedDateString = format(date, 'yyyy-MM-dd');
          const dayData = formattedData.find(item => 
            format(item.date, 'yyyy-MM-dd') === selectedDateString
          );
          setSelectedDayData(dayData || null);
        } else {
          setSelectedDayData(null);
        }
      } catch (error) {
        console.error('Failed to fetch monthly expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMonthlyExpenses();
  }, [user, month, date]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    
    // Find data for selected day
    const selectedDateString = format(newDate, 'yyyy-MM-dd');
    const dayData = expenseData.find(item => 
      format(item.date, 'yyyy-MM-dd') === selectedDateString
    );
    setSelectedDayData(dayData || null);
  };

  const handleMonthChange = (increment: number) => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setMonth(newMonth);
  };

  // For calendar UI - show expense indicators on dates
  const getDayWithExpense = useMemo(() => {
    return (day: Date) => {
      const matchingData = expenseData.find(data => 
        isEqual(new Date(data.date).setHours(0, 0, 0, 0), new Date(day).setHours(0, 0, 0, 0))
      );
      
      if (!matchingData) return undefined;
      
      return matchingData.totalExpense > 0 
        ? "bg-red-100 text-red-900" 
        : matchingData.totalIncome > 0 
          ? "bg-green-100 text-green-900" 
          : undefined;
    };
  }, [expenseData]);

  const netBalance = selectedDayData 
    ? selectedDayData.totalIncome - selectedDayData.totalExpense 
    : 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Expense Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleMonthChange(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(month, 'MMMM yyyy')}
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleMonthChange(1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Track your daily expenses and income
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-7/12">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                month={month}
                onMonthChange={setMonth}
                className="bg-white rounded-md border p-3"
                modifiers={{
                  expense: (day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    return expenseData.some(d => 
                      format(d.date, 'yyyy-MM-dd') === dayStr && d.totalExpense > 0
                    );
                  },
                  income: (day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    return expenseData.some(d => 
                      format(d.date, 'yyyy-MM-dd') === dayStr && d.totalIncome > 0
                    );
                  }
                }}
                modifiersStyles={{
                  expense: {
                    fontWeight: "bold",
                    color: "var(--red-600)"
                  },
                  income: {
                    fontWeight: "bold",
                    color: "var(--green-600)"
                  }
                }}
              />
            </div>
            <div className="w-full md:w-5/12 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {isToday(date) ? 'Today' : format(date, 'MMMM d, yyyy')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(selectedDayData?.totalIncome || 0, "INR")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expenses:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(selectedDayData?.totalExpense || 0, "INR")}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Net:</span>
                      <span className={`font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netBalance, "INR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 mt-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-muted-foreground">Expense</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Income</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCalendar;
