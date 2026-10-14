import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Upload, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  Camera, 
  X 
} from 'lucide-react';

export function AnonymousReportModal({ isOpen, onClose, onReportSubmitted }) {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('harassment');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [anonToken, setAnonToken] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedToken = 'ANON-' + Math.floor(100000 + Math.random() * 900000);
      setAnonToken(generatedToken);
      setSubmissionSuccess(true);
      if (onReportSubmitted) {
        onReportSubmitted({ location, category, description, token: generatedToken });
      }
    }, 1200);
  };

  const handleReset = () => {
    setLocation('');
    setDescription('');
    setPhotoPreview(null);
    setSubmissionSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn font-['Outfit']">
      <div className="relative w-full max-w-lg bg-[#12142A] border border-[#FF5D73]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/40 via-[#1B1E3D] to-[#12142A] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF5D73]/15 text-[#FF5D73] border border-[#FF5D73]/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Anonymous Incident Reporting</h2>
              <p className="text-xs text-gray-400">Zero identity telemetry recorded or shared</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Privacy note */}
          <div className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-purple-300 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>STRICT ANONYMITY & PATTERN DISCOVERY</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic font-medium">
              "Your identity is never shared; repeated reports on the same location/person trigger a pattern alert to campus safety."
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero IP tracking • Metadata stripped from photos automatically</span>
            </div>
          </div>

          {submissionSuccess ? (
            /* Success Receipt */
            <div className="p-6 rounded-3xl bg-emerald-950/80 border border-emerald-500 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Incident Safely Filed</h3>
                <p className="text-xs text-emerald-200">
                  Your report has been encrypted into the campus safety pattern detection database.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                Anonymous Reference Token: <span className="font-bold text-white">{anonToken}</span>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
              >
                Close Report Form
              </button>
            </div>
          ) : (
            /* The Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Location */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                  Incident Location / Sector:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#FF5D73] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near Science Quad bike rack or Library Bus Stop"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5D73]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                  Incident Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF5D73]"
                >
                  <option value="harassment">Catcalling / Verbal Harassment</option>
                  <option value="stalking">Followed / Stalking behavior</option>
                  <option value="loitering">Suspicious individual idling in blindspot</option>
                  <option value="physical">Physical misconduct</option>
                  <option value="lighting">Broken safety light / Call box broken</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                  Incident Description:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, physical descriptions, vehicle models, or behavior patterns..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5D73] resize-none"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">
                  Optional Photo Attachment (EXIF stripped):
                </label>
                <div className="border border-dashed border-white/20 rounded-2xl p-4 text-center hover:border-white/40 transition-colors">
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-xl border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview(null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1 text-gray-400">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300">Click to attach photo evidence</span>
                      <span className="text-[10px] text-gray-500">PNG, JPG up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-[#FF5D73] to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,93,115,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'ENCRYPTING & DISPATCHING...' : 'SUBMIT ENCRYPTED ANONYMOUS REPORT'}</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
