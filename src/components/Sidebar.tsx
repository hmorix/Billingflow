import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, Users, CreditCard, LogOut, Receipt, Shield, Settings as SettingsIcon, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, organization, logout } = useAuth();

  const getPlanBadge = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'growth':
        return <span className="badge badge-info" style={{ marginLeft: '8px' }}>Growth</span>;
      case 'enterprise':
        return <span className="badge badge-success" style={{ marginLeft: '8px' }}>Enterprise</span>;
      default:
        return <span className="badge badge-warning" style={{ marginLeft: '8px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>Free Tier</span>;
    }
  };

  return (
    <aside className="sidebar glass-card" style={{
      width: '280px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <Receipt size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BILLINGFLOW
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>HMORIX Invoice Manager</p>
          </div>
        </div>

        {/* Tenant Profile (Org) */}
        {organization && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{organization.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tier:</span>
              {getPlanBadge(organization.subscriptionPlan)}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FileSpreadsheet size={18} />
            <span>Invoices</span>
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Clients</span>
          </NavLink>
          <NavLink
            to="/settings/design"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Palette size={18} />
            <span>Bill Design</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/billing"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <CreditCard size={18} />
            <span>Plan & Subscriptions</span>
          </NavLink>
          {user?.role === 'superadmin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Shield size={18} />
              <span>Admin Control</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* User Session Info */}
      {user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
          </div>
          <button onClick={logout} className="btn btn-danger" style={{ width: '100%', padding: '10px' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
