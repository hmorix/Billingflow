import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, FileDown, Mail, CheckCircle2, Trash2, Eye, Receipt, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  discount: number;
  currency: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
}

export const Invoices: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Payment modal state
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/api/invoices');
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="badge badge-success">Paid</span>;
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>;
      case 'sent':
        return <span className="badge badge-info">Sent</span>;
      default:
        return <span className="badge badge-warning">Draft</span>;
    }
  };

  const handleDownloadPDF = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await apiFetch(`/api/invoices/${id}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Error: Failed to generate and download PDF invoice.');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      const res = await apiFetch(`/api/invoices/${id}/reminder`, {
        method: 'POST'
      });
      alert(`Reminder email logged successfully!\nTo: ${res.log.to_email}\nSubject: ${res.log.subject}`);
      fetchInvoices();
    } catch (err: any) {
      alert(`Failed to send reminder: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await apiFetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      });
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      alert('Error: Failed to delete invoice.');
    }
  };

  const openPaymentModal = (invoice: Invoice) => {
    setPaymentInvoice(invoice);
    setPaymentMethod('stripe');
    setPaymentNotes('');
    setIsPaying(false);
  };
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;

    setIsPaying(true);
    try {
      await apiFetch(`/api/invoices/${paymentInvoice.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod,
          notes: paymentNotes
        })
      });

      // Confetti burst on successful payment!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981']
      });

      setPaymentInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment.');
    } finally {
      setIsPaying(false);
    }
  };

  // Filtering invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return inv.status === activeTab && matchesSearch;
  });

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }} className="text-gradient">
            Invoice Manager
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Draft, track collections, send reminders, and record incoming payments.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
          <Plus size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px'
        }}>
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            placeholder="Search invoice or client..."
            className="form-input"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: '70px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }} className="pulse-glow"></div>
          ))}
        </div>
      ) : filteredInvoices.length > 0 ? (
        <div className="custom-table-container fade-in">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Client</th>
                <th>Issued</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span 
                      style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => navigate(`/invoices/edit/${inv.id}`)}
                    >
                      {inv.invoice_number}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.client_name}</span>
                      {inv.client_company && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{inv.client_company}</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>{(inv.currency || 0).toLocaleString()}</td>

                  <td style={{ textAlign: 'right' }}>

                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px' }}
                        onClick={() => navigate(`/invoices/edit/${inv.id}`)}
                        title="Edit Invoice"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleDownloadPDF(inv.id, inv.invoice_number)}
                        title="Download PDF"
                      >
                        <FileDown size={14} />

                        
                      </button>
                      {inv.status !== 'paid' && (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', color: 'var(--accent)' }}
                            onClick={() => handleSendReminder(inv.id)}
                            title="Send Email Reminder"
                          >
                            <Mail size={14} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', color: 'var(--success)' }}
                            onClick={() => openPaymentModal(inv)}
                            title="Record Payment"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleDelete(inv.id)}
                        title="Delete Invoice"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
          <Receipt size={40} color="var(--text-muted)" />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No invoices found</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first invoice to bill a client.'}
            </p>
          </div>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => navigate('/invoices/new')}>
              <Plus size={16} />
              <span>Create First Invoice</span>
            </button>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Record Payment</h4>
              <button 
                onClick={() => setPaymentInvoice(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Record a payment collections receipt for <strong style={{ color: 'var(--text-primary)' }}>Invoice {paymentInvoice.invoice_number}</strong> issued to {paymentInvoice.client_name}.
            </p>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="stripe">Stripe Checkout</option>
                  <option value="bank_transfer">Bank Wire / ACH</option>
                  <option value="cash">Cash Payment</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="Tx ID, Bank Ref, etc."
                  className="form-input"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentInvoice(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={isPaying} className="btn btn-accent" style={{ background: 'linear-gradient(135deg, var(--success), #059669)', border: 'none' }}>
                  {isPaying ? 'Recording...' : 'Confirm Paid'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
