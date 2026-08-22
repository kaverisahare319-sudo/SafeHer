import React from 'react';
import { Download, ShieldAlert, X } from 'lucide-react';

export function PwaPrompt({ deferredPrompt, onInstall, onDismiss }) {
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto glass-panel p-4 rounded-2xl border-2 border-[#FF10F0] shadow-[0_0_30px_rgba(255,16,240,0.5)] flex items-center justify-between gap-3 animate-bounce">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#FF10F0]/20 text-[#FF10F0] border border-[#FF10F0]/40">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Install SafeHer App</h4>
          <p className="text-xs text-gray-300">Add to Home Screen for 1-tap fast emergency SOS access.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onInstall}
          className="px-3.5 py-2 rounded-xl bg-[#FF10F0] text-black font-extrabold text-xs shadow-[0_0_15px_#FF10F0] hover:bg-[#d900c9]"
        >
          Install
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
