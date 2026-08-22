import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export function QuickDial() {
  const helplines = [
    {
      title: "National Emergency / Police",
      number: "112",
      description: "24/7 All-in-one Emergency Services",
      icon: ShieldAlert,
      color: "from-red-600/30 to-[#FF10F0]/20",
      borderColor: "border-red-500/50",
      btnColor: "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
    },
    {
      title: "Women's Emergency Helpline",
      number: "1091",
      description: "Dedicated Women Protection Helpline",
      icon: ShieldCheck,
      color: "from-[#FF10F0]/30 to-purple-600/20",
      borderColor: "border-[#FF10F0]/50",
      btnColor: "bg-[#FF10F0] text-black hover:bg-[#d900c9] shadow-[0_0_15px_#FF10F0]"
    },
    {
      title: "Ambulance / Medical",
      number: "102",
      description: "Medical Emergency & Ambulance Services",
      icon: HeartPulse,
      color: "from-emerald-600/30 to-teal-600/20",
      borderColor: "border-emerald-500/50",
      btnColor: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
    },
    {
      title: "Domestic Abuse Helpline",
      number: "181",
      description: "Support for Domestic Violence Victims",
      icon: Lock,
      color: "from-amber-600/30 to-orange-600/20",
      borderColor: "border-amber-500/50",
      btnColor: "bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.5)]"
    },
    {
      title: "Cyber Crime Helpline",
      number: "1930",
      description: "Report Harassment & Cyber Threats",
      icon: PhoneCall,
      color: "from-blue-600/30 to-cyan-600/20",
      borderColor: "border-blue-500/50",
      btnColor: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
    }
  ];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[#FF10F0]/20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#FF10F0]" />
            <span>Emergency Helplines (1-Tap Dial)</span>
          </h2>
          <p className="text-xs text-gray-400">
            Tapping directly opens your phone dialer for instant emergency response.
          </p>
        </div>
      </div>

      {/* Grid of Helpline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {helplines.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-5 rounded-2xl border ${item.borderColor} bg-gradient-to-br ${item.color} flex items-center justify-between transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-[#FF10F0]">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{item.title}</h3>
                  <p className="text-xs text-gray-300 font-medium mt-0.5">{item.description}</p>
                  <span className="text-lg font-black text-white font-mono">{item.number}</span>
                </div>
              </div>

              <a
                href={`tel:${item.number}`}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all ${item.btnColor}`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL</span>
              </a>
            </div>
          );
        })}
      </div>

    </div>
  );
}
