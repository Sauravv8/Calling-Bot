import React, { useEffect, useState } from 'react';
import {
    PhoneOff,
    Mic,
    MicOff,
    Volume2,
    Grip,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    Slash
} from 'lucide-react';
import { api } from '../api';

interface ActiveCallProps {
    number: string;
    name?: string;
    onHangup: () => void;
    onSaveNotes?: (notes: string, status: string) => void;
}

const ActiveCall: React.FC<ActiveCallProps> = ({ number, name, onHangup, onSaveNotes }) => {
    // State
    const [duration, setDuration] = useState(0);
    const [callState, setCallState] = useState<'calling' | 'active' | 'ended'>('calling');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true); // Default to "speaker" visual in auto mode

    // Post-call state
    const [notes, setNotes] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Timer logic
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (callState !== 'ended') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callState]);

    // Initialize Call
    useEffect(() => {
        const startAutonomousCall = async () => {
            try {
                const response = await api.post('/make-call', { number, name });
                if (response.success) {
                    setCallState('active'); // Transition to active immediately for UI feedback
                } else {
                    throw new Error('Failed to initiate call');
                }
            } catch (err: any) {
                console.error('Call failed:', err);
                setError(err.message || 'Call Failed');
                setTimeout(() => setCallState('ended'), 2000);
            }
        };

        if (number && callState === 'calling') {
            startAutonomousCall();
        }
    }, [number, name, callState]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleEndCall = () => {
        setCallState('ended');
    };

    const handleSave = () => {
        if (onSaveNotes) {
            onSaveNotes(notes, selectedStatus || 'Called');
        }
        onHangup();
    };

    // --- RENDER HELPERS ---

    const renderInCall = () => (
        <div className="flex flex-col h-full bg-slate-950 text-white relative overflow-hidden rounded-3xl shadow-2xl border border-slate-800" style={{ maxWidth: '400px', width: '100%', height: '700px' }}>
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="mt-16 flex flex-col items-center z-10">
                <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-xl relative ring-4 ring-slate-900">
                    {/* Breathing Animation Ring */}
                    {callState === 'active' && (
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping duration-[2000ms]" />
                    )}
                    <User size={48} className="text-slate-400" />
                </div>

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 px-4 text-center">
                    {name || 'Unknown'}
                </h2>
                <p className="text-sm text-indigo-400 font-mono mt-1 tracking-wider">{number}</p>

                <div className="mt-4 text-slate-400 font-mono text-lg">
                    {error ? <span className="text-red-400">{error}</span> :
                        callState === 'calling' ? 'Calling...' : formatTime(duration)}
                </div>
            </div>

            {/* Action Grid (Visual Only for Automated Mode) */}
            <div className="flex-1 flex flex-col justify-end pb-12 px-8 z-10">
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`flex flex-col items-center gap-2 transition-all active:scale-95 ${isMuted ? 'text-white' : 'text-slate-500'}`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </div>
                        <span className="text-xs font-medium">Mute</span>
                    </button>

                    <button className="flex flex-col items-center gap-2 text-slate-500 opacity-50 cursor-not-allowed">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                            <Grip size={24} />
                        </div>
                        <span className="text-xs font-medium">Keypad</span>
                    </button>

                    <button
                        onClick={() => setIsSpeaker(!isSpeaker)}
                        className={`flex flex-col items-center gap-2 transition-all active:scale-95 ${isSpeaker ? 'text-white' : 'text-slate-500'}`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800/50 hover:bg-slate-800'}`}>
                            <Volume2 size={24} />
                        </div>
                        <span className="text-xs font-medium">Speaker</span>
                    </button>

                </div>

                {/* End Call Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleEndCall}
                        className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/30 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                        <PhoneOff size={32} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPostCall = () => {
        const statuses = [
            { id: 'Qualified', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { id: 'Not Interested', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { id: 'Callback Later', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { id: 'Bad Number', icon: Slash, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
        ];

        return (
            <div className="flex flex-col h-full bg-slate-950 text-white relative overflow-hidden rounded-3xl shadow-xl border border-slate-800" style={{ maxWidth: '400px', width: '100%', height: '700px' }}>
                <div className="p-8 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-1 text-center">Call Ended</h2>
                    <p className="text-slate-400 text-center mb-8 font-mono text-sm">{formatTime(duration)}</p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">Outcome</label>
                            <div className="grid grid-cols-2 gap-3">
                                {statuses.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStatus(s.id)}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${selectedStatus === s.id
                                                ? `${s.bg} border-current ring-1 ring-inset ${s.color}`
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <s.icon size={20} className={selectedStatus === s.id ? s.color : ''} />
                                        <span className={`text-xs font-semibold ${selectedStatus === s.id ? s.color : ''}`}>{s.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 block">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add quick notes..."
                                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0">
                    <button
                        onClick={handleSave}
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-all"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {callState === 'ended' ? renderPostCall() : renderInCall()}
        </div>
    );
};

export default ActiveCall;
