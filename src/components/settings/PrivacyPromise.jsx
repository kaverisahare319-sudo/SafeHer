import React from 'react';
import { ShieldCheck, Ban, Check } from 'lucide-react';

const NEVER = [
  ['No background surveillance', 'SafeHer does nothing in the background. It does not watch, listen or record you.'],
  ['No hidden camera or mic monitoring', 'The camera and microphone are never used secretly.'],
  ['No permanent location tracking', 'Your location is used only while you start a Walk Me Home or an SOS. It is time-limited and forgotten when you stop. It is never saved in your profile.'],
  ['No automatic “dangerous person” labels', 'The app never decides that someone is dangerous. Complaints and reports are reviewed by the admin. Nobody is accused or flagged automatically.'],
  ['No facial recognition', 'No face scanning of you or anyone else, ever.'],
  ['No fake police or emergency claims', 'SafeHer is not a police or emergency service. It alerts only YOUR contacts. In danger, call 112.'],
  ['No “100% safe route” promise', 'No app can guarantee safety. Heatmaps show only what students reported.'],
  ['No public personal information', 'Your name, phone, email and ID card are never shown to other students. Complaints are anonymous even to the admin.']
];

const YES = [
  'Only female students of this college, approved by the admin after checking the ID card',
  'ID card photo is deleted right after the admin decides',
  'You can sign out any time. Your location stops being shared immediately when you tap “I’m safe”'
];

export function PrivacyPromise() {
  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/25 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"><ShieldCheck className="w-6 h-6" /></div>
        <div>
          <h2 className="text-lg font-black text-white">Our Privacy & Safety Promise</h2>
          <p className="text-xs text-gray-400">What SafeHer will never do</p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {NEVER.map(([t, d]) => (
          <li key={t} className="flex gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <Ban className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#FF5D73]" />
            <div><div className="text-sm font-bold text-white">{t}</div><div className="text-xs text-gray-400 mt-0.5">{d}</div></div>
          </li>
        ))}
      </ul>

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
        {YES.map(y => (
          <div key={y} className="flex gap-2 text-xs text-emerald-100"><Check className="w-4 h-4 flex-shrink-0 text-emerald-300" />{y}</div>
        ))}
      </div>
    </div>
  );
}
