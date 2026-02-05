import { useState, useMemo } from "react";
import { useDebt, type Debt } from "../context/DebtContext";
import PayoffModal from "../components/PayoffModal";
import AddDebtModal from "../components/debt/AddDebtModal";
import DebtDetailModal from "../components/debt/DebtDetailModal";
import Pagination from "../components/common/Pagination";

export default function DebtTracker() {
  const { debts } = useDebt();
  const [tab, setTab] = useState<'ALL' | 'DEBT' | 'RECEIVABLE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPayoffModal, setShowPayoffModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Derived selectedDebt
  const selectedDebt = useMemo(() => debts.find(d => d.id === selectedDebtId) || null, [debts, selectedDebtId]);

  // Calculate remaining amounts
  const calculateRemaining = (debt: Debt) => {
    const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, debt.amount - paid);
  };

  const filteredDebts = debts
    .filter(d => tab === 'ALL' || d.type === tab)
    .filter(d => filterStatus === 'ALL' || d.status === filterStatus)
    .filter(d => {
      if (!dateRange.start && !dateRange.end) return true;
      const debtDate = new Date(d.createdAt).getTime();
      const start = dateRange.start ? new Date(dateRange.start).setHours(0, 0, 0, 0) : -Infinity;
      const end = dateRange.end ? new Date(dateRange.end).setHours(23, 59, 59, 999) : Infinity;
      return debtDate >= start && debtDate <= end;
    })
    .sort((a, b) => {
      // Priority 1: Status (UNPAID first, PAID last)
      if (a.status !== b.status) {
        return a.status === 'PAID' ? 1 : -1;
      }

      // Priority 2: User selected sort
      if (sortBy === 'date') {
        const dateA = new Date(a.dueDate || a.createdAt).getTime();
        const dateB = new Date(b.dueDate || b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const amountA = calculateRemaining(a);
        const amountB = calculateRemaining(b);
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
    });

  const totalPages = Math.ceil(filteredDebts.length / itemsPerPage);
  const paginatedDebts = filteredDebts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalDebt = debts
    .filter(d => d.type === 'DEBT')
    .reduce((sum, d) => sum + calculateRemaining(d), 0);
    
  const totalReceivable = debts
    .filter(d => d.type === 'RECEIVABLE')
    .reduce((sum, d) => sum + calculateRemaining(d), 0);

  const netBalance = totalReceivable - totalDebt;

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-[#0f3d32] via-[#052e22] to-[#020b08] relative isolate">
      {/* Decorative background blurs */}
      <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-gold/10 blur-[80px] pointer-events-none -z-10"></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay -z-10"></div>

      {/* Top Bar - Sticky */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 pt-8 pb-4 shrink-0 backdrop-blur-xl bg-[#0f3d32]/50 border-b border-white/5 transition-all duration-300">
        <div className="flex flex-col justify-center h-10">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          Debt Manager <span className="text-[9px] font-bold bg-gradient-to-r from-gold to-yellow-600 text-black px-1.5 py-0.5 rounded-full shadow-lg shadow-gold/20">PRO</span>
        </h1>
        <div className="flex gap-3 relative z-50">
            <div className="relative">
                <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 border ${showFilterMenu ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined">tune</span>
                </button>
                {showFilterMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                        <div className="absolute right-0 top-12 w-64 bg-[#0a120f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-white/5">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">Filter Status</div>
                            <button
                                onClick={() => { setFilterStatus('ALL'); setCurrentPage(1); }}
                                className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${filterStatus === 'ALL' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                            >
                                <span className="group-hover:translate-x-1 transition-transform">All Status</span>
                                {filterStatus === 'ALL' && <span className="material-symbols-outlined text-sm">check</span>}
                            </button>
                            <button
                                onClick={() => { setFilterStatus('UNPAID'); setCurrentPage(1); }}
                                className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${filterStatus === 'UNPAID' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                            >
                                <span className="group-hover:translate-x-1 transition-transform">Unpaid Only</span>
                                {filterStatus === 'UNPAID' && <span className="material-symbols-outlined text-sm">check</span>}
                            </button>
                            <button
                                onClick={() => { setFilterStatus('PAID'); setCurrentPage(1); }}
                                className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${filterStatus === 'PAID' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                            >
                                <span className="group-hover:translate-x-1 transition-transform">Paid Only</span>
                                {filterStatus === 'PAID' && <span className="material-symbols-outlined text-sm">check</span>}
                            </button>
                            
                            <div className="my-1 border-t border-white/5"></div>
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">Date Range</div>
                            <div className="px-4 py-2 flex flex-col gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-medium">From</label>
                                    <input 
                                        type="date" 
                                        value={dateRange.start}
                                        onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setCurrentPage(1); }}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 font-medium">To</label>
                                    <input 
                                        type="date" 
                                        value={dateRange.end}
                                        onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setCurrentPage(1); }}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                {(dateRange.start || dateRange.end) && (
                                    <button 
                                        onClick={() => { setDateRange({ start: '', end: '' }); setCurrentPage(1); }}
                                        className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 text-center w-full py-1.5 rounded bg-rose-500/10 border border-rose-500/20 transition-colors"
                                    >
                                        Clear Dates
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 px-6 pb-32 z-10 space-y-6 mt-2">
        {/* Summary Card */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/10 shadow-2xl shadow-emerald-900/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs font-medium text-emerald-100/60 mb-1 uppercase tracking-wider">Net Balance</p>
              <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                <span className="text-2xl align-top opacity-60 mr-1">Rp</span>
                {Math.abs(netBalance).toLocaleString('id-ID')}
                {netBalance < 0 && <span className="text-xs text-rose-400 ml-2 font-bold bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">DEFICIT</span>}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-gold/20 border border-white/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-white text-2xl">account_balance_wallet</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:bg-black/30 transition-colors group/item">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">You Owe</p>
              </div>
              <p className="text-lg font-bold text-rose-400 tabular-nums group-hover/item:scale-105 transition-transform origin-left">Rp {totalDebt.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 hover:bg-black/30 transition-colors group/item">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Owed to You</p>
              </div>
              <p className="text-lg font-bold text-emerald-400 tabular-nums group-hover/item:scale-105 transition-transform origin-left">Rp {totalReceivable.toLocaleString('id-ID')}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full mb-5">
            <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-medium uppercase tracking-wider">
              <span>Debt Ratio</span>
              <span className={totalDebt === 0 ? 'text-emerald-400' : 'text-gray-400'}>
                 {totalDebt === 0 ? 'Debt Free' : `${Math.round((totalDebt / (totalDebt + totalReceivable || 1)) * 100)}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden flex shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000" 
                style={{ width: `${(totalDebt / (totalDebt + totalReceivable || 1)) * 100}%` }}
              ></div>
              <div className="h-full bg-emerald-500/20 flex-1 relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #fff 5px, #fff 10px)' }}></div>
              </div>
            </div>
          </div>
          
          {/* Payment Plan Generator */}
          <button 
            onClick={() => setShowPayoffModal(true)} 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-xs font-bold text-white hover:text-gold hover:border-gold/30 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/20 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px] text-gold group-hover:rotate-12 transition-transform">strategy</span>
            Generate Smart Payoff Strategy
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-black/30 p-1.5 rounded-2xl flex backdrop-blur-md border border-white/5 shadow-lg">
          <button 
            onClick={() => { setTab('ALL'); setCurrentPage(1); }} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
              tab === 'ALL' ? 'bg-white/15 text-white shadow-lg border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => { setTab('DEBT'); setCurrentPage(1); }} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
              tab === 'DEBT' ? 'bg-rose-500/20 text-rose-300 shadow-lg border border-rose-500/20' : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/5'
            }`}
          >
            Debts
          </button>
          <button 
            onClick={() => { setTab('RECEIVABLE'); setCurrentPage(1); }} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
              tab === 'RECEIVABLE' ? 'bg-emerald-500/20 text-emerald-300 shadow-lg border border-emerald-500/20' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/5'
            }`}
          >
            Receivables
          </button>
        </div>

        {/* List Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Records
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-gray-300 font-mono">{filteredDebts.length}</span>
            </h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all active:scale-95 border border-emerald-400/20"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Record
                </button>
                <div className="relative">
                    <button 
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">sort</span>
                        {sortBy === 'date' ? 'Date' : 'Amount'}
                    </button>
                    
                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                            <div className="absolute right-0 top-12 w-48 bg-[#0a120f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/5">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">Sort By</div>
                                <button
                                    onClick={() => { setSortBy('date'); setCurrentPage(1); setShowSortMenu(false); }}
                                    className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${sortBy === 'date' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                                >
                                    <span className="group-hover:translate-x-1 transition-transform">Date</span>
                                    {sortBy === 'date' && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                                <button
                                    onClick={() => { setSortBy('amount'); setCurrentPage(1); setShowSortMenu(false); }}
                                    className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${sortBy === 'amount' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                                >
                                    <span className="group-hover:translate-x-1 transition-transform">Amount</span>
                                    {sortBy === 'amount' && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                                <div className="my-1 border-t border-white/5"></div>
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">Order</div>
                                <button
                                    onClick={() => { setSortOrder('asc'); setCurrentPage(1); setShowSortMenu(false); }}
                                    className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${sortOrder === 'asc' ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}
                                >
                                    Ascending
                                    {sortOrder === 'asc' && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                                <button
                                    onClick={() => { setSortOrder('desc'); setCurrentPage(1); setShowSortMenu(false); }}
                                    className={`px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${sortOrder === 'desc' ? 'text-gold font-bold' : 'text-gray-300'}`}
                                >
                                    Descending
                                    {sortOrder === 'desc' && <span className="material-symbols-outlined text-sm">check</span>}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {paginatedDebts.length === 0 ? (
                <div className="text-center py-10 opacity-60 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <span className="material-symbols-outlined text-4xl text-[#92c9ba]">
                            {tab === 'RECEIVABLE' ? 'folder_open' : 'verified'}
                        </span>
                    </div>
                    <p className="text-[#92c9ba] font-medium">
                        {tab === 'RECEIVABLE' ? 'Belum ada data piutang' : 'Luar biasa, kamu bebas dari hutang!'}
                    </p>
                </div>
            ) : (
                <>
                  {paginatedDebts.map(debt => {
                    const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
                    const remaining = Math.max(0, debt.amount - paid);
                    const progress = Math.min((paid / debt.amount) * 100, 100);

                    return (
                      <div 
                          key={debt.id} 
                          onClick={() => setSelectedDebtId(debt.id)}
                          className="glass-card rounded-2xl p-4 flex flex-col gap-3 group cursor-pointer hover:bg-white/10 transition-all border border-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10">
                                <span className="material-symbols-outlined text-white">person</span>
                            </div>
                            
                            <div className="flex flex-col">
                              <p className="text-white font-semibold text-base leading-tight group-hover:text-primary transition-colors">{debt.person}</p>
                              <p className="text-gray-500 text-[10px] mt-0.5">
                                {new Date(debt.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {debt.dueDate && (
                                  <p className="text-white/40 text-xs font-medium">Due {debt.dueDate}</p>
                                )}
                                {debt.status === 'PAID' && (
                                  <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                    Paid
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-0.5">{debt.type === 'DEBT' ? 'Remaining' : 'Unpaid'}</p>
                            <p className={`text-base font-bold tabular-nums ${debt.type === 'DEBT' ? 'text-gold' : 'text-primary'}`}>
                              Rp {remaining.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex">
                          <div 
                              className={`h-full transition-all duration-1000 ${debt.type === 'DEBT' ? 'bg-gold' : 'bg-primary'}`} 
                              style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] font-medium text-gray-500">
                           <span>{progress.toFixed(0)}% Paid</span>
                           <span>Total: Rp {debt.amount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Pagination */}
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PayoffModal 
        isOpen={showPayoffModal} 
        onClose={() => setShowPayoffModal(false)} 
        totalDebt={totalDebt} 
      />
      
      <AddDebtModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedDebt && (
        <DebtDetailModal 
            debt={selectedDebt}
            onClose={() => setSelectedDebtId(null)}
        />
      )}
    </div>
  );
}
