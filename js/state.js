/* ===== STATE.JS — State machine + state global ===== */
/* Proyek: Pancing Rupiah */

import { CONFIG, SCREENS } from './config.js';

// ===== State global =====
export const gameState = {
  currentScreen: SCREENS.LANDING,

  // Player
  playerName: '',
  score: 0,
  combo: 0,
  highScores: [],

  // Timing
  timeLeft: CONFIG.GAME_DURATION,
  wave: 0,

  // Hooks
  hook: {
    x: window.innerWidth / 2,
    y: 0,
    isThrowing: false,
    isReeling: false,
    depth: 0,
    maxDepth: 180,
    caughtMoney: null,
  },

  // Meter Peduli Rupiah
  peduliMeter: 0,
  peduliFull: false,
  bonusActive: false,
  bonusTimeLeft: 0,

  // Active money pool (pooled by money.js)
  moneyPool: [],

  // Active particles
  particles: [],

  // Items
  activeItems: [],

  // Flags
  muted: false,
  reducedMotion: false,
  gameRunning: false,
};

// ===== Getter helpers =====
export function getScreen() {
  return gameState.currentScreen;
}

export function getScore() {
  return gameState.score;
}

export function getComboMultiplier() {
  return Math.min(
    CONFIG.COMBO_BASE + Math.floor(gameState.combo / CONFIG.COMBO_STEP) * 0.5,
    CONFIG.COMBO_MAX_MULTIPLIER
  );
}

// ===== Persistence (localStorage) =====
export function loadHighScores() {
  try {
    const stored = localStorage.getItem('pancing_rupiah_highscores');
    if (stored) {
      gameState.highScores = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[PancingRupiah] Gagal memuat high score:', e);
    gameState.highScores = [];
  }
}

export function saveScore(score, name) {
  try {
    const entry = {
      score: score,
      name: name || 'Anon',
      date: new Date().toISOString(),
    };
    gameState.highScores.push(entry);
    gameState.highScores.sort((a, b) => b.score - a.score);
    gameState.highScores = gameState.highScores.slice(0, CONFIG.MAX_HIGH_SCORES);
    localStorage.setItem('pancing_rupiah_highscores', JSON.stringify(gameState.highScores));
    loadHighScores();
  } catch (e) {
    console.warn('[PancingRupiah] Gagal menyimpan high score:', e);
  }
}

// ===== Reset game state =====
export function resetGameState() {
  gameState.score = 0;
  gameState.combo = 0;
  gameState.timeLeft = CONFIG.GAME_DURATION;
  gameState.wave = 0;
  gameState.peduliMeter = 0;
  gameState.peduliFull = false;
  gameState.bonusActive = false;
  gameState.bonusTimeLeft = 0;
  gameState.moneyPool = [];
  gameState.particles = [];
  gameState.activeItems = [];
  gameState.hook.caughtMoney = null;
}

// ===== Transition helpers =====
export function setScreen(screen) {
  gameState.currentScreen = screen;
}

// Check reduced motion
export function checkReducedMotion() {
  gameState.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}