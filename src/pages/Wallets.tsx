
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/wallet/WalletCard";
import WalletForm, { WalletFormData } from "@/components/wallet/WalletForm";
import TransferFundsForm, { TransferFormData } from "@/components/wallet/TransferFundsForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeftRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Wallets = () => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch wallets from Supabase
  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching wallets:', error);
          toast({
            variant: "destructive",
            title: "Failed to load wallets",
            description: error.message,
          });
          return;
        }
        
        if (data && data.length === 0) {
          // Create default INR wallets for new users
          const defaultWallets = [
            { name: "Cash", balance: 2000, currency: "INR", user_id: user.id },
            { name: "Bank", balance: 10000, currency: "INR", user_id: user.id },
            { name: "Savings", balance: 50000, currency: "INR", user_id: user.id },
          ];
          
          try {
            const { data: newWallets, error: insertError } = await supabase
              .from('wallets')
              .insert(defaultWallets)
              .select();
              
            if (insertError) throw insertError;
            
            setWallets(newWallets || []);
          } catch (insertErr) {
            console.error('Error creating default wallets:', insertErr);
          }
        } else {
          setWallets(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not load your wallets. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWallets();
  }, [user, toast]);

  // Listen for custom event to open transfer form
  useEffect(() => {
    const handleOpenTransferForm = () => {
      setIsTransferOpen(true);
    };
    
    window.addEventListener('open-transfer-form', handleOpenTransferForm);
    
    return () => {
      window.removeEventListener('open-transfer-form', handleOpenTransferForm);
    };
  }, []);

  // Handler for adding a new wallet
  const handleAddWallet = async (walletData: WalletFormData) => {
    if (!user) return;

    try {
      const newWalletData = {
        name: walletData.name,
        balance: walletData.balance,
        currency: walletData.currency || "INR", // Default to INR
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('wallets')
        .insert(newWalletData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setWallets([data, ...wallets]);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Wallet has been added successfully.",
      });
    } catch (error: any) {
      console.error('Error adding wallet:', error);
      toast({
        variant: "destructive",
        title: "Failed to add wallet",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  // Handler for editing a wallet
  const handleEditWallet = async (walletData: WalletFormData) => {
    if (!user || !walletData.id) return;
    
    try {
      const updateData = {
        name: walletData.name,
        balance: walletData.balance,
        currency: walletData.currency || "INR", // Default to INR if none provided
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('wallets')
        .update(updateData)
        .eq('id', walletData.id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state with the updated wallet data
      setWallets(
        wallets.map((wallet) =>
          wallet.id === walletData.id
            ? { ...wallet, ...updateData }
            : wallet
        )
      );
      
      setIsFormOpen(false);
      setEditingWallet(null);
      toast({
        title: "Success",
        description: "Wallet has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating wallet:', error);
      toast({
        variant: "destructive",
        title: "Failed to update wallet",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  // Handler for deleting a wallet
  const handleDeleteWallet = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setWallets(wallets.filter((wallet) => wallet.id !== id));
      toast({
        title: "Success",
        description: "Wallet has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting wallet:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete wallet",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  // Handler for transferring funds between wallets
  const handleTransferFunds = async (transferData: TransferFormData) => {
    if (!user) return;
    const { fromWalletId, toWalletId, amount } = transferData;

    try {
      // Start a Supabase transaction
      const fromWallet = wallets.find(wallet => wallet.id === fromWalletId);
      const toWallet = wallets.find(wallet => wallet.id === toWalletId);
      
      if (!fromWallet || !toWallet) {
        throw new Error("Wallet not found");
      }
      
      if (fromWallet.balance < amount) {
        throw new Error("Insufficient funds");
      }
      
      // Update source wallet (reduce balance)
      const { error: fromError } = await supabase
        .from('wallets')
        .update({ balance: fromWallet.balance - amount })
        .eq('id', fromWalletId)
        .eq('user_id', user.id);
      
      if (fromError) throw fromError;
      
      // Update destination wallet (increase balance)
      const { error: toError } = await supabase
        .from('wallets')
        .update({ balance: toWallet.balance + amount })
        .eq('id', toWalletId)
        .eq('user_id', user.id);
      
      if (toError) throw toError;
      
      // Update local state
      setWallets(wallets.map((wallet) => {
        if (wallet.id === fromWalletId) {
          return { ...wallet, balance: wallet.balance - amount };
        }
        if (wallet.id === toWalletId) {
          return { ...wallet, balance: wallet.balance + amount };
        }
        return wallet;
      }));

      setIsTransferOpen(false);
      toast({
        title: "Funds Transferred",
        description: `Successfully transferred ₹${amount} between wallets.`,
      });
    } catch (error: any) {
      console.error('Error transferring funds:', error);
      toast({
        variant: "destructive",
        title: "Failed to transfer funds",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  // Open the edit wallet form
  const openEditWalletForm = (id: string) => {
    const walletToEdit = wallets.find((wallet) => wallet.id === id);
    if (walletToEdit) {
      setEditingWallet({
        id: walletToEdit.id,
        name: walletToEdit.name,
        balance: walletToEdit.balance,
        currency: walletToEdit.currency
      });
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
            disabled={wallets.length < 2}
          >
            <ArrowLeftRight className="h-4 w-4" /> Transfer Funds
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Wallet
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-muted-foreground">Loading wallets...</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                id={wallet.id}
                name={wallet.name}
                balance={wallet.balance}
                currency={wallet.currency || "INR"}
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
        </>
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
