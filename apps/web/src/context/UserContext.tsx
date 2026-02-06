/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Transaction {
  id: number;
  title: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string; // YYYY-MM-DD
  time: string;
  icon: string;
  color: string;
}

interface UserContextType {
  name: string;
  setName: (name: string) => void;
  profileImage: string;
  setProfileImage: (image: string) => void;
  monthlyBudget: number;
  setMonthlyBudget: (amount: number) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const INITIAL_TRANSACTIONS: Transaction[] = [];

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState(() => localStorage.getItem('dompetku_user_name') || "");
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('dompetku_user_image') || "https://lh3.googleusercontent.com/aida-public/AB6AXuDPgDtMkO1E0AlzNd3T_2AIw86i35uOFmZ4qOfm_TpjDntkfal64kHT1jb42aIG8ndPsUdtFMw_KaK7b8NPXYIp_WTdt1RXCjKY9RjHd1NZBfy7CK9DagcdLNd0qEY8pSRkykm7KPPRXF8Yaga4Q7RMgw2TJWFYD1miQpt85NVVHtlF488CsMc-d2PHYzO06L1f88Kmq5COr5HiBF4RsBVZq489YsQRZq2JthjqrK3iXjWHGlQGTc_oeBC2gng3SZ-tFEhEMoJlkas");
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('dompetku_user_budget');
    return saved ? Number(saved) : 0;
  });

  // Sync user settings to localStorage
  useEffect(() => {
    localStorage.setItem('dompetku_user_name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('dompetku_user_image', profileImage);
  }, [profileImage]);

  useEffect(() => {
    localStorage.setItem('dompetku_user_budget', monthlyBudget.toString());
  }, [monthlyBudget]);
  
  // Initialize from localStorage or fallback to initial data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dompetku_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('dompetku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    setIsLoading(true);
    setError(null);
    
    // Instant save without delay
    try {
        setTransactions(prev => {
            const newId = Math.max(...prev.map(t => t.id), 0) + 1;
            const newTransaction = { ...transaction, id: newId };
            return [newTransaction, ...prev];
        });
        // No artificial delay needed
    } catch (err) {
        setError("Gagal menambahkan transaksi");
        console.error(err); // Log error for debugging
    } finally {
        setIsLoading(false);
    }
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <UserContext.Provider 
      value={{ 
        name, 
        setName, 
        profileImage, 
        setProfileImage, 
        monthlyBudget, 
        setMonthlyBudget,
        transactions,
        addTransaction,
        deleteTransaction,
        isLoading,
        error
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
