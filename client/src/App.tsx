import { useState } from 'react';
import Dialer from './components/Dialer';
import LeadList, { type Lead } from './components/LeadList';
import ActiveCall from './components/ActiveCall';
import Settings from './components/Settings';
import ExcelUpload, { type UploadedLead } from './components/ExcelUpload';
import GeneratedLeads, { type GeneratedLead } from './components/GeneratedLeads';
import { Settings as SettingsIcon, Phone, Users, BarChart3, Home } from 'lucide-react';

// Mock Data
const MOCK_LEADS: Lead[] = [
  { id: 1, name: 'John Doe', number: '+15551234567', status: 'New', score: 10 },
  { id: 2, name: 'Alice Smith', number: '+15559876543', status: 'Called', score: 5 },
  { id: 3, name: 'Bob Johnson', number: '+15551112222', status: 'Qualified', score: 20 },
  { id: 4, name: 'Emma Wilson', number: '+15553334444', status: 'New', score: 12 },
  { id: 5, name: 'Michael Brown', number: '+15555556666', status: 'Bad Number', score: 0 },
];

type ViewType = 'dialer' | 'call' | 'settings' | 'leads-generated' | 'excel-upload';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dialer');
  const [activeNumber, setActiveNumber] = useState('');
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [generatedLeads, setGeneratedLeads] = useState<GeneratedLead[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const handleCall = (number: string) => {
    console.log('Calling...', number);
    setActiveNumber(number);
    setCurrentView('call');
  };

  const handleHangup = () => {
    console.log('Hanging up...');
    setCurrentView('dialer');
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
        notes: notes,
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

  const handleSettingsSave = () => {
    setShowSettings(false);
  };

  const navItems = [
    { id: 'dialer' as ViewType, label: 'Dialer', icon: Phone },
    { id: 'excel-upload' as ViewType, label: 'Import Leads', icon: Users },
    { id: 'leads-generated' as ViewType, label: 'Generated Leads', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full text-slate-100 overflow-hidden bg-transparent">
      {/* Sidebar - Desktop Optimized */}
      <div className="w-72 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-20 shadow-2xl">
        {/* Logo Section */}
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/30">
              CC
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-xl text-white tracking-tight">ColdCaller</h1>
              <p className="text-xs text-indigo-400 font-medium">Pro Edition</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-1">AI-Powered Calling</p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-xs uppercase font-bold text-slate-500 tracking-wider px-4 mb-6">Navigation</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>
                )}
                <Icon size={20} className={`transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-6 py-4 border-t border-slate-800/50">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all"
          >
            <SettingsIcon size={20} />
            <span className="font-semibold">Settings</span>
          </button>
          <button
            onClick={() => alert('Help & Documentation')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-all mt-1"
          >
            <Home size={20} />
            <span className="font-semibold">Help</span>
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-6 border-t border-slate-800/50">
          <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 mb-2 border border-slate-700/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs text-slate-300">Online & Ready</span>
          </div>
          <p className="text-xs text-slate-500 text-center">v1.0.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Desktop Header */}
        <header className="h-20 border-b border-slate-800/30 flex items-center justify-between px-8 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tight animate-in">
              {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h2>
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <div className="h-8 w-px bg-slate-800"></div>
              <span className="text-sm text-slate-400">
                {currentView === 'dialer' && `${leads.length} Leads in Queue`}
                {currentView === 'leads-generated' && `${generatedLeads.length} Generated Leads`}
                {currentView === 'excel-upload' && 'Import Your Leads'}
                {currentView === 'call' && <span className="text-indigo-400 font-medium animate-pulse">● Live Call</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/40 rounded-full px-4 py-2 border border-slate-700/30 hidden sm:flex">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300 font-medium">System Optimal</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Settings"
            >
              <SettingsIcon size={22} className="text-slate-400 hover:text-indigo-400" />
            </button>
          </div>
        </header>

        {/* Main Content with Two-Column Layout for Dialer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Lead Queue (Desktop) */}
          {currentView === 'dialer' && (
            <div className="w-96 border-r border-slate-800/30 bg-slate-900/30 backdrop-blur-md p-6 overflow-y-auto custom-scrollbar flex flex-col hidden lg:flex animate-slide-in">
              <div className="flex items-center gap-3 mb-6 p-4 glass-panel rounded-xl">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Phone size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Call Queue</h3>
                  <p className="text-xs text-slate-400">{leads.length} available leads</p>
                </div>
              </div>
              <LeadList leads={leads} onSelectLead={handleLeadSelect} />
            </div>
          )}

          {/* Center Content Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden">

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 overflow-y-auto custom-scrollbar">
              {currentView === 'dialer' && (
                <div className="w-full max-w-4xl animate-in">
                  <div className="text-center mb-10">
                    <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4 tracking-tight">
                      Start Calling
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                      {leads.length > 0
                        ? `You have ${leads.length} leads ready in your queue. Select a lead or dial manually to begin.`
                        : 'Import leads to get started with your high-velocity calling campaign.'}
                    </p>
                  </div>

                  {/* Dialer + Quick Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    <div className="flex justify-center lg:justify-end">
                      <Dialer onCall={handleCall} />
                    </div>
                    <div className="space-y-4 pt-4">
                      <div className="card hover:scale-102 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Total Leads</p>
                          <Users size={16} className="text-indigo-500/50" />
                        </div>
                        <p className="text-3xl font-bold text-white">{leads.length}</p>
                      </div>
                      <div className="card hover:scale-102 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Calls Completed</p>
                          <Phone size={16} className="text-indigo-500/50" />
                        </div>
                        <p className="text-3xl font-bold text-white">{generatedLeads.length}</p>
                      </div>
                      <div className="card hover:scale-102 transition-transform cursor-default">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Conversion Rate</p>
                          <BarChart3 size={16} className="text-emerald-500/50" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-emerald-400">
                            {generatedLeads.length === 0 ? '0' : Math.round((generatedLeads.filter(l => l.status === 'Qualified').length / generatedLeads.length) * 100)}%
                          </p>
                          <span className="text-xs text-slate-500">Target: 15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'call' && (
                <div className="w-full max-w-2xl animate-scale-in">
                  <ActiveCall
                    number={activeNumber}
                    name={activeLead?.name}
                    onHangup={handleHangup}
                    onSaveNotes={handleSaveCallNotes}
                  />
                </div>
              )}

              {currentView === 'excel-upload' && (
                <div className="w-full max-w-3xl animate-in">
                  <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users size={32} className="text-indigo-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-3">
                      Import Leads
                    </h2>
                    <p className="text-slate-400 text-lg">
                      Upload an Excel or CSV file to supercharge your pipeline
                    </p>
                  </div>
                  <ExcelUpload onLeadsLoaded={handleLeadsLoaded} />
                </div>
              )}

              {currentView === 'leads-generated' && (
                <div className="w-full h-full max-w-6xl animate-in">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Call Analytics
                    </h2>
                    <p className="text-slate-400">Review results and qualified leads</p>
                  </div>
                  <GeneratedLeads
                    leads={generatedLeads}
                    onDeleteLead={handleDeleteGeneratedLead}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
}

export default App;
