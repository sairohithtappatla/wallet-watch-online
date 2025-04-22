
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface WalletFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (walletData: WalletFormData) => void;
  initialData?: WalletFormData;
  isEditing: boolean;
}

export interface WalletFormData {
  id?: string;
  name: string;
  balance: number;
  currency: string;
}

// Default currency set to INR
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

const WalletForm = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing,
}: WalletFormProps) => {
  const [formData, setFormData] = useState<WalletFormData>(
    initialData || {
      name: "",
      balance: 0,
      currency: "INR", // Default to INR
    }
  );

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          name: "",
          balance: 0,
          currency: "INR", // Default to INR
        }
      );
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "balance" ? parseFloat(value) || 0 : value,
    });
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData({
      ...formData,
      currency,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your wallet details below."
              : "Create a new wallet to track your finances."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Balance
              </Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletForm;
