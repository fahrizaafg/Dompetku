import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDebt, type DebtType } from '../../context/DebtContext';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDebtModal({ isOpen, onClose }: AddDebtModalProps) {
  const { addDebt } = useDebt();
  const [type, setType] = useState<DebtType>('DEBT');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClose = () => {
    // Reset form
    setPerson('');
    setAmount('');
    setDueDate('');
    setDescription('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!person.trim()) newErrors.person = 'Nama wajib diisi';
    if (!amount || parseInt(amount.replace(/\D/g, '')) <= 0) newErrors.amount = 'Jumlah valid wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      addDebt({
        person,
        type,
        amount: parseInt(amount.replace(/\D/g, '')),
        dueDate: dueDate || undefined,
        description: description || undefined,
      });
      handleClose();
    }
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return parseInt(num).toLocaleString("id-ID");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={handleClose} />
      
      <div className="relative w-full max-w-md bg-[#0a120f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Tambah Transaksi Baru</h2>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setType('DEBT')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'DEBT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Hutang Saya
            </button>
            <button
              type="button"
              onClick={() => setType('RECEIVABLE')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'RECEIVABLE' ? 'bg-primary/20 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Piutang Saya
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold text-sm">Rp</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors ${
                  errors.amount ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="0"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Person */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nama Orang</label>
            <input
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors ${
                errors.person ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="Terkait dengan siapa?"
            />
            {errors.person && <p className="text-red-500 text-xs mt-1">{errors.person}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Jatuh Tempo (Opsional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full block bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-colors [color-scheme:dark] h-[46px]"
            />
          </div>

           {/* Description */}
           <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Keterangan (Opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-sm shadow-lg shadow-gold/20 hover:shadow-gold/30 active:scale-[0.98] transition-all mt-4"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
