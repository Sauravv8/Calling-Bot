import React, { useState } from 'react';
import { User, Phone, Search, ChevronRight } from 'lucide-react';

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Qualified': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'badge-success' };
        case 'Bad Number': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'badge-danger' };
        case 'Called': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'badge-warning' };
        case 'DNC': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'badge-info' };
        default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-text-muted', badge: 'badge' };
    }
};

const LeadList: React.FC<LeadListProps> = ({ leads, onSelectLead }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.number.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'New').length,
        qualified: leads.filter(l => l.status === 'Qualified').length,
        called: leads.filter(l => l.status === 'Called').length,
    };

    const statuses = ['All', 'New', 'Called', 'Qualified', 'Bad Number', 'DNC'];

    return (
        <div className="h-full flex flex-col">
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center">
                    <div className="font-bold text-blue-300 text-lg">{stats.total}</div>
                    <div className="text-text-muted text-xs">Total Leads</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <div className="font-bold text-green-300 text-lg">{stats.qualified}</div>
                    <div className="text-text-muted text-xs">Qualified</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="font-bold text-yellow-300 text-lg">{stats.called}</div>
                    <div className="text-text-muted text-xs">Called</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center">
                    <div className="font-bold text-purple-300 text-lg">{stats.new}</div>
                    <div className="text-text-muted text-xs">New</div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input w-full pl-10"
                    />
                </div>
            </div>

            {/* Status Filter */}
            <div className="mb-4 flex flex-wrap gap-2">
                {statuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${statusFilter === status
                            ? 'bg-blue-500/40 border border-blue-500/60 text-blue-300'
                            : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <User size={40} className="text-slate-600 mb-2" />
                        <p className="text-slate-400 text-sm">No leads match your search</p>
                    </div>
                ) : (
                    filteredLeads.map(lead => {
                        const colors = getStatusColor(lead.status);
                        return (
                            <button
                                key={lead.id}
                                onClick={() => onSelectLead(lead)}
                                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group hover:scale-102 ${colors.bg
                                    } ${colors.border} hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/20`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white group-hover:text-blue-300">{lead.name}</h4>
                                        <div className="flex items-center gap-1 text-slate-400 mt-1">
                                            <Phone size={14} />
                                            <span className="text-sm font-mono">{lead.number}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 mt-1" />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className={colors.badge}>
                                        {lead.status}
                                    </span>
                                    <span className="text-xs text-slate-500">Score: {lead.score}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LeadList;
