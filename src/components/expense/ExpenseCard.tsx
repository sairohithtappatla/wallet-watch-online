
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  ArrowDown, 
  ArrowUp, 
  MoreVertical, 
  PenLine, 
  Trash2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export type ExpenseType = "income" | "expense";

export interface ExpenseProps {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  walletId: string;
  walletName: string;
  type: ExpenseType;
  amountDisplay?: string; // Added amountDisplay as optional prop
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExpenseCard = ({
  id,
  amount,
  currency,
  description,
  category,
  date,
  walletName,
  type,
  amountDisplay,
  onEdit,
  onDelete,
}: ExpenseProps) => {
  const isIncome = type === "income";

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="p-3 pb-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
            {isIncome ? (
              <ArrowUp className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium line-clamp-1">{description}</p>
            <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      <CardContent className="p-3 pt-2 flex flex-row justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="outline" className="h-6">
              {category}
            </Badge>
          )}
          {walletName && (
            <Badge variant="secondary" className="h-6">
              {walletName}
            </Badge>
          )}
        </div>
        <span className={`font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}>
          {amountDisplay || (isIncome ? "+" : "-") + formatCurrency(amount, currency)}
        </span>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
