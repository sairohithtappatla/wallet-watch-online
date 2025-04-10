
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, PenLine, Trash2, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

export interface WalletProps {
  id: string;
  name: string;
  balance: number;
  currency: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const WalletCard = ({ id, name, balance, currency, onEdit, onDelete }: WalletProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`h-44 transition-all duration-200 ${
        isHovered ? "shadow-lg transform -translate-y-1" : "shadow"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          {name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <PenLine className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center h-20">
          <span className="text-3xl font-bold">
            {formatCurrency(balance, currency)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">Current Balance</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
