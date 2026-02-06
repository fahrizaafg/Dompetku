import React, { useState } from 'react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue: string;
  type: 'INCOME' | 'EXPENSE';
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  onClose,
  onConfirm,
  initialValue,
  type
}) => {
  const [display, setDisplay] = useState(() => {
    const cleanVal = initialValue.replace(/\D/g, '');
    return cleanVal === '' ? '0' : cleanVal;
  });
  const [equation, setEquation] = useState('');
  const [isResult, setIsResult] = useState(false);

  const handleNumber = (num: string) => {
    if (isResult) {
      setDisplay(num);
      setEquation('');
      setIsResult(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (isResult) {
      setEquation(display + ' ' + op + ' ');
      setIsResult(false);
    } else {
      setEquation(equation + display + ' ' + op + ' ');
    }
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsResult(false);
  };

  const handleDelete = () => {
    if (isResult) {
      handleClear();
    } else {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }
  };

  const calculate = () => {
    try {
      // Replace visual operators with JS operators
      const expression = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // Safe evaluation
      const result = new Function('return ' + expression)();
      
      // Format result: round to integer as app seems to use integers for Rp
      const finalResult = Math.round(result).toString();
      
      setDisplay(finalResult);
      setEquation(''); // Clear equation or keep it? Usually clear on result.
      setIsResult(true);
      return finalResult;
    } catch {
      setDisplay('Error');
      setIsResult(true);
      return '0';
    }
  };

  const handleEqual = () => {
    calculate();
  };

  const handleConfirm = () => {
    // If there's a pending equation, calculate it first
    let finalValue = display;
    if (equation && !isResult) {
        finalValue = calculate();
    }
    
    // Ensure we don't return 'Error'
    if (finalValue === 'Error') {
        finalValue = '0';
    }
    
    onConfirm(finalValue);
    onClose();
  };

  // Theme colors
  const bgColor = type === 'EXPENSE' ? 'bg-[#2e1616]' : 'bg-[#162e28]';

  const formatNumber = (num: string) => {
    if (num === 'Error') return num;
    try {
      return new Intl.NumberFormat('id-ID').format(parseInt(num.replace(/\D/g, '') || '0'));
    } catch {
      return num;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Display */}
        <div className="p-6 bg-white/5 flex flex-col items-end justify-center min-h-[140px] relative overflow-hidden">
            {/* Background accents */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${type === 'EXPENSE' ? 'bg-rose-500/10' : 'bg-primary/10'} blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none`}></div>
            
            <div className="text-gray-400 text-sm mb-2 h-6 font-medium tracking-wide">
                {equation.replace(/\*/g, '×').replace(/\//g, '÷')}
            </div>
            <div className={`text-4xl font-bold tracking-tight break-all ${type === 'EXPENSE' ? 'text-rose-500' : 'text-primary'}`}>
                {formatNumber(display)}
            </div>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-3 bg-[#0A0A0A]">
            <button onClick={handleClear} className="col-span-1 p-4 rounded-2xl bg-white/5 text-rose-400 font-bold hover:bg-white/10 transition-colors">C</button>
            <button onClick={handleDelete} className="col-span-1 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-sm">backspace</span>
            </button>
            <button onClick={() => handleOperator('÷')} className="col-span-1 p-4 rounded-2xl bg-white/5 text-primary font-bold hover:bg-white/10 transition-colors">÷</button>
            <button onClick={() => handleOperator('×')} className="col-span-1 p-4 rounded-2xl bg-white/5 text-primary font-bold hover:bg-white/10 transition-colors">×</button>

            <button onClick={() => handleNumber('7')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">7</button>
            <button onClick={() => handleNumber('8')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">8</button>
            <button onClick={() => handleNumber('9')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">9</button>
            <button onClick={() => handleOperator('-')} className="p-4 rounded-2xl bg-white/5 text-primary font-bold hover:bg-white/10 transition-colors">-</button>

            <button onClick={() => handleNumber('4')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">4</button>
            <button onClick={() => handleNumber('5')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">5</button>
            <button onClick={() => handleNumber('6')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">6</button>
            <button onClick={() => handleOperator('+')} className="p-4 rounded-2xl bg-white/5 text-primary font-bold hover:bg-white/10 transition-colors">+</button>

            <button onClick={() => handleNumber('1')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">1</button>
            <button onClick={() => handleNumber('2')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">2</button>
            <button onClick={() => handleNumber('3')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">3</button>
            <button onClick={handleEqual} className={`row-span-2 p-4 rounded-2xl ${bgColor} ${type === 'EXPENSE' ? 'text-rose-500' : 'text-primary'} border border-white/10 font-bold text-xl hover:brightness-110 transition-all shadow-lg`}>=</button>

            <button onClick={() => handleNumber('0')} className="col-span-2 p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">0</button>
            <button onClick={() => handleNumber('000')} className="p-4 rounded-2xl bg-transparent border border-white/5 text-white text-xl font-medium hover:bg-white/5 transition-colors">000</button>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-3">
             <button 
                onClick={onClose}
                    className="py-3 rounded-2xl border border-white/10 text-gray-400 font-medium hover:bg-white/5 transition-colors"
                >
                    Batal
                </button>
                <button 
                    onClick={handleConfirm}
                    className={`py-3 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${type === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primary-dark shadow-primary/20'}`}
                >
                    Gunakan Hasil
                </button>
        </div>
      </div>
    </div>
  );
};
