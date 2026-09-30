/* ===== MAIN.JS — Entry point & router antar layar ===== */
/* Proyek: Pancing Rupiah */

import { gameState, loadHighScores, setScreen, resetGameState, checkReducedMotion } from './state.js';
import { SCREENS, CONFIG, FACTS, FISHER_SPEECHES, BANK_SPEECHES } from './config.js';
import { rand, randInt, shuffle } from './utils.js';

// ===== DOM cache =====
const elements = {
  clouds: document.getElementById('clouds'),
  waterRipples: document.getElementById('water-ripples'),
  floatingCoins: document.getElementById('floating-coins'),
  trees: document.querySelector('.trees'),
  fisherContainer: document.getElementById('fisher-container'),
  bankContainer: document.getElementById('bank-container'),
  fisherSvg: document.querySelector('.fisher-svg'),
  bankSvg: document.querySelector('.bank-svg'),
  fisherSpeech: document.getElementById('fisher-speech'),
  bankSpeech: document.getElementById('bank-speech'),
  startBtn: document.getElementById('start-btn'),
  howtoBtn: document.getElementById('howto-btn'),
  highscoreBtn: document.getElementById('highscore-btn'),
  soundBtn: document.getElementById('sound-btn'),
  soundIcon: document.getElementById('sound-icon'),
  playerNameInput: document.getElementById('player-name'),
  factText: document.getElementById('fact-text'),
  howtoModal: document.getElementById('howto-modal'),
  highscoreModal: document.getElementById('highscore-modal'),
  highscoreList: document.getElementById('highscore-list'),
  modalCloses: document.querySelectorAll('.modal-close'),
};

// ===== State tracker =====
const app = {
  factIndex: 0,
  factsShuffled: [],
  fisherIdleTimer: null,
  cloudsSpawned: 0,
  coinInterval: null,
  fisherClickCooldown: false,
  bankClickCooldown: false,
};

// ===== Init =====
function init() {
  checkReducedMotion();
  loadHighScores();
  loadPlayerName();
  setScreen(SCREENS.LANDING);

  // Shuffle fakta
  app.factsShuffled = shuffle(FACTS);

  // Setup UI
  setupLanding();

  // Spawn awan
  spawnClouds(8);

  // Floating coins
  startFloatingCoins();

  // Trees / palms
  spawnTreesAndPalms();

  // Fact rotator
  rotateFacts();

  // Fisher idle sway
  startFisherIdle();

  // Event listeners
  addEventListeners();
}

// ===== Landing setup =====
function setupLanding() {
  // Fisher idle sway on rod
  const rod = elements.fisherSvg.querySelector('.rod');
  if (rod) {
    rod.style.transformOrigin = 'right center';
    rod.style.animation = 'rodSway 4s ease-in-out infinite';
  }

  // Fisher idle breath
  const fisherBody = elements.fisherSvg.querySelector('#fisher-body');
  if (fisherBody) {
    fisherBody.style.animation = 'fisherIdle 4s ease-in-out infinite';
  }

  // Bank flag wave
  const flag = elements.bankSvg.querySelector('#bank-flag');
  if (flag) {
    flag.style.animation = 'flagWave 3s ease-in-out infinite';
  }

  // Bank window blink
  const windows = elements.bankSvg.querySelectorAll('.window');
  windows.forEach((w, i) => {
    w.style.animation = `windowBlink 5s ease-in-out infinite`;
    w.style.animationDelay = `${i * 0.7}s`;
  });
}

// ===== Cloud spawning =====
function spawnClouds(count) {
  if (!elements.clouds) return;

  for (let i = 0; i < count; i++) {
    const cloud = document.createElement('div');
    cloud.className = `cloud${i % 3 === 0 ? ' thick' : ''}`;
    cloud.style.left = `${randInt(-20, 100)}vw`;
    cloud.style.top = `${randInt(5, 45)}%`;
    cloud.style.width = `${randInt(80, 160)}px`;
    cloud.style.height = `${randInt(35, 55)}px`;
    cloud.style.animationDuration = `${randInt(30, 70)}s`;
    cloud.style.animationDelay = `${-randInt(0, 30)}s`;
    cloud.style.opacity = String(rand(0.6, 1));

    elements.clouds.appendChild(cloud);
    app.cloudsSpawned++;
  }
}

