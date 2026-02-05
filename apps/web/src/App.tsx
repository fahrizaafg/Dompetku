import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import AddTransaction from "@/pages/AddTransaction";
import History from "@/pages/History";
import DebtTracker from "@/pages/DebtTracker";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import RequireAuth from "@/components/RequireAuth";
import { NotificationProvider } from "@/context/NotificationContext";
import { UserProvider } from "@/context/UserContext";
import { DebtProvider } from "@/context/DebtContext";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <NotificationProvider>
          <DebtProvider>
            {/* Main Application Routes */}
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-transaction" element={<AddTransaction />} />
                <Route path="/history" element={<History />} />
                <Route path="/debt" element={<DebtTracker />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </DebtProvider>
        </NotificationProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
