
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import ExpenseCard from "@/components/expense/ExpenseCard";
import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Filter,
  ArrowUpDown, 
  Calendar 
} from "lucide-react";
import { generateId } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const initialWallets = [
  { id: "w1", name: "Cash", balance: 850, currency: "USD" },
  { id: "w2", name: "Bank", balance: 3500, currency: "USD" },
  { id: "w3", name: "Savings", balance: 12000, currency: "USD" },
];

const initialTransactions = [
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

const Transactions = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [wallets] = useState(initialWallets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExpenseFormData | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterWallet, setFilterWallet] = useState<string>("all");
  const { toast } = useToast();

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const walletMatch = filterWallet === "all" || transaction.walletId === filterWallet;
    return typeMatch && walletMatch;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Handler for adding a new transaction
  const handleAddTransaction = (transactionData: ExpenseFormData) => {
    const wallet = wallets.find((w) => w.id === transactionData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
    const newTransaction = {
      id: generateId(),
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
  };

  // Handler for editing a transaction
  const handleEditTransaction = (transactionData: ExpenseFormData) => {
    const wallet = wallets.find((w) => w.id === transactionData.walletId);
    
    if (!wallet) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected wallet not found.",
      });
      return;
    }
    
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
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    toast({
      title: "Success",
      description: "Transaction has been deleted successfully.",
    });
  };

  // Open the edit transaction form
  const openEditTransactionForm = (id: string) => {
    const transactionToEdit = transactions.find((transaction) => transaction.id === id);
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setIsFormOpen(true);
    }
  };

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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterWallet}
            onValueChange={setFilterWallet}
          >
            <SelectTrigger className="w-[140px]">
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
      </div>

      {sortedTransactions.length > 0 ? (
        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <ExpenseCard
              key={transaction.id}
              {...transaction}
              onEdit={openEditTransactionForm}
              onDelete={handleDeleteTransaction}
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

      {/* Transaction Form Modal */}
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
