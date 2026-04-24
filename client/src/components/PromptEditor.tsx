import React, { useState, useEffect } from 'react';
import { Sparkles, Save, RotateCcw, CheckCircle, AlertCircle, Loader2, Info, Zap } from 'lucide-react';
import { api } from '../api';

const DEFAULT_PROMPT = `You are a professional sales agent. Your goal is to introduce yourself warmly, briefly explain the product or service, and gauge the prospect's interest. Always be respectful, concise, and never pushy. Listen actively and respond thoughtfully to any questions or objections.`;

interface PromptEditorProps {}

const PromptEditor: React.FC<PromptEditorProps> = () => {
  const [prompt, setPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('callSettings');
    if (saved) {
      const data = JSON.parse(saved);
      return data.systemPrompt || DEFAULT_PROMPT;
    }
    return DEFAULT_PROMPT;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingEl, setIsUpdatingEl] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [charCount, setCharCount] = useState(prompt.length);

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveLocally = async () => {
    setIsSaving(true);
    try {
      const saved = localStorage.getItem('callSettings');
      const current = saved ? JSON.parse(saved) : {};
      const updated = { ...current, systemPrompt: prompt };
      localStorage.setItem('callSettings', JSON.stringify(updated));
      await api.post('/settings', { systemPrompt: prompt });
      showMessage('success', 'Prompt saved to server successfully!');
    } catch {
      showMessage('error', 'Saved locally but failed to sync to server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateElevenLabs = async () => {
    setIsUpdatingEl(true);
    try {
      const response = await api.post('/elevenlabs/update-prompt', { prompt });
      if (response.success) {
        showMessage('success', 'ElevenLabs agent prompt updated successfully! Changes are live.');
      } else {
        throw new Error(response.error || 'Update failed');
      }
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to update ElevenLabs agent. Check API key & Agent ID in Settings.');
    } finally {
      setIsUpdatingEl(false);
    }
  };

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
    showMessage('info', 'Prompt reset to default template.');
  };

  return (
    <div className="animate-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-primary-light)' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-primary)' }}>
              AI Agent Prompt
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Customize what your AI calling agent says during calls
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="alert alert-info mb-6" style={{ borderRadius: 'var(--radius-lg)' }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong>How this works:</strong> Your prompt is sent to your ElevenLabs Conversational AI agent.
          Click <em>"Save to Server"</em> to persist locally, or <em>"Update ElevenLabs"</em> to push changes live to the agent immediately.
        </div>
      </div>

      {/* Prompt Editor Card */}
      <div className="section-card mb-6">
        <div className="section-header">
          <h2 className="section-title">System Prompt</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {charCount.toLocaleString()} characters
          </div>
        </div>
        <div className="section-body">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your custom prompt for the AI calling agent..."
            rows={16}
            className="input"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: '13px',
              lineHeight: '1.7',
              resize: 'vertical',
              minHeight: '320px',
              background: '#fafbff',
            }}
          />

          {/* Prompt Tips */}
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-page)', border: '1px solid var(--border-card)' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💡 Prompt Tips
            </p>
            <ul style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>• Start with a clear role definition: <em>"You are a..."</em></li>
              <li>• Include your company name and product in the prompt for personalized calls</li>
              <li>• Define the goal: schedule appointment, qualify lead, gather information</li>
              <li>• Add objection handling: how to respond when someone says "not interested"</li>
              <li>• Keep it under 2000 characters for best performance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'error' ? 'error' : 'info'} mb-6 animate-in`}>
          {message.type === 'success' && <CheckCircle size={16} style={{ flexShrink: 0 }} />}
          {message.type === 'error'   && <AlertCircle size={16} style={{ flexShrink: 0 }} />}
          {message.type === 'info'    && <Info size={16} style={{ flexShrink: 0 }} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {/* Update ElevenLabs — Primary CTA */}
        <button
          id="update-elevenlabs-btn"
          onClick={handleUpdateElevenLabs}
          disabled={isUpdatingEl || !prompt.trim()}
          className="btn btn-primary"
          style={{ minWidth: '220px' }}
        >
          {isUpdatingEl ? (
            <><Loader2 size={16} className="animate-spin" />Updating ElevenLabs...</>
          ) : (
            <><Zap size={16} />Update ElevenLabs Agent</>
          )}
        </button>

        {/* Save to Server */}
        <button
          id="save-prompt-server-btn"
          onClick={handleSaveLocally}
          disabled={isSaving || !prompt.trim()}
          className="btn btn-secondary"
        >
          {isSaving ? (
            <><Loader2 size={16} className="animate-spin" />Saving...</>
          ) : (
            <><Save size={16} />Save to Server</>
          )}
        </button>

        {/* Reset */}
        <button
          id="reset-prompt-btn"
          onClick={handleReset}
          className="btn btn-ghost"
          style={{ marginLeft: 'auto' }}
        >
          <RotateCcw size={14} />
          Reset to Default
        </button>
      </div>

      {/* ElevenLabs Note */}
      <div className="mt-8 p-5 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-primary-light), #f0f4ff)', border: '1.5px solid var(--purple-200)' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} /> ElevenLabs Integration
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          The <strong>"Update ElevenLabs Agent"</strong> button calls the ElevenLabs API and updates your agent's system prompt in real time.
          Make sure your <strong>ElevenLabs API Key</strong> and <strong>Agent ID</strong> are configured in{' '}
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Settings → ElevenLabs Configuration</span>.
        </p>
      </div>
    </div>
  );
};

export default PromptEditor;
