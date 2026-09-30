/* ===== MONEY.JS — Definisi uang Rupiah asli, Spawner & Render Canvas ===== */
/* Proyek: Pancing Rupiah */
/* Uang Kertas & Koin Rupiah bergaya otentik dengan detail grafis tinggi */

(function() {
  'use strict';

  // Definisi 11 Pecahan Uang Rupiah Asli
  var MONEY_DEFINITIONS = [
    // LOGAM (Koin)
    {
      id: 'coin100',
      kind: 'coin',
      name: 'Rp 100',
      value: 100,
      points: 10,
      weight: 1.3,
      color: '#c98a4b',
      innerColor: '#d69e5c',
      label: '100',
      motif: 'Garuda'
    },
    {
      id: 'coin200',
      kind: 'coin',
      name: 'Rp 200',
      value: 200,
      points: 20,
      weight: 1.2,
      color: '#d0d7de',
      innerColor: '#e6ebf1',
      label: '200',
      motif: 'Jalak Bali'
    },
    {
      id: 'coin500',
      kind: 'coin',
      name: 'Rp 500',
      value: 500,
      points: 50,
      weight: 1.1,
      color: '#e2b13c',
      innerColor: '#f7cf68',
      label: '500',
      motif: 'Melati'
    },
    {
      id: 'coin1000',
      kind: 'coin',
      name: 'Rp 1.000',
      value: 1000,
      points: 100,
      weight: 1.0,
      isBimetal: true,
      outerColor: '#d0d7de',
      innerColor: '#e2b13c',
      label: '1000',
      motif: 'Angklung'
    },

    // KERTAS (Banknotes)
    {
      id: 'note1k',
      kind: 'note',
      name: 'Rp 1.000',
      value: 1000,
      points: 100,
      weight: 0.8,
      bgGrad: ['#3e6b5c', '#5e9482', '#2d5246'],
      accentColor: '#a8d5c2',
      label: '1.000',
      textNominal: 'SERIBU RUPIAH'
    },
    {
      id: 'note2k',
      kind: 'note',
      name: 'Rp 2.000',
      value: 2000,
      points: 200,
      weight: 0.75,
      bgGrad: ['#5a6b7c', '#8195a8', '#3d4d5e'],
      accentColor: '#c5d3e0',
      label: '2.000',
      textNominal: 'DUA RIBU RUPIAH'
    },
    {
      id: 'note5k',
      kind: 'note',
      name: 'Rp 5.000',
      value: 5000,
      points: 500,
      weight: 0.7,
      bgGrad: ['#a66838', '#cf8b54', '#7d4a21'],
      accentColor: '#f7d3b0',
      label: '5.000',
      textNominal: 'LIMA RIBU RUPIAH'
    },
    {
      id: 'note10k',
      kind: 'note',
      name: 'Rp 10.000',
      value: 10000,
      points: 1000,
      weight: 0.65,
      bgGrad: ['#6b3e7c', '#9b5eaf', '#4a2559'],
      accentColor: '#e3c2f2',
      label: '10.000',
      textNominal: 'SEPULUH RIBU RUPIAH'
    },
    {
      id: 'note20k',
      kind: 'note',
      name: 'Rp 20.000',
      value: 20000,
      points: 2000,
      weight: 0.6,
      bgGrad: ['#2e7d48', '#4caf6e', '#1e542f'],
      accentColor: '#b8f2cb',
      label: '20.000',
      textNominal: 'DUA PULUH RIBU'
    },
    {
      id: 'note50k',
      kind: 'note',
      name: 'Rp 50.000',
      value: 50000,
      points: 5000,
      weight: 0.55,
      bgGrad: ['#1e5799', '#2989d8', '#123766'],
      accentColor: '#b2d9ff',
      label: '50.000',
      textNominal: 'LIMA PULUH RIBU'
    },
    {
      id: 'note100k',
      kind: 'note',
      name: 'Rp 100.000',
      value: 100000,
      points: 10000,
      weight: 0.5,
      bgGrad: ['#c0292b', '#e74c3c', '#8a191b'],
      accentColor: '#ffc2c3',
      label: '100.000',
      textNominal: 'SERATUS RIBU'
    },
  ];

  function Money(def, condition, x, y, speed, direction) {
    this.def = def;
    this.condition = condition; // 'good' atau 'worn'
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = direction; // 1 (kanan) atau -1 (kiri)

    if (def.kind === 'coin') {
      this.width = 44; this.height = 44; this.radius = 22;
    } else {
      this.width = 82; this.height = 42; this.radius = 24;
    }

    this.active = true;
    this.caught = false;
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.rotation = (Math.random() - 0.5) * 0.1;
  }

  Money.prototype.update = function(dt, canvasWidth) {
    if (this.caught) return;
    this.x += this.speed * this.direction * dt;
    this.wobbleOffset += dt * 3.5;
    this.y += Math.sin(this.wobbleOffset) * 0.5;

    // Out of screen bounds check
    if (this.direction === 1 && this.x > canvasWidth + 100) this.active = false;
    else if (this.direction === -1 && this.x < -100) this.active = false;
  };

  Money.prototype.render = function(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.def.kind === 'coin') this._renderCoin(ctx);
    else this._renderNote(ctx);

    if (this.condition === 'worn') this._renderWorn(ctx);
    ctx.restore();
  };

  /**
   * Render Koin Rupiah 3D Metalik
   */
  Money.prototype._renderCoin = function(ctx) {
    var r = this.radius;

    // Bayangan Koin
    ctx.beginPath();
    ctx.ellipse(3, 4, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    if (this.def.isBimetal) {
      // KOIN BIMETAL (Rp 1.000)
      // Ring Luar (Perak)
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      var outerGrad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
      outerGrad.addColorStop(0, '#ffffff');
      outerGrad.addColorStop(0.5, this.def.outerColor);
      outerGrad.addColorStop(1, '#9aa0a6');
      ctx.fillStyle = outerGrad;
      ctx.fill();
      ctx.strokeStyle = '#7c8288';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core Dalam (Emas)
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      var innerGrad = ctx.createRadialGradient(-r*0.2, -r*0.2, r*0.05, 0, 0, r*0.65);
      innerGrad.addColorStop(0, '#fff3b0');
      innerGrad.addColorStop(0.5, this.def.innerColor);
      innerGrad.addColorStop(1, '#b38215');
      ctx.fillStyle = innerGrad;
      ctx.fill();
      ctx.strokeStyle = '#996e0f';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // KOIN SINGLE METAL (Rp 100, 200, 500)
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      var coinGrad = ctx.createRadialGradient(-r*0.3, -r*0.3, r*0.1, 0, 0, r);
      coinGrad.addColorStop(0, '#ffffff');
      coinGrad.addColorStop(0.4, this.def.innerColor);
      coinGrad.addColorStop(1, this.def.color);
      ctx.fillStyle = coinGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Ridge
      ctx.beginPath();
      ctx.arc(0, 0, r - 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Teks Nominal
    ctx.fillStyle = '#1c2a39';
    ctx.font = '900 12px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.def.label, 0, -1);

    // Teks "BANK INDONESIA" melengkung kecil
    ctx.fillStyle = 'rgba(28, 42, 57, 0.75)';
    ctx.font = '600 5.5px Nunito, sans-serif';
    ctx.fillText('BANK INDONESIA', 0, 11);

    // Kilau Cahaya (Good Condition)
    if (this.condition === 'good') {
      ctx.beginPath();
      ctx.ellipse(-r*0.35, -r*0.35, r*0.3, r*0.15, -Math.PI*0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();
    }
  };

  /**
   * Render Uang Kertas Rupiah Otentik
   */
  Money.prototype._renderNote = function(ctx) {
    var w = this.width;
    var h = this.height;
    var hw = w / 2;
    var hh = h / 2;

    // Bayangan Uang Kertas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-hw + 3, -hh + 4, w, h, 4) : ctx.rect(-hw + 3, -hh + 4, w, h);
    ctx.fill();

    // Body Gradient khas Rupiah
    var bgGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    bgGrad.addColorStop(0, this.def.bgGrad[0]);
    bgGrad.addColorStop(0.5, this.def.bgGrad[1]);
    bgGrad.addColorStop(1, this.def.bgGrad[2]);

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-hw, -hh, w, h, 4);
    else ctx.rect(-hw, -hh, w, h);
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Bingkai Ornamen Guilloche (Garis Halus Keamanan)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

    // Benang Pengaman Metallic (Security Thread)
    ctx.fillStyle = 'rgba(246, 194, 33, 0.85)';
    ctx.fillRect(hw * 0.15, -hh, 2.5, h);

    // Jendela Air (Watermark Window Circle)
    ctx.beginPath();
    ctx.arc(-hw + 14, 0, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Teks Header "BANK INDONESIA"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 6px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BANK INDONESIA', -hw + 6, -hh + 9);

    // Nominal Utama Besar
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 13px Fredoka, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.def.label, hw - 6, hh - 8);

    // Sub-Teks Nominal Rupiah
    ctx.fillStyle = this.def.accentColor;
    ctx.font = '700 5.5px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.def.textNominal, hw - 6, -hh + 9);

    // Lambang Garuda / Pahlawan Silhouette (Center Emblem)
    ctx.beginPath();
    ctx.arc(4, -2, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    // Kilau Mulus (Good Condition)
    if (this.condition === 'good') {
      var shineGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
      shineGrad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
      shineGrad.addColorStop(0.6, 'rgba(255,255,255,0)');
      ctx.fillStyle = shineGrad;
      ctx.fillRect(-hw, -hh, w, h);
    }
  };

  /**
   * Render Efek Uang Lusuh / Rusak (WORN)
   */
  Money.prototype._renderWorn = function(ctx) {
    var w = this.width;
    var h = this.height;
    var hw = w / 2;
    var hh = h / 2;

    // Overlay tekstur kusam / pudar
    ctx.fillStyle = 'rgba(70, 45, 20, 0.35)';
    if (this.def.kind === 'coin') {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-hw, -hh, w, h);
    }

    // Lipatan / Kerutan Lecek (Crease Lines)
    ctx.strokeStyle = 'rgba(40, 25, 10, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-hw + 8, -hh + 5); ctx.lineTo(hw - 10, hh - 6);
    ctx.moveTo(hw - 12, -hh + 6); ctx.lineTo(-hw + 10, hh - 4);
    ctx.stroke();

    // Coretan Spidol (Scribble)
    ctx.strokeStyle = 'rgba(200, 30, 30, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-2, 1, 6, 0, Math.PI * 1.5);
    ctx.stroke();

    // Noda Cokelat Kusam
    ctx.fillStyle = 'rgba(65, 38, 12, 0.55)';
    ctx.beginPath();
    ctx.arc(hw * 0.4, -hh * 0.3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Staples / Solasi di Sudut
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hw + 4, -hh + 6);
    ctx.lineTo(-hw + 11, -hh + 6);
    ctx.stroke();

    // Badge Tanda "LUSUH" Merah Tegas
    ctx.fillStyle = '#d62828';
    ctx.fillRect(-18, hh - 10, 36, 9);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 7px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LUSUH', 0, hh - 5.5);
  };

  /**
   * Spawner Uang Acak
   */
  function spawnRandomMoney(canvasWidth, canvasHeight, wornRatio) {
    var def = MONEY_DEFINITIONS[Math.floor(Math.random() * MONEY_DEFINITIONS.length)];
    var condition = Math.random() < wornRatio ? 'worn' : 'good';

    var minY, maxY;
    if (def.kind === 'coin') {
      minY = canvasHeight * 0.55;
      maxY = canvasHeight * 0.86;
    } else {
      minY = canvasHeight * 0.35;
      maxY = canvasHeight * 0.72;
    }
    var y = minY + Math.random() * (maxY - minY);

    var direction = Math.random() < 0.5 ? 1 : -1;
    var x = direction === 1 ? -90 : canvasWidth + 90;

    var baseSpeed = def.kind === 'note' ? 85 : 55;
    var speed = baseSpeed + Math.random() * 40;

    return new Money(def, condition, x, y, speed, direction);
  }

  // Expose ke global scope
  window.MONEY_DEFINITIONS = MONEY_DEFINITIONS;
  window.Money = Money;
  window.spawnRandomMoney = spawnRandomMoney;

})();
