import React, { useRef, useState } from 'react';
import { Upload, X, Check, AlertCircle, CloudUpload } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [leadsToSync, setLeadsToSync] = useState<UploadedLead[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result as ArrayBuffer);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          if (!jsonData || jsonData.length === 0) {
            setError('No data found in the Excel file');
            setLoading(false);
            return;
          }

          // Map Excel columns to our Lead interface
          const leads: UploadedLead[] = jsonData.map((row, index) => ({
            id: `lead-${Date.now()}-${index}`,
            name: row['Name'] || row['name'] || row['CONTACT_NAME'] || `Lead ${index + 1}`,
            number: row['Phone'] || row['phone'] || row['PHONE_NUMBER'] || '',
            email: row['Email'] || row['email'] || row['EMAIL'] || undefined,
            company: row['Company'] || row['company'] || row['COMPANY'] || undefined,
            status: 'New' as const,
            score: Math.floor(Math.random() * 20),
          })).filter(lead => lead.number); // Filter out entries without phone numbers

          if (leads.length === 0) {
            setError('No valid phone numbers found in the Excel file');
            setLoading(false);
            return;
          }

          setLeadsToSync(leads);
          setSuccess(true);
          // Don't auto-load, let user choose to sync
          // onLeadsLoaded(leads); 

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err) {
          setError('Error parsing Excel file. Please ensure it has columns: Name, Phone');
          console.error(err);
        }
        setLoading(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      setError('Error reading file');
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (leadsToSync.length === 0) return;

    setIsSyncing(true);
    try {
      // Send to local app state
      onLeadsLoaded(leadsToSync);

      // Send to backend
      await api.post('/leads/bulk', { leads: leadsToSync });

      setSuccess(true);
      setFile(null);
      setLeadsToSync([]);
      alert(`Successfully synced ${leadsToSync.length} leads to server!`);
    } catch (error) {
      console.error('Failed to sync leads:', error);
      setError('Failed to upload leads to server.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload size={20} className="text-primary" />
          Import Leads from Excel
        </h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-primary/5"
        >
          <Upload size={40} className="mx-auto mb-3 text-primary/60" />
          <p className="text-text font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-text-muted text-sm">Supported formats: Excel (.xlsx, .xls, .csv)</p>
          <p className="text-text-muted text-xs mt-2">Columns needed: Name, Phone (Email and Company optional)</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
            <span className="text-text text-sm">{file.name}</span>
            {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </div>
        )}

        {leadsToSync.length > 0 && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-text-muted mb-3">Found {leadsToSync.length} leads in file.</p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : <CloudUpload size={18} />}
              {isSyncing ? 'Syncing...' : 'Upload to Server & Dashboard'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X size={16} className="hover:text-red-300" />
            </button>
          </div>
        )}

        {success && leadsToSync.length === 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <Check size={18} className="text-green-400" />
            <span className="text-green-400 text-sm">Leads imported successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUpload;
