import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  ShieldAlert, 
  PlusCircle 
} from 'lucide-react';
import { AnonymousReportModal } from './AnonymousReportModal';
import { CommunityAlertBoard } from './CommunityAlertBoard';

export function TrustReportingHub() {
  const [isAnonymousModalOpen, setIsAnonymousModalOpen] = useState(false);

  return (
    <div className="space-y-5 font-['Outfit'] animate-fadeIn">
      
      {/* Top Banner with Quick Trigger to File Incident */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-[#1B1E3D] to-[#12142A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Trust & Anonymous Reporting</h2>
            <p className="text-xs text-gray-300">
              Zero telemetry logs. Repeated reports on the same location trigger campus safety pattern alerts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAnonymousModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-[#FF5D73] hover:from-red-500 hover:to-[#ff4760] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>File Anonymous Report</span>
        </button>
      </div>

      {/* Community Alert Board */}
      <CommunityAlertBoard onOpenReportModal={() => setIsAnonymousModalOpen(true)} />

      {/* Anonymous Report Form Modal */}
      <AnonymousReportModal 
        isOpen={isAnonymousModalOpen} 
        onClose={() => setIsAnonymousModalOpen(false)} 
      />

    </div>
  );
}
