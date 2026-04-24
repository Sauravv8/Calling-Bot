import React, { useState } from 'react';
import { Phone, Delete, ChevronDown } from 'lucide-react';

interface DialerProps {
  onCall: (number: string) => void;
}

const COUNTRY_CODES = [
  { code: '+1',  country: 'US 🇺🇸' },
  { code: '+91', country: 'IN 🇮🇳' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+61', country: 'AU 🇦🇺' },
  { code: '+81', country: 'JP 🇯🇵' },
  { code: '+971',country: 'AE 🇦🇪' },
  { code: '+65', country: 'SG 🇸🇬' },
];

const PADS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

const Dialer: React.FC<DialerProps> = ({ onCall }) => {
  const [number, setNumber]           = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showCC, setShowCC]           = useState(false);

  const handleNumClick = (num: string) => setNumber(prev => prev + num);
  const handleDelete   = () => setNumber(prev => prev.slice(0, -1));
  const handleClear    = () => setNumber('');
  const handleCall     = () => {
    if (!number.trim()) return;
    const clean = number.startsWith('0') ? number.slice(1) : number;
    onCall(`${countryCode}${clean}`);
  };

  return (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Display */}
      <div style={{
        background: 'white',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Country Code Selector */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <button
            id="country-code-btn"
            onClick={() => setShowCC(!showCC)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary-light)',
              border: '1.5px solid var(--purple-200)',
              color: 'var(--accent-primary)',
              fontSize: '13px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {countryCode}
            <ChevronDown size={12} />
          </button>
          {showCC && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 50,
              background: 'white', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border-card)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', minWidth: '160px',
            }}>
              {COUNTRY_CODES.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCountryCode(c.code); setShowCC(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 14px',
                    background: countryCode === c.code ? 'var(--accent-primary-light)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{c.code}</span>
                  <span>{c.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number Display */}
        <div style={{
          fontSize: '32px', fontWeight: 800,
          color: number ? 'var(--text-primary)' : 'var(--text-placeholder)',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-display)',
          minHeight: '48px',
          display: 'flex', alignItems: 'center',
        }}>
          {number || '···'}
        </div>

        {/* Clear / Backspace */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <button
            onClick={handleClear}
            disabled={!number}
            style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', border: 'none', background: 'transparent',
              cursor: number ? 'pointer' : 'default',
              color: number ? 'var(--text-muted)' : 'var(--text-placeholder)',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleDelete}
            disabled={!number}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'transparent',
              cursor: number ? 'pointer' : 'default',
              color: number ? 'var(--text-muted)' : 'var(--text-placeholder)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { if (number) (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-danger)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <Delete size={20} />
          </button>
        </div>
      </div>

      {/* Keypad */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
        marginBottom: '16px',
      }}>
        {PADS.map(pad => (
          <button
            key={pad}
            id={`keypad-${pad}`}
            onClick={() => handleNumClick(pad)}
            className="keypad-btn"
          >
            {pad}
          </button>
        ))}
      </div>

      {/* Call Button */}
      <button
        id="call-button"
        onClick={handleCall}
        disabled={!number.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 'var(--radius-xl)',
          background: number.trim() ? 'var(--accent-primary)' : '#e5e7eb',
          border: 'none',
          color: number.trim() ? 'white' : '#9ca3af',
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          cursor: number.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          boxShadow: number.trim() ? 'var(--shadow-purple)' : 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          if (number.trim()) {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-primary-hover)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = number.trim() ? 'var(--accent-primary)' : '#e5e7eb';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        <Phone size={20} fill={number.trim() ? 'white' : '#9ca3af'} />
        Call
      </button>
    </div>
  );
};

export default Dialer;
