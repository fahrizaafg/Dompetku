import { useState } from 'react';
import { createPortal } from 'react-dom';
import { type Debt, useDebt } from '../../context/DebtContext';
import PaymentModal from './PaymentModal';
import ConfirmationModal from '../common/ConfirmationModal';

interface DebtDetailModalProps {
  debt: Debt;
  onClose: () => void;
}

export default function DebtDetailModal({ debt, onClose }: DebtDetailModalProps) {
  const { deleteDebt } = useDebt();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = debt.amount - totalPaid;
  const progress = Math.min((totalPaid / debt.amount) * 100, 100);

  // Estimate Payoff
  const getEstimation = () => {
    if (debt.payments.length < 2) return null;
    
    // Simple average based on last 3 payments
    const recentPayments = [...debt.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
    const avgAmount = recentPayments.reduce((sum, p) => sum + p.amount, 0) / recentPayments.length;
    
    if (avgAmount <= 0) return null;
    
    const monthsLeft = Math.ceil(remaining / avgAmount);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsLeft);
    
    return {
        date: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        months: monthsLeft
    };
  };

  const estimation = getEstimation();

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteDebt(debt.id);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#0a120f] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-0 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    debt.type === 'DEBT' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/20' 
                        : 'bg-primary/20 text-primary border-primary/20'
                }`}>
                    {debt.type}
                </span>
                {debt.status === 'PAID' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-green-500/20 text-green-400 border-green-500/20">
                        LUNAS
                    </span>
                )}
            </div>
            <h2 className="text-2xl font-bold text-white">{debt.person}</h2>
            {debt.description && <p className="text-sm text-gray-400 mt-1">{debt.description}</p>}
          </div>
          <div className="flex items-center gap-1">
            <button 
                onClick={handleDeleteClick} 
                className="p-2 hover:bg-rose-500/10 rounded-full text-rose-500/40 hover:text-rose-500 transition-colors"
                title="Hapus Data"
            >
                <span className="material-symbols-outlined">delete</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Total Jumlah</p>
                    <p className="text-lg font-bold text-white">Rp {debt.amount.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Sisa</p>
                    <p className="text-lg font-bold text-gold">Rp {remaining.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Progress */}
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Progres Pembayaran</span>
                    <span className="text-white">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${debt.type === 'DEBT' ? 'bg-gold' : 'bg-primary'}`} 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Estimation */}
            {estimation && remaining > 0 && (
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-500/20 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-indigo-400">event_upcoming</span>
                     </div>
                     <div>
                        <p className="text-xs text-indigo-300 font-medium uppercase">Estimasi Lunas</p>
                        <p className="text-sm text-white">
                            ~ {estimation.months} bulan ({estimation.date})
                        </p>
                     </div>
                </div>
            )}

            {/* Timeline */}
            <div>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-lg">history</span>
                    Riwayat Pembayaran
                </h3>
                
                <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                    {debt.payments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic pl-4">Belum ada pembayaran tercatat.</p>
                    ) : (
                        [...debt.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                            <div key={payment.id} className="relative pl-6">
                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-[#0a120f] border-2 border-primary flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-white font-bold">Rp {payment.amount.toLocaleString('id-ID')}</p>
                                        <span className="text-xs text-gray-400">
                                            {new Date(payment.date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    {payment.note && <p className="text-xs text-gray-500">{payment.note}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        {debt.status !== 'PAID' && (
            <div className="p-4 border-t border-white/10 bg-[#0a120f]">
                <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                    Catat Pembayaran
                </button>
            </div>
        )}
      </div>

      <PaymentModal  
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        debtId={debt.id}
        remainingAmount={remaining}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={`Hapus ${debt.type === 'DEBT' ? 'Hutang' : 'Piutang'}?`}
        message={`Data ${debt.type === 'DEBT' ? 'hutang' : 'piutang'} atas nama ${debt.person} akan dihapus permanen. Lanjutkan?`}
        confirmText="Hapus"
        isDangerous={true}
      />
    </div>,
    document.body
  );
}
