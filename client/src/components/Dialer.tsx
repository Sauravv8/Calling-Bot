import React, { useState } from 'react';
import { Phone, Delete, RotateCcw } from 'lucide-react';

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
        <div className="w-full max-w-sm">
            {/* Display Screen */}
            <div className="mb-8 relative">
                <div className="panel p-8">
                    <div className="text-center mb-4">
                        <p className="text-slate-400 text-sm font-medium">Dial Phone Number</p>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-slate-800 text-white rounded-lg px-2 py-1 outline-none border border-slate-700 text-xl font-mono appearance-none text-center cursor-pointer hover:bg-slate-700 transition"
                            style={{ minWidth: '80px' }}
                        >
                            {countryCodes.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.country} ({c.code})
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={number}
                            readOnly
                            className="flex-1 text-4xl text-right font-mono font-bold text-white tracking-widest bg-transparent placeholder-slate-600 focus:outline-none"
                            placeholder="Enter number"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            {number.length > 0 ? `${number.length} digits` : 'Ready'}
                        </span>
                        {number && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="p-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                                    title="Delete last digit"
                                >
                                    <Delete size={18} />
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="p-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 hover:text-orange-300 transition-all duration-200 hover:scale-110"
                                    title="Clear all"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Keypad */}
            <div className="mb-8">
                <div className="grid grid-cols-3 gap-3 mb-6 panel p-6">
                    {pads.map(pad => (
                        <button
                            key={pad}
                            onClick={() => handleNumClick(pad)}
                            className="aspect-square rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50
                             text-3xl font-bold text-white hover:text-blue-300 transition-all active:scale-95 flex items-center justify-center
                             cursor-pointer"
                        >
                            {pad}
                        </button>
                    ))}
                </div>
            </div>

            {/* Call Button */}
            <button
                onClick={handleCall}
                disabled={!number.trim()}
                className={`w-full h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform ${number.trim()
                    ? 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-400 hover:via-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95 cursor-pointer'
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
            >
                <Phone size={24} className="font-bold" />
                <span>{number.trim() ? 'Call Now' : 'Enter Number'}</span>
            </button>

            {/* Info Text */}
            <p className="text-slate-500 text-center text-sm mt-6">
                {number ? (
                    <span>
                        Ready to call <span className="text-blue-300 font-semibold">{countryCode} {number}</span>
                    </span>
                ) : (
                    'Tap numbers to dial'
                )}
            </p>
        </div>
    );
};

export default Dialer;
