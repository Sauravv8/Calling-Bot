import { useState } from 'react';
import Dialer from './components/Dialer';
import LeadList, { type Lead } from './components/LeadList';
import ActiveCall from './components/ActiveCall';
import Settings from './components/Settings';
import ExcelUpload, { type UploadedLead } from './components/ExcelUpload';
import GeneratedLeads, { type GeneratedLead } from './components/GeneratedLeads';
import PromptEditor from './components/PromptEditor';
import {
  Phone,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  LayoutDashboard,
  PhoneCall,
  TrendingUp,
} from 'lucide-react';

// Mock Data
const MOCK_LEADS: Lead[] = [
  { id: 1, name: 'John Doe',       number: '+15551234567', status: 'New',       score: 10 },
  { id: 2, name: 'Alice Smith',    number: '+15559876543', status: 'Called',    score: 5  },
  { id: 3, name: 'Bob Johnson',    number: '+15551112222', status: 'Qualified', score: 20 },
  { id: 4, name: 'Emma Wilson',    number: '+15553334444', status: 'New',       score: 12 },
  { id: 5, name: 'Michael Brown',  number: '+15555556666', status: 'Bad Number',score: 0  },
];

type ViewType = 'dashboard' | 'dialer' | 'excel-upload' | 'leads-generated' | 'prompt';

