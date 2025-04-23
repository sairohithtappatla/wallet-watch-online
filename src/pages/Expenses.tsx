import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ExpenseCard, { ExpenseProps, ExpenseType } from "@/components/expense/ExpenseCard";
import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, Loader2 } from "lucide-react";
import { generateId, groupExpensesByDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Expenses = () => {
  const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const handleOpenExpenseForm = () => {
      setIsFormOpen(true);
    };
    
    window.addEventListener('open-expense-form', handleOpenExpenseForm);
    
    return () => {
      window.removeEventListener('open-expense-form', handleOpenExpenseForm);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);
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
              name
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        if (expensesError) throw expensesError;
        const formattedExpenses = expensesData?.map(expense => ({
          id: expense.id,
          amount: Number(expense.amount),
          currency: "INR",
          description: expense.description || "",
          category: expense.category || "Other",
          date: new Date(expense.date).toISOString().split('T')[0],
          walletId: expense.wallet_id,
          walletName: expense.wallets?.name || "Unknown",
          type: Number(expense.amount) >= 0 ? "income" as ExpenseType : "expense" as ExpenseType,
          onEdit: () => {},
          onDelete: () => {},
        })) || [];
        setExpenses(formattedExpenses);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Please refresh the page and try again."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  const groupedExpenses = groupExpensesByDate(expenses);
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    if (!user) return;
    
    const wallet = wallets.find((w) => w.id === expenseData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
    try {
      const amount = expenseData.type === 'expense' ? -Math.abs(expenseData.amount) : Math.abs(expenseData.amount);
      
      const { data: newExpense, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          wallet_id: expenseData.walletId,
          amount: amount,
          description: expenseData.description,
          category: expenseData.category,
          date: expenseData.date
        })
        .select(`
          id, 
          amount, 
          description, 
          category, 
          date,
          wallet_id,
          wallets (
            name
          )
        `)
        .single();
      
      if (error) throw error;
      
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance + Number(amount) })
        .eq('id', wallet.id);
      
      const formattedExpense: ExpenseProps = {
        id: newExpense.id,
        amount: Math.abs(Number(newExpense.amount)),
        currency: wallet.currency,
        description: newExpense.description || "",
        category: newExpense.category || "Other",
        date: new Date(newExpense.date).toISOString().split('T')[0],
        walletId: newExpense.wallet_id,
        walletName: newExpense.wallets?.name || wallet.name,
        type: Number(newExpense.amount) >= 0 ? "income" as ExpenseType : "expense" as ExpenseType,
        onEdit: () => {},
        onDelete: () => {},
      };
      
      setExpenses([formattedExpense, ...expenses]);
      setIsFormOpen(false);
      
      setWallets(wallets.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: w.balance + Number(amount) } 
          : w
      ));
      
      toast({
        title: "Success",
        description: "Transaction has been added successfully.",
      });
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add transaction.",
      });
    }
  };

  const handleEditExpense = async (expenseData: ExpenseFormData) => {
    if (!user || !expenseData.id) return;
    
    const wallet = wallets.find((w) => w.id === expenseData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
    try {
      const originalExpense = expenses.find(e => e.id === expenseData.id);
      if (!originalExpense) throw new Error("Original expense not found");
      
      const originalAmount = originalExpense.type === 'expense' 
        ? -Math.abs(originalExpense.amount) 
        : Math.abs(originalExpense.amount);
      
      const newAmount = expenseData.type === 'expense' 
        ? -Math.abs(expenseData.amount) 
        : Math.abs(expenseData.amount);
      
      const balanceChange = newAmount - originalAmount;
      
      const { data: updatedExpense, error } = await supabase
        .from('expenses')
        .update({
          wallet_id: expenseData.walletId,
          amount: newAmount,
          description: expenseData.description,
          category: expenseData.category,
          date: expenseData.date
        })
        .eq('id', expenseData.id)
        .eq('user_id', user.id)
        .select(`
          id, 
          amount, 
          description, 
          category, 
          date,
          wallet_id,
          wallets (
            name
          )
        `)
        .single();
      
      if (error) throw error;
      
      if (originalExpense.walletId === expenseData.walletId) {
        await supabase
          .from('wallets')
          .update({ balance: wallet.balance + balanceChange })
          .eq('id', wallet.id);
          
        setWallets(wallets.map(w => 
          w.id === wallet.id 
            ? { ...w, balance: w.balance + balanceChange } 
            : w
        ));
      } else {
        const oldWallet = wallets.find(w => w.id === originalExpense.walletId);
        
        if (oldWallet) {
          await supabase
            .from('wallets')
            .update({ balance: oldWallet.balance - originalAmount })
            .eq('id', oldWallet.id);
            
          await supabase
            .from('wallets')
            .update({ balance: wallet.balance + newAmount })
            .eq('id', wallet.id);
            
          setWallets(wallets.map(w => {
            if (w.id === oldWallet.id) return { ...w, balance: w.balance - originalAmount };
            if (w.id === wallet.id) return { ...w, balance: w.balance + newAmount };
            return w;
          }));
        }
      }
      
      const formattedExpense: ExpenseProps = {
        id: updatedExpense.id,
        amount: Math.abs(Number(updatedExpense.amount)),
        currency: wallet.currency,
        description: updatedExpense.description || "",
        category: updatedExpense.category || "Other",
        date: new Date(updatedExpense.date).toISOString().split('T')[0],
        walletId: updatedExpense.wallet_id,
        walletName: updatedExpense.wallets?.name || wallet.name,
        type: Number(updatedExpense.amount) >= 0 ? "income" as ExpenseType : "expense" as ExpenseType,
        onEdit: () => {},
        onDelete: () => {},
      };
      
      setExpenses(expenses.map(expense => 
        expense.id === expenseData.id ? formattedExpense : expense
      ));
      
      setIsFormOpen(false);
      setEditingExpense(null);
      
      toast({
        title: "Success",
        description: "Transaction has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update transaction.",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (!expenseToDelete) throw new Error("Expense not found");
      
      const wallet = wallets.find(w => w.id === expenseToDelete.walletId);
      if (!wallet) throw new Error("Wallet not found");
      
      const amount = expenseToDelete.type === 'expense' 
        ? -Math.abs(expenseToDelete.amount) 
        : Math.abs(expenseToDelete.amount);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('id', wallet.id);
      
      setExpenses(expenses.filter(expense => expense.id !== id));
      
      setWallets(wallets.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: w.balance - amount } 
          : w
      ));
      
      toast({
        title: "Success",
        description: "Transaction has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete transaction.",
      });
    }
  };

  const openEditExpenseForm = (id: string) => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) {
      setEditingExpense({
        id: expenseToEdit.id,
        amount: expenseToEdit.amount,
        currency: expenseToEdit.currency,
        description: expenseToEdit.description,
        category: expenseToEdit.category,
        date: expenseToEdit.date,
        walletId: expenseToEdit.walletId,
        type: expenseToEdit.type,
      });
      setIsFormOpen(true);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading transactions...</p>
        </div>
      </DashboardLayout>
    );
  }

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
                  amountDisplay={`₹${Number(expense.amount)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
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
