import { useState, useRef, useEffect } from "react";
import { useNotification } from "@/context/NotificationContext";

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/5 transition-colors group"
      >
        <span className={`material-symbols-outlined transition-colors ${isOpen ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
          notifications
        </span>
        {/* Red dot badge */}
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-[#0A2319]"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-white/10">
          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{unreadCount} Baru</span>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${notif.isRead ? 'opacity-50' : ''}`}>
                <div className="flex gap-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                    notif.type === 'warning' ? 'bg-orange-500' : 
                    notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <h4 className={`text-sm font-medium transition-colors ${notif.isRead ? 'text-gray-400' : 'text-gray-200 group-hover:text-white'}`}>{notif.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-gray-500 mt-2 block">{notif.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/5 bg-white/5">
            <button 
              onClick={markAllAsRead}
              className="w-full py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={unreadCount === 0}
            >
              Tandai semua sudah dibaca
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
