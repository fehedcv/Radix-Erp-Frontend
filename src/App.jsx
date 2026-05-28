import React, { useState, useEffect, useRef } from 'react';
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
import BusinessHubApp from './pages/business/BusinessHubApp';
import BusinessOverviewApp from './pages/business/BusinessOverviewApp';
import LeadReviewApp from './pages/business/LeadReviewApp';
import ManageLeadsApp from './pages/business/MangeLeadsApp';
import PortfolioManagerApp from './pages/business/PortfolioManagerApp';
import AdminHubApp from './pages/admin/AdminHubApp';
import AdminOverviewApp from './pages/admin/AdminOverviewApp';
import AgentControlApp from './pages/admin/AgentControlApp';
import CreditSettlementApp from './pages/admin/CreditSettlementApp';
import MasterLeadTrackerApp from './pages/admin/MasterLeadTrackerApp';
import BusinessControlApp from './pages/admin/BusinessControlApp';

const AppContent = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const userRoleRef = useRef(null);
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
    isMountedRef.current = true;

    // Helper to safely restore session and user role
    const restoreSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session on startup:', error);
        }

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else if (isMountedRef.current) {
          setUserRole(null);
        }
      } catch (err) {
        console.error('Failed to restore Supabase session:', err);
        if (isMountedRef.current) setUserRole(null);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    // Initial restore
    restoreSession();

    // Auth state change listener - handle specific events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, payload) => {
      try {
        switch (event) {
         case 'SIGNED_IN':
  if (payload?.session?.user) {
    await fetchUserRole(payload.session.user.id);
  } else {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserRole(session.user.id);
    }
  }
  break;
          case 'TOKEN_REFRESHED':
            try {
              const { data: { session }, error } = await supabase.auth.getSession();
              if (error) console.error('Error getting session after token refresh:', error);
              if (session?.user) await fetchUserRole(session.user.id);
            } catch (e) {
              console.error('TOKEN_REFRESHED handling failed:', e);
            }
            break;
          case 'SIGNED_OUT':
            if (isMountedRef.current) {
              userRoleRef.current = null;
              setUserRole(null);
              setIsLoading(false);
              localStorage.removeItem('vynx_user');
            }
            break;
          case 'USER_UPDATED':
            if (payload?.user?.id) await fetchUserRole(payload.user.id).catch(() => {});
            break;
          default:
            await restoreSession();
        }
      } catch (e) {
        console.error('Error in auth state handler:', e);
      }
    });

    // Periodic session validation to avoid stale sessions (every 5 minutes)
    const intervalId = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Periodic session check failed:', error);
          return;
        }
        // Only fetch role if session exists but role is missing — never clear role here.
        // Actual sign-outs are handled by the SIGNED_OUT auth event.
        if (session?.user && !userRoleRef.current) {
          await fetchUserRole(session.user.id).catch(() => {});
        }
      } catch (e) {
        console.error('Error during periodic session validation:', e);
      }
    }, 5 * 60 * 1000);

    // When tab becomes visible, revalidate session immediately
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) console.error('visibilitychange getSession error:', error);

          if (session?.user) {
            // If token is expired or expires within the next 10 minutes, force a
            // refresh NOW so subsequent DB requests use a valid token. Without this
            // the DB query races against Supabase's internal _recoverAndRefresh()
            // and can run with the stale expired token.
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = (session.expires_at ?? 0) - now;
            if (expiresIn < 600) {
              const { error: refreshErr } = await supabase.auth.refreshSession();
              if (refreshErr) console.warn('Token refresh on visibility failed:', refreshErr);
            }

            await fetchUserRole(session.user.id).catch(() => {});
          }
          // Do NOT clear role when getSession returns null — that can happen on
          // network hiccups after long inactivity. The SIGNED_OUT event handles
          // real sign-outs.
        } catch (e) {
          console.error('Error on visibilitychange handler:', e);
        }
      }
    };

    // When network reconnects, revalidate session and role
    const handleOnline = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('online getSession error:', error);
        if (session?.user) {
          const now = Math.floor(Date.now() / 1000);
          if (((session.expires_at ?? 0) - now) < 600) {
            await supabase.auth.refreshSession().catch(() => {});
          }
          await fetchUserRole(session.user.id).catch(() => {});
        }
      } catch (e) {
        console.error('Error on online handler:', e);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', handleOnline);

    return () => {
      isMountedRef.current = false;
      try { subscription?.unsubscribe(); } catch (e) {}
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', handleOnline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreRoleFromCache = (userId) => {
    if (!isMountedRef.current) return;
    try {
      const cached = localStorage.getItem('vynx_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id === userId && parsed?.role) {
          userRoleRef.current = parsed.role;
          setUserRole(parsed.role);
          return;
        }
      }
    } catch {} // eslint-disable-line no-empty
    // Only reach here if no valid cache exists
    userRoleRef.current = null;
    setUserRole(null);
  };

  const fetchUserRole = async (userId) => {
    const TIMEOUT_MS = 12000;
    try {
      const rolePromise = supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      const timer = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout fetching role')), TIMEOUT_MS)
      );

      const result = await Promise.race([rolePromise, timer]);
      const { data, error } = result || {};

      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error fetching user role:', error);
        restoreRoleFromCache(userId);
      } else if (!data) {
        console.warn('No user role data returned');
        restoreRoleFromCache(userId);
      } else {
        let role = data.role;
        if (role === 'manager') role = 'business';
        userRoleRef.current = role;
        setUserRole(role);
        try {
          localStorage.setItem('vynx_user', JSON.stringify({
            id: userId,
            role: role,
            name: data.full_name
          }));
        } catch {} // eslint-disable-line no-empty
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      if (isMountedRef.current) {
        restoreRoleFromCache(userId);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    } finally {
      setUserRole(null);
      localStorage.removeItem('vynx_user');
    }
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
          <Route path="/admin" element={isNative ? <AdminHubApp onLogout={handleLogout} /> : <AdminHub onLogout={handleLogout} /> }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={isNative ? <AdminOverviewApp /> : <AdminOverview />} />
            <Route path="leads" element={isNative ? <MasterLeadTrackerApp /> : <MasterLeadTracker />} />
            <Route path="units" element={isNative ? <BusinessControlApp /> : <BusinessControl />} />
            <Route path="agents" element={isNative ? <AgentControlApp /> : <AgentControl />} />
            <Route path="credits" element={isNative ? <CreditSettlementApp /> : <CreditSettlement />} />
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
          <Route path="/business" element={isNative ? <BusinessHubApp onLogout={handleLogout} /> : <BusinessHub onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={isNative ? <BusinessOverviewApp /> : <BusinessOverview />} />
            <Route path="leads" element={isNative ? <ManageLeadsApp /> : <ManageLeads />} />
            <Route path="leads/:id" element={isNative ? <LeadReviewApp /> : <LeadReview />} />
            <Route path="portfolio" element={isNative ? <PortfolioManagerApp /> : <PortfolioManager />} />
            {/* <Route path="settings" element={<BusinessSettings />} /> */}
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