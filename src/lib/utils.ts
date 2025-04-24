
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Define the NotificationType interface
export interface NotificationType {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR") {
  return `₹${Number(amount)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function calculateTotalBalance(wallets: { balance: number }[]): number {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function groupExpensesByDate(expenses: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  expenses.forEach((expense) => {
    const date = new Date(expense.date).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(expense);
  });
  
  // Sort each day's expenses
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  return grouped;
}

export function getStoredNotifications(): NotificationType[] {
  try {
    return JSON.parse(localStorage.getItem("WW_Notifications") || "[]");
  } catch {
    return [];
  }
}

export function clearStoredNotifications(): void {
  localStorage.setItem("WW_Notifications", "[]");
}

export function clearNotification(id: string): void {
  const notifications = getStoredNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  localStorage.setItem("WW_Notifications", JSON.stringify(filtered));
}

export function addNotification(notification: { title: string; description: string; type?: string }): void {
  const notifications = getStoredNotifications();
  const exists = notifications.some(
    n => n.title === notification.title && 
         n.description === notification.description && 
         n.type === notification.type
  );
  
  if (!exists) {
    const newNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("WW_Notifications", JSON.stringify([newNotification, ...notifications]));
  }
}
