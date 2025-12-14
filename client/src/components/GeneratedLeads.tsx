import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, Phone, Mail, Building2 } from 'lucide-react';

export interface GeneratedLead {
  id: string;
  name: string;
  number: string;
  email?: string;
  company?: string;
  callDuration: number; // in seconds
  status: 'Qualified' | 'Not Interested' | 'Callback Later' | 'Bad Number' | 'No Answer';
  notes?: string;
  callDate: string;
  recordingUrl?: string;
}

interface GeneratedLeadsProps {
  leads: GeneratedLead[];
  onDeleteLead: (id: string) => void;
}

const GeneratedLeads: React.FC<GeneratedLeadsProps> = ({ leads, onDeleteLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'name'>('date');

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.number.includes(searchTerm) ||
        (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.callDate).getTime() - new Date(a.callDate).getTime();
        case 'duration':
          return b.callDuration - a.callDuration;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified':
        return 'badge-success';
      case 'Not Interested':
        return 'badge-danger';
      case 'Callback Later':
        return 'badge-warning';
      case 'Bad Number':
      case 'No Answer':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Phone', 'Email', 'Company', 'Status', 'Call Duration', 'Call Date', 'Notes'].join(','),
      ...filteredLeads.map(lead =>
        [
          lead.name,
          lead.number,
          lead.email || '',
          lead.company || '',
          lead.status,
          formatDuration(lead.callDuration),
          lead.callDate,
          lead.notes || '',
        ].map(field => `"${field}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Generated Leads</h2>
        <p className="text-text-muted">Leads captured and qualified from your calls</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-slate-400 text-sm mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-white">{leads.length}</p>
        </div>
        <div className="card">
          <p className="text-text-muted text-sm mb-1">Qualified</p>
          <p className="text-2xl font-bold text-green-400">
            {leads.filter(l => l.status === 'Qualified').length}
          </p>
        </div>
        <div className="card">
          <p className="text-text-muted text-sm mb-1">Total Call Time</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatDuration(leads.reduce((acc, l) => acc + l.callDuration, 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-text-muted text-sm mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-400">
            {leads.length > 0
              ? Math.round((leads.filter(l => l.status === 'Qualified').length / leads.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <button onClick={handleExport} className="btn-primary flex items-center gap-2">
              <Download size={18} />
              Export CSV
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option>All</option>
                <option>Qualified</option>
                <option>Not Interested</option>
                <option>Callback Later</option>
                <option>Bad Number</option>
                <option>No Answer</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input"
              >
                <option value="date">Sort by Date</option>
                <option value="duration">Sort by Duration</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredLeads.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <Phone size={48} className="text-text-muted/40 mb-4" />
            <p className="text-text-muted mb-2">No leads found</p>
            <p className="text-text-muted text-sm">Make some calls to generate leads</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="card hover:border-slate-600 cursor-pointer group bg-slate-900 border-slate-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Phone size={14} />
                        {lead.number}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {lead.email}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-1">
                          <Building2 size={14} />
                          {lead.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(lead.status)}>
                      {lead.status}
                    </div>
                    <button
                      onClick={() => onDeleteLead(lead.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-slate-400 pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-text-muted">Call Duration:</span>
                    <span className="ml-2 text-text">{formatDuration(lead.callDuration)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Date:</span>
                    <span className="ml-2 text-text">{new Date(lead.callDate).toLocaleDateString()}</span>
                  </div>
                  {lead.notes && (
                    <div>
                      <span className="text-text-muted">Notes:</span>
                      <span className="ml-2 text-text">{lead.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedLeads;
