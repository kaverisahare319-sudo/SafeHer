import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Navigation, CheckCircle2, X, Clock, Phone } from 'lucide-react';
import { api } from '../../utils/api';

const STATUS_TEXT = {
  requested: 'Request sent. Waiting for the security office to acknowledge.',
  acknowledged: 'The security office has acknowledged your request.',
  completed: 'Marked completed by the security office.',
  cancelled: 'Request cancelled.'
};

// Real request to the college admin / security office. No fake officer, no fake ETA.
export function CampusEscortRequest({ token }) {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [escort, setEscort] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Poll status while a request is active (every 15 s; stops when finished).
  useEffect(() => {
    if (!escort || ['completed', 'cancelled'].includes(escort.status)) return;
    const t = setInterval(async () => {
      try {
        const r = await api(`/api/campus/escort/${escort.escortId}`, { token });
        if (r.ok) setEscort(r.data);
      } catch { /* ignore */ }
    }, 15000);
    return () => clearInterval(t);
  }, [escort, token]);

  const request = async () => {
    setError('');
    if (!pickup.trim() || !destination.trim()) { setError('Enter where you are and where you are going.'); return; }
    setBusy(true);
    try {
      const r = await api('/api/campus/escort/request', { method: 'POST', token, body: { pickupLocation: pickup.trim(), destination: destination.trim() } });
      if (r.ok) setEscort(r.data.escort); else setError(r.data.message || 'Could not send request.');
    } catch { setError('Could not reach the server. If you feel unsafe, call 112.'); }
    finally { setBusy(false); }
  };

  const cancel = async () => {
    try { await api(`/api/campus/escort/${escort.escortId}/cancel`, { method: 'POST', token }); } catch { /* ignore */ }
    setEscort(null);
  };

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      <div className="glass-panel p-5 rounded-3xl border border-blue-500/20 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30"><ShieldCheck className="w-6 h-6" /></div>
        <div>
          <h2 className="text-lg font-black text-white">Campus Escort Request</h2>
          <p className="text-xs text-gray-400">Ask the college security office to walk with you</p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-100">
        This sends a request to your college admin / security office. It is <b>not</b> an emergency service and we cannot promise anyone will arrive. If you are in danger, call <a href="tel:112" className="underline font-bold">112</a>.
      </div>

      {!escort ? (
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" />Where are you?</label>
            <input value={pickup} onChange={e => setPickup(e.target.value)} maxLength={120} placeholder="e.g. Library entrance"
              className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-blue-400" />Where are you going?</label>
            <input value={destination} onChange={e => setDestination(e.target.value)} maxLength={120} placeholder="e.g. Girls hostel gate"
              className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-blue-400" />
          </div>
          {error && <div className="text-xs text-[#FF5D73]">{error}</div>}
          <button onClick={request} disabled={busy} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm disabled:opacity-70">
            {busy ? 'Sending…' : 'Send escort request'}
          </button>
        </div>
      ) : (
        <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
            {escort.status === 'acknowledged' || escort.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Clock className="w-5 h-5" />}
            {STATUS_TEXT[escort.status] || escort.status}
          </div>
          <div className="text-xs text-gray-300">From <b>{escort.pickupLocation}</b> to <b>{escort.destination}</b></div>
          <div className="flex gap-2">
            <a href="tel:112" className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5"><Phone className="w-3.5 h-3.5" />Call 112</a>
            <button onClick={cancel} className="flex-1 py-2.5 rounded-xl bg-[#FF5D73]/15 text-[#FF5D73] border border-[#FF5D73]/40 text-xs font-bold flex items-center justify-center gap-1.5"><X className="w-3.5 h-3.5" />{['completed', 'cancelled'].includes(escort.status) ? 'Close' : 'Cancel request'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
