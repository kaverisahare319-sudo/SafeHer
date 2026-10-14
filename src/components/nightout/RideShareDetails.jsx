import React, { useState } from 'react';
import { Car, Share2, Info } from 'lucide-react';
import { getSmsShareUrl } from '../../utils/shareHelpers';

// Lets her share the vehicle/driver details of a cab with her own contacts BEFORE she boards.
// SafeHer does not "verify" drivers or vehicles and makes no claim about them.
export function RideShareDetails({ contacts = [] }) {
  const [plate, setPlate] = useState('');
  const [driver, setDriver] = useState('');
  const [app, setApp] = useState('');
  const [car, setCar] = useState('');

  const people = contacts.filter(c => c.phone !== '112');
  const msg = `I'm taking a ride. Vehicle: ${plate.trim().toUpperCase() || 'n/a'}${car ? ` (${car})` : ''}. Driver: ${driver || 'n/a'}.${app ? ` Booked via ${app}.` : ''} Please check on me.`;
  const canShare = plate.trim().length >= 3 && people.length > 0;
  const inp = 'w-full h-11 bg-[#0D0E20] border border-[#2C2F55] rounded-xl text-sm text-white px-3 outline-none focus:border-indigo-400';

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"><Car className="w-6 h-6" /></div>
        <div>
          <h2 className="text-lg font-black text-white">Share Ride Details</h2>
          <p className="text-xs text-gray-400">Send the cab number to your contacts before you board</p>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="Vehicle number plate *" className={inp} maxLength={15} />
        <input value={driver} onChange={e => setDriver(e.target.value)} placeholder="Driver name (as shown in the app)" className={inp} maxLength={60} />
        <div className="grid grid-cols-2 gap-3">
          <input value={car} onChange={e => setCar(e.target.value)} placeholder="Car model / colour" className={inp} maxLength={40} />
          <input value={app} onChange={e => setApp(e.target.value)} placeholder="Ola / Uber / Rapido…" className={inp} maxLength={30} />
        </div>
        {people.length === 0 && <p className="text-xs text-amber-300">Add at least one emergency contact first (Contacts tab).</p>}
        <a href={canShare ? getSmsShareUrl(people.map(p => p.phone.replace(/\D/g, '')).join(','), msg) : undefined}
          aria-disabled={!canShare}
          className={`w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 ${canShare ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600/40 pointer-events-none'}`}>
          <Share2 className="w-4 h-4" /> Share with {people.length || 'my'} contact{people.length === 1 ? '' : 's'}
        </a>
      </div>

      <div className="flex gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-300" />
        <span>SafeHer cannot confirm that a driver or vehicle is genuine. Match the number plate and driver name with your booking app before you sit, and never share OTPs with anyone outside the ride.</span>
      </div>
    </div>
  );
}
