import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none flex justify-center w-full">
      <div className="w-full max-w-md pointer-events-auto">
        <div className="glass-panel rounded-2xl h-[72px] flex items-center justify-around relative px-2 shadow-2xl shadow-black/50">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center w-12 h-full gap-1 group ${
              isActive("/") ? "text-primary" : "text-[#92c9ba] hover:text-white"
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[26px] group-hover:-translate-y-0.5 transition-transform duration-300">
              home
            </span>
            <span
              className={`text-[10px] font-medium transition-all duration-300 ${
                isActive("/")
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 absolute bottom-1.5"
              }`}
            >
              Home
            </span>
          </Link>
          
          <Link
            to="/history"
            className={`flex flex-col items-center justify-center w-12 h-full gap-1 group ${
              isActive("/history") ? "text-primary" : "text-[#92c9ba] hover:text-white"
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[26px] group-hover:-translate-y-0.5 transition-transform duration-300">
              analytics
            </span>
            <span
              className={`text-[10px] font-medium transition-all duration-300 ${
                isActive("/history")
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 absolute bottom-1.5"
              }`}
            >
              History
            </span>
          </Link>
          
          {/* FAB Placeholder for spacing */}
          <div className="w-14"></div>
          
          <Link
            to="/debt"
            className={`flex flex-col items-center justify-center w-12 h-full gap-1 group ${
              isActive("/debt") ? "text-primary" : "text-[#92c9ba] hover:text-white"
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[26px] group-hover:-translate-y-0.5 transition-transform duration-300">
              account_balance_wallet
            </span>
            <span
              className={`text-[10px] font-medium transition-all duration-300 ${
                isActive("/debt")
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 absolute bottom-1.5"
              }`}
            >
              Debts
            </span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center w-12 h-full gap-1 group ${
              isActive("/profile") ? "text-primary" : "text-[#92c9ba] hover:text-white"
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[26px] group-hover:-translate-y-0.5 transition-transform duration-300">
              person
            </span>
            <span
              className={`text-[10px] font-medium transition-all duration-300 ${
                isActive("/profile")
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 absolute bottom-1.5"
              }`}
            >
              Profile
            </span>
          </Link>
          
          {/* Floating Action Button */}
          <Link
            to="/add-transaction"
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary rounded-full shadow-[0_4px_20px_rgba(15,184,139,0.5)] flex items-center justify-center text-white hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-[#020906]"
          >
            <span className="material-symbols-outlined text-[32px]">add</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
