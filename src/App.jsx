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
  Heart,
  Moon,
  GraduationCap,
  Lock,
  Settings,
  Vibrate,
  Volume2,
  VolumeX,
  Zap,
  EyeOff,
  PhoneIncoming,
  Radio,
  Sliders
} from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { SosButton } from './components/SosButton';
import { SosModal } from './components/SosModal';
import { LocationMap } from './components/LocationMap';
import { EmergencyContacts } from './components/EmergencyContacts';
import { SafetyCheckin } from './components/SafetyCheckin';
import { QuickDial } from './components/QuickDial';
import { SafetyToolkit } from './components/SafetyToolkit';
import { PwaPrompt } from './components/PwaPrompt';

// New Features Suite
import { SilentSosModal } from './components/emergency/SilentSosModal';
import { EmergencyActiveModal } from './components/emergency/EmergencyActiveModal';
import { ShakeAlertModal } from './components/emergency/ShakeAlertModal';
import { FakeCallModal } from './components/fakecall/FakeCallModal';
import { NightOutHub } from './components/nightout/NightOutHub';
import { CampusHub } from './components/campus/CampusHub';
import { TrustReportingHub } from './components/reporting/TrustReportingHub';
import { EmergencySettingsHub } from './components/settings/EmergencySettingsHub';

import { ComplaintBox } from './components/complaints/ComplaintBox';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { api } from './utils/api';

import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { audioSiren } from './utils/audioSiren';