// ===== Floating coins =====
function startFloatingCoins() {
  if (!elements.floatingCoins) return;

  function spawnCoin() {
    const coin = document.createElement('span');
    coin.className = 'floating-coin';
    coin.textContent = randInt(0, 1) === 0 ? '🪙' : '💰';
    coin.style.left = `${randInt(0, 100)}vw`;
    coin.style.fontSize = `${randInt(14, 24)}px`;
    coin.style.animationDuration = `${randInt(8, 16)}s`;

    elements.floatingCoins.appendChild(coin);

    // Cleanup
    setTimeout(() => {
      if (coin.parentNode) coin.remove();
    }, 16000);
  }

  spawnCoin();
  app.coinInterval = setInterval(spawnCoin, 1500);
}

// ===== Trees & palms =====
function spawnTreesAndPalms() {
  if (!elements.trees) return;

  // Trees (left & right)
  for (let i = 0; i < 6; i++) {
    const tree = document.createElement('div');
    tree.className = 'tree';
    tree.style.left = `${i * 16 - 5}vw`;
    tree.style.borderBottomColor = 'rgba(10, 50, 15, 0.4)';
    elements.trees.appendChild(tree);
  }

  // Palms scattered
  const palmPositions = [15, 35, 60, 80];
  palmPositions.forEach(pos => {
    const palm = document.createElement('div');
    palm.className = 'palm';
    palm.style.left = `${pos}vw`;
    palm.style.fontSize = `${randInt(18, 28)}px`;
    elements.trees.appendChild(palm);
  });
}

// ===== Fact rotator =====
function rotateFacts() {
  if (!elements.factText) return;

  const fact = app.factsShuffled[app.factIndex];
  elements.factText.textContent = fact;
  app.factIndex = (app.factIndex + 1) % app.factsShuffled.length;

  setTimeout(rotateFacts, 6000);
}

// ===== Fisher idle =====
function startFisherIdle() {
  // Fisher periodically looks like it's idle
  function idleCycle() {
    if (!elements.fisherSvg) return;

    const body = elements.fisherSvg.querySelector('#fisher-body');
    const fisherContainer = elements.fisherContainer;

    // Subtle bob
    if (body && !gameState.reducedMotion) {
      body.style.transform = 'translateY(-1px)';
      setTimeout(() => {
        if (body) body.style.transform = 'translateY(0)';
      }, 2000);
    }

    setTimeout(idleCycle, randInt(8000, 15000));
  }

  setTimeout(idleCycle, 3000);
}

