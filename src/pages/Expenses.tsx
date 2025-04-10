
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ExpenseCard, { ExpenseProps } from "@/components/expense/ExpenseCard";
import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import { useToast } from "@/components/ui/toast";
import { Plus, Filter } from "lucide-react";
import { generateId, groupExpensesByDate } from "@/lib/utils";

// Mock data
const initialWallets = [
  { id: "w1", name: "Cash", balance: 850, currency: "USD" },
  { id: "w2", name: "Bank", balance: 3500, currency: "USD" },
  { id: "w3", name: "Savings", balance: 12000, currency: "USD" },
];

const initialExpenses = [
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

const Expenses = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [wallets] = useState(initialWallets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseFormData | null>(null);
  const { toast } = useToast();

  // Group expenses by date
  const groupedExpenses = groupExpensesByDate(expenses);
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Handler for adding a new expense
  const handleAddExpense = (expenseData: ExpenseFormData) => {
    const wallet = wallets.find((w) => w.id === expenseData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
    const newExpense: ExpenseProps = {
      id: generateId(),
      ...expenseData,
      walletName: wallet.name,
      onEdit: () => {},
      onDelete: () => {},
    };
    
    setExpenses([newExpense, ...expenses]);
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Transaction has been added successfully.",
    });
  };

  // Handler for editing an expense
  const handleEditExpense = (expenseData: ExpenseFormData) => {
    const wallet = wallets.find((w) => w.id === expenseData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
    setExpenses(
      expenses.map((expense) =>
        expense.id === expenseData.id
          ? { 
              ...expense, 
              ...expenseData, 
              walletName: wallet.name 
            }
          : expense
      )
    );
    setIsFormOpen(false);
    setEditingExpense(null);
    toast({
      title: "Success",
      description: "Transaction has been updated successfully.",
    });
  };

  // Handler for deleting an expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
    toast({
      title: "Success",
      description: "Transaction has been deleted successfully.",
    });
  };

  // Open the edit expense form
  const openEditExpenseForm = (id: string) => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) {
      setEditingExpense(expenseToEdit);
      setIsFormOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="gap-1 ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date} className="mb-6">
            <h2 className="font-medium text-lg mb-3">{new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h2>
            <div className="space-y-3">
              {groupedExpenses[date].map((expense: ExpenseProps) => (
                <ExpenseCard
                  key={expense.id}
                  {...expense}
                  onEdit={openEditExpenseForm}
                  onDelete={handleDeleteExpense}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You don't have any transactions yet. Add your first one!
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSave={editingExpense ? handleEditExpense : handleAddExpense}
        initialData={editingExpense || undefined}
        isEditing={!!editingExpense}
        wallets={wallets}
      />
    </DashboardLayout>
  );
};

export default Expenses;
