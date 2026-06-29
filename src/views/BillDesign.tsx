import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Palette, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  typography: string;
  badge: string;
}

export const BillDesign: React.FC = () => {
  const { apiFetch, organization, updateOrganization } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState<string>(
    organization?.invoiceTemplate || 'modern_purple'
  );
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templates: TemplateOption[] = [
    {
      id: 'modern_purple',
      name: 'Modern Purple',
      description: 'Clean modern layout featuring soft lavender accents, generous white space, and Indigo highlights. Perfect for modern SaaS and consulting.',
      primaryColor: '#6366f1',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      typography: 'Helvetica',
      badge: 'Default / Clean'
    },
    {
      id: 'minimalist_dark',
      name: 'Minimalist Dark',
      description: 'High-contrast monochrome design featuring a dark sidebar column, structured layout, and a modern payment QR code area.',
      primaryColor: '#1f2937',
      textColor: '#1f2937',
      backgroundColor: '#f3f4f6',
      typography: 'Helvetica Modern',
      badge: 'High Contrast'
    },
    {
      id: 'retro_bold',
      name: 'Retro Bold',
      description: 'A vintage-style typewriter design featuring a warm cream background, bold crimson red accents, and classic Courier grid outlines.',
      primaryColor: '#dc2626',
      textColor: '#171717',
      backgroundColor: '#faf6f0',
      typography: 'Courier (Monospace)',
      badge: 'Vintage Grid'
    },
    {
      id: 'corporate_crimson',
      name: 'Corporate Crimson',
      description: 'Formal purchase-order style design featuring solid crimson headers, a dedicated shipping/payment terms row, and an authorized signature area.',
      primaryColor: '#991b1b',
      textColor: '#111827',
      backgroundColor: '#ffffff',
      typography: 'Helvetica Formal',
      badge: 'Corporate PO'
    }
  ];

  const handleActivateTemplate = async (templateId: string) => {
    setLoadingTemplateId(templateId);
    setSuccessMessage(null);
    setError(null);

    try {
      const response = await apiFetch('/api/organization/template', {
        method: 'PUT',
        body: JSON.stringify({ template: templateId })
      });

      updateOrganization({ invoiceTemplate: templateId });
      setActiveTemplate(templateId);
      setSuccessMessage(`${templates.find(t => t.id === templateId)?.name} template has been activated successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice template.');
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }} className="text-gradient">
            Invoice Bill Design
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Choose the visual layout and color palette for all generated PDF invoices.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Palette size={16} />
          <span>Multi-Template Active</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="fade-in" style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.15)', color: 'var(--danger)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {successMessage} <Sparkles size={16} className="animate-pulse" />
          </span>
        </div>
      )}

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
        {templates.map((tpl) => {
          const isActive = activeTemplate === tpl.id;
          const isLoading = loadingTemplateId === tpl.id;

          return (
            <div 
              key={tpl.id} 
              className={`glass-card ${isActive ? 'active-border' : ''}`}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                padding: '24px',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                transform: isActive ? 'scale(1.02)' : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Active Banner Badge */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} />
                  <span>ACTIVE DESIGN</span>
                </div>
              )}

              {/* Template Header info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: isActive ? '12px' : '0' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {tpl.badge}
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tpl.name}
                </h4>
              </div>

              {/* HTML/CSS Miniature High-Fidelity Mockup */}
              <div style={{ 
                height: '180px', 
                background: tpl.backgroundColor, 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontSize: '5px',
                color: tpl.textColor,
                fontFamily: tpl.id === 'retro_bold' ? 'Courier New, monospace' : 'sans-serif',
                position: 'relative',
                overflow: 'hidden'
              }}>
                
                {/* 1. MODERN PURPLE MINI LAYOUT */}
                {tpl.id === 'modern_purple' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: tpl.primaryColor }} />
                        <span style={{ fontWeight: 'bold', fontSize: '6px' }}>Acme Corp</span>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '8px', color: tpl.primaryColor }}>INVOICE</span>
                    </div>
                    <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#9ca3af' }}>FROM:</div>
                        <div>Acme Corp LLC</div>
                        <div>HQ New York</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#9ca3af' }}>TO:</div>
                        <div>John Doe</div>
                        <div>Invoice No: INV-0001</div>
                      </div>
                    </div>
                    {/* Tiny Table */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ background: tpl.primaryColor, color: '#fff', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderRadius: '2px' }}>
                        <span>Description</span>
                        <span>Total</span>
                      </div>
                      <div style={{ padding: '2px 4px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
                        <span>Consulting Service</span>
                        <span>$1,500.00</span>
                      </div>
                    </div>
                    {/* Total Box */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <div style={{ background: tpl.primaryColor, color: '#fff', padding: '3px 8px', borderRadius: '2px', fontWeight: 'bold', fontSize: '6px' }}>
                        Total Due: $1,500.00
                      </div>
                    </div>
                  </>
                )}

                {/* 2. MINIMALIST DARK MINI LAYOUT */}
                {tpl.id === 'minimalist_dark' && (
                  <div style={{ display: 'flex', height: '100%', margin: '-12px' }}>
                    {/* Sidebar */}
                    <div style={{ width: '35%', background: '#1f2937', color: '#9ca3af', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fff' }} />
                      <div>
                        <div style={{ color: '#d1d5db', fontWeight: 'bold' }}>DATE</div>
                        <div style={{ fontSize: '4.5px' }}>June 29, 2026</div>
                      </div>
                      <div>
                        <div style={{ color: '#d1d5db', fontWeight: 'bold' }}>TO</div>
                        <div style={{ fontSize: '4.5px', color: '#fff' }}>John Doe</div>
                      </div>
                      {/* Tiny QR code */}
                      <div style={{ width: '14px', height: '14px', border: '1px solid #4b5563', marginTop: 'auto', display: 'flex', flexWrap: 'wrap', padding: '1px' }}>
                        <div style={{ width: '4px', height: '4px', background: '#fff' }} />
                        <div style={{ width: '4px', height: '4px' }} />
                        <div style={{ width: '4px', height: '4px', background: '#fff' }} />
                        <div style={{ width: '4px', height: '4px', background: '#fff' }} />
                      </div>
                    </div>
                    {/* Main Side */}
                    <div style={{ width: '65%', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '6px' }}>Acme Corporation</div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '4px' }}>INVOICE</div>
                      </div>
                      {/* Table */}
                      <div style={{ width: '100%' }}>
                        <div style={{ background: '#1f2937', color: '#fff', padding: '2px 4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Description</span>
                          <span>Total</span>
                        </div>
                        <div style={{ padding: '2px 4px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                          <span>Consulting</span>
                          <span>$1,500.00</span>
                        </div>
                      </div>
                      {/* Total */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold', fontSize: '6.5px', borderTop: '1px solid #111827', paddingTop: '2px' }}>
                        Total: $1,500.00
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. RETRO BOLD MINI LAYOUT */}
                {tpl.id === 'retro_bold' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: tpl.primaryColor, lineHeight: 1 }}>INVOICE</div>
                        <div style={{ fontSize: '4.5px', marginTop: '3px' }}>#INV-0001</div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 'bold' }}>ACME &amp; CO.</div>
                    </div>
                    <div style={{ height: '1px', background: '#171717', margin: '3px 0' }} />
                    {/* Boxed Grid Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #171717', marginTop: '4px' }}>
                      <div style={{ display: 'flex', borderBottom: '1px solid #171717', fontWeight: 'bold', background: 'rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '65%', padding: '2px', borderRight: '1px solid #171717' }}>DESCRIPTION</div>
                        <div style={{ width: '35%', padding: '2px', textAlign: 'right' }}>TOTAL</div>
                      </div>
                      <div style={{ display: 'flex', borderBottom: '1px solid #171717' }}>
                        <div style={{ width: '65%', padding: '2px', borderRight: '1px solid #171717' }}>CONSULTING SERVICE</div>
                        <div style={{ width: '35%', padding: '2px', textAlign: 'right' }}>1,500.00</div>
                      </div>
                      <div style={{ display: 'flex', fontWeight: 'bold' }}>
                        <div style={{ width: '65%', padding: '2px', borderRight: '1px solid #171717', textAlign: 'right', color: tpl.primaryColor }}>GRAND TOTAL</div>
                        <div style={{ width: '35%', padding: '2px', textAlign: 'right', color: tpl.primaryColor }}>$1,500.00</div>
                      </div>
                    </div>
                    {/* Sign Line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>TERM:</div>
                        <div>30 DAYS NET</div>
                      </div>
                      <div style={{ textAlign: 'center', width: '60px' }}>
                        <div style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', color: tpl.primaryColor, fontSize: '6px' }}>Acme &amp; Co.</div>
                        <div style={{ height: '0.5px', background: '#171717', margin: '1px 0' }} />
                        <div style={{ fontSize: '4px', fontWeight: 'bold' }}>MANAGER</div>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. CORPORATE CRIMSON MINI LAYOUT */}
                {tpl.id === 'corporate_crimson' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ width: '10px', height: '10px', background: tpl.primaryColor }} />
                        <span style={{ fontWeight: 'bold', color: tpl.primaryColor, fontSize: '6px' }}>ACME STATIONERY</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '5px', fontWeight: 'bold', color: tpl.primaryColor }}>December 18, 2021</div>
                        <div style={{ fontSize: '4px' }}>Purchase Order Date</div>
                      </div>
                    </div>
                    {/* Crimson Header Bar */}
                    <div style={{ background: tpl.primaryColor, color: '#fff', padding: '3px 6px', fontWeight: 'bold', fontSize: '6px', marginTop: '4px' }}>
                      PURCHASE ORDER  #1258820
                    </div>
                    {/* Shipping Row */}
                    <div style={{ display: 'flex', background: '#f3f4f6', padding: '2px', fontSize: '4.5px', marginTop: '4px', justifyContent: 'space-between' }}>
                      <div><strong>VIA:</strong> DHL</div>
                      <div><strong>PAYMENT:</strong> NET 30</div>
                      <div><strong>DELIVERY:</strong> 2021-12-31</div>
                    </div>
                    {/* Table */}
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ background: tpl.primaryColor, color: '#fff', padding: '2px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>DESCRIPTION</span>
                        <span>TOTAL</span>
                      </div>
                      <div style={{ padding: '2px', display: 'flex', justifyContent: 'space-between', background: '#f9fafb' }}>
                        <span>Item from stock</span>
                        <span>$1,500.00</span>
                      </div>
                    </div>
                    {/* Bottom thank you / sig */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: tpl.primaryColor }}>THANK YOU</span>
                      <div style={{ borderTop: '0.5px solid #991b1b', width: '50px', textAlign: 'center', fontSize: '4px', paddingTop: '1px' }}>
                        AUTH SIGNATURE
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Description */}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, flexGrow: 1 }}>
                {tpl.description}
              </p>

              {/* Details footer */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '16px',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: tpl.primaryColor }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{tpl.typography}</span>
                </div>

                <button
                  type="button"
                  disabled={isActive || isLoading}
                  onClick={() => handleActivateTemplate(tpl.id)}
                  className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                >
                  {isLoading ? 'Activating...' : isActive ? 'Active ✓' : 'Activate Template'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
