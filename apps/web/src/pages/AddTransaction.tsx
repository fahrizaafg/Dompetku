import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { CalculatorModal } from "../components/CalculatorModal";

// Mock Categories
const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Makanan', icon: 'restaurant', color: 'orange' },
  { id: 'transport', name: 'Transportasi', icon: 'directions_car', color: 'blue' },
  { id: 'shopping', name: 'Belanja', icon: 'shopping_bag', color: 'purple' },
  { id: 'health', name: 'Kesehatan', icon: 'medication', color: 'emerald' },
  { id: 'fun', name: 'Hiburan', icon: 'movie', color: 'pink' }
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Gaji', icon: 'payments', color: 'emerald' },
  { id: 'bonus', name: 'Bonus', icon: 'redeem', color: 'yellow' },
  { id: 'others', name: 'Lainnya', icon: 'more_horiz', color: 'gray' }
];

import { getLocalISOString } from "../utils/dateUtils";

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, isLoading } = useUser();
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState<string>("0");
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [note, setNote] = useState<string>("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<{id: string, name: string, icon: string, color: string}[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("category");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Combined categories based on transaction type
  const currentBaseCategories = transactionType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const allCategories = [...currentBaseCategories, ...customCategories];

  // Helper to get color classes based on transaction type
  const getTypeColor = (type: 'text' | 'bg' | 'border' | 'caret') => {
    if (transactionType === 'EXPENSE') {
      if (type === 'text') return 'text-rose-500';
      if (type === 'bg') return 'bg-rose-500';
      if (type === 'border') return 'border-rose-500';
      if (type === 'caret') return 'caret-rose-500';
    }
    return `${type}-emerald-500`; // Default to emerald (green) for INCOME
  };
  
  // Format currency input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, "");
    
    // Remove leading zeros unless it's just "0"
    if (value.length > 1 && value.startsWith("0")) {
      value = value.substring(1);
    }
    
    // If empty, set to 0
    if (value === "") value = "0";

    // Format with thousand separators
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value));
    setAmount(formatted);
  };

  const handleCalculatorConfirm = (value: string) => {
    // Format the value with thousand separators
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value.replace(/\D/g, '') || '0'));
    setAmount(formatted);
  };

  const handleSubmit = async () => {
    const categoryObj = allCategories.find(c => c.id === selectedCategory) || allCategories[0];
    const numericAmount = parseInt(amount.replace(/\./g, ""));
    
    if (numericAmount <= 0) {
        alert("Mohon masukkan jumlah yang valid");
        return;
    }

    const localISO = getLocalISOString();
    const [dateStr, fullTime] = localISO.split('T');
    const timeStr = fullTime.substring(0, 5);

    await addTransaction({
        title: note || categoryObj.name, // Use note as title if available, else category name
        type: transactionType,
        amount: numericAmount,
        date: dateStr,
        time: timeStr,
        icon: categoryObj.icon,
        color: categoryObj.color
    });
    
    // Show success animation
    setIsSuccess(true);
    
    // Navigate back after animation
    setTimeout(() => {
        navigate("/");
    }, 1000);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName,
      icon: newCategoryIcon,
      color: 'blue' // Default color
    };
    
    setCustomCategories([...customCategories, newCategory]);
    setSelectedCategory(newCategory.id);
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-black touch-none overscroll-none">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full blur-[120px] transition-colors duration-500 ${transactionType === 'EXPENSE' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[100px] transition-colors duration-500 ${transactionType === 'EXPENSE' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}></div>
      </div>

      {/* Success Animation Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative">
                {/* Pulse Rings */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 duration-1000 ${transactionType === 'EXPENSE' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                <div className={`absolute inset-[-10px] rounded-full animate-pulse opacity-10 duration-1000 ${transactionType === 'EXPENSE' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                
                {/* Main Circle */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform animate-in zoom-in-50 duration-300 ${transactionType === 'EXPENSE' ? 'bg-gradient-to-br from-rose-500 to-rose-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                    <span className="material-symbols-outlined text-5xl text-white animate-in zoom-in duration-300 font-bold">check</span>
                </div>
            </div>
            
            <div className="mt-8 text-center animate-in slide-in-from-bottom-5 fade-in duration-500 delay-75">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Berhasil Disimpan!</h2>
                <p className="text-gray-400 text-sm">{transactionType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'} Anda telah dicatat.</p>
                
                <div className="mt-6 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total</span>
                    <span className={`text-xl font-bold ${transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        Rp {amount}
                    </span>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div 
        className="relative z-10 w-full px-6 pt-6 pb-2 flex justify-between items-center shrink-0"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)'
        }}
      >
        <Link to="/" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">close</span>
        </Link>
        <div className="flex bg-black/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
          <button 
            className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              transactionType === 'EXPENSE' 
                ? 'bg-[#2e1616] text-rose-500 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setTransactionType('EXPENSE');
              setSelectedCategory(EXPENSE_CATEGORIES[0].id);
            }}
          >
            Pengeluaran
          </button>
          <button 
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all ${
              transactionType === 'INCOME' 
                ? 'bg-[#162e28] text-emerald-500 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setTransactionType('INCOME');
              setSelectedCategory(INCOME_CATEGORIES[0].id);
            }}
          >
            Pemasukan
          </button>
        </div>
        <button 
          className={`w-10 h-10 rounded-full glass-card flex items-center justify-center transition-colors hover:bg-white/10 ${getTypeColor('text')}`}
          onClick={() => setIsCalculatorOpen(true)}
        >
          <span className="material-symbols-outlined">calculate</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col w-full px-6 overflow-hidden">
        {/* Amount Input */}
        <div className="mt-4 mb-4 flex flex-col items-center justify-center text-center relative w-full shrink-0">
          <span className={`text-xs font-medium tracking-widest uppercase mb-2 transition-colors ${transactionType === 'EXPENSE' ? 'text-rose-500/80' : 'text-emerald-500/80'}`}>Jumlah Total</span>
          <div className="flex items-center justify-center w-full px-4">
            <div className="relative flex items-center w-full max-w-[280px]">
              <span className="absolute left-0 text-2xl font-medium text-gray-400 z-10">Rp</span>
              <input 
                className={`bg-transparent border-none text-3xl font-bold py-1 pl-10 pr-0 text-right focus:ring-0 w-full outline-none transition-colors text-white ${getTypeColor('caret')}`}
                inputMode="numeric" 
                type="text" 
                value={amount} 
                onChange={handleAmountChange}
              />
            </div>
          </div>
        </div>
          
        {/* Categories */}
        <div className="mb-4 w-full shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="text-gray-300 font-semibold text-xs">Kategori</h3>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className={`text-[10px] font-medium hover:opacity-80 transition-colors ${getTypeColor('text')}`}
            >
              Lihat semua
            </button>
          </div>
          <div 
            key={transactionType}
            className={`flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-6 px-6 snap-x animate-in slide-in-from-right-8 fade-in duration-300 ${transactionType === 'INCOME' ? 'justify-center' : ''}`}
          >
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 min-w-[64px] snap-start transition-all duration-300 ${
                  selectedCategory === cat.id ? 'transform scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                  selectedCategory === cat.id 
                    ? `bg-opacity-20 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)] ${transactionType === 'EXPENSE' ? 'bg-rose-500/20 border-rose-500 shadow-rose-500/30' : 'bg-emerald-500/20 border-emerald-500 shadow-emerald-500/30'}`
                    : 'bg-surface-dark border-white/5 hover:bg-white/5'
                }`}>
                  <span className={`material-symbols-outlined text-2xl transition-colors ${
                    selectedCategory === cat.id ? (transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500') : 'text-gray-400'
                  }`}>
                    {cat.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  selectedCategory === cat.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <h3 className="text-gray-300 font-semibold text-xs px-1">Detail</h3>
          <div className="bg-surface-darker/60 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="material-symbols-outlined text-gray-400 text-xl">edit_note</span>
              <input 
                className="bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 w-full text-sm p-0 outline-none" 
                placeholder="Tambahkan catatan..." 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-gray-300 transition-colors group`}>
                  <span className={`material-symbols-outlined text-[16px] transition-colors group-hover:opacity-80 ${getTypeColor('text')}`}>calendar_today</span>
                  <span>Hari Ini</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-gray-300 transition-colors">
                  <span className="material-symbols-outlined text-[16px] text-yellow-400">image</span>
                  Tambah Struk
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom of container */}
      <div className="p-4 glass-panel border-t border-white/5 z-20 shrink-0 mt-auto">
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full text-white font-bold text-sm py-3 rounded-xl shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          } ${
            transactionType === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Memproses...
            </>
          ) : (
            <>
              Simpan Transaksi
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </>
          )}
        </button>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-auto max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
              <h3 className="text-lg font-bold text-white">Semua Kategori</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6">
              {/* Add New Category Section */}
              <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Tambah Kategori Kustom</h4>
                <div className="flex gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-gray-400">
                    <span className="material-symbols-outlined">{newCategoryIcon}</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nama Kategori" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/10 text-white placeholder-gray-600 focus:border-primary focus:ring-0 px-2 py-2 outline-none transition-colors"
                  />
                </div>
                
                {/* Icon Selection (Simplified) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                  {['category', 'shopping_cart', 'restaurant', 'directions_car', 'home', 'work', 'pets', 'fitness_center', 'flight'].map(icon => (
                    <button 
                      key={icon}
                      onClick={() => setNewCategoryIcon(icon)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${newCategoryIcon === icon ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all ${newCategoryName.trim() ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                  Buat Kategori
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-4 gap-4">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsCategoryModalOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 group w-full`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                      selectedCategory === cat.id 
                        ? `bg-opacity-20 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)] ${transactionType === 'EXPENSE' ? 'bg-rose-500/20 border-rose-500 shadow-rose-500/30' : 'bg-emerald-500/20 border-emerald-500 shadow-emerald-500/30'}`
                    : 'bg-surface-dark border-white/5 group-hover:bg-white/5'
                }`}>
                  <span className={`material-symbols-outlined text-2xl transition-colors ${
                    selectedCategory === cat.id ? (transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500') : 'text-gray-400'
                  }`}>
                    {cat.icon}
                  </span>
                    </div>
                    <span className={`text-[10px] font-medium text-center truncate w-full transition-colors ${
                      selectedCategory === cat.id ? 'text-white' : 'text-gray-500'
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {isCalculatorOpen && (
        <CalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          onConfirm={handleCalculatorConfirm}
          initialValue={amount}
          type={transactionType}
        />
      )}
    </div>
  );
}