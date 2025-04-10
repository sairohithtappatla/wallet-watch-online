
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { WalletProps } from "../wallet/WalletCard";
import type { ExpenseType } from "./ExpenseCard";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: ExpenseFormData) => void;
  initialData?: ExpenseFormData;
  isEditing: boolean;
  wallets: Omit<WalletProps, "onEdit" | "onDelete">[];
}

export interface ExpenseFormData {
  id?: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  walletId: string;
  type: ExpenseType;
}

const CATEGORIES = [
  "Food", "Transport", "Entertainment", "Shopping", 
  "Health", "Utilities", "Housing", "Education", 
  "Salary", "Gift", "Investment", "Other"
];

const ExpenseForm = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing,
  wallets,
}: ExpenseFormProps) => {
  const today = new Date().toISOString().split("T")[0];
  
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      amount: 0,
      currency: wallets[0]?.currency || "USD",
      description: "",
      category: "Other",
      date: today,
      walletId: wallets[0]?.id || "",
      type: "expense",
    }
  );

  // Update currency when wallet changes
  useEffect(() => {
    if (formData.walletId) {
      const selectedWallet = wallets.find(w => w.id === formData.walletId);
      if (selectedWallet) {
        setFormData(prev => ({
          ...prev,
          currency: selectedWallet.currency
        }));
      }
    }
  }, [formData.walletId, wallets]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value as ExpenseType,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update transaction details below."
              : "Enter the details of your transaction below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={handleTypeChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3">
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wallet" className="text-right">
                Wallet
              </Label>
              <Select
                value={formData.walletId}
                onValueChange={(value) => handleSelectChange("walletId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} ({wallet.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="min-h-[60px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={today}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;