function App() {
  const [currentView, setCurrentView]         = useState<ViewType>('dashboard');
  const [activeNumber, setActiveNumber]       = useState('');
  const [activeLead, setActiveLead]           = useState<Lead | null>(null);
  const [leads, setLeads]                     = useState<Lead[]>(MOCK_LEADS);
  const [generatedLeads, setGeneratedLeads]   = useState<GeneratedLead[]>([]);
  const [showSettings, setShowSettings]       = useState(false);
  const [showCall, setShowCall]               = useState(false);

  const handleCall = (number: string) => {
    setActiveNumber(number);
    setShowCall(true);
  };

  const handleHangup = () => {
    setShowCall(false);
    setActiveNumber('');
    setActiveLead(null);
  };

  const handleSaveCallNotes = (notes: string, status: string) => {
    if (activeLead) {
      const newLead: GeneratedLead = {
        id: `gen-${Date.now()}`,
        name: activeLead.name,
        number: activeLead.number,
        callDuration: 0,
        status: status as any,
        notes,
        callDate: new Date().toISOString(),
      };
      setGeneratedLeads(prev => [newLead, ...prev]);
    }
  };

  const handleLeadSelect = (lead: Lead) => {
    setActiveLead(lead);
    handleCall(lead.number);
  };

  const handleLeadsLoaded = (uploadedLeads: UploadedLead[]) => {
    const newLeads: Lead[] = uploadedLeads.map((lead, index) => ({
      id: Math.max(...leads.map(l => l.id), 0) + index + 1,
      name: lead.name,
      number: lead.number,
      status: 'New',
      score: lead.score,
    }));
    setLeads(prev => [...prev, ...newLeads]);
  };

  const handleDeleteGeneratedLead = (id: string) => {
    setGeneratedLeads(prev => prev.filter(lead => lead.id !== id));
  };

  // ---- Page Labels ----
  const pageLabels: Record<ViewType, string> = {
    dashboard:       'Dashboard',
    dialer:          'Dialer',
    'excel-upload':  'Import Leads',
    'leads-generated': 'Call Analytics',
    prompt:          'AI Prompt',
  };

  // ---- Stats ----
  const totalCalls     = generatedLeads.length;
  const activeCalls    = showCall ? 1 : 0;
  const completedCalls = generatedLeads.filter(l => l.status !== 'Callback Later').length;
  const qualified      = generatedLeads.filter(l => l.status === 'Qualified').length;
  const conversionRate = totalCalls > 0 ? Math.round((qualified / totalCalls) * 100) : 0;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: 'var(--bg-page)' }}>

      {/* ====== SIDEBAR ====== */}
      <aside className="sidebar animate-slide">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-wordmark">
            02<span>launch</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>AI Cold Calling Suite</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main</p>

          {/* Dashboard */}
          <button
            id="nav-dashboard"
            onClick={() => setCurrentView('dashboard')}
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <LayoutDashboard size={15} />
            </span>
            Dashboard
          </button>

          {/* Dialer */}
          <button
            id="nav-dialer"
            onClick={() => setCurrentView('dialer')}
            className={`nav-item ${currentView === 'dialer' ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Phone size={15} />
            </span>
            Dialer
          </button>

          <p className="nav-section-label">Leads</p>

          {/* Import Leads */}
          <button
            id="nav-import"
            onClick={() => setCurrentView('excel-upload')}
            className={`nav-item ${currentView === 'excel-upload' ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Users size={15} />
            </span>
            Import Leads
          </button>

          {/* Analytics */}
          <button
            id="nav-analytics"
            onClick={() => setCurrentView('leads-generated')}
            className={`nav-item ${currentView === 'leads-generated' ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <BarChart3 size={15} />
            </span>
            Call Analytics
          </button>

          <p className="nav-section-label">AI</p>

          {/* Prompt Editor */}
          <button
            id="nav-prompt"
            onClick={() => setCurrentView('prompt')}
            className={`nav-item ${currentView === 'prompt' ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Sparkles size={15} />
            </span>
            AI Prompt
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            id="nav-settings"
            onClick={() => setShowSettings(true)}
            className="nav-item"
            style={{ marginBottom: '4px' }}
          >
            <span className="nav-icon">
              <SettingsIcon size={15} />
            </span>
            Settings
          </button>

          {/* Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--sidebar-active-bg)',
            marginTop: '8px'
          }}>
            <span className={`status-dot ${showCall ? 'status-dot-yellow' : 'status-dot-green'}`}
              style={{ animation: showCall ? 'pulse-ring 1.5s ease-out infinite' : 'none' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {showCall ? 'Call Active' : 'System Ready'}
            </span>
          </div>
        </div>
      </aside>

      {/* ====== MAIN AREA ====== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Bar */}
        <header className="topbar">
          <h1 className="topbar-title">{pageLabels[currentView]}</h1>

          {/* Live call pill */}
          {showCall && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              background: '#fff7ed', border: '1.5px solid #fed7aa',
              fontSize: '12px', fontWeight: 700, color: '#c2410c',
            }}>
              <PhoneCall size={13} />
              Live Call
            </div>
          )}

          {/* Stats chips */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary-light)', border: '1.5px solid var(--purple-200)',
              fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)'
            }}>
              <Users size={12} />
              {leads.length} Leads
            </div>
            {totalCalls > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                background: '#ecfdf5', border: '1.5px solid #a7f3d0',
                fontSize: '12px', fontWeight: 600, color: '#065f46'
              }}>
                <TrendingUp size={12} />
                {conversionRate}% CVR
              </div>
            )}
          </div>

          {/* Settings button */}
          <button
            id="topbar-settings"
            onClick={() => setShowSettings(true)}
            style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-card)', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'all 0.15s ease', marginLeft: '8px'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-card)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
            title="Settings"
          >
            <SettingsIcon size={17} />
          </button>
        </header>

        {/* ====== PAGE CONTENT ====== */}
        <main className="page-content custom-scrollbar">

          {/* ---- DASHBOARD ---- */}
          {currentView === 'dashboard' && (
            <div className="animate-in">
              {/* Stat Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ede9fe' }}>
                    <Phone size={22} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Calls</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {totalCalls}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fff7ed' }}>
                    <PhoneCall size={22} style={{ color: '#c2410c' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Calls</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#c2410c', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {activeCalls}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ecfdf5' }}>
                    <BarChart3 size={22} style={{ color: '#059669' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {completedCalls}
                    </p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#eff6ff' }}>
                    <TrendingUp size={22} style={{ color: '#2563eb' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Conversion</p>
                    <p style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {conversionRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Agents */}
              <div className="section-card mb-6">
                <div className="section-header">
                  <h2 className="section-title">Available Agents</h2>
                </div>
                <div className="section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div className="agent-card" onClick={() => setCurrentView('dialer')} id="agent-card-dialer">
                    <div className="agent-card-icon">🤖</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '2px' }}>
                        Cold Calling Agent
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        AI-powered autonomous calling via ElevenLabs
                      </p>
                      <span className="badge badge-purple">ElevenLabs AI</span>
                    </div>
                    <div style={{ color: 'var(--purple-400)', fontSize: '18px' }}>→</div>
                  </div>

                  <div className="agent-card" onClick={() => setCurrentView('prompt')} id="agent-card-prompt">
                    <div className="agent-card-icon">✨</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '2px' }}>
                        Customize AI Prompt
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Edit and push custom prompts to your agent
                      </p>
                      <span className="badge badge-gray">Configure</span>
                    </div>
                    <div style={{ color: 'var(--purple-400)', fontSize: '18px' }}>→</div>
                  </div>
                </div>
              </div>

              {/* Call History (recent generated leads) */}
              {generatedLeads.length > 0 && (
                <div className="section-card">
                  <div className="section-header">
                    <h2 className="section-title">Recent Call History</h2>
                    <button className="btn btn-secondary" onClick={() => setCurrentView('leads-generated')} style={{ fontSize: '12px', padding: '6px 14px' }}>
                      View All
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedLeads.slice(0, 5).map(lead => (
                          <tr key={lead.id}>
                            <td style={{ fontWeight: 600 }}>{lead.name}</td>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>{lead.number}</td>
                            <td>
                              <span className={`badge ${
                                lead.status === 'Qualified'     ? 'badge-success' :
                                lead.status === 'Not Interested'? 'badge-danger'  :
                                lead.status === 'Callback Later'? 'badge-warning' : 'badge-gray'
                              }`}>{lead.status}</span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {new Date(lead.callDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {generatedLeads.length === 0 && (
                <div className="section-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <Phone size={40} style={{ color: 'var(--purple-300)', margin: '0 auto 12px' }} />
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>No Call History Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                    Make calls using the Dialer to see your call history here.
                  </p>
                  <button className="btn btn-primary" onClick={() => setCurrentView('dialer')}>
                    <Phone size={15} /> Go to Dialer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- DIALER VIEW ---- */}
          {currentView === 'dialer' && (
            <div className="animate-in" style={{ display: 'flex', gap: '24px', height: '100%' }}>
              {/* Lead Queue Panel */}
              <div style={{
                width: '320px', minWidth: '320px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', height: 'fit-content',
                maxHeight: 'calc(100vh - 130px)'
              }}>
                <div className="section-header">
                  <h2 className="section-title">Call Queue</h2>
                  <span className="badge badge-purple">{leads.length} leads</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', padding: '16px' }}>
                  <LeadList leads={leads} onSelectLead={handleLeadSelect} />
                </div>
              </div>

              {/* Dialer Panel */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    Start Calling
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Select a lead from the queue or dial manually
                  </p>
                </div>
                <Dialer onCall={handleCall} />
              </div>
            </div>
          )}

          {/* ---- IMPORT LEADS ---- */}
          {currentView === 'excel-upload' && (
            <div className="animate-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
                  background: 'var(--accent-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Users size={26} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                  Import Leads
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Upload an Excel or CSV file to add leads to your pipeline
                </p>
              </div>
              <ExcelUpload onLeadsLoaded={handleLeadsLoaded} />
            </div>
          )}

          {/* ---- CALL ANALYTICS ---- */}
          {currentView === 'leads-generated' && (
            <div className="animate-in">
              <GeneratedLeads leads={generatedLeads} onDeleteLead={handleDeleteGeneratedLead} />
            </div>
          )}

          {/* ---- AI PROMPT ---- */}
          {currentView === 'prompt' && (
            <PromptEditor />
          )}

        </main>
      </div>

      {/* ====== ACTIVE CALL OVERLAY ====== */}
      {showCall && (
        <ActiveCall
          number={activeNumber}
          name={activeLead?.name}
          onHangup={handleHangup}
          onSaveNotes={handleSaveCallNotes}
        />
      )}

      {/* ====== SETTINGS MODAL ====== */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
