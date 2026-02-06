import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [inputName, setInputName] = useState("");
  const { setName } = useUser();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setName(inputName.trim());
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f3d32] via-[#052e22] to-[#020b08] p-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-gold/10 blur-[80px] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

        <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
            {/* Logo/Header */}
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-900/50 mb-6 rotate-3">
                    <span className="material-symbols-outlined text-4xl text-[#020906]">account_balance_wallet</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Dompetku</h1>
                <p className="text-[#92c9ba] text-lg">Kelola keuanganmu dengan bijak.</p>
            </div>

            {/* Login Card */}
            <div className="glass-panel rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-semibold text-gray-300 ml-1">
                            Siapa namamu?
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">person</span>
                            </div>
                            <input
                                type="text"
                                id="name"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                placeholder="Masukkan nama kamu"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!inputName.trim()}
                        className="w-full bg-gradient-to-r from-primary to-emerald-400 text-[#020906] font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                    >
                        Masuk Sekarang
                    </button>
                </form>
            </div>
            
            <p className="text-center text-white/30 text-xs mt-8">
                &copy; {new Date().getFullYear()} Dompetku. Simpel & Aman.
            </p>
        </div>
    </div>
  );
}
