import React, { useRef, useState } from 'react';
import { X, Check, AlertCircle, CloudUpload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../api';

export interface UploadedLead {
  id: string;
  name: string;
  number: string;
  email?: string;
  company?: string;
  status: 'New' | 'Called' | 'Qualified' | 'Bad Number' | 'DNC';
  score: number;
}

interface ExcelUploadProps {
  onLeadsLoaded: (leads: UploadedLead[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onLeadsLoaded }) => {
  const [file,         setFile]         = useState<File | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);
  const [leadsToSync,  setLeadsToSync]  = useState<UploadedLead[]>([]);
  const [isSyncing,    setIsSyncing]    = useState(false);
  const [isDragging,   setIsDragging]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const workbook  = XLSX.read(event.target?.result as ArrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData  = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (!jsonData || jsonData.length === 0) {
          setError('No data found in the file');
          setLoading(false);
          return;
        }

        const leads: UploadedLead[] = jsonData.map((row, index) => ({
          id:      `lead-${Date.now()}-${index}`,
          name:    row['Name'] || row['name'] || row['CONTACT_NAME'] || `Lead ${index + 1}`,
          number:  row['Phone'] || row['phone'] || row['PHONE_NUMBER'] || '',
          email:   row['Email'] || row['email'] || row['EMAIL'] || undefined,
          company: row['Company'] || row['company'] || row['COMPANY'] || undefined,
          status:  'New' as const,
          score:   Math.floor(Math.random() * 20),
        })).filter(lead => lead.number);

        if (leads.length === 0) {
          setError('No valid phone numbers found. Column should be named "Phone".');
          setLoading(false);
          return;
        }

        setLeadsToSync(leads);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setError('Error parsing file. Ensure columns are: Name, Phone (Email, Company optional)');
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleSync = async () => {
    if (leadsToSync.length === 0) return;
    setIsSyncing(true);
    try {
      onLeadsLoaded(leadsToSync);
      await api.post('/leads/bulk', { leads: leadsToSync });
      setSuccess(true);
      setFile(null);
      setLeadsToSync([]);
    } catch {
      setError('Failed to upload leads to server. Leads added locally.');
      setSuccess(true);
      setFile(null);
      setLeadsToSync([]);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Upload Card */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Upload File</h2>
          <span className="badge badge-gray">Excel / CSV</span>
        </div>
        <div className="section-body">
          {/* Drop Zone */}
          <div
            id="upload-dropzone"
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--purple-200)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'var(--accent-primary-light)' : 'var(--bg-page)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: 'var(--radius-xl)',
              background: 'var(--accent-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FileSpreadsheet size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              {isDragging ? 'Drop your file here!' : 'Click to upload or drag & drop'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Excel (.xlsx, .xls) or CSV files
            </p>
            <p style={{ color: 'var(--text-placeholder)', fontSize: '12px', marginTop: '8px' }}>
              Required columns: <strong style={{ color: 'var(--accent-primary)' }}>Name</strong>, <strong style={{ color: 'var(--accent-primary)' }}>Phone</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;Optional: Email, Company
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="file-input"
          />

          {/* File Selected */}
          {file && (
            <div style={{
              marginTop: '16px', padding: '12px 16px',
              background: 'var(--accent-primary-light)', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--purple-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={18} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>{file.name}</span>
              </div>
              {loading && (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid var(--purple-200)', borderTopColor: 'var(--accent-primary)',
                  animation: 'spin 0.9s linear infinite',
                }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview & Sync */}
      {leadsToSync.length > 0 && (
        <div className="section-card animate-in">
          <div className="section-header">
            <h2 className="section-title">Ready to Import</h2>
            <span className="badge badge-success">{leadsToSync.length} leads found</span>
          </div>
          <div className="section-body">
            {/* Preview Table */}
            <div style={{ overflowX: 'auto', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }} className="custom-scrollbar">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsToSync.slice(0, 10).map(lead => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 600 }}>{lead.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{lead.number}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{lead.email || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{lead.company || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leadsToSync.length > 10 && (
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '8px' }}>
                  ...and {leadsToSync.length - 10} more leads
                </p>
              )}
            </div>

            <button
              id="sync-leads-btn"
              onClick={handleSync}
              disabled={isSyncing}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isSyncing ? (
                <>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.9s linear infinite' }} />
                  Importing...
                </>
              ) : (
                <><CloudUpload size={16} />Import {leadsToSync.length} Leads to Dashboard</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error animate-in">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Success */}
      {success && leadsToSync.length === 0 && (
        <div className="alert alert-success animate-in">
          <Check size={15} style={{ flexShrink: 0 }} />
          <span>Leads imported successfully! Check your Call Queue in the Dialer.</span>
        </div>
      )}

      {/* Format Guide */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">File Format Guide</h2>
        </div>
        <div className="section-body">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name <span style={{ color: '#dc2626', fontWeight: 700 }}>*</span></th>
                  <th>Phone <span style={{ color: '#dc2626', fontWeight: 700 }}>*</span></th>
                  <th>Email</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>John Doe</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>+15551234567</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>john@example.com</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Acme Corp</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Jane Smith</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>+15559876543</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>*</span> Required columns
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
