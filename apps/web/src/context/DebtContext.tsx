/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNotification } from "./NotificationContext";
import { useUser } from "./UserContext";
import { getLocalISOString } from "../utils/dateUtils";

export type DebtType = 'DEBT' | 'RECEIVABLE';

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Debt {
  id: string;
  person: string;
  type: DebtType;
  amount: number; // Total initial amount
  description?: string;
  dueDate?: string;
  status: 'UNPAID' | 'PAID';
  payments: Payment[];
  createdAt: string;
}

interface DebtContextType {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, "id" | "payments" | "createdAt" | "status">) => void;
  addPayment: (debtId: string, payment: Omit<Payment, "id">) => void;
  deleteDebt: (id: string) => void;
  getDebt: (id: string) => Debt | undefined;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

const INITIAL_DEBTS: Debt[] = [];

export function DebtProvider({ children }: { children: ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('dompetku_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });
  
  const { addNotification } = useNotification();
  const { addTransaction, deleteTransaction, transactions } = useUser();

  useEffect(() => {
    localStorage.setItem('dompetku_debts', JSON.stringify(debts));
  }, [debts]);

  const addDebt = (debtData: Omit<Debt, "id" | "payments" | "createdAt" | "status">) => {
    const createdAt = getLocalISOString();

    const newDebt: Debt = {
      ...debtData,
      id: Date.now().toString(),
      payments: [],
      status: 'UNPAID',
      createdAt: createdAt
    };
    setDebts(prev => [newDebt, ...prev]);
    
    // Sync with Transactions (Update Balance)
    // createdAt is like "2026-02-06T17:00:00.000"
    const [dateStr, fullTime] = createdAt.split('T');
    const timeStr = fullTime.substring(0, 5);
    
    addTransaction({
      title: debtData.type === 'DEBT' ? `Pinjaman dari ${debtData.person}` : `Pinjaman ke ${debtData.person}`,
      type: debtData.type === 'DEBT' ? 'INCOME' : 'EXPENSE',
      amount: debtData.amount,
      date: dateStr,
      time: timeStr,
      icon: debtData.type === 'DEBT' ? 'account_balance_wallet' : 'trending_down',
      color: debtData.type === 'DEBT' ? 'primary' : 'rose-red'
    });

    addNotification({
      title: "Transaksi Hutang Baru",
      message: `Menambahkan ${debtData.type === 'DEBT' ? 'hutang ke' : 'piutang dari'} ${debtData.person}`,
      type: "info"
    });
  };

  const addPayment = (debtId: string, paymentData: Omit<Payment, "id">) => {
    const targetDebt = debts.find(d => d.id === debtId);
    if (!targetDebt) return;

    setDebts(prev => prev.map(debt => {
      if (debt.id !== debtId) return debt;

      const newPayment: Payment = {
        ...paymentData,
        id: Date.now().toString()
      };

      const updatedPayments = [...debt.payments, newPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const isPaidOff = totalPaid >= debt.amount;

      if (isPaidOff && debt.status !== 'PAID') {
         addNotification({
            title: "Hutang Lunas!",
            message: `${debt.type === 'DEBT' ? 'Hutang' : 'Piutang'} ${debt.person} telah lunas.`,
            type: "alert"
         });
      }

      return {
        ...debt,
        payments: updatedPayments,
        status: isPaidOff ? 'PAID' : 'UNPAID'
      };
    }));

    // Sync with Transactions (Update Balance)
    // paymentData.date comes from datetime-local input, so it's "YYYY-MM-DDTHH:mm"
    const [dateStr, timeStr] = paymentData.date.includes('T') 
      ? paymentData.date.split('T')
      : [paymentData.date, "00:00"];

    addTransaction({
      title: targetDebt.type === 'DEBT' ? `Pelunasan ke ${targetDebt.person}` : `Pembayaran dari ${targetDebt.person}`,
      type: targetDebt.type === 'DEBT' ? 'EXPENSE' : 'INCOME',
      amount: paymentData.amount,
      date: dateStr,
      time: timeStr.substring(0, 5),
      icon: targetDebt.type === 'DEBT' ? 'trending_up' : 'account_balance_wallet',
      color: targetDebt.type === 'DEBT' ? 'rose-red' : 'primary'
    });
  };

  const deleteDebt = (id: string) => {
    const debtToDelete = debts.find(d => d.id === id);
    if (debtToDelete) {
      // 1. Delete the initial debt creation transaction
      const [dateStr, fullTime] = debtToDelete.createdAt.split('T');
      const timeStr = fullTime.substring(0, 5);
      
      const expectedTitle = debtToDelete.type === 'DEBT' 
          ? `Pinjaman dari ${debtToDelete.person}` 
          : `Pinjaman ke ${debtToDelete.person}`;
          
      const transactionToDelete = transactions.find(t => 
          t.amount === debtToDelete.amount &&
          t.date === dateStr &&
          t.time === timeStr &&
          t.title === expectedTitle
      );
      
      if (transactionToDelete) {
          deleteTransaction(transactionToDelete.id);
      }

      // 2. Delete all payment transactions
      debtToDelete.payments.forEach(payment => {
          const [pDateStr, pTimeStr] = payment.date.includes('T') 
            ? payment.date.split('T')
            : [payment.date, "00:00"];
          
          const pExpectedTitle = debtToDelete.type === 'DEBT' 
            ? `Pelunasan ke ${debtToDelete.person}` 
            : `Pembayaran dari ${debtToDelete.person}`;
          
          const pTransaction = transactions.find(t => 
            t.amount === payment.amount &&
            t.date === pDateStr &&
            t.time === pTimeStr.substring(0, 5) &&
            t.title === pExpectedTitle
          );
          
          if (pTransaction) {
              deleteTransaction(pTransaction.id);
          }
      });

      addNotification({
        title: "Hutang Dihapus",
        message: "Data hutang dan riwayat transaksi terkait telah dihapus.",
        type: "info"
      });
    }

    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const getDebt = (id: string) => debts.find(d => d.id === id);

  return (
    <DebtContext.Provider value={{ debts, addDebt, addPayment, deleteDebt, getDebt }}>
      {children}
    </DebtContext.Provider>
  );
}

export function useDebt() {
  const context = useContext(DebtContext);
  if (context === undefined) {
    throw new Error("useDebt must be used within a DebtProvider");
  }
  return context;
}
