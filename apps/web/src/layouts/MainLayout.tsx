import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function MainLayout() {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/add-transaction';
  const isDebtsPage = location.pathname === '/debt';

  return (
    <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-glow-spot pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(15,184,139,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className={`relative z-10 flex flex-col w-full max-w-md mx-auto ${isFullScreenPage ? 'h-[100dvh] overflow-hidden' : isDebtsPage ? 'min-h-screen' : 'min-h-screen pb-24'}`}>
        <Outlet />
      </div>

      {!isFullScreenPage && <BottomNav />}
    </div>
  );
}
