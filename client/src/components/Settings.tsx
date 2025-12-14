import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle, Check } from 'lucide-react';
import { api } from '../api';

interface SettingsData {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  twilioTwimlAppSid: string;
  twilioApiKey: string;
  twilioApiSecret: string;
  baseUrl: string;
  geminiApiKey: string;
  systemPrompt: string;
}

interface SettingsProps {
  onClose: () => void;
  onSave: (settings: SettingsData) => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, onSave }) => {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('callSettings');
    return saved ? JSON.parse(saved) : {
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
      twilioTwimlAppSid: '',
      twilioApiKey: '',
      twilioApiSecret: '',
      baseUrl: '',
      geminiApiKey: '',
      systemPrompt: 'You are a professional sales agent. Introduce yourself and the product, then ask for their interest. Be respectful and brief.',
    };
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to LocalStorage
      localStorage.setItem('callSettings', JSON.stringify(settings));

      // Sync to Server (Backend needs these to function)
      // Note: In a real app, send these securely.
      await api.post('/settings', settings);

      onSave(settings);
      setMessage({ type: 'success', text: 'Settings saved and synced to server!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to sync settings:', error);
      setMessage({ type: 'error', text: 'Saved locally, but failed to sync to server.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="panel w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900 p-6 border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <SettingsIcon size={24} className="text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Twilio Settings */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Twilio Configuration</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Account SID</label>
                  <input
                    type="password"
                    value={settings.twilioAccountSid}
                    onChange={(e) => handleChange('twilioAccountSid', e.target.value)}
                    placeholder="AC..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="input-label">Auth Token</label>
                  <input
                    type="password"
                    value={settings.twilioAuthToken}
                    onChange={(e) => handleChange('twilioAuthToken', e.target.value)}
                    placeholder="Auth Token"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">API Key (SID)</label>
                  <input
                    type="password"
                    value={settings.twilioApiKey}
                    onChange={(e) => handleChange('twilioApiKey', e.target.value)}
                    placeholder="SK..."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="input-label">API Secret</label>
                  <input
                    type="password"
                    value={settings.twilioApiSecret}
                    onChange={(e) => handleChange('twilioApiSecret', e.target.value)}
                    placeholder="Secret"
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">TwiML App SID</label>
                <input
                  type="text"
                  value={settings.twilioTwimlAppSid}
                  onChange={(e) => handleChange('twilioTwimlAppSid', e.target.value)}
                  placeholder="AP..."
                  className="input w-full"
                />
                <p className="text-xs text-text-muted mt-1">Found in Twilio Console &gt; Voice &gt; TwiML Apps</p>
              </div>

              <div>
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  value={settings.twilioPhoneNumber}
                  onChange={(e) => handleChange('twilioPhoneNumber', e.target.value)}
                  placeholder="+1234567890"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="input-label">Public Server URL (ngrok)</label>
                <input
                  type="url"
                  value={settings.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  placeholder="https://....ngrok-free.app"
                  className="input w-full"
                />
                <p className="text-xs text-text-muted mt-1">Required for Twilio to send call events back to your server</p>
              </div>
            </div>
          </div>

          {/* Gemini Settings */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Gemini API Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="input-label">API Key</label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                  placeholder="Your Google Gemini API Key"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="input-label">Custom Call Prompt</label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  placeholder="Enter your custom prompt for the calling agent..."
                  className="input w-full h-32 resize-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
              }`}>
              {message.type === 'success' ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <AlertCircle size={18} className="text-red-400" />
              )}
              <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                {message.text}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save & Sync Settings'}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
