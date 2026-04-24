import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Save, AlertCircle, Check, Eye, EyeOff, X, Loader2
} from 'lucide-react';
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
  elevenLabsApiKey: string;
  elevenLabsAgentId: string;
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
      twilioAccountSid: '', twilioAuthToken: '', twilioPhoneNumber: '',
      twilioTwimlAppSid: '', twilioApiKey: '', twilioApiSecret: '',
      baseUrl: '', geminiApiKey: '',
      elevenLabsApiKey: '', elevenLabsAgentId: '',
      systemPrompt: 'You are a professional sales agent. Introduce yourself and the product, then ask for their interest. Be respectful and brief.',
    };
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'twilio' | 'elevenlabs' | 'ai'>('twilio');

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecret = (key: string) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('callSettings', JSON.stringify(settings));
      await api.post('/settings', settings);
      onSave(settings);
      setMessage({ type: 'success', text: 'Settings saved and synced to server!' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Saved locally, but failed to sync to server.' });
    } finally {
      setIsSaving(false);
    }
  };

  const SecretInput = ({ field, placeholder }: { field: keyof SettingsData; placeholder: string }) => (
    <div style={{ position: 'relative' }}>
      <input
        type={showSecrets[field] ? 'text' : 'password'}
        value={settings[field] as string}
        onChange={e => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => toggleSecret(field)}
        style={{
          position: 'absolute', right: '10px', top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
        }}
      >
        {showSecrets[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  const tabs = [
    { id: 'twilio' as const,     label: 'Twilio',       emoji: '📞' },
    { id: 'elevenlabs' as const, label: 'ElevenLabs',   emoji: '🎙️' },
    { id: 'ai' as const,         label: 'AI Prompt',    emoji: '✨' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(30, 27, 75, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '16px',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-scale" style={{
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        border: '1.5px solid var(--border-card)',
      }}>

        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1.5px solid var(--border-card)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SettingsIcon size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Configuration
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage API keys and server settings</p>
          </div>
          <button
            id="settings-close"
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-card)', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '12px 24px',
          borderBottom: '1.5px solid var(--border-card)',
          background: 'var(--bg-page)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 16px', borderRadius: 'var(--radius-md)',
                border: '1.5px solid',
                fontSize: '12.5px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === tab.id ? 'var(--accent-primary)' : 'white',
                borderColor: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--border-card)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">

          {/* ---- TWILIO TAB ---- */}
          {activeTab === 'twilio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">Account SID</label>
                  <SecretInput field="twilioAccountSid" placeholder="AC..." />
                </div>
                <div>
                  <label className="input-label">Auth Token</label>
                  <SecretInput field="twilioAuthToken" placeholder="Auth Token" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="input-label">API Key (SID)</label>
                  <SecretInput field="twilioApiKey" placeholder="SK..." />
                </div>
                <div>
                  <label className="input-label">API Secret</label>
                  <SecretInput field="twilioApiSecret" placeholder="Secret" />
                </div>
              </div>
              <div>
                <label className="input-label">TwiML App SID</label>
                <input
                  type="text" value={settings.twilioTwimlAppSid}
                  onChange={e => handleChange('twilioTwimlAppSid', e.target.value)}
                  placeholder="AP..."
                  className="input"
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Found in Twilio Console › Voice › TwiML Apps
                </p>
              </div>
              <div>
                <label className="input-label">Phone Number (Caller ID)</label>
                <input
                  type="tel" value={settings.twilioPhoneNumber}
                  onChange={e => handleChange('twilioPhoneNumber', e.target.value)}
                  placeholder="+1234567890"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Public Server URL (ngrok)</label>
                <input
                  type="url" value={settings.baseUrl}
                  onChange={e => handleChange('baseUrl', e.target.value)}
                  placeholder="https://xxxx.ngrok-free.app"
                  className="input"
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Required for Twilio webhooks to reach your local server
                </p>
              </div>
            </div>
          )}

          {/* ---- ELEVENLABS TAB ---- */}
          {activeTab === 'elevenlabs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'var(--accent-primary-light)',
                border: '1.5px solid var(--purple-200)',
                fontSize: '12.5px', color: 'var(--accent-primary)', fontWeight: 500,
              }}>
                🎙️ These credentials are used to connect your calls to ElevenLabs Conversational AI and to update agent prompts from the <strong>AI Prompt</strong> page.
              </div>
              <div>
                <label className="input-label">ElevenLabs API Key</label>
                <SecretInput field="elevenLabsApiKey" placeholder="Your ElevenLabs API Key" />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Found in ElevenLabs Dashboard › My Account › API Keys
                </p>
              </div>
              <div>
                <label className="input-label">Agent ID</label>
                <input
                  type="text" value={settings.elevenLabsAgentId}
                  onChange={e => handleChange('elevenLabsAgentId', e.target.value)}
                  placeholder="Your ElevenLabs Agent ID"
                  className="input"
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Found in ElevenLabs Dashboard › Conversational AI › Your Agent
                </p>
              </div>
              <div>
                <label className="input-label">Gemini API Key (optional)</label>
                <SecretInput field="geminiApiKey" placeholder="Your Google Gemini API Key" />
              </div>
            </div>
          )}

          {/* ---- AI PROMPT TAB ---- */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: '#fffbeb', border: '1.5px solid #fde68a',
                fontSize: '12.5px', color: '#92400e',
              }}>
                ✨ You can also edit and push your AI prompt directly from the <strong>AI Prompt</strong> page in the sidebar for a better editing experience.
              </div>
              <div>
                <label className="input-label">System Prompt (Stored in Server)</label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={e => handleChange('systemPrompt', e.target.value)}
                  placeholder="Enter your custom prompt for the calling agent..."
                  className="input"
                  rows={10}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ margin: '0 24px 16px', borderRadius: 'var(--radius-md)' }}>
            {message.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: '1.5px solid var(--border-card)',
          display: 'flex', gap: '10px',
        }}>
          <button
            id="settings-save"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {isSaving ? (
              <><Loader2 size={15} className="animate-spin" />Saving...</>
            ) : (
              <><Save size={15} />Save & Sync Settings</>
            )}
          </button>
          <button
            id="settings-cancel"
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
