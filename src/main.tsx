import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './modules/ui';
import { LoginPage } from './modules/auth/LoginPage';
import { SignupPage } from './modules/auth/SignupPage';
import { VerifyEmailPage } from './modules/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './modules/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/auth/ResetPasswordPage';
import { SelectRolePage } from './modules/auth/SelectRolePage';
import { RequireAuth } from './modules/auth/RequireAuth';
import { AdminRoute } from './auth/AdminRoute';
import { AppLayout } from './modules/layout/AppLayout';
import { VendorDashboard } from './modules/vendor/VendorDashboard';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { SupportInboxPage } from './modules/admin/SupportInboxPage';
import { OrdersPage } from './modules/vendor/OrdersPage';
import { MenuPage } from './modules/vendor/MenuPage';
import { MenuManagePage } from './modules/vendor/MenuManagePage';
import { ReportsPage } from './modules/vendor/ReportsPage';
import { ProfilePage } from './modules/vendor/ProfilePage';
import { BrandingPage } from './modules/vendor/BrandingPage';
import { ModifiersPage } from './modules/vendor/ModifiersPage';
import { FeedbackPage } from './modules/vendor/FeedbackPage';
import { SupportPage } from './modules/vendor/SupportPage';
import { UsersPage } from './modules/admin/UsersPage';
import { RiderVerificationPage } from './modules/admin/RiderVerificationPage';
import { AdminOrdersPage } from './modules/admin/AdminOrdersPage';
import { CampaignsPage } from './modules/admin/CampaignsPage';
import { SettingsPage } from './modules/admin/SettingsPage';
import { AdminReportsPage } from './modules/admin/ReportsPage';
import { PayoutsPage } from './modules/admin/PayoutsPage';
import { RefundsPage } from './modules/admin/RefundsPage';
import { FeesPage } from './modules/admin/FeesPage';
import { ZonesPage } from './modules/admin/ZonesPage';

const router = createBrowserRouter([
  { path: '/login', element: <VendorDashboard /> },
  { path: '/signup', element: <AdminDashboard /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/select-role', element: <SelectRolePage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { element: <RequireAuth />, children: [
      { index: true, element: <VendorDashboard /> },
      { path: 'vendor', element: <VendorDashboard /> },
      { path: 'vendor/orders', element: <OrdersPage /> },
      { path: 'vendor/menu', element: <MenuPage /> },
      { path: 'vendor/menu-manage', element: <MenuManagePage /> },
      { path: 'vendor/reports', element: <ReportsPage /> },
      { path: 'vendor/profile', element: <ProfilePage /> },
      { path: 'vendor/branding', element: <BrandingPage /> },
      { path: 'vendor/modifiers', element: <ModifiersPage /> },
      { path: 'vendor/feedback', element: <FeedbackPage /> },
      { path: 'vendor/support', element: <SupportPage /> },
      { element: <AdminRoute />, children: [
        { path: 'admin', element: <AdminDashboard /> },
        { path: 'admin/users', element: <UsersPage /> },
        { path: 'admin/riders', element: <RiderVerificationPage /> },
        { path: 'admin/orders', element: <AdminOrdersPage /> },
        { path: 'admin/campaigns', element: <CampaignsPage /> },
        { path: 'admin/settings', element: <SettingsPage /> },
        { path: 'admin/reports', element: <AdminReportsPage /> },
        { path: 'admin/payouts', element: <PayoutsPage /> },
        { path: 'admin/refunds', element: <RefundsPage /> },
        { path: 'admin/fees', element: <FeesPage /> },
        { path: 'admin/support', element: <SupportInboxPage /> },
        { path: 'admin/zones', element: <ZonesPage /> }
      ]}
      ]}
    ]
  }
]);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}


