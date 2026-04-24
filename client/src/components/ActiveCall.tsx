import React, { useEffect, useState } from 'react';
import {
  PhoneOff, Mic, MicOff, Volume2, User, CheckCircle2, XCircle, Clock, Slash, Loader2
} from 'lucide-react';
import { api } from '../api';

interface ActiveCallProps {
  number: string;
  name?: string;
  onHangup: () => void;
  onSaveNotes?: (notes: string, status: string) => void;
}

const ActiveCall: React.FC<ActiveCallProps> = ({ number, name, onHangup, onSaveNotes }) => {
  const [duration,       setDuration]       = useState(0);
  const [callState,      setCallState]      = useState<'calling' | 'active' | 'ended'>('calling');
  const [isMuted,        setIsMuted]        = useState(false);
  const [isSpeaker,      setIsSpeaker]      = useState(true);
  const [notes,          setNotes]          = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [error,          setError]          = useState<string | null>(null);

  // Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (callState !== 'ended') {
      timer = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Initiate call
  useEffect(() => {
    const startCall = async () => {
      try {
        const response = await api.post('/make-call', { number, name });
        if (response.success) setCallState('active');
        else throw new Error('Failed to initiate call');
      } catch (err: any) {
        setError(err.message || 'Call Failed');
        setTimeout(() => setCallState('ended'), 2000);
      }
    };
    if (number && callState === 'calling') startCall();
  }, [number, name, callState]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s    = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSave = () => {
    if (onSaveNotes) onSaveNotes(notes, selectedStatus || 'Called');
    onHangup();
  };

  const statuses = [
    { id: 'Qualified',      icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'Not Interested', icon: XCircle,      color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { id: 'Callback Later', icon: Clock,        color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { id: 'Bad Number',     icon: Slash,        color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  ];

  // IN-CALL UI — keep dark for immersive feel
  if (callState !== 'ended') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 10, 40, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '16px',
      }}>
        <div className="animate-scale" style={{
          width: '360px',
          background: 'linear-gradient(180deg, #1e1247 0%, #0f0a28 100%)',
          borderRadius: '28px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 24px 80px rgba(109, 40, 217, 0.4)',
          overflow: 'hidden',
          padding: '40px 28px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0',
        }}>
          {/* Avatar ring */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            {callState === 'active' && (
              <div style={{
                position: 'absolute', inset: '-12px',
                borderRadius: '50%',
                border: '2px solid rgba(139, 92, 246, 0.4)',
                animation: 'pulse-ring 2s ease-out infinite',
              }} />
            )}
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
            }}>
              <User size={36} color="white" />
            </div>
          </div>

          {/* Name & Number */}
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            {name || 'Unknown'}
          </h2>
          <p style={{ fontSize: '13px', color: '#a78bfa', fontFamily: 'monospace', marginBottom: '12px' }}>
            {number}
          </p>

          {/* Timer / Status */}
          <div style={{
            fontSize: '14px', fontWeight: 600,
            color: error ? '#f87171' : callState === 'calling' ? '#a78bfa' : '#a3e635',
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '36px',
          }}>
            {callState === 'calling' && !error && <Loader2 size={14} className="animate-spin" />}
            {error ? error : callState === 'calling' ? 'Connecting...' : formatTime(duration)}
          </div>

          {/* Controls Row */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '36px' }}>
            {[
              { label: 'Mute',    icon: isMuted ? MicOff : Mic,     active: isMuted,   onClick: () => setIsMuted(!isMuted) },
              { label: 'Speaker', icon: Volume2,                    active: isSpeaker,  onClick: () => setIsSpeaker(!isSpeaker) },
            ].map(ctrl => (
              <button key={ctrl.label} onClick={ctrl.onClick} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                border: 'none', background: 'transparent', cursor: 'pointer',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: ctrl.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <ctrl.icon size={20} color={ctrl.active ? '#7c3aed' : 'white'} />
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{ctrl.label}</span>
              </button>
            ))}
          </div>

          {/* Hang Up */}
          <button
            id="hangup-btn"
            onClick={() => setCallState('ended')}
            style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: '#ef4444',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
          >
            <PhoneOff size={28} fill="white" color="white" />
          </button>
        </div>
      </div>
    );
  }

  // POST-CALL UI — light theme
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(30, 27, 75, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '16px',
    }}>
      <div className="animate-scale" style={{
        width: '440px',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1.5px solid var(--border-card)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, var(--accent-primary-light), #f0f4ff)',
          borderBottom: '1.5px solid var(--border-card)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
            Call Ended
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            Duration: {formatTime(duration)}
          </p>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Selection */}
          <div>
            <label className="input-label" style={{ marginBottom: '10px', display: 'block' }}>Call Outcome</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {statuses.map(s => (
                <button
                  key={s.id}
                  id={`status-${s.id.replace(/\s/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedStatus(s.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid',
                    background: selectedStatus === s.id ? s.bg : 'white',
                    borderColor: selectedStatus === s.id ? s.border : 'var(--border-card)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '13px', fontWeight: 600,
                    color: selectedStatus === s.id ? s.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <s.icon size={16} style={{ color: selectedStatus === s.id ? s.color : 'var(--text-muted)' }} />
                  {s.id}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add call notes..."
              className="input"
              rows={4}
              style={{ resize: 'none', lineHeight: '1.6' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              id="save-call-btn"
              onClick={handleSave}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Save & Close
            </button>
            <button
              id="discard-call-btn"
              onClick={onHangup}
              className="btn btn-ghost"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCall;
