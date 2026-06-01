import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// --- THEME CONTEXT ---
import { ThemeProvider, useTheme } from './context/ThemeContext';

// --- NOTIFICATION CONTEXT ---
import { NotificationProvider } from './context/NotificationContext';

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

// --- LOADER ---
import GlobalLoader from './components/Loader';

// --- PUSH NOTIFICATIONS ---
import PushNotificationHandler from './components/PushNotificationHandler';
import NotificationToast from './components/NotificationToast';
import { cleanupPushNotifications } from './services/pushNotifications';
import { cleanupWebPush } from './services/webPush';

const AppContent = () => {
  const [userRole, setUserRole] = useState(null);
  const [authUserId, setAuthUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const userRoleRef = useRef(null);
  const isFetchingRoleRef = useRef(false);
  const { theme } = useTheme();
  const isNative = Capacitor.isNativePlatform();

  // Update Status Bar based on Theme
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;
        await StatusBar.setOverlaysWebView({ overlay: false });
        if (theme === 'light') {
          await StatusBar.setBackgroundColor({ color: '#F4F5F7' });
          await StatusBar.setStyle({ style: Style.Light });
        } else {
          await StatusBar.setBackgroundColor({ color: '#131720' });
          await StatusBar.setStyle({ style: Style.Dark });
        }
      } catch (error) {
        console.warn('StatusBar is not available on this platform', error);
      }
    };
    configureStatusBar();
  }, [theme]);

  useEffect(() => {
    isMountedRef.current = true;

    // Render from cache immediately — eliminates white screen on reload
    try {
      const cached = JSON.parse(localStorage.getItem('vynx_user') || 'null');
      if (cached?.id && cached?.role) {
        userRoleRef.current = cached.role;
        setUserRole(cached.role);
        setAuthUserId(cached.id);
      }
    } catch {} // eslint-disable-line no-empty

    // onAuthStateChange is the single driver for all auth state.
    // Supabase internally handles token auto-refresh, visibility, and online events
    // — we must not call getSession()/refreshSession() ourselves or we race the lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      console.log('[auth] event:', event, session?.user?.id ?? 'no user');

      switch (event) {
        case 'INITIAL_SESSION':
          if (session?.user) {
            await fetchUserRole(session.user.id).catch(() => {});
          } else {
            setUserRole(null);
            setAuthUserId(null);
          }
          if (isMountedRef.current) setIsLoading(false);
          break;

        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          if (session?.user) {
            await fetchUserRole(session.user.id).catch(() => {});
          }
          break;

        case 'SIGNED_OUT':
          userRoleRef.current = null;
          setUserRole(null);
          setAuthUserId(null);
          setIsLoading(false);
          localStorage.removeItem('vynx_user');
          break;

        default:
          break;
      }
    });

    return () => {
      isMountedRef.current = false;
      try { subscription?.unsubscribe(); } catch {} // eslint-disable-line no-empty
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
          setAuthUserId(userId);
          return;
        }
      }
    } catch {} // eslint-disable-line no-empty
    userRoleRef.current = null;
    setUserRole(null);
    setAuthUserId(null);
  };

  const fetchUserRole = async (userId) => {
    if (isFetchingRoleRef.current) {
      console.log('[auth] fetchUserRole skipped — already in progress');
      return;
    }
    console.log('[auth] fetchUserRole start');
    isFetchingRoleRef.current = true;

    try {
      const TIMEOUT_MS = 10000;
      const queryPromise = supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('FETCH_TIMEOUT')), TIMEOUT_MS)
      );

      let data, error;
      try {
        ({ data, error } = await Promise.race([queryPromise, timeoutPromise]));
      } catch (raceErr) {
        if (raceErr?.message === 'FETCH_TIMEOUT') {
          console.warn('[fetchUserRole] Request timed out, falling back to cache');
          restoreRoleFromCache(userId);
          return;
        }
        throw raceErr;
      }

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
        setAuthUserId(userId);
        try {
          localStorage.setItem('vynx_user', JSON.stringify({
            id: userId,
            role,
            name: data.full_name
          }));
        } catch {} // eslint-disable-line no-empty
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error fetching user role:', err);
      restoreRoleFromCache(userId);
    } finally {
      isFetchingRoleRef.current = false;
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  async function handleLogout() {
    // Clean up push tokens before signing out
    try {
      if (Capacitor.isNativePlatform()) {
        await cleanupPushNotifications();
      } else {
        await cleanupWebPush();
      }
    } catch (e) {
      console.warn('Push token cleanup on logout failed:', e);
    }

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    } finally {
      setUserRole(null);
      setAuthUserId(null);
      localStorage.removeItem('vynx_user');
    }
  }

  if (isLoading) return <GlobalLoader text="Loading..." />;

  return (
    <BrowserRouter>
      {/* Push notification initializer — requires Router context for navigate() */}
      <PushNotificationHandler userId={authUserId} />

      {/* In-app toast overlay for foreground notifications */}
      <NotificationToast />

      <Routes>
        <Route
          path="/"
          element={!userRole ? <LandingPage onEnterPortal={() => window.location.href='/login'} /> : <Navigate to={`/${userRole}`} replace />}
        />

        <Route
          path="/login"
          element={
            !userRole ? (
              Capacitor.isNativePlatform() ? <AuthGatewayApp /> : <AuthGateway />
            ) : (
              <Navigate to={`/${userRole}`} replace />
            )
          }
        />

        <Route
          path="/signup"
          element={
            !userRole ? (
              Capacitor.isNativePlatform() ? <AuthGatewayApp /> : <AuthGateway />
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
          <Route path="/agent" element={isNative ? <AgentHubApp onLogout={handleLogout} /> : <AgentHub onLogout={handleLogout} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={isNative ? <DashboardOverviewApp /> : <DashboardOverview />} />
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
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  </ThemeProvider>
);

export default App;