export default function App() {
  const [user, setUser] = useLocalStorage('safeher_user', null);
  // Main Tabs: 'sos' | 'nightout' | 'campus' | 'trust' | 'settings' | 'map' | 'contacts' | 'helplines'
  const [activeTab, setActiveTab] = useState('sos');

  // Modals state
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSilentSosOpen, setIsSilentSosOpen] = useState(false);
  const [isEmergencyActiveOpen, setIsEmergencyActiveOpen] = useState(false);
  const [isShakeAlertOpen, setIsShakeAlertOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  // Siren and Offline state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Custom geolocation hook
  const { location, address, loading: locationLoading, error: locationError, refreshLocation } = useGeolocation();

  // Default emergency contacts saved in localStorage
  // Only the national emergency number is pre-filled. Everything else is added by the student herself.
  const defaultContacts = [
    { id: 'helpline-112', name: 'Emergency Helpline 112', phone: '112', relation: 'Emergency', isPrimary: false, autoSmsEnabled: false }
  ];

  const [contacts, setContacts] = useLocalStorage('safeher_emergency_contacts', defaultContacts);

  // Service Worker & PWA Install Listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.()) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service Worker Registration Error:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setContacts(defaultContacts); // don't leave one student's contacts on a shared device
    setActiveTab('sos');
    setUser(null);
  };

  // If the admin blocks an account or the token expires, sign out right away.
  useEffect(() => {
    if (!user?.token || user.role === 'admin') return;
    api('/api/complaints/mine', { token: user.token })
      .then(r => { if (r.status === 401 || r.status === 403) handleLogout(); })
      .catch(() => { /* offline: stay signed in */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

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
    setIsEmergencyActiveOpen(true);
  };

  // If user is not authenticated, render AuthScreen
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Admins get their own dashboard: no SOS/location screens.
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#12142A] text-[#F4F2FA] flex flex-col justify-between selection:bg-[#FF5D73] selection:text-black font-['Outfit']">
      
      {/* 1. Offline Mode Indicator (Reassuring banner when disconnected or testing) */}
      <OfflineBanner 
        isSimulatedOffline={isSimulatedOffline} 
        onToggleSimulation={() => setIsSimulatedOffline(!isSimulatedOffline)} 
      />

      {/* 2. Top Navigation Header */}
      <Header 
        locationError={locationError}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
        user={user}
        onLogout={handleLogout}
        onOpenSilentSos={() => setIsSilentSosOpen(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
      />

      {/* 3. Category Bar (Quick switch between 5 main modules) */}
      <div className="bg-[#0D0E20]/80 border-b border-[#2C2F55] px-4 py-2 sticky top-[60px] z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'sos'
                ? 'bg-[#FF5D73] text-black shadow-[0_0_15px_rgba(255,93,115,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>SOS Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('nightout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'nightout'
                ? 'bg-[#33D6A6] text-black shadow-[0_0_15px_rgba(51,214,166,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night-out Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('campus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'campus'
                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Campus Protection</span>
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'trust'
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Trust & Reporting</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Offline & Auto-SMS</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {/* 4. Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 mb-24 flex-1">
        
        {/* ============================================================ */}
        {/* TAB 1: SOS DASHBOARD & HARDWARE TRIGGER SUITE */}
        {/* ============================================================ */}
        {activeTab === 'sos' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Glowing Main SOS Hero */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#FF5D73]/30 shadow-[0_0_35px_rgba(255,93,115,0.15)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5D73]/10 rounded-full blur-2xl pointer-events-none" />
              
              <SosButton
                onTriggerSos={handleTriggerSos}
                locationLoading={locationLoading}
                address={address}
              />
            </div>

            {/* HIGH-IMPACT HARDWARE TRIGGER CARDS (Silent SOS, Siren+Strobe, Shake, Fake Call) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* Card 1: Silent SOS Stealth Screen */}
              <button
                onClick={() => setIsSilentSosOpen(true)}
                className="glass-panel p-4 rounded-2xl border border-purple-500/30 hover:border-purple-400 bg-gradient-to-b from-purple-950/20 to-transparent flex flex-col justify-between text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 group-hover:scale-110 transition-transform">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                    Stealth
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">Silent SOS Screen</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Covert lock screen disguise & 5s subtle countdown</p>
                </div>
              </button>

              {/* Card 2: Siren + Flashlight Strobe Emergency Active UI */}
              <button
                onClick={() => setIsEmergencyActiveOpen(true)}
                className="glass-panel p-4 rounded-2xl border border-red-500/30 hover:border-red-400 bg-gradient-to-b from-red-950/20 to-transparent flex flex-col justify-between text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500/30 text-red-200">
                    Full UI
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">Siren + Strobe Control</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Dual-tone loud audio siren & flashlight strobe</p>
                </div>
              </button>

              {/* Card 3: Shake-to-Alert Onboarding */}
              <button
                onClick={() => setIsShakeAlertOpen(true)}
                className="glass-panel p-4 rounded-2xl border border-pink-500/30 hover:border-pink-400 bg-gradient-to-b from-pink-950/20 to-transparent flex flex-col justify-between text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-pink-500/20 text-[#FF5D73] border border-pink-500/40 group-hover:scale-110 transition-transform">
                    <Vibrate className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-500/30 text-pink-200">
                    Sensor
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">Shake-to-Alert</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sensitivity calibration & real-time motion test</p>
                </div>
              </button>

              {/* Card 4: Fake Incoming Call */}
              <button
                onClick={() => setIsFakeCallOpen(true)}
                className="glass-panel p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-400 bg-gradient-to-b from-indigo-950/20 to-transparent flex flex-col justify-between text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 group-hover:scale-110 transition-transform">
                    <PhoneIncoming className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                    Escape
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">Fake Incoming Call</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Custom caller photo, timer & glanceable script</p>
                </div>
              </button>

            </div>

            {/* Location & Primary Contact Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-[#2C2F55] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-[#FF5D73]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Primary Emergency Contact</h4>
                  <p className="text-xs text-[#9491B4] font-medium">
                    {contacts.find(c => c.isPrimary)?.name || contacts[0]?.name || 'None Set'} • {contacts.find(c => c.isPrimary)?.phone || contacts[0]?.phone || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF5D73] border border-[#2C2F55] text-xs font-bold text-center"
                >
                  Configure Auto-SMS
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-[#2C2F55] text-xs font-bold text-center"
                >
                  Manage Contacts ({contacts.length})
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: NIGHT-OUT & SOCIAL SAFETY */}
        {/* ============================================================ */}
        {activeTab === 'nightout' && (
          <NightOutHub 
            userLocation={location}
            contacts={contacts}
            address={address}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 3: CAMPUS-SPECIFIC SAFETY */}
        {/* ============================================================ */}
        {activeTab === 'campus' && (
          <CampusHub 
            userLocation={location}
            address={address}
            token={user.token}
            contacts={contacts}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 4: TRUST & REPORTING */}
        {/* ============================================================ */}
        {activeTab === 'trust' && (
          <TrustReportingHub />
        )}

        {/* ============================================================ */}
        {/* TAB 5: EMERGENCY SETTINGS & OFFLINE RESILIENCE */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <EmergencySettingsHub 
            contacts={contacts}
            setContacts={setContacts}
            userLocation={location}
            userName={user?.name || 'Student'}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 6: LIVE LOCATION MAP */}
        {/* ============================================================ */}
        {activeTab === 'map' && (
          <LocationMap 
            location={location}
            address={address}
            refreshLocation={refreshLocation}
            loading={locationLoading}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 7: EMERGENCY CONTACTS */}
        {/* ============================================================ */}
        {activeTab === 'contacts' && (
          <EmergencyContacts 
            contacts={contacts}
            setContacts={setContacts}
            location={location}
            address={address}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 8: HELPLINES */}
        {/* ============================================================ */}
        {activeTab === 'helplines' && (
          <QuickDial />
        )}

      </main>

      {/* ============================================================ */}
      {/* ALL INTERACTIVE MODALS */}
      {/* ============================================================ */}

      {/* 1. Silent SOS Screen */}
      <SilentSosModal 
        isOpen={isSilentSosOpen}
        onClose={() => setIsSilentSosOpen(false)}
        location={location}
        address={address}
        contacts={contacts}
        onTriggerActiveSos={() => setIsEmergencyActiveOpen(true)}
      />

      {/* 2. Full-Screen Emergency Active UI (Siren + Flashlight + Stop Alert) */}
      <EmergencyActiveModal 
        isOpen={isEmergencyActiveOpen}
        onClose={() => setIsEmergencyActiveOpen(false)}
        location={location}
        address={address}
        contacts={contacts}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
      />

      {/* 3. Shake-to-Alert Onboarding & Test Screen */}
      <ShakeAlertModal 
        isOpen={isShakeAlertOpen}
        onClose={() => setIsShakeAlertOpen(false)}
      />

      {/* 4. Realistic Fake Incoming Call Screen with Glanceable Script */}
      <FakeCallModal 
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      {/* 5. Standard SOS Modal */}
      <SosModal 
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        location={location}
        address={address}
        contacts={contacts}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
      />

      {/* 6. PWA Installation Prompt */}
      <PwaPrompt 
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPwa}
        onDismiss={() => setDeferredPrompt(null)}
      />

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0E20]/95 backdrop-blur-xl border-t border-[#2C2F55] py-2 px-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'sos' ? 'text-[#FF5D73] scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <AlertOctagon className={`w-5 h-5 ${activeTab === 'sos' ? 'animate-pulse' : ''}`} />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('nightout')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'nightout' ? 'text-[#33D6A6] scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">NIGHT</span>
          </button>

          <button
            onClick={() => setActiveTab('campus')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'campus' ? 'text-blue-400 scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">CAMPUS</span>
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'trust' ? 'text-purple-400 scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">TRUST</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'settings' ? 'text-amber-400 scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">SETTINGS</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-emerald-400 scale-105' : 'text-[#9491B4] hover:text-[#F4F2FA]'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase">MAP</span>
          </button>

        </div>
      </nav>

      {/* Anonymous complaint box: fixed tab on the right edge */}
      <ComplaintBox token={user.token} onSessionExpired={handleLogout} />

    </div>
  );
}
