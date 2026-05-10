import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
// --- THEME CONTEXT ---
import { ThemeProvider, useTheme } from './context/ThemeContext'; // Ensure this path is correct

// --- SUPABASE ---
import { supabase } from './supabase/supabaseClient';

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

// Agent hub in android app

import AgentHubApp from './pages/agent/AgentHubApp';

// --- BUSINESS HUB & SUB-PAGES ---
import BusinessHub from "./pages/business/BusinessHub";
import BusinessOverview from "./pages/business/BusinessOverview";
import ManageLeads from "./pages/business/ManageLeads";
import PortfolioManager from "./pages/business/PortfolioManager";
import BusinessSettings from "./pages/business/BusinessSettings";
import LeadReview from "./pages/business/LeadReview";
import DashboardOverviewApp from './pages/agent/DashboardOverviewApp';
import BusinessDirectoryApp from './pages/agent/BusinessDirectoryApp';
import BusinessDetailApp from './pages/agent/BusinessDetailApp';
import WalletApp from './pages/agent/WalletApp';
import LeadHistoryApp from './pages/agent/LeadHistoryApp';
import ProfilePageApp from './pages/agent/ProfileApp';
import AuthGatewayApp from './pages/auth/AuthGatewayApp';

const AppContent = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme(); // Access global theme
const isNative = Capacitor.isNativePlatform();
  // Update Status Bar based on Theme
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;

        // 1. Turn OFF the transparent overlay so it acts like a normal status bar
        await StatusBar.setOverlaysWebView({ overlay: false });

        // 2. Set the exact hex colors to match your Bento design
        if (theme === 'light') {
          await StatusBar.setBackgroundColor({ color: '#FF0000' }); // Light mode app background
          await StatusBar.setStyle({ style: Style.Light });         // Dark icons/text
        } else {
          await StatusBar.setBackgroundColor({ color: '#09090B' }); // Dark mode app background
          await StatusBar.setStyle({ style: Style.Dark });          // Light icons/text
        }
      } catch (error) {
        console.warn('StatusBar is not available on this platform', error);
      }
    };

    configureStatusBar();
  }, [theme]);// Re-run whenever theme changes

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchUserRole(user.id);
      } else {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else {
        let role = data.role;
        if (role === 'manager') role = 'business'; // Map manager to business
        setUserRole(role);
        // Store in localStorage for additional persistence
        localStorage.setItem('vynx_user', JSON.stringify({
          id: userId,
          role: role,
          name: data.full_name
        }));
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  function handleLogout() {
    supabase.auth.signOut();
  }

  if (isLoading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={!userRole ? <LandingPage onEnterPortal={() => window.location.href='/login'} /> : <Navigate to={`/${userRole}`} replace />} 
        />
        
      <Route 
          path="/login" 
          element={
            !userRole ? (
              Capacitor.isNativePlatform() ? (
                <AuthGatewayApp />
              ) : (
                <AuthGateway />
              )
            ) : (
              <Navigate to={`/${userRole}`} replace />
            )
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            !userRole ? (
              Capacitor.isNativePlatform() ? (
                <AuthGatewayApp />
              ) : (
                <AuthGateway />
              )
            ) : (
              <Navigate to={`/${userRole}`} replace />
            )
          } 
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
          <Route path="/agent" element={isNative ? <AgentHubApp onLogout={handleLogout} /> : <AgentHub onLogout={handleLogout} /> }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={isNative ? <DashboardOverviewApp /> : <DashboardOverview /> } />
            <Route path="units" element={isNative ? <BusinessDirectoryApp /> : <BusinessDirectory />} />
            <Route path="units/:id" element={isNative ? <BusinessDetailApp /> : <BusinessDetail />} />
            <Route path="wallet" element={isNative ? <WalletApp /> : <WalletPage />} />
            <Route path="history" element={isNative ? <LeadHistoryApp /> : <LeadHistory />} />
            <Route path="profile" element={isNative ? <ProfilePageApp /> : <ProfilePage />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// --- WRAPPER TO PROVIDE CONTEXT TO THE WHOLE APP ---
const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;