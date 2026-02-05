import { useState } from "react";
import { createPortal } from "react-dom";

interface PayoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDebt: number;
}

export default function PayoffModal({ isOpen, onClose, totalDebt }: PayoffModalProps) {
  const [mode, setMode] = useState<'BUDGET' | 'TARGET'>('BUDGET');
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [result, setResult] = useState<{ label: string; value: string; subtext: string } | null>(null);

  const handleClose = () => {
    setResult(null);
    setBudgetAmount("");
    setTargetDate("");
    onClose();
  };

  if (!isOpen) return null;

  const handleCalculate = () => {
    if (totalDebt <= 0) {
      setResult({
        label: "Already Free!",
        value: "No Debt",
        subtext: "You are currently debt-free. Great job!"
      });
      return;
    }

    if (mode === 'BUDGET') {
      const amount = parseInt(budgetAmount.replace(/\./g, "") || "0");
      if (amount <= 0) return;

      const months = Math.ceil(totalDebt / amount);
      const now = new Date();
      now.setMonth(now.getMonth() + months);
      
      const freedomDate = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      setResult({
        label: "Debt Free By",
        value: freedomDate,
        subtext: `${months} months to go`
      });
    } else {
      if (!targetDate) return;
      const target = new Date(targetDate);
      const now = new Date();
      
      // Calculate months difference
      let months = (target.getFullYear() - now.getFullYear()) * 12;
      months -= now.getMonth();
      months += target.getMonth();
      
      if (months <= 0) {
        setResult({
          label: "Impossible Date",
          value: "Too Soon",
          subtext: "Please pick a future date"
        });
        return;
      }

      const monthlyNeeded = Math.ceil(totalDebt / months);
      setResult({
        label: "Monthly Payment",
        value: `Rp ${monthlyNeeded.toLocaleString('id-ID')}`,
        subtext: `For ${months} months`
      });
    }
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return parseInt(num).toLocaleString("id-ID");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0a120f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>

        {/* Handle Bar (Mobile) */}
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:hidden"></div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Smart Payoff Strategy</h2>
            <p className="text-xs text-gray-400">Plan your journey to financial freedom</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Total Debt Context */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 flex items-center justify-between">
          <span className="text-sm text-gray-300">Total Outstanding</span>
          <span className="text-lg font-bold text-gold">Rp {totalDebt.toLocaleString('id-ID')}</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
          <button 
            onClick={() => { setMode('BUDGET'); setResult(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'BUDGET' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Budget Driven
          </button>
          <button 
            onClick={() => { setMode('TARGET'); setResult(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === 'TARGET' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Goal Driven
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-6 space-y-4">
          {mode === 'BUDGET' ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">How much can you pay monthly?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold text-sm">Rp</span>
                <input 
                  type="text" 
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(formatCurrency(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">When do you want to be debt-free?</label>
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleCalculate}
          disabled={mode === 'BUDGET' ? !budgetAmount : !targetDate}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-sm shadow-lg shadow-gold/20 hover:shadow-gold/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Plan
        </button>

        {/* Result Section */}
        {result && (
          <div className="mt-6 p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/20 rounded-xl border border-emerald-500/30 animate-in zoom-in-95 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-medium mb-1 uppercase tracking-wider">{result.label}</p>
                <h3 className="text-2xl font-bold text-white mb-1">{result.value}</h3>
                <p className="text-sm text-gray-400">{result.subtext}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
