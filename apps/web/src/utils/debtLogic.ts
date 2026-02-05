import { type Payment } from "../context/DebtContext";

// Types needed for testing (simplified)
export const calculateRemaining = (amount: number, payments: Payment[]) => {
    const paid = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
    return Math.max(0, amount - paid);
};

export const calculateProgress = (amount: number, payments: Payment[]) => {
    const paid = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
    if (amount === 0) return 0;
    return Math.min((paid / amount) * 100, 100);
};

export const createPayment = (amount: number, date: string, note?: string) => {
    if (amount <= 0) throw new Error("Amount must be positive");
    return {
        id: Date.now().toString(),
        amount,
        date,
        note
    };
};
