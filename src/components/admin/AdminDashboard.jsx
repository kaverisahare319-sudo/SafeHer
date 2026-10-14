import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, LogOut, UserCheck, MessageSquareWarning, Footprints, Users, RefreshCw, X, Check, Ban } from 'lucide-react';
import { api } from '../../utils/api';

const TABS = [
  { id: 'approvals', label: 'Approvals', icon: UserCheck },
  { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
  { id: 'escorts', label: 'Escorts', icon: Footprints },
  { id: 'students', label: 'Students', icon: Users }
];

const card = 'p-4 rounded-2xl bg-[#1B1E3D] border border-[#2C2F55]';
const btn = 'px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5';

export function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('approvals');
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idView, setIdView] = useState(null); // { name, img }
  const [rejectFor, setRejectFor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [replies, setReplies] = useState({});
  const token = user.token;

  const guard = useCallback((res) => {
    if (res.status === 401 || res.status === 403) { onLogout(); return false; }
    return true;
  }, [onLogout]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const s = await api('/api/admin/stats', { token });
      if (!guard(s)) return;
      setStats(s.data);
      const path = {
        approvals: '/api/admin/users?status=pending',
        students: '/api/admin/users?status=approved',
        complaints: `/api/admin/complaints${filter ? `?status=${filter}` : ''}`,
        escorts: '/api/admin/escorts'
      }[tab];
      const r = await api(path, { token });
      if (!guard(r)) return;
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch { setError('Could not reach the server.'); }
    finally { setLoading(false); }
  }, [tab, filter, token, guard]);

  useEffect(() => { load(); }, [load]);

  const post = async (path, body, method = 'POST') => {
    const r = await api(path, { method, token, body: body || {} });
    if (!guard(r)) return false;
    if (!r.ok) { setError(r.data.message || 'Action failed.'); return false; }
    await load(); return true;
  };

  const viewId = async (u) => {
    const r = await api(`/api/admin/users/${u.id}/id-card`, { token });
    if (!guard(r)) return;
    if (r.ok) setIdView({ name: u.name, img: r.data.idCardImage }); else setError('No ID card on file.');
  };

  const badge = (n) => n > 0 && <span className="ml-1 px-1.5 rounded-full bg-[#FF5D73] text-[#2A0A10] text-[10px] font-black">{n}</span>;

  return (
    <div className="min-h-screen bg-[#12142A] text-[#F4F2FA] font-['Outfit']">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#14162E]/95 backdrop-blur border-b border-[#2C2F55]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FF5D73]/15 border border-[#FF5D73]/40"><ShieldCheck className="w-5 h-5 text-[#FF5D73]" /></div>
          <div>
            <div className="font-['Space_Grotesk'] font-bold">Safe<span className="text-[#FF5D73]">Her</span> <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-white/10 text-gray-300">ADMIN</span></div>
            <div className="text-[11px] text-[#9491B4]">{user.name}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load} aria-label="Refresh" className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button onClick={onLogout} aria-label="Log out" className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4 pb-24">
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[['Waiting approval', stats.students.pending, 'text-amber-300'], ['Approved students', stats.students.approved, 'text-emerald-300'],
              ['Open complaints', stats.complaints.open, 'text-[#FF5D73]'], ['Resolved', stats.complaints.resolved, 'text-blue-300']].map(([l, n, c]) => (
              <div key={l} className={card}><div className={`text-2xl font-black ${c}`}>{n}</div><div className="text-[11px] text-[#9491B4]">{l}</div></div>
            ))}
          </div>
        )}

        <nav className="flex gap-1.5 p-1.5 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setRows([]); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${tab === t.id ? 'bg-[#FF5D73] text-[#2A0A10]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
              {t.id === 'approvals' && stats && badge(stats.students.pending)}
              {t.id === 'complaints' && stats && badge(stats.complaints.open)}
            </button>
          ))}
        </nav>

        {error && <div className="p-3 rounded-xl bg-[#FF5D73]/10 border border-[#FF5D73] text-xs text-[#FF5D73]">{error}</div>}

        {tab === 'complaints' && (
          <div className="flex gap-1.5 overflow-x-auto">
            {[['', 'All'], ['open', 'Received'], ['in_review', 'In review'], ['resolved', 'Resolved']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${filter === v ? 'bg-white text-black border-white' : 'border-[#2C2F55] text-gray-300'}`}>{l}</button>
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && <div className="text-center text-[#9491B4] text-sm py-14">Nothing here right now.</div>}

        {/* APPROVALS */}
        {tab === 'approvals' && rows.map(u => (
          <div key={u.id} className={`${card} space-y-3`}>
            <div>
              <div className="font-bold">{u.name}</div>
              <div className="text-xs text-[#9491B4]">{u.email} · {u.phone}</div>
              <div className="text-[10px] text-[#635F87] mt-0.5">Registered {new Date(u.createdAt).toLocaleString()} · email verified</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => viewId(u)} className={`${btn} bg-white/10 text-white`}>View ID card</button>
              <button onClick={() => post(`/api/admin/users/${u.id}/approve`)} className={`${btn} bg-emerald-500 text-black`}><Check className="w-3.5 h-3.5" />Approve</button>
              <button onClick={() => { setRejectFor(u); setRejectReason(''); }} className={`${btn} bg-[#FF5D73]/20 text-[#FF5D73] border border-[#FF5D73]/40`}><X className="w-3.5 h-3.5" />Reject</button>
            </div>
          </div>
        ))}

        {/* COMPLAINTS (no identity exists to show) */}
        {tab === 'complaints' && rows.map(c => (
          <div key={c.id} className={`${card} space-y-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm">{c.category}</span>
              <select value={c.status} onChange={e => post(`/api/admin/complaints/${c.id}`, { status: e.target.value }, 'PATCH')}
                className="bg-[#0D0E20] border border-[#2C2F55] rounded-lg text-xs px-2 py-1">
                <option value="open">Received</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
              </select>
            </div>
            {c.location && <div className="text-xs text-[#9491B4]">📍 {c.location}</div>}
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{c.description}</p>
            <div className="text-[10px] text-[#635F87]">{new Date(c.createdAt).toLocaleString()} · complainant identity is not stored</div>
            {c.adminReply && <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-100"><b>Your reply:</b> {c.adminReply}</div>}
            <div className="flex gap-2">
              <input value={replies[c.id] ?? ''} onChange={e => setReplies(p => ({ ...p, [c.id]: e.target.value }))} placeholder="Write a reply the student can see…"
                className="flex-1 h-10 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-xs px-3 outline-none focus:border-[#FF5D73]" />
              <button disabled={!(replies[c.id] || '').trim()} onClick={async () => { if (await post(`/api/admin/complaints/${c.id}`, { adminReply: replies[c.id], status: c.status === 'open' ? 'in_review' : c.status }, 'PATCH')) setReplies(p => ({ ...p, [c.id]: '' })); }}
                className={`${btn} bg-[#FF5D73] text-[#2A0A10] disabled:opacity-40`}>Send</button>
            </div>
          </div>
        ))}

        {/* ESCORTS */}
        {tab === 'escorts' && rows.map(e => (
          <div key={e.id} className={`${card} space-y-2`}>
            <div className="flex items-center justify-between"><span className="font-bold">{e.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 uppercase">{e.status}</span></div>
            <div className="text-xs text-[#9491B4]">From <b className="text-gray-200">{e.pickupLocation}</b> to <b className="text-gray-200">{e.destination}</b></div>
            <div className="flex gap-2">
              {e.phone && <a href={`tel:${e.phone}`} className={`${btn} bg-white/10 text-white`}>Call</a>}
              {e.status === 'requested' && <button onClick={() => post(`/api/admin/escorts/${e.id}`, { status: 'acknowledged' }, 'PATCH')} className={`${btn} bg-blue-500 text-white`}>Acknowledge</button>}
              <button onClick={() => post(`/api/admin/escorts/${e.id}`, { status: 'completed' }, 'PATCH')} className={`${btn} bg-emerald-500 text-black`}>Completed</button>
            </div>
          </div>
        ))}

        {/* STUDENTS */}
        {tab === 'students' && rows.map(u => (
          <div key={u.id} className={`${card} flex items-center justify-between gap-3`}>
            <div className="min-w-0"><div className="font-bold truncate">{u.name}</div><div className="text-xs text-[#9491B4] truncate">{u.email} · {u.phone}</div></div>
            <button onClick={() => { if (window.confirm(`Block ${u.name}? She will be signed out and cannot sign in.`)) post(`/api/admin/users/${u.id}/block`, { reason: 'Blocked by admin' }); }}
              className={`${btn} bg-[#FF5D73]/15 text-[#FF5D73] border border-[#FF5D73]/40`}><Ban className="w-3.5 h-3.5" />Block</button>
          </div>
        ))}
      </main>

      {idView && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIdView(null)}>
          <div className="max-w-lg w-full bg-[#14162E] rounded-2xl p-3 border border-[#2C2F55]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold">ID card — {idView.name}</span><button onClick={() => setIdView(null)}><X className="w-5 h-5" /></button></div>
            <img src={idView.img} alt="College ID card" className="w-full rounded-xl" />
            <p className="text-[11px] text-[#9491B4] mt-2">Check the name matches and that the student is female and from this college. The photo is deleted after you decide.</p>
          </div>
        </div>
      )}

      {rejectFor && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#14162E] rounded-2xl p-4 border border-[#2C2F55] space-y-3">
            <div className="font-bold">Reject {rejectFor.name}?</div>
            <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason (shown to her), e.g. ID not clear"
              className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm px-3 outline-none focus:border-[#FF5D73]" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectFor(null)} className={`${btn} bg-white/10`}>Cancel</button>
              <button onClick={async () => { if (await post(`/api/admin/users/${rejectFor.id}/reject`, { reason: rejectReason })) setRejectFor(null); }} className={`${btn} bg-[#FF5D73] text-[#2A0A10]`}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
