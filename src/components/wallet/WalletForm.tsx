
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
      currency: "INR",
    }
  );

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData || {
          name: "",
          balance: 0,
          currency: "INR",
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
    
    // Prevent event bubbling issues
    e.stopPropagation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up
    
    // Always ensure currency is INR
    const updatedData = {...formData, currency: "INR"};
    onSave(updatedData);
    
    // Ensure we clean up properly
    setTimeout(() => {
      setFormData({
        name: "",
        balance: 0,
        currency: "INR",
      });
    }, 100);
  };

  const handleCancel = () => {
    // Clear the form data and close
    setFormData({
      name: "",
      balance: 0,
      currency: "INR",
    });
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownCapture={(e) => {
          // Fix for touch events not propagating correctly
          e.stopPropagation();
        }}
      >
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
                autoComplete="off"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <div className="col-span-3">
                <Input
                  id="currency"
                  name="currency"
                  value="INR"
                  className="col-span-3 bg-gray-100"
                  disabled
                />
                <span className="text-xs text-muted-foreground mt-1">Indian Rupee (₹) is the default currency</span>
              </div>
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
                autoComplete="off"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel();
              }}
              style={{ touchAction: "manipulation" }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              style={{ touchAction: "manipulation" }}
              onClick={(e) => e.stopPropagation()}
            >
              {isEditing ? "Save Changes" : "Add Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletForm;
