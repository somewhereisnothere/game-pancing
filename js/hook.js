/* ===== HOOK.JS — Fisika kail & tali pancing (INTERAKTIF) ===== */
/* Proyek: Pancing Rupiah */
/* Kail bisa digerakkan bebas oleh pemain (mouse/touch/keyboard) */

(function() {
  'use strict';

  /**
   * Hook — kail pancing yang sepenuhnya dikontrol pemain.
   * Pemain menggerakkan posisi horizontal kail bebas.
   * Tekan/klik untuk melempar kail ke bawah.
   * Kail naik kembali ke atas dengan cepat.
   */
  function Hook(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Posisi pivot (ujung joran, atas tengah)
    this.pivotX = canvasWidth / 2;
    this.pivotY = 30;

    // Posisi kail (dikontrol pemain)
    this.x = canvasWidth / 2;
    this.y = this.pivotY + 40;
    this.targetX = this.x;

    // Line length
    this.lineLength = 40;

    // State: 'ready', 'dropping', 'reeling'
    this.state = 'ready';

    // Kecepatan — reel sangat cepat agar tidak membosankan
    this.dropSpeed = 450;   // px/s turun
    this.reelSpeed = 600;   // px/s naik — CEPAT
    this.moveSpeed = 500;   // px/s horizontal

    // Posisi horizontal saat drop (dikunci saat melempar)
    this.dropX = this.x;

    // Uang yang tertangkap
    this.caughtMoney = null;
    this.radius = 16;

    // Input tracking
    this.inputX = canvasWidth / 2;
    this.isMovingLeft = false;
    this.isMovingRight = false;

    // Visual: hook swing animation saat ready
    this.idleTime = 0;
  }

  Hook.prototype.resize = function(w, h) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.pivotX = w / 2;
    this.pivotY = 30;
  };

  /**
   * Set target horizontal dari mouse/touch.
   */
  Hook.prototype.setTargetX = function(x) {
    this.inputX = x;
  };

  /**
   * Update posisi kail setiap frame.
   */
  Hook.prototype.update = function(dt) {
    this.idleTime += dt;

    switch (this.state) {
      case 'ready':
        // Ikuti posisi input (mouse/touch) dengan smooth
        var dx = this.inputX - this.x;
        if (Math.abs(dx) > 1) {
          this.x += dx * Math.min(1, dt * 12);
        } else {
          this.x = this.inputX;
        }

        // Keyboard movement
        if (this.isMovingLeft) {
          this.x -= this.moveSpeed * dt;
        }
        if (this.isMovingRight) {
          this.x += this.moveSpeed * dt;
        }

        // Clamp ke layar
        this.x = Math.max(20, Math.min(this.canvasWidth - 20, this.x));
        this.y = this.pivotY + 40;
        this.lineLength = 40;
        this.pivotX = this.x; // pivot ikut
        break;

      case 'dropping':
        // Turun lurus ke bawah dari posisi drop
        this.y += this.dropSpeed * dt;
        this.lineLength = this.y - this.pivotY;

        // Batas bawah
        if (this.y >= this.canvasHeight - 15) {
          this.y = this.canvasHeight - 15;
          this.state = 'reeling';
        }
        break;

      case 'reeling':
        // Naik kembali — CEPAT
        var speed = this.reelSpeed;
        // Sedikit lambat jika bawa uang berat (tapi tetap cepat)
        if (this.caughtMoney) {
          speed = this.reelSpeed / Math.max(0.7, (this.caughtMoney.def.weight || 1) * 0.6);
        }
        this.y -= speed * dt;
        this.lineLength = Math.max(0, this.y - this.pivotY);

        // Ikutkan uang yang tertangkap
        if (this.caughtMoney) {
          this.caughtMoney.x = this.x;
          this.caughtMoney.y = this.y + 12;
        }

        // Sampai atas — selesai
        if (this.y <= this.pivotY + 40) {
          this.y = this.pivotY + 40;
          this.lineLength = 40;
          // Proses uang yang tertangkap di game.js
          return 'arrived';
        }
        break;
    }

    return null;
  };

  /**
   * Lempar kail ke bawah.
   */
  Hook.prototype.shoot = function() {
    if (this.state !== 'ready') return false;
    this.dropX = this.x;
    this.pivotX = this.x;
    this.state = 'dropping';
    this.idleTime = 0;
    return true;
  };

  /**
   * Tarik kail naik (bisa dipanggil kapan saja saat dropping).
   */
  Hook.prototype.reel = function() {
    if (this.state === 'dropping') {
      this.state = 'reeling';
    }
  };

  /**
   * Reset ke state ready.
   */
  Hook.prototype.reset = function() {
    this.state = 'ready';
    this.lineLength = 40;
    this.y = this.pivotY + 40;
    this.caughtMoney = null;
  };

  /**
   * Cek tabrakan kail dengan uang.
   */
  Hook.prototype.checkCollision = function(money) {
    if (this.state !== 'dropping') return false;
    if (money.caught || !money.active) return false;
    var dx = this.x - money.x;
    var dy = this.y - money.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (this.radius + money.radius);
  };

  /**
   * Tangkap uang.
   */
  Hook.prototype.catchMoney = function(money) {
    money.caught = true;
    this.caughtMoney = money;
    this.state = 'reeling'; // langsung tarik naik
  };

  /**
   * Render kail dan tali di canvas.
   */
  Hook.prototype.render = function(ctx) {
    ctx.save();

    var hookX = this.x;
    var hookY = this.y;
    var pivotX = this.pivotX;
    var pivotY = this.pivotY;

    // Tali pancing — garis lengkung halus
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    // Sedikit curve agar terlihat alami
    var midX = (pivotX + hookX) / 2 + Math.sin(this.idleTime * 2) * 3;
    var midY = (pivotY + hookY) / 2;
    ctx.quadraticCurveTo(midX, midY, hookX, hookY);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lingkaran kail (area tangkap)
    ctx.beginPath();
    ctx.arc(hookX, hookY, 7, 0, Math.PI * 2);
    var hookGrad = ctx.createRadialGradient(hookX - 2, hookY - 2, 1, hookX, hookY, 7);
    hookGrad.addColorStop(0, '#e0e0e0');
    hookGrad.addColorStop(1, '#909090');
    ctx.fillStyle = hookGrad;
    ctx.fill();
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bentuk kail (hook shape)
    ctx.beginPath();
    ctx.moveTo(hookX, hookY + 7);
    ctx.quadraticCurveTo(hookX + 10, hookY + 18, hookX + 3, hookY + 20);
    ctx.quadraticCurveTo(hookX - 4, hookY + 18, hookX, hookY + 10);
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Titik ujung hook
    ctx.beginPath();
    ctx.arc(hookX + 3, hookY + 20, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#c0c0c0';
    ctx.fill();

    // Indikator area tangkap (hanya saat dropping)
    if (this.state === 'dropping') {
      ctx.beginPath();
      ctx.arc(hookX, hookY + 10, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(246, 194, 49, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  };

  window.Hook = Hook;
})();
