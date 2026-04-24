import React, { useState } from 'react';
import { Search, Download, Trash2, Phone, Mail, Building2, Filter, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export interface GeneratedLead {
  id: string;
  name: string;
  number: string;
  email?: string;
  company?: string;
  callDuration: number;
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
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy,       setSortBy]       = useState<'date' | 'duration' | 'name'>('date');

  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.number.includes(searchTerm) ||
        (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':     return new Date(b.callDate).getTime() - new Date(a.callDate).getTime();
        case 'duration': return b.callDuration - a.callDuration;
        case 'name':     return a.name.localeCompare(b.name);
        default:         return 0;
      }
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Qualified':      return 'badge badge-success';
      case 'Not Interested': return 'badge badge-danger';
      case 'Callback Later': return 'badge badge-warning';
      default:               return 'badge badge-gray';
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
        [lead.name, lead.number, lead.email || '', lead.company || '', lead.status,
          formatDuration(lead.callDuration), lead.callDate, lead.notes || '']
          .map(f => `"${f}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `call-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const qualified    = leads.filter(l => l.status === 'Qualified').length;
  const totalTime    = leads.reduce((acc, l) => acc + l.callDuration, 0);
  const conversion   = leads.length > 0 ? Math.round((qualified / leads.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Calls',      value: leads.length,               color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)', icon: Phone },
          { label: 'Qualified',        value: qualified,                  color: '#059669',               bg: '#ecfdf5',                     icon: CheckCircle },
          { label: 'Total Call Time',  value: formatDuration(totalTime),  color: '#2563eb',               bg: '#eff6ff',                     icon: Clock },
          { label: 'Conversion Rate',  value: `${conversion}%`,           color: '#7c3aed',               bg: '#f5f3ff',                     icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="section-card">
        <div className="section-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              id="analytics-search"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '34px' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input"
              style={{ width: 'auto' }}
              id="status-filter"
            >
              <option>All</option>
              <option>Qualified</option>
              <option>Not Interested</option>
              <option>Callback Later</option>
              <option>Bad Number</option>
              <option>No Answer</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="input"
            style={{ width: 'auto' }}
            id="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Export */}
          <button id="export-csv-btn" onClick={handleExport} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="section-card">
        {filteredLeads.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Phone size={44} style={{ color: 'var(--purple-200)', margin: '0 auto 12px' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>No calls found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {leads.length === 0 ? 'Make some calls to see analytics here.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'var(--accent-primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)',
                          flexShrink: 0,
                        }}>
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{lead.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Phone size={9} />{lead.number}
                            </span>
                            {lead.email && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Mail size={9} />{lead.email}
                              </span>
                            )}
                            {lead.company && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Building2 size={9} />{lead.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadge(lead.status)}>{lead.status}</span>
                    </td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {formatDuration(lead.callDuration)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(lead.callDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {lead.notes ? (
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {lead.notes}
                        </span>
                      ) : <span style={{ color: 'var(--text-placeholder)' }}>—</span>}
                    </td>
                    <td>
                      <button
                        id={`delete-lead-${lead.id}`}
                        onClick={() => onDeleteLead(lead.id)}
                        style={{
                          width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid #fca5a5', background: '#fef2f2',
                          color: '#dc2626', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedLeads;
