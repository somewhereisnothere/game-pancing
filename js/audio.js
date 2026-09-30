/* ===== AUDIO.JS — Efek suara sintetis Web Audio API ===== */
/* Proyek: Pancing Rupiah */

var AudioManager = {
  ctx: null,
  muted: false,
  initialized: false,

  init: function() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch(e) {
      console.warn('[Audio] Web Audio tidak didukung');
    }
  },

  ensureContext: function() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setMuted: function(val) {
    this.muted = val;
  },

  /**
   * Bunyi pendek: frekuensi, durasi, jenis gelombang.
   */
  playTone: function(freq, duration, type, volume) {
    if (this.muted || !this.ctx) return;
    this.ensureContext();

    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (duration || 0.2));
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + (duration || 0.2));
  },

  /**
   * Efek suara: splash (kail masuk air).
   */
  splash: function() {
    if (this.muted || !this.ctx) return;
    this.ensureContext();
    // White noise burst
    var bufferSize = this.ctx.sampleRate * 0.15;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    var gain = this.ctx.createGain();
    gain.gain.value = 0.12;
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  },

  /**
   * Efek suara: ting koin.
   */
  coin: function() {
    this.playTone(1200, 0.15, 'sine', 0.12);
    setTimeout(function() { AudioManager.playTone(1600, 0.1, 'sine', 0.08); }, 80);
  },

  /**
   * Efek suara: sret kertas.
   */
  paper: function() {
    if (this.muted || !this.ctx) return;
    this.ensureContext();
    var bufferSize = this.ctx.sampleRate * 0.1;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (bufferSize * 0.5));
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    var gain = this.ctx.createGain();
    gain.gain.value = 0.08;
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  },

  /**
   * Efek suara: dompet kling.
   */
  wallet: function() {
    this.playTone(800, 0.12, 'triangle', 0.1);
    setTimeout(function() { AudioManager.playTone(1000, 0.08, 'triangle', 0.06); }, 60);
  },

  /**
   * Efek suara: lonceng BI.
   */
  bankBell: function() {
    this.playTone(600, 0.3, 'sine', 0.15);
    setTimeout(function() { AudioManager.playTone(800, 0.25, 'sine', 0.1); }, 150);
  },

  /**
   * Efek suara: combo naik.
   */
  comboUp: function() {
    var base = 400;
    for (var i = 0; i < 3; i++) {
      (function(freq, delay) {
        setTimeout(function() { AudioManager.playTone(freq, 0.08, 'square', 0.06); }, delay);
      })(base + i * 200, i * 60);
    }
  },

  /**
   * Efek suara: bonus fanfare.
   */
  bonusFanfare: function() {
    var notes = [523, 659, 784, 1047];
    notes.forEach(function(f, i) {
      setTimeout(function() { AudioManager.playTone(f, 0.2, 'sine', 0.12); }, i * 100);
    });
  },

  /**
   * Efek suara: oops / miss.
   */
  oops: function() {
    this.playTone(200, 0.25, 'sawtooth', 0.08);
  },

  /**
   * Efek suara: game over.
   */
  gameOver: function() {
    var notes = [440, 349, 294, 220];
    notes.forEach(function(f, i) {
      setTimeout(function() { AudioManager.playTone(f, 0.3, 'sine', 0.1); }, i * 200);
    });
  }
};

window.AudioManager = AudioManager;