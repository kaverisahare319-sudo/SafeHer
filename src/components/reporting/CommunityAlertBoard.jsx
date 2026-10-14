import React, { useState } from 'react';
import { 
  Bell, 
  ThumbsUp, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Tag, 
  Send 
} from 'lucide-react';
import { INITIAL_COMMUNITY_ALERTS } from '../../utils/campusData';

export function CommunityAlertBoard({ onOpenReportModal }) {
  const [alerts, setAlerts] = useState(INITIAL_COMMUNITY_ALERTS);
  const [upvotedIds, setUpvotedIds] = useState({});
  const [showPostForm, setShowPostForm] = useState(false);

  // New post state
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('Lighting / Visibility');
  const [newDescription, setNewDescription] = useState('');

  const handleUpvote = (alertId) => {
    if (upvotedIds[alertId]) {
      // Remove upvote
      setUpvotedIds(prev => ({ ...prev, [alertId]: false }));
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, upvotes: a.upvotes - 1 } : a));
    } else {
      // Add upvote
      setUpvotedIds(prev => ({ ...prev, [alertId]: true }));
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, upvotes: a.upvotes + 1 } : a));
    }
  };

  const handlePostAlert = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdAlert = {
      id: 'alert-' + Date.now(),
      title: newTitle,
      location: newLocation || 'Campus Quad',
      timeAgo: 'Just now',
      category: newCategory,
      description: newDescription,
      upvotes: 1,
      confirmed: true,
      expiresInDays: 7, // Auto-expiry after 7 days
      tags: ['Student Report', 'Active Caution']
    };

    setAlerts([createdAlert, ...alerts]);
    setUpvotedIds(prev => ({ ...prev, [createdAlert.id]: true }));
    setNewTitle('');
    setNewLocation('');
    setNewDescription('');
    setShowPostForm(false);
  };

  return (
    <div className="space-y-6 font-['Outfit'] animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Community Safety Feed</h2>
            <p className="text-xs text-gray-400">Anonymous peer warnings with 7-day auto-expiry</p>
          </div>
        </div>

        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post Warning</span>
        </button>
      </div>

      {/* NEW ALERT QUICK POST FORM */}
      {showPostForm && (
        <form onSubmit={handlePostAlert} className="glass-panel p-5 rounded-3xl border border-amber-500/40 bg-amber-950/15 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-white">Post Anonymous Safety Warning</h3>
            <span className="text-[10px] text-amber-400 font-bold">Auto-expires after 7 days</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Warning Headline:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Streetlight out near Gate 2 walkway"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Campus Location:</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Gate 2 / Cycle Stand"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Hazard Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Lighting / Visibility">Lighting / Visibility</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Physical Hazard">Physical / Construction Detour</option>
                  <option value="Equipment Broken">Equipment / Emergency Box Down</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Details & Advice:</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Suggest alternate routes or precautions for peers..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Broadcast Warning
            </button>
          </div>
        </form>
      )}

      {/* FEED OF ALERTS */}
      <div className="space-y-3">
        {alerts.map((alert) => {
          const isUpvoted = upvotedIds[alert.id];

          return (
            <div
              key={alert.id}
              className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/30 transition-all space-y-3"
            >
              {/* Top metadata */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {alert.category}
                    </span>
                    <span className="text-[11px] text-gray-400">• {alert.timeAgo}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {alert.title}
                  </h3>
                </div>

                {/* 7-DAY AUTO-EXPIRY BADGE */}
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-black/50 text-gray-300 border border-white/10 flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Expires in {alert.expiresInDays}d</span>
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#FF5D73]" />
                <span>{alert.location}</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed">
                {alert.description}
              </p>

              {/* Action Bar: Upvote & Confirmation */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvote(alert.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isUpvoted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                    <span>Confirm / Upvote ({alert.upvotes})</span>
                  </button>

                  {alert.upvotes >= 10 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Reported by students (not verified)
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-gray-500">
                  Anonymous student report
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
