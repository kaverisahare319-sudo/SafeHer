import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Users, 
  Timer, 
  PhoneCall, 
  Wrench, 
  ShieldAlert, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Header } from './components/Header';
import { SosButton } from './components/SosButton';
import { SosModal } from './components/SosModal';
import { LocationMap } from './components/LocationMap';
import { EmergencyContacts } from './components/EmergencyContacts';
import { SafetyCheckin } from './components/SafetyCheckin';
import { QuickDial } from './components/QuickDial';
import { SafetyToolkit } from './components/SafetyToolkit';
import { PwaPrompt } from './components/PwaPrompt';

import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { audioSiren } from './utils/audioSiren';

export default function App() {
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'map' | 'contacts' | 'checkin' | 'helplines' | 'toolkit'
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Custom geolocation hook
  const { location, address, loading: locationLoading, error: locationError, refreshLocation } = useGeolocation();

  // Default emergency contacts saved in localStorage
  const defaultContacts = [
    { id: '1', name: 'Mom', phone: '+1 800 555 0199', relation: 'Parent', isPrimary: true },
    { id: '2', name: 'Best Friend (Sarah)', phone: '+1 800 555 0188', relation: 'Friend', isPrimary: false },
    { id: '3', name: 'Emergency Helpline', phone: '112', relation: 'Police', isPrimary: false }
  ];

  const [contacts, setContacts] = useLocalStorage('safeher_emergency_contacts', defaultContacts);

  // Service Worker & PWA Install Listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service Worker Registration Error:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      audioSiren.stop();
      setIsSirenActive(false);
    } else {
      audioSiren.start();
      setIsSirenActive(true);
    }
  };

  const handleTriggerSos = () => {
    refreshLocation();
    setIsSosModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050509] text-gray-100 flex flex-col justify-between selection:bg-[#FF10F0] selection:text-black">
      
      {/* Top Header */}
      <Header 
        locationError={locationError}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 mb-24 flex-1">
        
        {/* Tab 1: SOS Home Dashboard */}
        {activeTab === 'sos' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Glowing Main SOS Hero */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#FF10F0]/30 shadow-[0_0_35px_rgba(255,16,240,0.15)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF10F0]/10 rounded-full blur-2xl pointer-events-none" />
              
              <SosButton
                onTriggerSos={handleTriggerSos}
                locationLoading={locationLoading}
                address={address}
              />
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('map')}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#FF10F0]/40 flex flex-col items-center gap-2 text-center transition-all group"
              >
                <div className="p-3 rounded-xl bg-[#FF10F0]/10 text-[#FF10F0] group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">Live Map</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#FF10F0]/40 flex flex-col items-center gap-2 text-center transition-all group"
              >
                <div className="p-3 rounded-xl bg-[#FF10F0]/10 text-[#FF10F0] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">Contacts ({contacts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('checkin')}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#FF10F0]/40 flex flex-col items-center gap-2 text-center transition-all group"
              >
                <div className="p-3 rounded-xl bg-[#FF10F0]/10 text-[#FF10F0] group-hover:scale-110 transition-transform">
                  <Timer className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">Safety Timer</span>
              </button>

              <button
                onClick={() => setActiveTab('helplines')}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#FF10F0]/40 flex flex-col items-center gap-2 text-center transition-all group"
              >
                <div className="p-3 rounded-xl bg-[#FF10F0]/10 text-[#FF10F0] group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white">112 Helplines</span>
              </button>
            </div>

            {/* Emergency Contacts Summary Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-[#FF10F0]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Primary Emergency Contact</h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {contacts.find(c => c.isPrimary)?.name || contacts[0]?.name || 'None Set'} • {contacts.find(c => c.isPrimary)?.phone || contacts[0]?.phone || ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('contacts')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF10F0] border border-white/10 text-xs font-bold"
              >
                Manage
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Live Location Map */}
        {activeTab === 'map' && (
          <LocationMap 
            location={location}
            address={address}
            refreshLocation={refreshLocation}
            loading={locationLoading}
          />
        )}

        {/* Tab 3: Emergency Contacts Manager */}
        {activeTab === 'contacts' && (
          <EmergencyContacts 
            contacts={contacts}
            setContacts={setContacts}
            location={location}
            address={address}
          />
        )}

        {/* Tab 4: Safety Check-in Timer */}
        {activeTab === 'checkin' && (
          <SafetyCheckin 
            onTriggerSos={handleTriggerSos}
            isSirenActive={isSirenActive}
            toggleSiren={toggleSiren}
          />
        )}

        {/* Tab 5: Quick Dial Helplines */}
        {activeTab === 'helplines' && (
          <QuickDial />
        )}

        {/* Tab 6: Safety Toolkit */}
        {activeTab === 'toolkit' && (
          <SafetyToolkit 
            isSirenActive={isSirenActive}
            toggleSiren={toggleSiren}
          />
        )}

      </main>

      {/* SOS Triggered Modal */}
      <SosModal 
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        location={location}
        address={address}
        contacts={contacts}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
      />

      {/* PWA Prompt Modal */}
      <PwaPrompt 
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPwa}
        onDismiss={() => setDeferredPrompt(null)}
      />

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#050509]/95 backdrop-blur-xl border-t border-[#FF10F0]/20 py-2 px-3">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'sos' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertOctagon className={`w-5 h-5 ${activeTab === 'sos' ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">MAP</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'contacts' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">CONTACTS</span>
          </button>

          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'checkin' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">TIMER</span>
          </button>

          <button
            onClick={() => setActiveTab('helplines')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'helplines' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">DIAL</span>
          </button>

          <button
            onClick={() => setActiveTab('toolkit')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeTab === 'toolkit' ? 'text-[#FF10F0] scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase">TOOLS</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
