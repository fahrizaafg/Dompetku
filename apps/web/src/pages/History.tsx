import { useState, useEffect, useMemo } from "react";
import { useUser } from "../context/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Pagination from "../components/common/Pagination";

export default function History() {
  const { transactions } = useUser();
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'AMOUNT' | 'TITLE'>('DATE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredTransactions = useMemo(() => {
    const result = transactions.filter(t => filter === 'ALL' || t.type === filter);
    
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'DATE') {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === 'AMOUNT') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'TITLE') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'ASC' ? comparison : -comparison;
    });

    return result;
  }, [transactions, filter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    return filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Group by Date only if sorted by DATE
  const isDateSorted = sortBy === 'DATE';
  const groupedTransactions = useMemo(() => {
    if (!isDateSorted) return { 'All Results': paginatedTransactions };

    return paginatedTransactions.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {} as Record<string, typeof transactions>);
  }, [paginatedTransactions, isDateSorted]);

  const formatDate = (dateStr: string) => {
    if (!isDateSorted && dateStr === 'All Results') return 'All Results';
    
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${dayName} ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${dayName} ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    }
    return `${dayName} ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction History", 14, 22);
    
    const tableData = filteredTransactions.map(t => [
      t.date,
      t.time,
      t.title,
      t.type,
      `Rp ${t.amount.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      head: [['Date', 'Time', 'Title', 'Type', 'Amount']],
      body: tableData,
      startY: 30,
    });

    doc.save("transactions.pdf");
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions.map(t => ({
      Date: t.date,
      Time: t.time,
      Title: t.title,
      Type: t.type,
      Amount: t.amount
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
    setShowExportMenu(false);
  };

  return (
    <div className="flex flex-col h-full" onClick={() => { setShowSortMenu(false); setShowExportMenu(false); }}>
      {/* Abstract Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] bg-primary/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Top Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 z-50 sticky top-0">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white absolute left-1/2 -translate-x-1/2">History</h1>
        
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors border group ${showSortMenu ? 'bg-primary border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
            <span className={`material-symbols-outlined transition-colors ${showSortMenu ? 'text-black' : 'text-white/80 group-hover:text-primary'}`}>sort</span>
            </button>
            
            {showSortMenu && (
                <div className="absolute right-0 top-12 w-48 glass-panel rounded-xl p-2 z-50 flex flex-col gap-1 shadow-xl">
                    <p className="text-xs text-white/40 px-3 py-2 font-medium">SORT BY</p>
                    <button onClick={() => { setSortBy('DATE'); setCurrentPage(1); setShowSortMenu(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${sortBy === 'DATE' ? 'bg-primary text-black font-semibold' : 'text-white hover:bg-white/10'}`}>Date</button>
                    <button onClick={() => { setSortBy('AMOUNT'); setCurrentPage(1); setShowSortMenu(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${sortBy === 'AMOUNT' ? 'bg-primary text-black font-semibold' : 'text-white hover:bg-white/10'}`}>Amount</button>
                    <button onClick={() => { setSortBy('TITLE'); setCurrentPage(1); setShowSortMenu(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${sortBy === 'TITLE' ? 'bg-primary text-black font-semibold' : 'text-white hover:bg-white/10'}`}>Category (Title)</button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <p className="text-xs text-white/40 px-3 py-2 font-medium">ORDER</p>
                    <button onClick={() => { setSortOrder('ASC'); setCurrentPage(1); setShowSortMenu(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${sortOrder === 'ASC' ? 'bg-primary text-black font-semibold' : 'text-white hover:bg-white/10'}`}>Ascending</button>
                    <button onClick={() => { setSortOrder('DESC'); setCurrentPage(1); setShowSortMenu(false); }} className={`px-3 py-2 rounded-lg text-sm text-left ${sortOrder === 'DESC' ? 'bg-primary text-black font-semibold' : 'text-white hover:bg-white/10'}`}>Descending</button>
                </div>
            )}
        </div>
      </header>

      {/* Filters */}
      <div className="flex-none px-6 py-4 z-10 flex justify-between items-center">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => { setFilter('ALL'); setCurrentPage(1); }} 
            className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-semibold transition-transform active:scale-95 ${
              filter === 'ALL' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => { setFilter('INCOME'); setCurrentPage(1); }} 
            className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              filter === 'INCOME' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Income
          </button>
          <button 
            onClick={() => { setFilter('EXPENSE'); setCurrentPage(1); }} 
            className={`flex h-9 shrink-0 items-center justify-center px-5 rounded-full text-sm font-medium transition-transform active:scale-95 ${
              filter === 'EXPENSE' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Expense
          </button>
        </div>
        
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${showExportMenu ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/70 hover:text-primary hover:bg-white/10'}`} 
                title="Export to PDF/Excel"
            >
            <span className="material-symbols-outlined text-[20px]">download</span>
            </button>

            {showExportMenu && (
                <div className="absolute right-0 top-12 w-40 glass-panel rounded-xl p-2 z-50 flex flex-col gap-1 shadow-xl">
                    <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 text-left">
                        <span className="material-symbols-outlined text-red-400 text-[18px]">picture_as_pdf</span>
                        PDF
                    </button>
                    <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 text-left">
                        <span className="material-symbols-outlined text-green-400 text-[18px]">table_view</span>
                        Excel
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 z-0">
        {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#92c9ba]">
                        <path d="M9 22L12 19L15 22L18 19L21 22V11C21 6.02944 16.9706 2 12 2C7.02944 2 3 6.02944 3 11V22L6 19L9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p className="text-[#92c9ba] text-base font-medium">Belum ada transaksi. Yuk, mulai catat sekarang!</p>
            </div>
        ) : (
            Object.keys(groupedTransactions).map(date => (
          <div key={date} className="mb-6">
            {/* Date Header */}
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
              {formatDate(date)}
            </h3>

            {/* Items */}
            <div className="space-y-3">
              {groupedTransactions[date].map(t => {
                const isExpense = t.type === 'EXPENSE';
                const amountClass = isExpense ? 'text-[#ff4d5e]' : 'text-primary';
                const sign = isExpense ? '-' : '+';
                const iconColor = isExpense ? 'text-[#ff4d5e]' : 'text-primary';

                return (
                  <div key={t.id} className="glass-panel rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 ${iconColor}`}>
                        <span className="material-symbols-outlined">{t.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{t.title}</p>
                        <p className="text-white/40 text-[10px] mt-1 font-medium">{t.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`${amountClass} font-bold text-sm`}>{sign} Rp {t.amount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}