/* ===== CONFIG.JS — SEMUA angka balancing & konstanta ===== */
/* Proyek: Pancing Rupiah */

export const CONFIG = {
  // Durasi
  GAME_DURATION: 60, // detik (mode klasik)
  COUNTDOWN_DURATION: 3, // detik

  // Spawn
  WAVE_INTERVAL: 15, // detik per gelombang
  INITIAL_SPAWN_RATE: 1.8, // detik antar uang
  MIN_SPAWN_RATE: 0.5,
  SPAWN_RATE_DECREMENT: 0.1, // per gelombang
  WORN_RATIO: 0.35, // 35% lusuh
  WORN_RATIO_INCREMENT: 0.05, // per gelombang

  // Kecepatan
  MONEY_SPEED: 40,
  MONEY_SPEED_INCREMENT: 10, // per gelombang

  // Hook / fishing line
  HOOK_SPEED: 220, // px/s
  REEL_SPEED: 120,

  // Combo
  COMBO_BASE: 1,
  COMBO_STEP: 5, // setiap 5 combo, +0.5x
  COMBO_MAX_MULTIPLIER: 4,

  // Meter Peduli Rupiah
  PEDULI_MAX: 100,
  PEDULI_PER_WORN_DEPOSIT: 20,

  // Bonus Cinta Rupiah
  BONUS_DURATION: 10, // detik
  BONUS_MULTIPLIER: 2,

  // Item khusus
  ITEM_SPAWN_CHANCE: 0.08,
  ITEM_DURATION: {
    magnet: 8,
    jam: 0,
    trap: 0,
  },

  // Skor
  SCORE_BASE: {
    coin100: 10,
    coin200: 20,
    coin500: 50,
    coin1000: 100,
    note1k: 100,
    note2k: 200,
    note5k: 500,
    note10k: 1000,
    note20k: 2000,
    note50k: 5000,
    note100k: 10000,
  },

  // Deposit bonus (uang lusuh)
  WORN_DEPOSIT_BONUS_RATIO: 0.10,

  // High score
  MAX_HIGH_SCORES: 5,

  // Karakter
  PLAYER_NAME_MAX: 12,

  // Efek
  PARTICLE_COUNT: 15,
};

// Fakta edukasi acak (lihat CLAUDE.md Bagian 14)
export const FACTS = [
  'Rupiah itu simbol kedaulatan negara. Rawat, ya!',
  '5 Jangan: jangan dilipat, dicoret, diremas, dibasahi, distapler.',
  'Uang lusuh bisa ditukarkan ke Bank Indonesia.',
  'Cinta, Bangga, Paham Rupiah!',
  'Cek keaslian uang dengan 3D: Dilihat, Diraba, Diterawang.',
  'Uang yang dirawat baik bisa beredar lebih lama.',
  'Uang lusuh yang disetor ke BI bisa ditukar dengan uang baru.',
  'Simpan uang dengan benar, jangan dibasahi atau ditempel.',
];

// Ucapan karakter (acak)
export const FISHER_SPEECHES = [
  'Ayo mancing!',
  'Dapat nih!',
  'Rupiah bagus, masuk dompet!',
  'Yang lusuh, setor ke BI ya!',
  'Combo terus, jangan putus!',
  'Hari ini pasti dapat seratus ribu!',
  'Nek suka, klik terus!',
  'Wah, uang cantik nih!',
];

export const BANK_SPEECHES = [
  'Rupiah lusuh? Setor ke sini!',
  'Uang lusuh diganti baru di BI lho!',
  'Sampaikan cinta pada Rupiah dengan merawatnya!',
  '5 Jangan itu penting, ya!',
  'Terima kasih sudah setor ke BI!',
  'Cek 3D uangmu ya: Dilihat, Diraba, Diterawang!',
];

// Daftar emoji emoticon untuk notifikasi
export const EMOJI = {
  coin: '🪙',
  note: '💵',
  bonus: '⭐',
  time: '⏱️',
  magnet: '🧲',
  jam: '🕐',
  trap: '🐟',
  heart: '💖',
};

export const SCREENS = {
  LANDING: 'LANDING',
  HOWTO: 'HOWTO',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
};