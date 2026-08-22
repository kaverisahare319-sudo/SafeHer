import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Share2, Copy, Check, Shield, Hospital, Building2 } from 'lucide-react';
import { createGoogleMapsUrl, copyToClipboard, getWhatsAppShareUrl } from '../utils/shareHelpers';

export function LocationMap({ location, address, refreshLocation, loading }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showPlaces, setShowPlaces] = useState(true);

  const lat = location?.latitude || 28.6139; // Default New Delhi or fallback
  const lng = location?.longitude || 77.2090;

  useEffect(() => {
    // Dynamically initialize Leaflet map if Leaflet is loaded
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Map
      const map = window.L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false
      });

      // CartoDB Dark Matter tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom control at bottom right
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    const map = mapInstanceRef.current;

    // Update marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (window.L) {
      // Custom neon pink marker icon
      const pinkIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="
          width: 24px; 
          height: 24px; 
          background: #FF10F0; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          box-shadow: 0 0 20px #FF10F0, 0 0 40px #FF10F0;
          animation: pulse 1.5s infinite;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      markerRef.current = window.L.marker([lat, lng], { icon: pinkIcon }).addTo(map);
      markerRef.current.bindPopup(`
        <div style="font-family: Outfit, sans-serif;">
          <strong style="color: #FF10F0;">📍 Your Current Location</strong><br/>
          <small style="color: #ccc;">${address || 'Acquiring GPS...'}</small>
        </div>
      `);
    }

    // Update accuracy circle
    if (location?.accuracy) {
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(location.accuracy);
      } else if (window.L) {
        circleRef.current = window.L.circle([lat, lng], {
          radius: location.accuracy,
          color: '#FF10F0',
          fillColor: '#FF10F0',
          fillOpacity: 0.12,
          weight: 1
        }).addTo(map);
      }
    }

  }, [lat, lng, address, location?.accuracy]);

  const handleCopyLink = async () => {
    const link = createGoogleMapsUrl(lat, lng);
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const link = createGoogleMapsUrl(lat, lng);
    const msg = `📍 Here is my live safety location: ${link}`;
    window.open(getWhatsAppShareUrl('', msg), '_blank');
  };

  const handleCenterOnMe = () => {
    refreshLocation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Map Control Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#FF10F0]/20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF10F0]" />
            <span>Live Location Tracking</span>
          </h2>
          <p className="text-xs text-gray-400">
            {address ? address : loading ? 'Locating coordinates...' : 'OpenStreetMap Live GPS'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterOnMe}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold transition-all"
          >
            <Navigation className="w-4 h-4 text-[#FF10F0]" />
            <span>Recenter</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF10F0]/20 hover:bg-[#FF10F0]/30 text-[#FF10F0] border border-[#FF10F0]/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,16,240,0.2)]"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden glass-panel border border-[#FF10F0]/30 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Overlay Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-gray-300 border border-white/10 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF10F0] animate-ping" />
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
          {location?.accuracy && (
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono text-pink-300 border border-[#FF10F0]/30">
              Accuracy: ~{Math.round(location.accuracy)}m
            </span>
          )}
        </div>

        {/* Quick Safe Zone Indicators */}
        <div className="absolute bottom-3 left-3 z-20 glass-panel p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 max-w-[280px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nearby Safe Havens</p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <a 
              href={`https://www.google.com/maps/search/police+station/@${lat},${lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF10F0]/20 border border-white/10 flex flex-col items-center gap-1 transition-all"
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-medium text-gray-200">Police</span>
            </a>
            <a 
              href={`https://www.google.com/maps/search/hospital/@${lat},${lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF10F0]/20 border border-white/10 flex flex-col items-center gap-1 transition-all"
            >
              <Hospital className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-medium text-gray-200">Hospital</span>
            </a>
            <a 
              href={`https://www.google.com/maps/search/pharmacy+24+hours/@${lat},${lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF10F0]/20 border border-white/10 flex flex-col items-center gap-1 transition-all"
            >
              <Building2 className="w-4 h-4 text-green-400" />
              <span className="text-[10px] font-medium text-gray-200">Pharmacy</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
