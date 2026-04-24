import React, { useState } from 'react';
import { User, Phone, Search, ChevronRight, TrendingUp } from 'lucide-react';

export interface Lead {
  id: number;
  name: string;
  number: string;
  status: 'New' | 'Called' | 'Qualified' | 'Bad Number' | 'DNC';
  score: number;
}

interface LeadListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Qualified':   return 'badge badge-success';
    case 'Bad Number':  return 'badge badge-danger';
    case 'Called':      return 'badge badge-warning';
    case 'DNC':         return 'badge badge-info';
    default:            return 'badge badge-gray';
  }
};

const LeadList: React.FC<LeadListProps> = ({ leads, onSelectLead }) => {
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.number.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total:     leads.length,
    new:       leads.filter(l => l.status === 'New').length,
    qualified: leads.filter(l => l.status === 'Qualified').length,
    called:    leads.filter(l => l.status === 'Called').length,
  };

  const statuses = ['All', 'New', 'Called', 'Qualified', 'Bad Number', 'DNC'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: 'Total',     value: stats.total,     color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' },
          { label: 'Qualified', value: stats.qualified, color: '#059669',               bg: '#ecfdf5' },
          { label: 'Called',    value: stats.called,    color: '#d97706',               bg: '#fffbeb' },
          { label: 'New',       value: stats.new,       color: '#2563eb',               bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 'var(--radius-md)',
            padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: s.color, opacity: 0.7, marginTop: '2px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="input"
          style={{ paddingLeft: '34px', fontSize: '13px' }}
          id="lead-search"
        />
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid',
              fontSize: '11px', fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: statusFilter === status ? 'var(--accent-primary)' : 'white',
              borderColor: statusFilter === status ? 'var(--accent-primary)' : 'var(--border-card)',
              color: statusFilter === status ? 'white' : 'var(--text-muted)',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        {filteredLeads.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '24px' }}>
            <User size={32} style={{ color: 'var(--purple-200)', marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No leads match your search</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredLeads.map(lead => (
              <button
                key={lead.id}
                id={`lead-${lead.id}`}
                onClick={() => onSelectLead(lead)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 14px',
                  background: 'white',
                  border: '1.5px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-primary-light)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-card)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'white';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '14px', fontWeight: 700,
                  color: 'var(--accent-primary)',
                }}>
                  {lead.name.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px', marginBottom: '2px' }}>
                    {lead.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <Phone size={10} />
                    <span style={{ fontFamily: 'monospace' }}>{lead.number}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={getStatusBadge(lead.status)} style={{ fontSize: '10px' }}>{lead.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <TrendingUp size={9} />
                    {lead.score}
                  </div>
                </div>

                <ChevronRight size={14} style={{ color: 'var(--purple-300)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadList;
