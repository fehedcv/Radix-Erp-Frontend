import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- PUBLIC PAGES ---
import LandingPage from './pages/public/LandingPage';
import AuthGateway from './pages/auth/AuthGateway';

// --- ADMIN HUB & SUB-PAGES ---
import AdminHub from "./pages/admin/AdminHub";
import AdminOverview from './pages/admin/AdminOverview';
import BusinessControl from './pages/admin/BusinessControl';
import MasterLeadTracker from './pages/admin/MasterLeadTracker';
import CreditSettlement from './pages/admin/CreditSettlement';
import AgentControl from './pages/admin/AgentControl';

// --- AGENT HUB & SUB-PAGES ---
import AgentHub from "./pages/agent/AgentHub";
import DashboardOverview from './pages/agent/DashboardOverview';
import BusinessDirectory from './pages/agent/BusinessDirectory';
import BusinessDetail from './pages/agent/BusinessDetail';
import WalletPage from './pages/agent/Wallet';
import LeadHistory from './pages/agent/LeadHistory';
import ProfilePage from './pages/agent/Profile';

// --- BUSINESS HUB & SUB-PAGES ---
import BusinessHub from "./pages/business/BusinessHub";
import BusinessOverview from "./pages/business/BusinessOverview";
import ManageLeads from "./pages/business/ManageLeads";
import PortfolioManager from "./pages/business/PortfolioManager";
import BusinessSettings from "./pages/business/BusinessSettings";
import LeadReview from "./pages/business/LeadReview";

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. സെഷൻ പരിശോധിക്കുന്നു (LocalStorage Sync)
  useEffect(() => {
    const checkSession = () => {
      const savedUser = localStorage.getItem('vynx_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUserRole(parsedUser.role);
        } catch (error) {
          localStorage.removeItem('vynx_user');
        }
      }
      setIsLoading(false);
    };
    checkSession();

    // ടാബുകൾ തമ്മിലുള്ള സിങ്ക്രണൈസേഷനായി
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  // 2. ലോഗൗട്ട് ഫങ്ക്ഷൻ
  const handleLogout = () => {
    localStorage.removeItem('vynx_user');
    setUserRole(null);
  };

  if (isLoading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* ലോഗിൻ ചെയ്തിട്ടില്ലെങ്കിൽ ലാൻഡിംഗ് പേജ്, ഉണ്ടെങ്കിൽ ഡാഷ്‌ബോർഡ് */}
        <Route 
          path="/" 
          element={!userRole ? <LandingPage onEnterPortal={() => window.location.href='/login'} /> : <Navigate to={`/${userRole}`} replace />} 
        />
        
        <Route 
          path="/login" 
          element={!userRole ? <AuthGateway onLoginSuccess={(role) => setUserRole(role)} /> : <Navigate to={`/${userRole}`} replace />} 
        />
        
        <Route 
          path="/signup" 
          element={!userRole ? <AuthGateway onLoginSuccess={(role) => setUserRole(role)} /> : <Navigate to={`/${userRole}`} replace />} 
        />

        {/* --- ADMIN PRIVATE ROUTES --- */}
        {userRole === 'admin' && (
          <Route path="/admin" element={<AdminHub onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="leads" element={<MasterLeadTracker />} />
            <Route path="units" element={<BusinessControl />} />
            <Route path="agents" element={<AgentControl />} />
            <Route path="credits" element={<CreditSettlement />} />
          </Route>
        )}

        {/* --- AGENT PRIVATE ROUTES --- */}
        {userRole === 'agent' && (
          <Route path="/agent" element={<AgentHub onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="units" element={<BusinessDirectory />} />
            <Route path="units/:id" element={<BusinessDetail />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="history" element={<LeadHistory />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        )}

        {/* --- BUSINESS PRIVATE ROUTES --- */}
        {userRole === 'business' && (
          <Route path="/business" element={<BusinessHub onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BusinessOverview />} />
            <Route path="leads" element={<ManageLeads />} />
            <Route path="leads/:id" element={<LeadReview />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>
        )}

        {/* FALLBACK: തെറ്റായ URL അടിച്ചാൽ ഹോം പേജിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;