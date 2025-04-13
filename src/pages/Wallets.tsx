
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/wallet/WalletCard";
import WalletForm, { WalletFormData } from "@/components/wallet/WalletForm";
import TransferFundsForm, { TransferFormData } from "@/components/wallet/TransferFundsForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeftRight } from "lucide-react";
import { generateId } from "@/lib/utils";

// Mock data
const initialWallets = [
  { id: "w1", name: "Cash", balance: 850, currency: "USD" },
  { id: "w2", name: "Bank", balance: 3500, currency: "USD" },
  { id: "w3", name: "Savings", balance: 12000, currency: "USD" },
];

const Wallets = () => {
  const [wallets, setWallets] = useState(initialWallets);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletFormData | null>(null);
  const { toast } = useToast();

  // Handler for adding a new wallet
  const handleAddWallet = (walletData: WalletFormData) => {
    const newWallet = {
      id: generateId(),
      ...walletData,
    };
    setWallets([...wallets, newWallet]);
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Wallet has been added successfully.",
    });
  };

  // Handler for editing a wallet
  const handleEditWallet = (walletData: WalletFormData) => {
    setWallets(
      wallets.map((wallet) =>
        wallet.id === walletData.id
          ? { ...wallet, ...walletData }
          : wallet
      )
    );
    setIsFormOpen(false);
    setEditingWallet(null);
    toast({
      title: "Success",
      description: "Wallet has been updated successfully.",
    });
  };

  // Handler for deleting a wallet
  const handleDeleteWallet = (id: string) => {
    setWallets(wallets.filter((wallet) => wallet.id !== id));
    toast({
      title: "Success",
      description: "Wallet has been deleted successfully.",
    });
  };

  // Handler for transferring funds between wallets
  const handleTransferFunds = (transferData: TransferFormData) => {
    const { fromWalletId, toWalletId, amount } = transferData;

    setWallets(
      wallets.map((wallet) => {
        if (wallet.id === fromWalletId) {
          return { ...wallet, balance: wallet.balance - amount };
        }
        if (wallet.id === toWalletId) {
          return { ...wallet, balance: wallet.balance + amount };
        }
        return wallet;
      })
    );

    setIsTransferOpen(false);
    toast({
      title: "Funds Transferred",
      description: `Successfully transferred funds between wallets.`,
    });
  };

  // Open the edit wallet form
  const openEditWalletForm = (id: string) => {
    const walletToEdit = wallets.find((wallet) => wallet.id === id);
    if (walletToEdit) {
      setEditingWallet(walletToEdit);
      setIsFormOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Wallets</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsTransferOpen(true)}
            variant="outline"
            className="gap-1"
          >
            <ArrowLeftRight className="h-4 w-4" /> Transfer Funds
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Wallet
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            {...wallet}
            onEdit={openEditWalletForm}
            onDelete={handleDeleteWallet}
          />
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You don't have any wallets yet. Create your first one!
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        </div>
      )}

      {/* Wallet Form Modal */}
      <WalletForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWallet(null);
        }}
        onSave={editingWallet ? handleEditWallet : handleAddWallet}
        initialData={editingWallet || undefined}
        isEditing={!!editingWallet}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsForm
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransfer={handleTransferFunds}
        wallets={wallets}
      />
    </DashboardLayout>
  );
};

export default Wallets;
