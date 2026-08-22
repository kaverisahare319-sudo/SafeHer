import React, { useState } from 'react';
import { 
  UserPlus, 
  Phone, 
  MessageSquare, 
  Send, 
  Trash2, 
  Star, 
  Edit3, 
  ShieldCheck, 
  X, 
  Check, 
  Heart 
} from 'lucide-react';
import { getWhatsAppShareUrl, getSmsShareUrl } from '../utils/shareHelpers';

export function EmergencyContacts({ contacts, setContacts, location, address }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: 'Family',
    isPrimary: false
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', relation: 'Family', isPrimary: contacts.length === 0 });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation || 'Family',
      isPrimary: !!contact.isPrimary
    });
    setEditingId(contact.id);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this emergency contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    let updatedList = [...contacts];

    if (formData.isPrimary) {
      // Clear other primary flags
      updatedList = updatedList.map(c => ({ ...c, isPrimary: false }));
    }

    if (editingId) {
      updatedList = updatedList.map(c => 
        c.id === editingId ? { ...c, ...formData } : c
      );
    } else {
      const newContact = {
        id: Date.now().toString(),
        ...formData
      };
      updatedList.push(newContact);
    }

    setContacts(updatedList);
    setIsAdding(false);
  };

  const lat = location?.latitude || 0;
  const lng = location?.longitude || 0;
  const sosMsg = `🚨 EMERGENCY! I need help! My location: https://www.google.com/maps?q=${lat},${lng} ${address ? '(' + address + ')' : ''}`;

  return (
    <div className="space-y-4">
      
      {/* Header & Add Button */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-[#FF10F0]/20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF10F0]" />
            <span>Trusted Emergency Contacts</span>
          </h2>
          <p className="text-xs text-gray-400">
            Contacts saved securely in your browser ({contacts.length} saved)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF10F0] hover:bg-[#d900c9] text-black font-extrabold text-xs shadow-[0_0_15px_#FF10F0] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-5 rounded-2xl border border-[#FF10F0] shadow-[0_0_30px_rgba(255,16,240,0.4)]">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Emergency Contact' : 'Add Trusted Contact'}
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-300">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mom, Sister, Best Friend"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF10F0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 234 567 8900"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF10F0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Relationship</label>
                <select
                  value={formData.relation}
                  onChange={e => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF10F0]"
                >
                  <option value="Family">Family</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Partner">Partner</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 accent-[#FF10F0] rounded"
                />
                <label htmlFor="isPrimary" className="text-xs text-gray-200 font-medium">
                  Set as Primary SOS Receiver
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-semibold hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF10F0] text-black text-xs font-bold shadow-[0_0_15px_#FF10F0] hover:bg-[#d900c9]"
                >
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts List Grid */}
      {contacts.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center border border-white/10 space-y-3">
          <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-300">No Contacts Added Yet</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Add trusted contacts like family or friends to quickly notify them during emergency SOS alerts.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#FF10F0]/20 text-[#FF10F0] border border-[#FF10F0]/40 text-xs font-bold"
          >
            + Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`glass-panel p-4 rounded-2xl border transition-all ${
                contact.isPrimary
                  ? 'border-[#FF10F0] bg-[#FF10F0]/5 shadow-[0_0_20px_rgba(255,16,240,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{contact.name}</h3>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF10F0] text-black text-[10px] font-extrabold flex items-center gap-0.5 shadow-[0_0_8px_#FF10F0]">
                        <Star className="w-3 h-3 fill-black" /> PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{contact.phone}</p>
                  <span className="inline-block mt-1 text-[11px] text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20 font-medium">
                    {contact.relation || 'Contact'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>

                <a
                  href={getSmsShareUrl(contact.phone, sosMsg)}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS</span>
                </a>

                <a
                  href={getWhatsAppShareUrl(contact.phone, sosMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#FF10F0]/20 hover:bg-[#FF10F0]/30 text-[#FF10F0] border border-[#FF10F0]/30 text-xs font-bold transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
