
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ExpenseCard from "@/components/expense/ExpenseCard";
import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Filter,
  CalendarRange, 
  ArrowUpDown,
  Wallet as WalletIcon
} from "lucide-react";
import { generateId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface TransactionProps extends ExpenseFormData {
  id: string;
  walletName: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionProps | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterWallet, setFilterWallet] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch wallets and transactions from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch wallets
        const { data: walletsData, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);
          
        if (walletsError) throw walletsError;
        
        setWallets(walletsData || []);
        
        // Fetch transactions
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
          .order('date', { ascending: false });
        
        if (expensesError) throw expensesError;
        
        const formattedTransactions = expensesData?.map(expense => ({
          id: expense.id,
          amount: Math.abs(Number(expense.amount)),
          description: expense.description || "",
          category: expense.category || "Other",
          date: expense.date,
          walletId: expense.wallet_id,
          walletName: expense.wallets?.name || "Unknown",
          currency: "INR",
          type: Number(expense.amount) >= 0 ? "income" as const : "expense" as const,
          onEdit: () => {},
          onDelete: () => {},
        }));
        
        setTransactions(formattedTransactions || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Could not fetch your transactions. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const walletMatch = filterWallet === "all" || transaction.walletId === filterWallet;
    const dateMatch = !filterDate || 
      format(new Date(transaction.date), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
      
    return typeMatch && walletMatch && dateMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddTransaction = async (transactionData: ExpenseFormData) => {
    if (!user) return;
    
    try {
      const wallet = wallets.find((w) => w.id === transactionData.walletId);
      
      if (!wallet) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected wallet not found.",
        });
        return;
      }
      
      const amount = transactionData.type === 'expense' 
        ? -Math.abs(transactionData.amount) 
        : Math.abs(transactionData.amount);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          wallet_id: transactionData.walletId,
          amount,
          description: transactionData.description,
          category: transactionData.category,
          date: transactionData.date
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newTransaction: TransactionProps = {
          id: data[0].id,
          ...transactionData,
          walletName: wallet.name,
          onEdit: () => {},
          onDelete: () => {},
        };
        
        setTransactions([newTransaction, ...transactions]);
        setIsFormOpen(false);
        toast({
          title: "Success",
          description: "Transaction has been added successfully.",
        });
        
        if (transactionData.type === "expense" && transactionData.amount > 5000) {
          window.dispatchEvent(
            new CustomEvent("expense-alert", {
              detail: {
                message: `High expense of ₹${Number(transactionData.amount).toLocaleString('en-IN')} detected in ${wallet.name}`,
              },
            })
          );
        }
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction. Please try again.",
      });
    }
  };

  const handleEditTransaction = async (transactionData: ExpenseFormData) => {
    if (!user || !transactionData.id) return;
    
    try {
      const wallet = wallets.find((w) => w.id === transactionData.walletId);
      
      if (!wallet) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Selected wallet not found.",
        });
        return;
      }
      
      const amount = transactionData.type === 'expense' 
        ? -Math.abs(transactionData.amount) 
        : Math.abs(transactionData.amount);
      
      const { error } = await supabase
        .from('expenses')
        .update({
          wallet_id: transactionData.walletId,
          amount,
          description: transactionData.description,
          category: transactionData.category,
          date: transactionData.date
        })
        .eq('id', transactionData.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTransactions(
        transactions.map((transaction) =>
          transaction.id === transactionData.id
            ? { 
                ...transaction, 
                ...transactionData,
                walletName: wallet.name 
              }
            : transaction
        )
      );
      
      setIsFormOpen(false);
      setEditingTransaction(null);
      toast({
        title: "Success",
        description: "Transaction has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update transaction. Please try again.",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
      toast({
        title: "Success",
        description: "Transaction has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
      });
    }
  };

  const openEditTransactionForm = (id: string) => {
    const transactionToEdit = transactions.find((transaction) => transaction.id === id);
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setIsFormOpen(true);
    }
  };

  const formatToRupees = (amount: number) => {
    return `₹${Number(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  
  const clearFilters = () => {
    setFilterType("all");
    setFilterWallet("all");
    setFilterDate(undefined);
  };

  if (isLoading) {
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
            onClick={() => setIsFormOpen(true)} 
            className="gap-1 ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Type</span>
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Wallet</span>
              <Select
                value={filterWallet}
                onValueChange={setFilterWallet}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wallets</SelectItem>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-start">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, 'PP') : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end">
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
          
          {(filterType !== "all" || filterWallet !== "all" || filterDate) && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm font-medium">Active filters:</span>
              {filterType !== "all" && (
                <Badge variant="outline" className="flex gap-1 items-center">
                  <ArrowUpDown className="h-3 w-3" />
                  {filterType === "income" ? "Income" : "Expense"}
                </Badge>
              )}
              {filterWallet !== "all" && (
                <Badge variant="outline" className="flex gap-1 items-center">
                  <WalletIcon className="h-3 w-3" />
                  {wallets.find(w => w.id === filterWallet)?.name || "Unknown wallet"}
                </Badge>
              )}
              {filterDate && (
                <Badge variant="outline" className="flex gap-1 items-center">
                  <CalendarRange className="h-3 w-3" />
                  {format(filterDate, 'PPP')}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {sortedTransactions.length > 0 ? (
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <ExpenseCard
              key={transaction.id}
              {...transaction}
              onEdit={openEditTransactionForm}
              onDelete={handleDeleteTransaction}
              amountDisplay={formatToRupees(transaction.amount)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No transactions match your filters. Try changing your filter criteria or add a new transaction.
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
          setEditingTransaction(null);
        }}
        onSave={editingTransaction ? handleEditTransaction : handleAddTransaction}
        initialData={editingTransaction || undefined}
        isEditing={!!editingTransaction}
        wallets={wallets}
      />
    </DashboardLayout>
  );
};

export default Transactions;
