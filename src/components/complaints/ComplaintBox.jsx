import React, { useState, useEffect, useCallback } from 'react';
import { X, MessageSquareWarning, EyeOff, Send, CheckCircle2, Inbox } from 'lucide-react';
import { api } from '../../utils/api';

const CATEGORIES = ['Harassment', 'Stalking / Following', 'Ragging / Bullying', 'Unsafe place', 'Staff / Faculty misconduct', 'Other'];
const STATUS_STYLE = {
  open: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  in_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};
const STATUS_LABEL = { open: 'Received', in_review: 'In review', resolved: 'Resolved' };

// Floating tab on the right edge of the screen + slide-in drawer.
export function ComplaintBox({ token, onSessionExpired }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('new'); // 'new' | 'mine'
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState([]);

  const loadMine = useCallback(async () => {
    try {
      const { ok, status, data } = await api('/api/complaints/mine', { token });
      if (status === 401 || status === 403) return onSessionExpired?.();
      if (ok) setMine(data);
    } catch { /* offline: keep old list */ }
  }, [token, onSessionExpired]);

  useEffect(() => { if (open && tab === 'mine') loadMine(); }, [open, tab, loadMine]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (description.trim().length < 15) { setError('Please describe what happened (at least 15 characters).'); return; }
    setBusy(true);
    try {
      const { ok, status, data } = await api('/api/complaints', { method: 'POST', token, body: { category, location, description } });
      if (status === 401 || status === 403) return onSessionExpired?.();
      if (ok) { setSent(true); setDescription(''); setLocation(''); }
      else setError(data.message || 'Could not submit. Try again.');
    } catch { setError('Could not reach the server. Check your internet.'); }
    finally { setBusy(false); }
  };

  return (
    <>
      {/* Side tab */}
      <button
        onClick={() => { setOpen(true); setSent(false); }}
        aria-label="Open complaint box"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 px-2 py-4 rounded-l-2xl bg-[#FF5D73] text-[#2A0A10] shadow-[0_0_20px_rgba(255,93,115,0.45)] hover:pr-3 transition-all"
      >
        <MessageSquareWarning className="w-5 h-5" />
        <span className="text-[11px] font-black tracking-widest" style={{ writingMode: 'vertical-rl' }}>COMPLAINT BOX</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-[92%] max-w-md h-full bg-[#14162E] border-l border-[#2C2F55] flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-[#2C2F55]">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white">Complaint Box</h2>
                <p className="text-[11px] text-[#9491B4]">Goes to the college admin only</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-xl hover:bg-white/10 text-gray-300"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-1.5 p-3">
              {[['new', 'New complaint'], ['mine', 'My complaints']].map(([k, l]) => (
                <button key={k} onClick={() => { setTab(k); setSent(false); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${tab === k ? 'bg-[#FF5D73] text-[#2A0A10]' : 'bg-white/5 text-gray-300'}`}>{l}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-1">
              {tab === 'new' && (sent ? (
                <div className="text-center py-10 space-y-3">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                  <h3 className="text-white font-bold">Complaint submitted</h3>
                  <p className="text-xs text-[#9491B4] px-4">Your name is not saved with it. Track the status under “My complaints”.</p>
                  <button onClick={() => setSent(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold">File another</button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="flex gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs">
                    <EyeOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><b>100% anonymous.</b> Your name, email and phone are not stored with the complaint. Not even the admin can see who filed it.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#9491B4] mb-1.5">Type</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-[#FF5D73]">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9491B4] mb-1.5">Where? (optional)</label>
                    <input value={location} onChange={e => setLocation(e.target.value)} maxLength={120} placeholder="e.g. Library back gate, Block C corridor"
                      className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-[#FF5D73]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9491B4] mb-1.5">What happened?</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={6} placeholder="Write when, where and what happened…"
                      className="w-full bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white p-3 outline-none focus:border-[#FF5D73] resize-none" />
                    <div className="text-[10px] text-[#635F87] text-right">{description.length}/2000</div>
                  </div>
                  <p className="text-[11px] text-[#635F87]">Complaints are never shown publicly and nobody is labelled automatically. If you are in danger right now, call <b>112</b>.</p>
                  {error && <div className="p-3 rounded-xl bg-[#FF5D73]/10 border border-[#FF5D73] text-xs text-[#FF5D73]">{error}</div>}
                  <button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-[#FF5D73] text-[#2A0A10] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70">
                    <Send className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit anonymously'}
                  </button>
                </form>
              ))}

              {tab === 'mine' && (
                mine.length === 0 ? (
                  <div className="text-center py-12 text-[#9491B4] text-sm space-y-2"><Inbox className="w-10 h-10 mx-auto opacity-60" /><p>No complaints yet.</p></div>
                ) : (
                  <ul className="space-y-3">
                    {mine.map(c => (
                      <li key={c.id} className="p-3 rounded-2xl bg-[#1B1E3D] border border-[#2C2F55] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{c.category}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                        </div>
                        {c.location && <p className="text-[11px] text-[#9491B4]">📍 {c.location}</p>}
                        <p className="text-xs text-gray-200 whitespace-pre-wrap">{c.description}</p>
                        <p className="text-[10px] text-[#635F87]">{new Date(c.createdAt).toLocaleString()}</p>
                        {c.adminReply && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-100">
                            <b className="block text-[10px] uppercase tracking-wider text-emerald-300 mb-0.5">Admin reply</b>{c.adminReply}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
