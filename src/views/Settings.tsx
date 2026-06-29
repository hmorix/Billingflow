import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Mail, ShieldAlert, CheckCircle2, Upload, FileImage, KeyRound, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const Settings: React.FC = () => {
  const { apiFetch, organization, updateOrganization } = useAuth();

  // Profile Form States
  const [companyName, setCompanyName] = useState(organization?.name || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [taxId, setTaxId] = useState(organization?.taxId || '');
  const [phone, setPhone] = useState(organization?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Logo Upload States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [processedLogoBlob, setProcessedLogoBlob] = useState<Blob | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    organization?.logoUrl ? `${API_BASE_URL}${organization.logoUrl}` : null
  );
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState(false);

  // SMTP Settings States
  const [smtpHost, setSmtpHost] = useState(organization?.smtpHost || '');
  const [smtpPort, setSmtpPort] = useState(organization?.smtpPort || '587');
  const [smtpUser, setSmtpUser] = useState(organization?.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState(organization?.smtpFrom || '');
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSuccess, setSmtpSuccess] = useState(false);

  // SMTP Test States
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setError(null);

    try {
      await apiFetch('/api/organization/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: companyName,
          address,
          taxId,
          phone
        })
      });

      updateOrganization({
        name: companyName,
        address,
        taxId,
        phone
      });
      setProfileSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update organization profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Crop + resize logo to a square canvas (max 200×200px) before upload
  const processLogoImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const maxPx = 200;
        const outSize = Math.min(size, maxPx);
        const canvas = document.createElement('canvas');
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d')!;
        // Center-crop: cut equal amounts from each side
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);
        URL.revokeObjectURL(objectUrl);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob conversion failed'));
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for processing'));
      };
      img.src = objectUrl;
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoSuccess(false);
      try {
        const processed = await processLogoImage(file);
        setProcessedLogoBlob(processed);
        // Show the cropped preview
        setLogoPreview(URL.createObjectURL(processed));
      } catch {
        // Fallback to raw preview if processing fails
        setProcessedLogoBlob(null);
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) return;

    setLogoLoading(true);
    setLogoSuccess(false);
    setError(null);

    // Use the processed (cropped + resized) blob if available, else raw file
    const uploadBlob = processedLogoBlob ?? logoFile;
    const uploadName = logoFile.name.replace(/\.[^.]+$/, '') + '.png';

    const formData = new FormData();
    formData.append('logo', uploadBlob, uploadName);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/organization/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Logo upload failed.');

      updateOrganization({ logoUrl: data.logoUrl });
      // Show the uploaded logo via the R2 proxy URL
      setLogoPreview(`${API_BASE_URL}${data.logoUrl}`);
      setLogoSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleUpdateSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpLoading(true);
    setSmtpSuccess(false);
    setError(null);

    try {
      await apiFetch('/api/organization/smtp', {
        method: 'PUT',
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass: smtpPass || undefined, // Send password only if updated
          smtpFrom
        })
      });

      updateOrganization({
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpFrom,
        smtpHasPassword: smtpPass ? true : organization?.smtpHasPassword
      });
      setSmtpSuccess(true);
      setSmtpPass('');
    } catch (err: any) {
      setError(err.message || 'Failed to update SMTP configurations.');
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestLoading(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await apiFetch('/api/organization/smtp/test', {
        method: 'POST',
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass: smtpPass || undefined, // Test with current input or saved secret
          smtpFrom
        })
      });
      setTestResult({ type: 'success', message: response.message });
    } catch (err: any) {
      setTestResult({ type: 'error', message: err.message || 'SMTP Connection Test Failed.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }} className="text-gradient">
          Organization Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Configure company identities, bill headers, brand logo, and SMTP email parameters.
        </p>
      </div>

      {error && (
        <div className="fade-in" style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.15)', color: 'var(--danger)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Profile Edit Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <Building size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Billing Identity Profile</h4>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corporation LLC"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">VAT / Tax ID</label>
                  <input
                    type="text"
                    placeholder="US87654321"
                    className="form-input"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Contact</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 012-3456"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HQ Billing Address *</label>
                <textarea
                  required
                  placeholder="5th Ave, Floor 10, New York, NY 10001"
                  className="form-input"
                  rows={3}
                  style={{ resize: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                {profileSuccess ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved Successfully
                  </span>
                ) : <span></span>}

                <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </div>

          {/* SMTP Config Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <KeyRound size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>SMTP Mail Server Settings</h4>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
              Setup your own SMTP servers to send real invoice reminder emails to your clients. Leaving SMTP settings blank drops back to simulated logs.
            </p>

            <form onSubmit={handleUpdateSmtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SMTP Server Host</label>
                  <input
                    type="text"
                    placeholder="smtp.mailtrap.io"
                    className="form-input"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="text"
                    placeholder="587"
                    className="form-input"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SMTP Auth Username</label>
                  <input
                    type="text"
                    placeholder="api-key-user"
                    className="form-input"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SMTP Auth Password</label>
                  <input
                    type="password"
                    placeholder={organization?.smtpHasPassword ? '•••••••• (Saved)' : 'Enter password'}
                    className="form-input"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sender Email Address (From)</label>
                <input
                  type="email"
                  placeholder="billing@yourdomain.com"
                  className="form-input"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                />
              </div>

              {/* Test Connection Result alert */}
              {testResult && (
                <div style={{
                  background: testResult.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(225, 29, 72, 0.08)',
                  border: `1px solid ${testResult.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)'}`,
                  color: testResult.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  lineHeight: 1.4
                }}>
                  {testResult.type === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                {smtpSuccess ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Connection Saved
                  </span>
                ) : <span></span>}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    disabled={testLoading || !smtpHost || !smtpUser} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                    onClick={handleTestSmtp}
                  >
                    {testLoading ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button type="submit" disabled={smtpLoading} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                    {smtpLoading ? 'Saving...' : 'Save Config'}
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>

        {/* Right column: Branding logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <FileImage size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Brand Logo</h4>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Upload a PNG, JPG, or JPEG company logo. It will be <strong>automatically center-cropped to a square and resized to 200×200px</strong> before saving. This logo will appear on all generated PDF invoices.
            </p>

            {/* Current logo display */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Company Logo Preview" 
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Upload size={32} />
                  <span style={{ fontSize: '0.78rem' }}>No logo configured</span>
                </div>
              )}
            </div>

            <form onSubmit={handleLogoUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                id="logo-upload-input"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              
              <label 
                htmlFor="logo-upload-input" 
                className="btn btn-secondary" 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
              >
                <span>Select Logo File</span>
              </label>

              {logoFile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {logoFile.name}
                    </span>
                    <button type="submit" disabled={logoLoading} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      {logoLoading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                  </div>
                  {processedLogoBlob && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Auto-cropped to square &amp; resized to 200×200px — preview shown above
                    </span>
                  )}
                </div>
              )}

              {logoSuccess && (
                <span style={{ fontSize: '0.82rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'center' }}>
                  <CheckCircle2 size={16} /> Logo saved successfully
                </span>
              )}
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
