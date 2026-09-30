/* ===== GAME.JS — Core Game Loop & Canvas Renderer ===== */
/* Proyek: Pancing Rupiah */

(function() {
  'use strict';

  var canvas, ctx;
  var hook;
  var moneyList = [];
  var spawnTimer = 0;
  var spawnInterval = 1.4; // detik
  var gameTimeLeft = 60;   // detik
  var gameRunning = false;
  var isPaused = false;
  var animationFrameId = null;
  var lastTime = 0;
  var wornRatio = 0.35;
  var waveLevel = 1;

  // ===== HUD elements =====
  var elsHUD = {
    timer: null,
    score: null,
    combo: null,
    peduliFill: null,
    walletScore: null,
    gameContainer: null,
    pauseModal: null,
    gameoverModal: null,
    toastContainer: null,
  };

  /**
   * Inisialisasi canvas dan HUD.
   */
  function initGame() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (window.Hook) {
      hook = new window.Hook(canvas.width, canvas.height);
    }

    cacheHUDElements();
    setupControls();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (hook) hook.resize(canvas.width, canvas.height);
  }

  function cacheHUDElements() {
    elsHUD.timer = document.getElementById('hud-timer');
    elsHUD.score = document.getElementById('hud-score');
    elsHUD.combo = document.getElementById('hud-combo');
    elsHUD.peduliFill = document.getElementById('peduli-fill');
    elsHUD.walletScore = document.getElementById('wallet-score');
    elsHUD.gameContainer = document.getElementById('game-container');
    elsHUD.pauseModal = document.getElementById('pause-modal');
    elsHUD.gameoverModal = document.getElementById('gameover-modal');
    elsHUD.toastContainer = document.getElementById('toast-container');
  }

  /**
   * Mulai sesi permainan baru.
   */
  function startGame() {
    if (!canvas) initGame();

    gameRunning = true;
    isPaused = false;
    gameTimeLeft = 60;
    spawnTimer = 0;
    spawnInterval = 1.4;
    wornRatio = 0.35;
    waveLevel = 1;
    moneyList = [];

    if (window.ScoreManager) {
      window.ScoreManager.reset();
    }

    if (window.Hook) {
      hook = new window.Hook(canvas.width, canvas.height);
    }

    updateHUD();

    // Hide modals
    if (elsHUD.pauseModal) elsHUD.pauseModal.hidden = true;
    if (elsHUD.gameoverModal) elsHUD.gameoverModal.hidden = true;

    // Start loop
    lastTime = performance.now();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);

    if (window.AudioManager) {
      window.AudioManager.init();
    }

    showToast('🎣 PANCING RUPIAH DIMULAI! Geser mouse/jari untuk posisikan kail!', 'bonus');
  }

  /**
   * Main game loop (delta time).
   */
  function gameLoop(now) {
    if (!gameRunning) return;

    var dt = (now - lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; // cap dt
    lastTime = now;

    if (!isPaused) {
      update(dt);
    }

    render();

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  /**
   * Update logika game.
   */
  function update(dt) {
    // Timer permainan
    gameTimeLeft -= dt;
    if (gameTimeLeft <= 0) {
      gameTimeLeft = 0;
      endGame();
      return;
    }

    // Timer gelombang (tiap 15 detik = kesulitan naik)
    var currentWave = Math.floor((60 - gameTimeLeft) / 15) + 1;
    if (currentWave > waveLevel) {
      waveLevel = currentWave;
      spawnInterval = Math.max(0.5, spawnInterval - 0.2);
      wornRatio = Math.min(0.65, wornRatio + 0.05);
      showToast('⚠️ Gelombang ' + waveLevel + '! Kecepatan naik!', 'bad');
    }

    // Update timer bonus Peduli Rupiah
    if (window.ScoreManager) {
      window.ScoreManager.updateBonus(dt);
    }

    // Spawner uang
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      if (moneyList.length < 14 && window.spawnRandomMoney) {
        moneyList.push(window.spawnRandomMoney(canvas.width, canvas.height, wornRatio));
      }
    }

    // Update kail
    if (hook) {
      var hookResult = hook.update(dt);

      // Cek tabrakan kail dengan uang saat meluncur turun
      if (hook.state === 'dropping') {
        for (var i = 0; i < moneyList.length; i++) {
          var m = moneyList[i];
          if (hook.checkCollision(m)) {
            hook.catchMoney(m);
            if (window.AudioManager) {
              if (m.def.kind === 'coin') window.AudioManager.coin();
              else window.AudioManager.paper();
            }
            break;
          }
        }
      }

      // Kail selesai ditarik (arrived di atas)
      if (hookResult === 'arrived') {
        if (hook.caughtMoney) {
          processCaughtMoney(hook.caughtMoney);
        } else {
          // Meleset
          if (window.ScoreManager) window.ScoreManager.breakCombo();
          if (window.AudioManager) window.AudioManager.oops();
        }
        hook.reset();
      }
    }

    // Update semua uang aktif
    for (var j = moneyList.length - 1; j >= 0; j--) {
      var item = moneyList[j];
      item.update(dt, canvas.width);
      if (!item.active) {
        moneyList.splice(j, 1);
      }
    }

    updateHUD();
  }

  /**
   * Proses uang yang berhasil ditarik ke atas.
   */
  function processCaughtMoney(money) {
    if (!window.ScoreManager) return;

    if (money.condition === 'good') {
      // Uang bagus → Masuk Dompet (+poin penuh)
      var pts = window.ScoreManager.addGoodMoney(money.def);
      showToast('👛 Dompet +' + pts.toLocaleString('id-ID') + '! (' + money.def.name + ')', 'good');
      if (window.AudioManager) window.AudioManager.wallet();
    } else {
      // Uang lusuh → Setor ke BI (+bonus setor + Peduli Rupiah)
      var res = window.ScoreManager.addWornMoney(money.def);
      showToast('🏦 Setor BI +' + res.bonus.toLocaleString('id-ID') + '! (Lusuh ' + money.def.name + ')', 'bad');
      if (window.AudioManager) window.AudioManager.bankBell();

      if (res.justFilled) {
        showToast('⭐ BONUS CINTA RUPIAH AKTIF! (2x Poin 10s)', 'bonus');
        if (window.AudioManager) window.AudioManager.bonusFanfare();
      }
    }

    if (window.ScoreManager.combo > 1 && window.AudioManager) {
      window.AudioManager.comboUp();
    }
  }

  /**
   * Render canvas.
   */
  function render() {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render air transparan di area kolam
    var waterTop = canvas.height * 0.32;
    var waterGrad = ctx.createLinearGradient(0, waterTop, 0, canvas.height);
    waterGrad.addColorStop(0, 'rgba(31, 159, 184, 0.2)');
    waterGrad.addColorStop(1, 'rgba(14, 111, 138, 0.45)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterTop, canvas.width, canvas.height - waterTop);

    // Garis permukaan air
    ctx.beginPath();
    ctx.moveTo(0, waterTop);
    ctx.lineTo(canvas.width, waterTop);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render semua uang
    for (var i = 0; i < moneyList.length; i++) {
      moneyList[i].render(ctx);
    }

    // Render kail
    if (hook) {
      hook.render(ctx);
    }

    // Indikator posisi kail (guide dot di permukaan air)
    if (hook && hook.state === 'ready') {
      ctx.beginPath();
      ctx.arc(hook.x, waterTop, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(246, 194, 33, 0.8)';
      ctx.fill();
    }

    // Render aura bonus jika aktif
    if (window.ScoreManager && window.ScoreManager.bonusActive) {
      ctx.fillStyle = 'rgba(246, 194, 33, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Update elemen HUD.
   */
  function updateHUD() {
    if (!window.ScoreManager) return;

    // Timer
    if (elsHUD.timer) {
      var sec = Math.ceil(gameTimeLeft);
      elsHUD.timer.textContent = sec + 's';
      if (sec <= 10) elsHUD.timer.classList.add('timer-low');
      else elsHUD.timer.classList.remove('timer-low');
    }

    // Skor
    if (elsHUD.score) {
      elsHUD.score.textContent = 'Rp ' + window.ScoreManager.score.toLocaleString('id-ID');
    }
    if (elsHUD.walletScore) {
      elsHUD.walletScore.textContent = 'Rp ' + window.ScoreManager.score.toLocaleString('id-ID');
    }

    // Combo
    if (elsHUD.combo) {
      if (window.ScoreManager.combo > 1) {
        var mul = window.ScoreManager.getComboMultiplier();
        elsHUD.combo.textContent = '🔥 COMBO x' + window.ScoreManager.combo + ' (' + mul + 'x)';
        elsHUD.combo.classList.add('active');
      } else {
        elsHUD.combo.classList.remove('active');
      }
    }

    // Peduli Rupiah fill
    if (elsHUD.peduliFill) {
      var pct = window.ScoreManager.peduliMeter;
      elsHUD.peduliFill.style.width = pct + '%';
      if (pct >= 100) elsHUD.peduliFill.classList.add('full');
      else elsHUD.peduliFill.classList.remove('full');
    }
  }

  /**
   * Kontrol input (Mouse, Touch, Keyboard).
   */
  function setupControls() {
    // Mouse movement -> update posisi kail secara real-time
    window.addEventListener('mousemove', function(e) {
      if (!gameRunning || isPaused) return;
      if (hook) hook.setTargetX(e.clientX);
    });

    // Touch movement -> update posisi kail secara real-time
    window.addEventListener('touchmove', function(e) {
      if (!gameRunning || isPaused) return;
      if (e.touches && e.touches.length > 0) {
        if (hook) hook.setTargetX(e.touches[0].clientX);
      }
    }, { passive: true });

    // Click / Tap -> Tembak kail / reel
    window.addEventListener('click', function(e) {
      if (!gameRunning || isPaused) return;

      // Abaikan jika klik di HUD atau modal
      if (e.target.closest('.hud') || e.target.closest('.modal-overlay') || e.target.closest('.wallet-widget')) {
        return;
      }

      if (hook) {
        if (hook.state === 'ready') {
          hook.setTargetX(e.clientX);
          hook.shoot();
          if (window.AudioManager) window.AudioManager.splash();
        } else if (hook.state === 'dropping') {
          hook.reel(); // Paksa tarik sekarang jika ditekan lagi
        }
      }
    });

    // Touch start -> update posisi & tembak
    window.addEventListener('touchstart', function(e) {
      if (!gameRunning || isPaused) return;
      if (e.target.closest('.hud') || e.target.closest('.modal-overlay') || e.target.closest('.wallet-widget')) {
        return;
      }

      if (e.touches && e.touches.length > 0) {
        var touchX = e.touches[0].clientX;
        if (hook) {
          hook.setTargetX(touchX);
          if (hook.state === 'ready') {
            hook.shoot();
            if (window.AudioManager) window.AudioManager.splash();
          } else if (hook.state === 'dropping') {
            hook.reel();
          }
        }
      }
    }, { passive: true });

    // Keyboard controls
    window.addEventListener('keydown', function(e) {
      if (!gameRunning) return;

      if (e.code === 'ArrowLeft') {
        if (hook) hook.isMovingLeft = true;
      } else if (e.code === 'ArrowRight') {
        if (hook) hook.isMovingRight = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (hook) {
          if (hook.state === 'ready') {
            hook.shoot();
            if (window.AudioManager) window.AudioManager.splash();
          } else if (hook.state === 'dropping') {
            hook.reel();
          }
        }
      } else if (e.code === 'KeyP') {
        togglePause();
      }
    });

    window.addEventListener('keyup', function(e) {
      if (e.code === 'ArrowLeft' && hook) hook.isMovingLeft = false;
      if (e.code === 'ArrowRight' && hook) hook.isMovingRight = false;
    });

    // Pause button
    var pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', togglePause);
    }

    // Resume button
    var resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', togglePause);
    }
  }

  function togglePause() {
    if (!gameRunning) return;
    isPaused = !isPaused;
    if (elsHUD.pauseModal) {
      elsHUD.pauseModal.hidden = !isPaused;
    }
  }

  /**
   * Toast pemberitahuan melayang.
   */
  function showToast(msg, type) {
    if (!elsHUD.toastContainer) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'good');
    toast.textContent = msg;

    elsHUD.toastContainer.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('toast-out');
      setTimeout(function() {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, 2000);
  }

  /**
   * Akhiri permainan (Game Over).
   */
  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);

    if (window.AudioManager) {
      window.AudioManager.gameOver();
    }

    // Simpan high score
    var playerName = localStorage.getItem('pancing_player_name') || 'Pemancing';
    var finalScore = window.ScoreManager ? window.ScoreManager.score : 0;
    if (window.ScoreManager) {
      window.ScoreManager.saveHighScore(finalScore, playerName);
    }

    // Tampilkan modal Game Over
    if (elsHUD.gameoverModal) {
      document.getElementById('final-score').textContent = 'Rp ' + finalScore.toLocaleString('id-ID');
      document.getElementById('final-good').textContent = (window.ScoreManager ? window.ScoreManager.goodCount : 0) + ' Lembar/Keping';
      document.getElementById('final-worn').textContent = (window.ScoreManager ? window.ScoreManager.wornCount : 0) + ' Lembar/Keping';
      elsHUD.gameoverModal.hidden = false;
    }

    showToast('🏁 WAKTU HABIS! Game Over!', 'bonus');
  }

  // Expose global controller
  window.GameEngine = {
    start: startGame,
    togglePause: togglePause,
    endGame: endGame
  };

})();
