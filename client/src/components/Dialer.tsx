import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';

interface DialerProps {
    onCall: (number: string) => void;
}

const Dialer: React.FC<DialerProps> = ({ onCall }) => {
    const [number, setNumber] = useState('');

    const handleNumClick = (num: string) => {
        setNumber(prev => prev + num);
    };

    const handleDelete = () => {
        setNumber(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setNumber('');
    };

    // Define common country codes
    const countryCodes = [
        { code: '+1', country: 'US' },
        { code: '+91', country: 'IN' },
        { code: '+44', country: 'UK' },
        { code: '+61', country: 'AU' },
        { code: '+81', country: 'JP' },
    ];
    const [countryCode, setCountryCode] = useState('+1');

    const handleCall = () => {
        if (number.trim()) {
            // Remove leading zero if present when using country code
            const cleanNumber = number.startsWith('0') ? number.slice(1) : number;
            onCall(`${countryCode}${cleanNumber}`);
        }
    };

    const pads = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    return (
        <div className="w-full max-w-sm flex flex-col items-center">
            {/* Display Screen using standard rounded styling */}
            <div className="mb-6 w-full bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-inner">
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-transparent text-slate-400 font-medium text-xl outline-none cursor-pointer hover:text-white transition-colors appearance-none text-right"
                            style={{ direction: 'rtl' }}
                        >
                            {countryCodes.map(c => (
                                <option key={c.code} value={c.code} className="bg-slate-900 text-left">
                                    {c.code}
                                </option>
                            ))}
                        </select>
                        <span className="text-4xl font-bold text-white tracking-widest font-mono min-h-[48px] flex items-center">
                            {number || <span className="text-slate-700 text-3xl">...</span>}
                        </span>
                    </div>
                </div>

                {/* Control Actions Row (Clear/Delete) */}
                <div className="flex justify-between items-center px-4">
                    <button
                        onClick={handleClear}
                        disabled={!number}
                        className={`text-xs font-bold uppercase tracking-wider transition-colors ${number ? 'text-slate-500 hover:text-white cursor-pointer' : 'text-slate-800 cursor-default'}`}
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={!number}
                        className={`transition-colors ${number ? 'text-slate-500 hover:text-red-400 cursor-pointer' : 'text-slate-800 cursor-default'}`}
                    >
                        <Delete size={22} />
                    </button>
                </div>
            </div>

            {/* Keypad: Explicit Block Design */}
            <div className="grid grid-cols-3 gap-4 mb-8 w-full">
                {pads.map(pad => (
                    <button
                        key={pad}
                        onClick={() => handleNumClick(pad)}
                        className="w-full aspect-square rounded-2xl bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-950 hover:border-slate-800
                         active:border-b-0 active:translate-y-1
                         text-3xl font-bold text-white transition-all flex items-center justify-center
                         cursor-pointer shadow-lg group relative"
                    >
                        <span className="relative z-10">{pad}</span>
                    </button>
                ))}
            </div>

            {/* Call Button - Full Width Block */}
            <button
                onClick={handleCall}
                disabled={!number.trim()}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all duration-200 transform border-b-4 active:border-b-0 active:translate-y-1 ${number.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'
                    }`}
            >
                <Phone size={28} fill="currentColor" />
                <span className="font-bold text-xl">Call</span>
            </button>
        </div>
    );
};

export default Dialer;
