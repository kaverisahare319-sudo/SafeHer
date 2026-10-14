import React, { useState } from 'react';
import { Building, Phone, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getSmsShareUrl } from '../../utils/shareHelpers';

// Hostel help numbers are entered by the student herself (warden, security desk, friends).
// SafeHer never claims wardens/police were notified. It only helps her call or text.
export function HostelRaPanicLink({ contacts = [], userLocation }) {
  const [hostelNumbers, setHostelNumbers] = useLocalStorage('safeher_hostel_numbers', []);
  const [label, setLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useLocalStorage('safeher_room', '');

  const add = (e) => {
    e.preventDefault();
    if (!label.trim() || !/^\+?[0-9 ]{3,15}$/.test(phone.trim())) return;
    setHostelNumbers([...hostelNumbers, { id: String(Date.now()), label: label.trim(), phone: phone.trim() }]);
    setLabel(''); setPhone('');
  };

  const msg = `I need help${room ? ` at ${room}` : ' in my hostel'}. Please call me or come to my room.` +
    (userLocation?.latitude ? ` Location: https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}` : '');
  const targets = [...hostelNumbers, ...contacts.filter(c => c.phone !== '112')];

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30"><Building className="w-6 h-6" /></div>
        <div>
          <h2 className="text-lg font-black text-white">Hostel Help</h2>
          <p className="text-xs text-gray-400">Your own warden / security numbers, one tap away</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10">
        <label className="block text-xs font-bold text-gray-300 mb-1.5">Your room (optional, added to your message)</label>
        <input value={room} onChange={e => setRoom(e.target.value)} maxLength={60} placeholder="e.g. Block B, Room 204"
          className="w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-purple-400" />
      </div>

      <div className="space-y-3">
        {hostelNumbers.length === 0 && <p className="text-xs text-gray-400 px-1">Add your hostel warden, security desk or friends below.</p>}
        {hostelNumbers.map(n => (
          <div key={n.id} className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-2">
            <div className="min-w-0"><div className="text-sm font-bold text-white truncate">{n.label}</div><div className="text-[11px] text-gray-400">{n.phone}</div></div>
            <div className="flex gap-1.5">
              <a href={`tel:${n.phone}`} aria-label={`Call ${n.label}`} className="p-2.5 rounded-xl bg-white/10 text-purple-300"><Phone className="w-4 h-4" /></a>
              <a href={getSmsShareUrl(n.phone, msg)} aria-label={`Message ${n.label}`} className="p-2.5 rounded-xl bg-white/10 text-purple-300"><MessageSquare className="w-4 h-4" /></a>
              <button onClick={() => setHostelNumbers(hostelNumbers.filter(x => x.id !== n.id))} aria-label="Remove" className="p-2.5 rounded-xl bg-white/5 text-gray-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Name (e.g. Warden)" className="sm:col-span-2 h-10 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-xs text-white px-3 outline-none" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" inputMode="tel" className="sm:col-span-2 h-10 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-xs text-white px-3 outline-none" />
        <button type="submit" className="h-10 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>
      </form>

      {targets.length > 0 && (
        <a href={getSmsShareUrl(targets.map(t => t.phone.replace(/\D/g, '')).join(','), msg)}
          className="block w-full py-3.5 rounded-2xl bg-purple-600 text-white text-sm font-bold text-center">
          Text all of these numbers “I need help”
        </a>
      )}
      <p className="text-[11px] text-gray-500 text-center">This opens your own SMS app. SafeHer does not contact anyone on its own. In danger, call <a href="tel:112" className="underline">112</a>.</p>
    </div>
  );
}
