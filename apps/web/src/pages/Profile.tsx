import { useState, useRef, useEffect } from "react";
import NotificationButton from "../components/NotificationButton";
import { useUser } from "@/context/UserContext";
import ImageCropper from "@/components/ImageCropper";

const formatNumber = (val: string) => {
  if (!val) return "";
  const num = val.replace(/\D/g, "");
  return parseInt(num).toLocaleString("id-ID");
};

export default function Profile() {
  const { name, setName, profileImage, setProfileImage, monthlyBudget, setMonthlyBudget } = useUser();
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isViewingImage, setIsViewingImage] = useState(false);
  
  // Lock body scroll when viewing image
  useEffect(() => {
    if (isViewingImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isViewingImage]);
  
  // Local state for editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize tempBudget with formatted value
  useEffect(() => {
    setTempBudget(formatNumber(monthlyBudget.toString()));
  }, [monthlyBudget]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTempImage(e.target.result as string);
          setShowCropper(true);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setProfileImage(croppedImage);
    setShowCropper(false);
    setTempImage(null);
  };

  const saveName = () => {
    if (tempName.trim()) {
      setName(tempName);
    } else {
      setTempName(name); // Revert if empty
    }
    setIsEditingName(false);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setTempBudget(formatted);
  };

  const saveBudget = () => {
    const value = parseInt(tempBudget.replace(/\./g, ''));
    if (!isNaN(value)) {
      setMonthlyBudget(value);
    } else {
      setTempBudget(formatNumber(monthlyBudget.toString()));
    }
    setIsEditingBudget(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logging out...");
      // In real app, clear token
      window.location.reload();
    }
  };

  return (
    <>
      {showCropper && tempImage && (
        <ImageCropper 
          imageSrc={tempImage} 
          onCancel={() => setShowCropper(false)} 
          onCrop={handleCropComplete} 
        />
      )}

      {/* Full Screen Image Viewer */}
      {isViewingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 touch-none">
          <button 
            onClick={() => setIsViewingImage(false)}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5 group z-50"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="relative w-full max-w-sm aspect-square p-6 flex items-center justify-center">
             <img 
               src={profileImage} 
               className="w-full h-full object-cover rounded-full border-4 border-white/10 shadow-2xl shadow-primary/20 animate-in zoom-in-90 duration-300"
               alt="Profile Full"
             />
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white absolute left-1/2 -translate-x-1/2">Profile</h1>
        <NotificationButton />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 px-6 overflow-y-auto hide-scrollbar pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center justify-center mb-8 mt-4">
          <div className="relative group mb-4">
            <div 
              className="size-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 p-1 transition-transform group-hover:scale-105 shadow-2xl shadow-primary/20 cursor-pointer"
              onClick={() => setIsViewingImage(true)}
            >
              <img 
                src={profileImage} 
                className="size-full rounded-full object-cover border-2 border-white/10"
                alt="Profile"
              />
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageSelect}
            />
          </div>
          
          {/* Name Display */}
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{name}</h2>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          
          {/* Personal Info Group */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Personal Info</h3>
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              
              {/* Display Name Row */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Display Name</p>
                    <p className="text-xs text-white/40">{name}</p>
                  </div>
                </div>
                {isEditingName ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm w-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                      autoFocus
                      onBlur={saveName}
                      onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    />
                    <button onClick={saveName} className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setTempName(name); setIsEditingName(true); }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors border border-white/5"
                  >
                    Change Name
                  </button>
                )}
              </div>

              {/* Profile Picture Row */}
              <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Profile Picture</p>
                    <p className="text-xs text-white/40">Update your photo</p>
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors border border-white/5"
                >
                  Change Photo
                </button>
              </div>

            </div>
          </div>

          {/* Financial Settings Group */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">Financial</h3>
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Monthly Budget</p>
                    <p className="text-xs text-white/40">Set your limit</p>
                  </div>
                </div>
                
                {isEditingBudget ? (
                   <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                     <span className="text-white/40 text-sm font-medium">Rp</span>
                     <input 
                       type="text"
                       value={tempBudget}
                       onChange={handleBudgetChange}
                       className="w-28 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-right text-sm font-bold text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                       autoFocus
                       onBlur={saveBudget}
                       onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                       placeholder="0"
                     />
                     <button onClick={saveBudget} className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                       <span className="material-symbols-outlined text-[18px]">check</span>
                     </button>
                   </div>
                ) : (
                  <button 
                    onClick={() => { setTempBudget(formatNumber(monthlyBudget.toString())); setIsEditingBudget(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                  >
                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      Rp {formatNumber(monthlyBudget.toString())}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-white/30">edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* About App Group */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-1">About App</h3>
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg shadow-primary/5">
                   <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Made by Fahriza</h4>
                  <p className="text-white/40 text-xs">@fahrizaafg</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="https://instagram.com/fahrizaafg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 hover:bg-white/5 transition-all group"
                >
                   <span className="text-pink-500 font-bold text-xs group-hover:text-pink-400 transition-colors">Instagram</span>
                </a>
                <a 
                  href="https://saweria.co/fahrizaafg" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#eeb413] hover:bg-[#dca308] border border-[#eeb413] transition-all text-black font-bold text-xs shadow-lg shadow-yellow-500/20"
                >
                   <span>Saweria</span>
                   <span className="material-symbols-outlined text-[14px]">volunteer_activism</span>
                </a>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="w-full py-4 glass-panel rounded-2xl text-rose-400 font-semibold flex items-center justify-center gap-2 hover:bg-rose-500/10 transition-colors border border-rose-500/20 mt-2">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
