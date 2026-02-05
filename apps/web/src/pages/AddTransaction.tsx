import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { CalculatorModal } from "../components/CalculatorModal";

// Mock Categories
const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: 'restaurant', color: 'orange' },
  { id: 'transport', name: 'Transport', icon: 'directions_car', color: 'blue' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping_bag', color: 'purple' },
  { id: 'health', name: 'Health', icon: 'medication', color: 'emerald' },
  { id: 'fun', name: 'Fun', icon: 'movie', color: 'pink' }
];

const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Gaji', icon: 'payments', color: 'emerald' },
  { id: 'bonus', name: 'Bonus', icon: 'redeem', color: 'yellow' },
  { id: 'others', name: 'Others', icon: 'more_horiz', color: 'gray' }
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
    return `${type}-primary`; // Default to primary (green) for INCOME
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
        alert("Please enter a valid amount");
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
    <div className="flex flex-col h-full relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full blur-[120px] transition-colors duration-500 ${transactionType === 'EXPENSE' ? 'bg-rose-500/20' : 'bg-primary/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[100px] transition-colors duration-500 ${transactionType === 'EXPENSE' ? 'bg-rose-500/10' : 'bg-primary/10'}`}></div>
      </div>

      {/* Success Animation Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative">
                {/* Pulse Rings */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 duration-1000 ${transactionType === 'EXPENSE' ? 'bg-rose-500' : 'bg-primary'}`}></div>
                <div className={`absolute inset-[-10px] rounded-full animate-pulse opacity-10 duration-1000 ${transactionType === 'EXPENSE' ? 'bg-rose-500' : 'bg-primary'}`}></div>
                
                {/* Main Circle */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transform animate-in zoom-in-50 duration-300 ${transactionType === 'EXPENSE' ? 'bg-gradient-to-br from-rose-500 to-rose-700' : 'bg-gradient-to-br from-primary to-emerald-600'}`}>
                    <span className="material-symbols-outlined text-5xl text-white animate-in zoom-in duration-300 font-bold">check</span>
                </div>
            </div>
            
            <div className="mt-8 text-center animate-in slide-in-from-bottom-5 fade-in duration-500 delay-75">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Saved Successfully!</h2>
                <p className="text-gray-400 text-sm">Your {transactionType.toLowerCase()} has been recorded.</p>
                
                <div className="mt-6 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total</span>
                    <span className={`text-xl font-bold ${transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-primary'}`}>
                        Rp {amount}
                    </span>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 w-full px-6 pt-8 pb-4 flex justify-between items-center">
        <Link to="/" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">close</span>
        </Link>
        <div className="flex bg-black/40 p-1 rounded-full border border-white/5 backdrop-blur-md">
          <button 
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              transactionType === 'EXPENSE' 
                ? 'bg-[#2e1616] text-rose-500 shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setTransactionType('EXPENSE');
              setSelectedCategory(EXPENSE_CATEGORIES[0].id);
            }}
          >
            Expense
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              transactionType === 'INCOME' 
                ? 'bg-[#162e28] text-primary shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => {
              setTransactionType('INCOME');
              setSelectedCategory(INCOME_CATEGORIES[0].id);
            }}
          >
            Income
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
      <div className="relative z-10 flex-1 flex flex-col w-full px-6 overflow-y-auto no-scrollbar">
        {/* Amount Input */}
        <div className="mt-8 mb-6 flex flex-col items-center justify-center text-center relative w-full">
          <span className={`text-sm font-medium tracking-widest uppercase mb-4 transition-colors ${transactionType === 'EXPENSE' ? 'text-rose-500/80' : 'text-primary/80'}`}>Total Amount</span>
          <div className="flex items-center justify-center w-full px-4">
            <div className="relative flex items-center w-full max-w-[320px]">
              <span className="absolute left-0 text-3xl font-medium text-gray-400 z-10">Rp</span>
              <input 
                className={`bg-transparent border-none text-3xl font-bold py-2 pl-12 pr-0 text-right focus:ring-0 w-full outline-none transition-colors text-white ${getTypeColor('caret')}`}
                inputMode="numeric" 
                type="text" 
                value={amount} 
                onChange={handleAmountChange}
              />
            </div>
          </div>
          
          </div>
          
          {/* Categories */}
        <div className="mb-8 w-full">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-gray-300 font-semibold text-sm">Category</h3>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className={`text-xs font-medium hover:opacity-80 transition-colors ${getTypeColor('text')}`}
            >
              View all
            </button>
          </div>
          <div 
            key={transactionType}
            className={`flex gap-4 overflow-x-auto no-scrollbar py-4 -mx-6 px-6 snap-x animate-in slide-in-from-right-8 fade-in duration-300 ${transactionType === 'INCOME' ? 'justify-center' : ''}`}
          >
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 min-w-[72px] snap-start transition-all duration-300 ${
                  selectedCategory === cat.id ? 'transform scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                  selectedCategory === cat.id 
                    ? `bg-opacity-20 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)] ${transactionType === 'EXPENSE' ? 'bg-rose-500/20 border-rose-500 shadow-rose-500/30' : 'bg-primary/20 border-primary shadow-primary/30'}`
                    : 'bg-surface-dark border-white/5 hover:bg-white/5'
                }`}>
                  <span className={`material-symbols-outlined text-3xl transition-colors ${
                    selectedCategory === cat.id ? (transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-primary') : 'text-gray-400'
                  }`}>
                    {cat.icon}
                  </span>
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  selectedCategory === cat.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-4 pb-32">
          <h3 className="text-gray-300 font-semibold text-sm px-1">Details</h3>
          <div className="bg-surface-darker/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-gray-400">edit_note</span>
              <input 
                className="bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 w-full text-base p-0 outline-none" 
                placeholder="Add a note..." 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 transition-colors group`}>
                  <span className={`material-symbols-outlined text-[18px] transition-colors group-hover:opacity-80 ${getTypeColor('text')}`}>calendar_today</span>
                  <span>Today</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-yellow-400">image</span>
                  Add Receipt
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-2">
            <h3 className="text-gray-400 font-medium text-xs mb-3 px-1">Quick Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['#lunch', '#office', '#family'].map(tag => (
                <button key={tag} className={`px-4 py-2 rounded-full border border-white/10 bg-surface-dark text-sm text-gray-300 hover:border-opacity-50 hover:text-white transition-colors ${transactionType === 'EXPENSE' ? 'hover:border-rose-500' : 'hover:border-primary'}`}>
                  {tag}
                </button>
              ))}
              <button className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 glass-panel border-t border-white/5 z-20">
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          } ${
            transactionType === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Processing...
            </>
          ) : (
            <>
              Save Transaction
              <span className="material-symbols-outlined">check_circle</span>
            </>
          )}
        </button>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-lg font-bold text-white">All Categories</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add New Category Section */}
              <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Add Custom Category</h4>
                <div className="flex gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-gray-400">
                    <span className="material-symbols-outlined">{newCategoryIcon}</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Category Name" 
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
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${newCategoryIcon === icon ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-all ${newCategoryName.trim() ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                  Create Category
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
                    className={`flex flex-col items-center gap-2 group`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                      selectedCategory === cat.id 
                        ? `bg-opacity-20 border-opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.3)] ${transactionType === 'EXPENSE' ? 'bg-rose-500/20 border-rose-500 shadow-rose-500/30' : 'bg-primary/20 border-primary shadow-primary/30'}`
                        : 'bg-surface-dark border-white/5 group-hover:bg-white/5'
                    }`}>
                      <span className={`material-symbols-outlined text-2xl transition-colors ${
                        selectedCategory === cat.id ? (transactionType === 'EXPENSE' ? 'text-rose-500' : 'text-primary') : 'text-gray-400'
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