import { Link } from "react-router-dom";
import NotificationButton from "../components/NotificationButton";
import { useUser } from "@/context/UserContext";
import { useEffect, useState, useMemo } from "react";

// Helper functions for smooth curve
const line = (pointA: number[], pointB: number[]) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
  const p = previous || current;
  const n = next || current;
  const o = line(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * 0.2;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
  const cps = controlPoint(a[i - 1], a[i - 2], point);
  const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cps[0].toFixed(2)},${cps[1].toFixed(2)} ${cpe[0].toFixed(2)},${cpe[1].toFixed(2)} ${point[0].toFixed(2)},${point[1].toFixed(2)}`;
};

export default function Dashboard() {
  const { name, profileImage, transactions, isLoading, error, monthlyBudget } = useUser();
  const [greeting, setGreeting] = useState("");
  const [trendView, setTrendView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Greeting Logic
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Good Morning,");
      else if (hour >= 12 && hour < 18) setGreeting("Good Afternoon,");
      else if (hour >= 18 && hour < 22) setGreeting("Good Evening,");
      else setGreeting("Good Night,");
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Balance Calculation
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [transactions]);

  // Budget Insight Calculation (Monthly)
  const budgetInfo = useMemo(() => {
    const now = new Date();
    // Use local date to avoid timezone issues
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Format Month Name for display (e.g., "Oktober")
    const monthName = now.toLocaleString('id-ID', { month: 'long' });
    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Calculate total monthly expenses
    const monthlyExpenses = transactions
      .filter(t => t.type === 'EXPENSE' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = monthlyBudget - monthlyExpenses;
    
    // Calculate usage percentage
    // If budget is 0, avoid division by zero
    const percentUsed = monthlyBudget > 0 ? Math.min((monthlyExpenses / monthlyBudget) * 100, 100) : (monthlyExpenses > 0 ? 100 : 0);
    const isOverBudget = remaining < 0;

    // Calculate status message based on percentage
    let statusMessage = "Aman banget";
    let statusColor = "text-[#0fb88b]"; // Default Green
    
    if (percentUsed >= 100) {
        statusMessage = "Over Budget!";
        statusColor = "text-[#ff4d5e]";
    } else if (percentUsed >= 80) {
        statusMessage = "Bahaya!";
        statusColor = "text-[#ff4d5e]";
    } else if (percentUsed >= 60) {
        statusMessage = "Mulai boros";
        statusColor = "text-orange-400";
    } else if (percentUsed >= 40) {
        statusMessage = "Hati-hati";
        statusColor = "text-yellow-400";
    } else if (percentUsed >= 20) {
        statusMessage = "Masih aman";
        statusColor = "text-[#0fb88b]";
    }

    return {
      monthName,
      monthlyBudget,
      monthlyExpenses,
      remaining,
      percentUsed,
      isOverBudget,
      statusMessage,
      statusColor
    };
  }, [transactions, monthlyBudget]);

  // Expense Trend Calculation
  const trendData = useMemo(() => {
    const today = new Date();
    const dataPoints: { label: string; amount: number }[] = [];
    
    // Helper for local date string
    const getLocalDateStr = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (trendView === 'daily') {
        // Today's activity grouped by 4-hour blocks
        const todayStr = getLocalDateStr(today);
        const todayExpenses = transactions.filter(t => t.type === 'EXPENSE' && t.date === todayStr);

        for(let i=0; i<6; i++) {
            const startHour = i * 4;
            const endHour = (i + 1) * 4;
            const label = `${startHour.toString().padStart(2, '0')}:00`;
            
            const amount = todayExpenses.reduce((sum, t) => {
                // Parse time logic (24h format)
                let h = 0;
                const timeParts = t.time.split(':');
                if (timeParts.length >= 1) {
                    h = parseInt(timeParts[0]);
                }
                
                if (h >= startHour && h < endHour) return sum + t.amount;
                return sum;
            }, 0);
            
            dataPoints.push({ label, amount });
        }
    } else if (trendView === 'weekly') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getLocalDateStr(date);
            const dayExpenses = transactions
                .filter(t => t.type === 'EXPENSE' && t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            dataPoints.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                amount: dayExpenses
            });
        }
    } else if (trendView === 'monthly') {
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getLocalDateStr(date);
            const dayExpenses = transactions
                .filter(t => t.type === 'EXPENSE' && t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            dataPoints.push({
                label: date.getDate().toString(),
                amount: dayExpenses
            });
        }
    }
    return dataPoints;
  }, [transactions, trendView]);

  // Chart Points Generation
  const chartPath = useMemo(() => {
    if (trendData.length === 0) return { line: "", area: "", points: [] };
    
    const maxAmount = Math.max(...trendData.map(d => d.amount), 1); // Avoid div by 0
    // const height = 100; // Available height in SVG (leaving padding)
    const width = 350;
    const stepX = width / (trendData.length > 1 ? trendData.length - 1 : 1);
    
    const pointsArr = trendData.map((d, i) => {
      const x = i * stepX;
      // Invert Y because SVG 0 is top. 120 is baseline (leaving 30px bottom for padding)
      // We map 0 amount to 120, maxAmount to 20
      const y = 120 - (d.amount / maxAmount) * 100;
      return [x, y];
    });

    const pointsStr = pointsArr.map(p => `${p[0]},${p[1]}`);

    // Generate smooth path using Cubic Bezier curves
    const linePath = pointsArr.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point[0].toFixed(2)},${point[1].toFixed(2)}`;
      return `${acc} ${bezierCommand(point, i, a)}`;
    }, "");

    const areaPath = `${linePath} V150 H0 Z`;
    
    // Calculate max index for default display
    const maxIndex = trendData.reduce((maxIdx, current, idx, arr) => 
        current.amount > arr[maxIdx].amount ? idx : maxIdx
    , 0);

    return { line: linePath, area: areaPath, points: pointsStr, maxIndex };
  }, [trendData]);

  // Recent Activity
  const recentTransactions = useMemo(() => {
    // Sort by date/time (mock data strings might need better parsing in real app, but assumed ISO or sortable)
    return [...transactions]
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      .slice(0, 4);
  }, [transactions]);

  return (
    <>
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden ring-2 ring-primary/30">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src={profileImage}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-[#020906]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#92c9ba] font-medium">
              {greeting}
            </span>
            <span className="text-sm text-white font-bold">{name}</span>
          </div>
        </div>
        <NotificationButton />
      </header>

      {/* Balance Section */}
      <section className="px-6 pb-6">
        <div className="flex flex-col items-center justify-center pt-2 pb-6">
          <span className="text-[#92c9ba] text-sm font-medium mb-1">
            Total Saldo
          </span>
          <h1 className="text-white text-4xl font-bold tracking-tight mb-6">
            Rp {totalBalance.toLocaleString('id-ID')}
          </h1>
          {/* Budget Insight Module */}
          <div className="w-full glass-panel rounded-2xl p-5 relative overflow-hidden group">
            {/* Background Glow Effect */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] transition-colors duration-500 opacity-40 ${budgetInfo.isOverBudget ? 'bg-[#ff4d5e]' : 'bg-accent-yellow'}`}></div>

            <div className="relative z-10">
                {/* Header: Title & Percent */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <span className="text-[#92c9ba] text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            Budget {budgetInfo.monthName}
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                             <span className="text-white text-2xl font-bold tracking-tight">
                                Rp {Math.max(0, budgetInfo.remaining).toLocaleString('id-ID')}
                             </span>
                             {budgetInfo.isOverBudget && (
                                <span className="text-[#ff4d5e] text-xs font-bold bg-[#ff4d5e]/10 px-2 py-0.5 rounded-full border border-[#ff4d5e]/20">
                                    Over Rp {Math.abs(budgetInfo.remaining).toLocaleString('id-ID')}
                                </span>
                             )}
                        </div>
                        <span className="text-gray-400 text-xs mt-1">
                            {budgetInfo.isOverBudget ? 'Budget terlampaui dari total' : 'Tersedia dari total budget'} <span className="text-white/80 font-medium">Rp {budgetInfo.monthlyBudget.toLocaleString('id-ID')}</span>
                        </span>
                    </div>
                    
                    {/* Percent Indicator */}
                     <div className={`text-right flex flex-col items-end ${budgetInfo.isOverBudget ? 'text-[#ff4d5e]' : 'text-accent-yellow'}`}>
                        <span className="text-xl font-bold">{Math.round(budgetInfo.percentUsed)}%</span>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Used</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-700 ease-out ${
                            budgetInfo.isOverBudget ? 'bg-[#ff4d5e]' : 
                            budgetInfo.percentUsed > 85 ? 'bg-orange-400' : 
                            'bg-accent-yellow'
                        }`}
                        style={{ width: `${budgetInfo.percentUsed}%` }}
                    ></div>
                </div>
                
                {/* Footer Info */}
                <div className="mt-3 flex justify-between items-center text-xs border-t border-white/5 pt-3">
                     <span className="text-gray-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Terpakai: <span className="text-white font-medium">Rp {budgetInfo.monthlyExpenses.toLocaleString('id-ID')}</span>
                     </span>
                     <span className={`italic font-medium ${budgetInfo.statusColor}`}>
                        {budgetInfo.statusMessage}
                     </span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="px-6 mb-6">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white text-base font-semibold">
                Expense Trend
              </h3>
              <p className="text-[#92c9ba] text-xs mt-0.5">
                {trendView === 'weekly' ? 'Last 7 Days' : trendView === 'daily' ? 'Today' : 'This Month'}
              </p>
            </div>
            <div className="flex gap-1">
                {['daily', 'weekly', 'monthly'].map((view) => (
                    <button 
                        key={view}
                        onClick={() => {
                            setTrendView(view as 'daily' | 'weekly' | 'monthly');
                            setActivePointIndex(null);
                        }}
                        className={`text-[10px] px-2 py-1 rounded-lg transition capitalize ${trendView === view ? 'bg-primary text-black font-bold' : 'text-[#92c9ba] bg-white/5 hover:bg-white/10'}`}
                    >
                        {view}
                    </button>
                ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-40 w-full flex items-center justify-center text-[#92c9ba]">Loading...</div>
          ) : error ? (
            <div className="h-40 w-full flex items-center justify-center text-red-400">{error}</div>
          ) : (
            <>
              {/* Graph Container */}
              <div className="relative h-40 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 350 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0fb88b" stopOpacity="0.3"></stop>
                      <stop offset="100%" stopColor="#0fb88b" stopOpacity="0"></stop>
                    </linearGradient>
                    <filter
                      height="140%"
                      id="glow"
                      width="140%"
                      x="-20%"
                      y="-20%"
                    >
                      <feGaussianBlur
                        result="coloredBlur"
                        stdDeviation="3"
                      ></feGaussianBlur>
                      <feMerge>
                        <feMergeNode in="coloredBlur"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Grid Lines */}
                  {[0, 50, 100, 150].map(y => (
                      <line
                        key={y}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 4"
                        x1="0"
                        x2="350"
                        y1={y}
                        y2={y}
                      ></line>
                  ))}
                  
                  {/* Path Fill */}
                  <path
                    d={chartPath.area}
                    fill="url(#gradientGreen)"
                  ></path>
                  {/* Line Stroke */}
                  <path
                    d={chartPath.line}
                    fill="none"
                    filter="url(#glow)"
                    stroke="#0fb88b"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  ></path>
                  
                  {/* Data Points (Dots & Tooltips) */}
                  {chartPath.points.map((p: string, i: number) => {
                      const [cxStr, cyStr] = p.split(',');
                      const cx = parseFloat(cxStr);
                      const cy = parseFloat(cyStr);
                      const amount = trendData[i].amount;
                      
                      const isMax = i === chartPath.maxIndex;
                      const isLast = i === chartPath.points.length - 1;
                      const isActive = activePointIndex === i;
                      // Show tooltip if: 
                      // 1. It is the active (tapped) point
                      // 2. OR no point is active AND it is the Max or Last point (default view)
                      const showTooltip = isActive || (activePointIndex === null && (isMax || isLast));
                      
                      // Tooltip positioning logic to keep within bounds
                      const tooltipWidth = 60;
                      const halfWidth = tooltipWidth / 2;
                      let tooltipX = cx - halfWidth;
                      // Clamp to bounds (0 to 350)
                      if (tooltipX < 0) tooltipX = 0;
                      if (tooltipX + tooltipWidth > 350) tooltipX = 350 - tooltipWidth;
                      const textX = tooltipX + halfWidth;

                      // Formatting Amount for display
                      const formatAmount = (val: number) => {
                        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'jt';
                        if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                        return val.toString();
                      };

                      return (
                          <g key={i} className="group" onClick={() => setActivePointIndex(isActive ? null : i)}>
                             {/* Invisible larger target for easier hovering/tapping */}
                             <circle cx={cx} cy={cy} r="20" fill="transparent" className="cursor-pointer" />
                             
                             {/* The visible dot */}
                             <circle
                                cx={cx}
                                cy={cy}
                                fill="#020906"
                                r={isActive || showTooltip ? "6" : "4"}
                                stroke="#0fb88b"
                                strokeWidth="2"
                                className={`transition-all duration-300 pointer-events-none ${isActive || showTooltip ? 'fill-[#0fb88b] stroke-white' : 'group-hover:r-6 group-hover:fill-[#0fb88b] group-hover:stroke-white'}`}
                              ></circle>

                             {/* Tooltip / Label */}
                             <g className={`transition-opacity duration-300 pointer-events-none ${showTooltip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {/* Background pill */}
                                <rect 
                                    x={tooltipX} 
                                    y={cy - 35} 
                                    width={tooltipWidth} 
                                    height="24" 
                                    rx="6" 
                                    fill="#020906" 
                                    stroke="#0fb88b" 
                                    strokeWidth="1"
                                    className="opacity-90"
                                />
                                {/* Text Value */}
                                <text
                                    x={textX}
                                    y={cy - 20}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="white"
                                    fontWeight="bold"
                                    dominantBaseline="middle"
                                >
                                    {formatAmount(amount)}
                                </text>
                                {/* Triangle pointer */}
                                <path 
                                    d={`M ${cx} ${cy - 10} L ${cx - 4} ${cy - 11} L ${cx + 4} ${cy - 11} Z`} 
                                    fill="#0fb88b"
                                />
                             </g>
                          </g>
                      );
                  })}
                </svg>
              </div>
              {/* X Axis Labels */}
              <div className="flex justify-between mt-2 px-1">
                {trendData.map((d, i) => {
                    // For monthly, only show every 5th label + last one to avoid clutter
                    if (trendView === 'monthly' && i % 5 !== 0 && i !== trendData.length - 1) return null;
                    return (
                        <span key={i} className={`text-[10px] ${i === trendData.length - 1 ? 'text-white font-bold' : 'text-[#92c9ba]'}`}>
                            {d.label}
                        </span>
                    );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="px-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold">Recent Activity</h3>
          <Link
            className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
            to="/history"
          >
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-3 pb-4">
          {recentTransactions.length > 0 ? recentTransactions.map(t => {
            const isExpense = t.type === 'EXPENSE';
            const sign = isExpense ? '-' : '+';
            const colorClass = isExpense ? 'text-[#ff4d5e]' : 'text-primary';
            // Simple logic to map icon/color if needed, or use t.icon directly
            const iconBg = t.type === 'INCOME' ? 'bg-primary/20 text-primary' : 'bg-[#ff4d5e]/20 text-[#ff4d5e]';
            
            return (
              <div key={t.id} className="glass-panel rounded-xl p-3 flex items-center justify-between group active:scale-[0.98] transition-transform duration-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {t.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.title}</p>
                    <p className="text-[#92c9ba] text-xs">{t.date}, {t.time}</p>
                  </div>
                </div>
                <span className={`${colorClass} font-semibold text-sm`}>{sign} Rp {t.amount.toLocaleString('id-ID')}</span>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#92c9ba]">
                        <path d="M9 22L12 19L15 22L18 19L21 22V11C21 6.02944 16.9706 2 12 2C7.02944 2 3 6.02944 3 11V22L6 19L9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p className="text-[#92c9ba] text-sm font-medium">Belum ada transaksi. Yuk, mulai catat sekarang!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
