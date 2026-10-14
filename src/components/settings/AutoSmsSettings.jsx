import React, { useState } from 'react';
import { 
  MessageSquare, 
  MapPin, 
  Users, 
  Check, 
  Copy, 
  Send, 
  Smartphone, 
  RotateCcw, 
  CheckCircle2, 
  Sliders 
} from 'lucide-react';
import { createGoogleMapsUrl, copyToClipboard } from '../../utils/shareHelpers';

const DEFAULT_TEMPLATE = "{name} needs emergency help immediately! Location: {location} (Battery: {battery}, Sent at {time})";

export function AutoSmsSettings({ contacts, setContacts, userLocation, userName = 'Priya' }) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [copied, setCopied] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Toggle contact auto-SMS enabled
  const toggleContactSms = (id) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, autoSmsEnabled: c.autoSmsEnabled === undefined ? false : !c.autoSmsEnabled };
      }
      return c;
    }));
  };

  const lat = userLocation?.latitude ?? null;
  const lng = userLocation?.longitude ?? null;
  const mapsUrl = createGoogleMapsUrl(lat, lng);
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate preview text replacing tags
  const previewText = template
    .replace('{name}', userName)
    .replace('{location}', mapsUrl)
    .replace('{battery}', '92%')
    .replace('{time}', currentTimeStr);

  const handleCopyPreview = async () => {
    const ok = await copyToClipboard(previewText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendTestSms = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-[#FF5D73]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#FF5D73]/15 text-[#FF5D73] border border-[#FF5D73]/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Auto-SMS with Live Location</h2>
            <p className="text-xs text-gray-400">Automated multi-contact SMS dispatch configuration</p>
          </div>
        </div>
      </div>

      {/* 1. CONTACT LIST WITH TOGGLE SWITCHES */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#FF5D73]" />
            <span>Emergency SMS Recipients ({contacts.filter(c => c.autoSmsEnabled !== false).length} Active)</span>
          </div>
          <span className="text-[11px] text-gray-400">Toggled on for instant broadcast</span>
        </div>

        <div className="space-y-2.5">
          {contacts.map((contact) => {
            const isEnabled = contact.autoSmsEnabled !== false; // enabled by default
            return (
              <div 
                key={contact.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white">{contact.name}</p>
                      {contact.isPrimary && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#FF5D73]/20 text-[#FF5D73] font-bold border border-[#FF5D73]/30">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">{contact.phone} • {contact.relation}</p>
                  </div>
                </div>

                {/* Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleContactSms(contact.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5D73]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MESSAGE TEMPLATE EDITOR */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#FF5D73]" />
            <span>Emergency SMS Template:</span>
          </label>
          <button
            onClick={() => setTemplate(DEFAULT_TEMPLATE)}
            className="text-[11px] text-gray-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Template</span>
          </button>
        </div>

        {/* Dynamic Tags Helper */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['{name}', '{location}', '{battery}', '{time}'].map(tag => (
            <button
              key={tag}
              onClick={() => setTemplate(prev => prev + ' ' + tag)}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[#FF5D73] border border-white/10"
              title="Click to append tag"
            >
              +{tag}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full p-3.5 rounded-2xl bg-black/50 border border-white/15 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-[#FF5D73]"
        />
      </div>

      {/* 3. LIVE PREVIEW */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Live Auto-SMS Preview</span>
          </span>
          <button
            onClick={handleCopyPreview}
            className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Sample'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 text-xs text-emerald-100 font-mono break-all leading-relaxed">
          {previewText}
        </div>

        {/* Test SMS Button */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Standard SMS rates apply via cellular network.</p>
          <button
            onClick={handleSendTestSms}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test SMS</span>
          </button>
        </div>

        {testSent && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
            ✓ Test broadcast dispatched successfully to {contacts.find(c => c.isPrimary)?.name || 'Primary Contact'}!
          </div>
        )}
      </div>

    </div>
  );
}