// ===== Water ripple on click =====
function waterRipple(x, y) {
  if (!elements.waterRipples) return;

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y - 50}px`;
  ripple.style.width = `${randInt(30, 80)}px`;
  ripple.style.height = '2px';
  ripple.style.marginLeft = '0';

  elements.waterRipples.appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) ripple.remove();
  }, 2500);
}

// ===== Fisher click interaction =====
function onFisherClick(e) {
  e.stopPropagation();
  if (app.fisherClickCooldown) return;
  app.fisherClickCooldown = true;

  // Show speech
  showSpeech(elements.fisherSpeech, FISHER_SPEECHES[randInt(0, FISHER_SPEECHES.length - 1)]);

  // Animate: wave + jump
  const container = elements.fisherContainer;
  if (container) {
    container.style.animation = 'fisherWave 1s ease-in-out';
  }

  setTimeout(() => {
    if (container) container.style.animation = '';
    app.fisherClickCooldown = false;
  }, 1000);
}

// ===== Bank click interaction =====
function onBankClick(e) {
  e.stopPropagation();
  if (app.bankClickCooldown) return;
  app.bankClickCooldown = true;

  // Show speech
  showSpeech(elements.bankSpeech, BANK_SPEECHES[randInt(0, BANK_SPEECHES.length - 1)]);

  // Animate: door open, flag wave
  const door = elements.bankSvg?.querySelector('#bank-door');
  const flag = elements.bankSvg?.querySelector('#bank-flag');

  if (door) {
    door.style.transformOrigin = 'right center';
    door.style.transition = 'transform 0.4s ease';
    door.style.transform = 'scaleX(0.3)';
  }

  if (flag) {
    flag.style.animation = 'flagWaveSlow 0.6s ease-in-out infinite';
  }

  setTimeout(() => {
    if (door) {
      door.style.transform = 'scaleX(1)';
      setTimeout(() => {
        door.style.transition = '';
      }, 400);
    }
    if (flag) flag.style.animation = '';
    app.bankClickCooldown = false;
  }, 2500);
}

// ===== Speech bubble =====
function showSpeech(el, text) {
  if (!el) return;
  el.textContent = text;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 4000);
}

// ===== Player name =====
function loadPlayerName() {
  try {
    const stored = localStorage.getItem('pancing_rupiah_player_name');
    if (stored) {
      gameState.playerName = stored;
      if (elements.playerNameInput) {
        elements.playerNameInput.value = stored;
      }
    }
  } catch (e) {
    console.warn('[PancingRupiah] Gagal memuat nama pemain:', e);
  }
}

function savePlayerName() {
  const name = elements.playerNameInput?.value.trim() || '';
  gameState.playerName = name;
  try {
    localStorage.setItem('pancing_rupiah_player_name', name);
  } catch (e) {
    console.warn('[PancingRupiah] Gagal menyimpan nama pemain:', e);
  }
}

// ===== Sound toggle =====
function toggleSound() {
  gameState.muted = !gameState.muted;
  if (elements.soundIcon) {
    elements.soundIcon.textContent = gameState.muted ? '🔇' : '🔊';
  }
  if (elements.soundBtn) {
    elements.soundBtn.setAttribute('aria-pressed', String(gameState.muted));
  }
  try {
    localStorage.setItem('pancing_rupiah_muted', String(gameState.muted));
  } catch (e) {
    console.warn('[PancingRupiah] Gagal menyimpan status suara:', e);
  }
}

// ===== High score modal =====
function openHighScoreModal() {
  if (!elements.highscoreModal || !elements.highscoreList) return;

  if (gameState.highScores.length === 0) {
    elements.highscoreList.innerHTML = '<p class="no-score">Belum ada skor. Jadilah yang pertama!</p>';
  } else {
    let html = '<ol class="highscore-list">';
    gameState.highScores.forEach((entry, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      html += `<li class="hs-entry"><span class="hs-rank">${medal} ${i + 1}.</span> <span class="hs-name">${entry.name}</span> <span class="hs-score">Rp ${entry.score.toLocaleString('id-ID')}</span></li>`;
    });
    html += '</ol>';
    elements.highscoreList.innerHTML = html;
  }

  elements.highscoreModal.hidden = false;
}

// ===== Event listeners =====
function addEventListeners() {
  // Start button
  elements.startBtn?.addEventListener('click', () => {
    savePlayerName();
    goToScreen(SCREENS.COUNTDOWN);
  });

  // How-to button
  elements.howtoBtn?.addEventListener('click', () => {
    if (elements.howtoModal) elements.howtoModal.hidden = false;
  });

  // High score button
  elements.highscoreBtn?.addEventListener('click', openHighScoreModal);

  // Sound toggle
  elements.soundBtn?.addEventListener('click', toggleSound);

  // Name input
  elements.playerNameInput?.addEventListener('change', savePlayerName);

  // Fisher click
  elements.fisherContainer?.addEventListener('click', onFisherClick);

  // Bank click
  elements.bankContainer?.addEventListener('click', onBankClick);

  // Water click -> ripple
  document.addEventListener('click', (e) => {
    const rect = document.body.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on water area
    if (y > window.innerHeight * 0.72) {
      waterRipple(e.clientX, e.clientY);
    }
  });

  // Modal closes
  elements.modalCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.hidden = true;
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.hidden = true);
    }
  });

  // Keyboard: M for mute
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleSound();
    }
  });

  // Visibility change → auto-pause (set di game phase nanti)
  document.addEventListener('visibilitychange', () => {
    if (gameState.currentScreen === SCREENS.PLAYING) {
      // Will handle in game.js
      // eslint-disable-next-line no-console
      console.log('[PancingRupiah] Tab visibility changed — auto-pause trigger');
    }
  });
}

// ===== Screen transition =====
function goToScreen(screen) {
  setScreen(screen);

  switch (screen) {
    case SCREENS.LANDING:
      document.body.classList.remove('screen-game', 'screen-countdown');
      document.body.classList.add('screen-landing');
      break;
    case SCREENS.COUNTDOWN:
      document.body.classList.remove('screen-landing', 'screen-gameover');
      document.body.classList.add('screen-countdown');
      break;
    case SCREENS.PLAYING:
      document.body.classList.remove('screen-countdown', 'screen-landing');
      document.body.classList.add('screen-game');
      if (window.GameEngine) {
        window.GameEngine.start();
      }
      break;
    case SCREENS.GAMEOVER:
      document.body.classList.add('screen-gameover');
      break;
    default:
      break;
  }
}

// Export untuk dipakai di Fase 2
export { goToScreen, elements };

// ===== Bootstrap =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}