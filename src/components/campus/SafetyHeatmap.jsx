import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Plus, 
  Layers, 
  Check, 
  X, 
  Send,
  Eye
} from 'lucide-react';
import { HEATMAP_ZONES } from '../../utils/campusData';

export function SafetyHeatmap() {
  const [zones, setZones] = useState(HEATMAP_ZONES);
  const [selectedZone, setSelectedZone] = useState(HEATMAP_ZONES[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [newReportLocation, setNewReportLocation] = useState('');
  const [newReportType, setNewReportType] = useState('lighting');
  const [newReportDetails, setNewReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
  };

  const handleSubmitAreaReport = (e) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportModalOpen(false);
      setNewReportLocation('');
      setNewReportDetails('');
    }, 2000);
  };

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-yellow-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Campus Safety Heatmap</h2>
            <p className="text-xs text-gray-400">Areas students have reported. Not a safety guarantee.</p>
          </div>
        </div>

        {/* "Report this Area" Pin Button */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
        >
          <MapPin className="w-4 h-4" />
          <span>Report Area Pin</span>
        </button>
      </div>

      {/* HEATMAP RADAR / ZONE OVERVIEW */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4">
        
        {/* Color Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
          <span className="text-gray-300">CAMPUS SAFETY ZONES:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Safe & Well-Lit
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Caution Needed
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Unsafe / Avoid
            </span>
          </div>
        </div>

        {/* Zone Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zones.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            const statusBg = zone.status === 'safe' 
              ? 'border-emerald-500/40 hover:border-emerald-400' 
              : zone.status === 'caution' 
              ? 'border-amber-500/40 hover:border-amber-400' 
              : 'border-red-500/50 hover:border-red-400';

            return (
              <button
                key={zone.id}
                onClick={() => handleSelectZone(zone)}
                className={`p-4 rounded-2xl border text-left transition-all ${statusBg} ${
                  isSelected ? 'bg-white/10 shadow-lg' : 'bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    zone.status === 'safe' ? 'bg-emerald-500/20 text-emerald-300' :
                    zone.status === 'caution' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {zone.levelText}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-300">
                    {zone.reportsCount} report{zone.reportsCount === 1 ? '' : 's'}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white mt-2 truncate">
                  {zone.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{zone.reportsCount} student reports this week</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED ZONE DETAILS CARD */}
      {selectedZone && (
        <div className="glass-panel p-5 rounded-3xl border border-white/15 bg-black/50 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">STUDENT REPORTS FOR THIS AREA</span>
              <h3 className="text-base font-extrabold text-white">{selectedZone.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white">{selectedZone.reportsCount}</span>
              <span className="text-xs text-gray-400"> reports</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Lighting Infrastructure</p>
              <p className="text-gray-200">{selectedZone.lighting}</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Patrol info (from college)</p>
              <p className="text-gray-200">{selectedZone.patrols}</p>
            </div>
          </div>
        </div>
      )}

      {/* "REPORT THIS AREA" PIN MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-['Outfit']">
          <div className="relative w-full max-w-md bg-[#12142A] border border-red-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Report Unsafe Campus Area</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center space-y-2 text-emerald-200 animate-fadeIn">
                <Check className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold text-sm">Anonymous Pin Submitted!</p>
                <p className="text-xs text-emerald-300">
                  Added as a student report. The admin can review it.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAreaReport} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                    Specific Campus Location:
                  </label>
                  <input
                    type="text"
                    required
                    value={newReportLocation}
                    onChange={(e) => setNewReportLocation(e.target.value)}
                    placeholder="e.g. Behind Chem Lab B or Gate 3 alley"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                    Issue Category:
                  </label>
                  <select
                    value={newReportType}
                    onChange={(e) => setNewReportType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="lighting">Broken / Dim Streetlight</option>
                    <option value="isolated">Overgrown bushes / blindspot</option>
                    <option value="suspicious">Suspicious loitering</option>
                    <option value="harassment">Verbal harassment reported</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                    Additional Details:
                  </label>
                  <textarea
                    rows={2}
                    value={newReportDetails}
                    onChange={(e) => setNewReportDetails(e.target.value)}
                    placeholder="Describe safety hazard..."
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  100% Anonymous. Aggregated with fellow student reports to update heatmap color zones automatically.
                </p>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all"
                >
                  SUBMIT ANONYMOUS AREA PIN
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
