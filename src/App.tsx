import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Clients } from './views/Clients';
import { Invoices } from './views/Invoices';
import { InvoiceEdit } from './views/InvoiceEdit';
import { Billing, CheckoutMock, PortalMock } from './views/Billing';
import { Settings } from './views/Settings';
import { BillDesign } from './views/BillDesign';
import { TemplateBuilder } from './views/TemplateBuilder';
import { Admin } from './views/Admin';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090d',
        color: '#fff',
        fontFamily: 'var(--font-sans, sans-serif)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(255,255,255,0.06)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Authenticating Tenant...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
      <Routes>
        {/* Full-screen mock stripe screens (Bypass sidebar structure) */}
        <Route path="/billing/checkout-mock" element={<CheckoutMock />} />
        <Route path="/billing/portal-mock" element={<PortalMock />} />
        <Route path="/settings/design/builder" element={<TemplateBuilder />} />
        <Route path="/settings/design/builder/:id" element={<TemplateBuilder />} />

        {/* Regular Sidebar Navigation Pages */}
        <Route path="*" element={
          <div style={{ display: 'flex', width: '100%' }}>
            <Sidebar />
            <main style={{
              flex: 1,
              marginLeft: '280px',
              minHeight: '100vh',
              background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.03) 0%, transparent 50%)',
              position: 'relative'
            }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/new" element={<InvoiceEdit />} />
                <Route path="/invoices/edit/:id" element={<InvoiceEdit />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/design" element={<BillDesign />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;
