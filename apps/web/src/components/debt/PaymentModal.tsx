import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebt } from '../../context/DebtContext';
import { getLocalISOString } from '../../utils/dateUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  remainingAmount: number;
}

export default function PaymentModal({ isOpen, onClose, debtId, remainingAmount }: PaymentModalProps) {
  const { addPayment } = useDebt();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => getLocalISOString().slice(0, 16));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const PAYMENT_TEMPLATES = [
    { label: 'QRIS', color: 'border-rose-500 text-rose-500 bg-rose-500/10' },
    { label: 'BCA', color: 'border-blue-700 text-blue-500 bg-blue-700/10' },
    { label: 'BRI', color: 'border-blue-400 text-blue-400 bg-blue-400/10' },
    { label: 'DANA', color: 'border-sky-500 text-sky-500 bg-sky-500/10' },
    { label: 'OVO', color: 'border-purple-500 text-purple-500 bg-purple-500/10' },
    { label: 'Mandiri', color: 'border-yellow-500 text-yellow-500 bg-yellow-500/10' },
    { label: 'ShopeePay', color: 'border-orange-500 text-orange-500 bg-orange-500/10' },
  ];

  const handleClose = () => {
    setAmount('');
    setNote('');
    setError('');
    setDate(getLocalISOString().slice(0, 16));
    onClose();
  };

  if (!isOpen) return null;

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return parseInt(num).toLocaleString("id-ID");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''));
    
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > remainingAmount) {
      setError(`Maximum payment allowed is Rp ${remainingAmount.toLocaleString('id-ID')}`);
      return;
    }

    addPayment(debtId, {
      amount: numAmount,
      date,
      note: note || undefined,
    });
    handleClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#0a120f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Record Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5 flex items-center justify-between">
          <span className="text-sm text-gray-300">Remaining Debt</span>
          <span className="text-lg font-bold text-white">Rp {remainingAmount.toLocaleString('id-ID')}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold text-sm">Rp</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                    setAmount(formatCurrency(e.target.value));
                    setError('');
                }}
                className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors ${
                    error ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="0"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Note (Optional)</label>
            
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {PAYMENT_TEMPLATES.map((template) => {
                const noteValue = `Transfer via ${template.label}`;
                const isActive = note === noteValue;
                return (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => setNote(isActive ? '' : noteValue)}
                    className={`
                      relative px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 active:scale-95 flex-1 min-w-[80px]
                      ${isActive 
                        ? `${template.color} shadow-[0_0_15px_rgba(0,0,0,0.3)] border-opacity-100` 
                        : 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {template.label}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-colors"
              placeholder="e.g., Transfer via BCA"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mt-2"
          >
            Confirm Payment
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
