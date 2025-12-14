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
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar - Desktop Optimized */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        {/* Logo Section */}
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              CC
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-xl text-white">ColdCaller</h1>
              <p className="text-xs text-blue-400 font-medium">Pro Edition</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Calling</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
                  ? 'bg-blue-600/10 border border-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : 'group-hover:text-blue-400'} />
                <span className="font-semibold">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <SettingsIcon size={20} />
            <span className="font-semibold">Settings</span>
          </button>
          <button
            onClick={() => alert('Help & Documentation')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all mt-1"
          >
            <Home size={20} />
            <span className="font-semibold">Help</span>
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-6 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300">Online & Ready</span>
          </div>
          <p className="text-xs text-slate-500 text-center">v1.0.0</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        {/* Desktop Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold text-white">
              {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h2>
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <div className="h-8 w-px bg-slate-700"></div>
              <span className="text-sm text-slate-400">
                {currentView === 'dialer' && `${leads.length} Leads in Queue`}
                {currentView === 'leads-generated' && `${generatedLeads.length} Generated Leads`}
                {currentView === 'excel-upload' && 'Import Your Leads'}
                {currentView === 'call' && 'Active Call'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2 hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">Online</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Settings"
            >
              <SettingsIcon size={22} className="text-slate-400 hover:text-blue-400" />
            </button>
          </div>
        </header>

        {/* Main Content with Two-Column Layout for Dialer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Lead Queue (Desktop) */}
          {currentView === 'dialer' && (
            <div className="w-96 border-r border-slate-800 bg-slate-950 p-6 overflow-y-auto custom-scrollbar flex flex-col hidden lg:flex">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Phone size={20} className="text-blue-400" />
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
            {/* Background - Solid */}
            <div className="absolute inset-0 bg-slate-950 z-0"></div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
              {currentView === 'dialer' && (
                <div className="w-full max-w-3xl">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-3">
                      Start Calling
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                      {leads.length > 0
                        ? `You have ${leads.length} leads ready. Select from the queue or dial manually.`
                        : 'Import leads to get started with your calling campaign.'}
                    </p>
                  </div>

                  {/* Dialer + Quick Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="flex justify-center lg:justify-end">
                      <Dialer onCall={handleCall} />
                    </div>
                    <div className="space-y-4">
                      <div className="card">
                        <p className="text-slate-400 text-sm mb-1">Total Leads</p>
                        <p className="text-4xl font-bold text-white">{leads.length}</p>
                      </div>
                      <div className="card">
                        <p className="text-slate-400 text-sm mb-1">Calls Made</p>
                        <p className="text-4xl font-bold text-white">{generatedLeads.length}</p>
                      </div>
                      <div className="card">
                        <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                        <p className="text-4xl font-bold text-green-400">
                          {generatedLeads.length === 0 ? '0' : Math.round((generatedLeads.filter(l => l.status === 'Qualified').length / generatedLeads.length) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'call' && (
                <div className="w-full max-w-2xl">
                  <ActiveCall
                    number={activeNumber}
                    name={activeLead?.name}
                    onHangup={handleHangup}
                    onSaveNotes={handleSaveCallNotes}
                  />
                </div>
              )}

              {currentView === 'excel-upload' && (
                <div className="w-full max-w-3xl">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-3">
                      Import Leads
                    </h2>
                    <p className="text-slate-400 text-lg">
                      Upload an Excel or CSV file to add leads
                    </p>
                  </div>
                  <ExcelUpload onLeadsLoaded={handleLeadsLoaded} />
                </div>
              )}

              {currentView === 'leads-generated' && (
                <div className="w-full h-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Call Results
                    </h2>
                    <p className="text-slate-400">Leads captured from your calls</p>
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
