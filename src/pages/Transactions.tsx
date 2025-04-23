
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

// Extend the ExpenseCard props to include amountDisplay
interface TransactionProps extends ExpenseFormData {
  walletName: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [wallets] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionProps | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterWallet, setFilterWallet] = useState("all");
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const walletMatch = filterWallet === "all" || transaction.walletId === filterWallet;
    return typeMatch && walletMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    
    const newTransaction: TransactionProps = {
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

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    toast({
      title: "Success",
      description: "Transaction has been deleted successfully.",
    });
  };

  const openEditTransactionForm = (id: string) => {
    const transactionToEdit = transactions.find((transaction) => transaction.id === id);
    if (transactionToEdit) {
      setEditingTransaction(transactionToEdit);
      setIsFormOpen(true);
    }
  };

  // Format currency to Indian Rupees
  const formatToRupees = (amount: number) => {
    return `₹${Number(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
