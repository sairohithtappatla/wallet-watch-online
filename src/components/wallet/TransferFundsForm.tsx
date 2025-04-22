
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WalletProps } from "./WalletCard";

interface TransferFundsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (transferData: TransferFormData) => void;
  wallets: Omit<WalletProps, "onEdit" | "onDelete">[];
}

export interface TransferFormData {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
}

const TransferFundsForm = ({
  isOpen,
  onClose,
  onTransfer,
  wallets,
}: TransferFundsFormProps) => {
  const [formData, setFormData] = useState<TransferFormData>({
    fromWalletId: "",
    toWalletId: "",
    amount: 0,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && wallets.length >= 2) {
      setFormData({
        fromWalletId: wallets[0]?.id || "",
        toWalletId: wallets.length > 1 ? wallets[1]?.id || "" : "",
        amount: 0,
      });
    }
  }, [isOpen, wallets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (field: "fromWalletId" | "toWalletId", value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransfer(formData);
  };

  // Calculate the maximum amount that can be transferred
  const fromWallet = wallets.find((wallet) => wallet.id === formData.fromWalletId);
  const maxAmount = fromWallet?.balance || 0;
  
  // Check if the form is valid
  const isValidForm = 
    formData.fromWalletId !== "" && 
    formData.toWalletId !== "" && 
    formData.fromWalletId !== formData.toWalletId && 
    formData.amount > 0 && 
    formData.amount <= maxAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Move money between your wallets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fromWallet" className="text-right">
                From
              </Label>
              <Select
                value={formData.fromWalletId}
                onValueChange={(value) => handleSelectChange("fromWalletId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select source wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={`from-${wallet.id}`} value={wallet.id}>
                      {wallet.name} ({wallet.balance} {wallet.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="toWallet" className="text-right">
                To
              </Label>
              <Select
                value={formData.toWalletId}
                onValueChange={(value) => handleSelectChange("toWalletId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select destination wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets
                    .filter((wallet) => wallet.id !== formData.fromWalletId)
                    .map((wallet) => (
                      <SelectItem key={`to-${wallet.id}`} value={wallet.id}>
                        {wallet.name} ({wallet.balance} {wallet.currency})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount.toString()}
                value={formData.amount || ""}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            {fromWallet && (
              <p className="text-sm text-muted-foreground text-right">
                Available: {fromWallet.balance} {fromWallet.currency}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidForm}>
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferFundsForm;
