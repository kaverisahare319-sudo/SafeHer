// Web Audio API emergency synth siren - no external MP3 dependencies
let audioCtx = null;
let osc1 = null;
let osc2 = null;
let gainNode = null;
let isPlaying = false;
let intervalId = null;

export const audioSiren = {
  start: () => {
    if (isPlaying) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      osc1 = audioCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.connect(gainNode);
      osc1.start();

      isPlaying = true;
      let high = false;

      // Alternating dual-tone siren (850 Hz <-> 1250 Hz)
      intervalId = setInterval(() => {
        if (!audioCtx || !osc1) return;
        const freq = high ? 850 : 1250;
        osc1.frequency.setValueAtTime(freq, audioCtx.currentTime);
        high = !high;
      }, 350);

    } catch (e) {
      console.error("Audio Context Error:", e);
    }
  },

  stop: () => {
    if (!isPlaying) return;
    if (intervalId) clearInterval(intervalId);
    
    try {
      if (osc1) {
        osc1.stop();
        osc1.disconnect();
      }
      if (audioCtx) {
        audioCtx.close();
      }
    } catch (e) {
      console.error("Error stopping audio:", e);
    }

    osc1 = null;
    audioCtx = null;
    isPlaying = false;
  },

  isCurrentlyPlaying: () => isPlaying,

  playBeep: (frequency = 880, duration = 150) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, duration);
    } catch (e) {
      // ignore
    }
  }
};
