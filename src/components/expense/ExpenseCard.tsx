
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
  onEdit,
  onDelete,
}: ExpenseProps) => {
  return (
    <Card className="mb-3">
      <CardHeader className="p-3 pb-0 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-${type === "income" ? "expense-income/10" : "expense-expense/10"}`}>
            {type === "income" ? (
              <ArrowUp className="h-4 w-4 text-expense-income" />
            ) : (
              <ArrowDown className="h-4 w-4 text-expense-expense" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{description}</p>
            <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
        <div className="flex flex-row gap-2">
          <Badge variant="outline" className="h-6">
            {category}
          </Badge>
          <Badge variant="secondary" className="h-6">
            {walletName}
          </Badge>
        </div>
        <span className={`font-semibold ${type === "income" ? "text-expense-income" : "text-expense-expense"}`}>
          {type === "income" ? "+" : "-"}{formatCurrency(amount, currency)}
        </span>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
