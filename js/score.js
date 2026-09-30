/* ===== SCORE.JS — Skor, combo, high score, meter Peduli ===== */
/* Proyek: Pancing Rupiah */

var COMBO_STEP = 5;
var COMBO_MAX_MULTIPLIER = 4;
var WORN_BONUS_RATIO = 0.10;
var PEDULI_MAX = 100;
var PEDULI_PER_WORN = 20;
var BONUS_DURATION = 10;
var BONUS_MULTIPLIER = 2;
var MAX_HIGH_SCORES = 5;

var ScoreManager = {
  score: 0,
  combo: 0,
  peduliMeter: 0,
  bonusActive: false,
  bonusTimeLeft: 0,
  goodCount: 0,
  wornCount: 0,

  reset: function() {
    this.score = 0;
    this.combo = 0;
    this.peduliMeter = 0;
    this.bonusActive = false;
    this.bonusTimeLeft = 0;
    this.goodCount = 0;
    this.wornCount = 0;
  },

  getComboMultiplier: function() {
    return Math.min(
      1 + Math.floor(this.combo / COMBO_STEP) * 0.5,
      COMBO_MAX_MULTIPLIER
    );
  },

  /**
   * Uang bagus masuk dompet.
   */
  addGoodMoney: function(moneyDef) {
    var multiplier = this.getComboMultiplier();
    var bonusMul = this.bonusActive ? BONUS_MULTIPLIER : 1;
    var points = Math.floor(moneyDef.points * multiplier * bonusMul);
    this.score += points;
    this.combo++;
    this.goodCount++;
    return points;
  },

  /**
   * Uang lusuh setor ke BI.
   */
  addWornMoney: function(moneyDef) {
    var multiplier = this.getComboMultiplier();
    var bonus = Math.floor(moneyDef.points * WORN_BONUS_RATIO * multiplier);
    this.score += bonus;
    this.combo++;
    this.wornCount++;

    // Isi meter Peduli Rupiah
    this.peduliMeter = Math.min(this.peduliMeter + PEDULI_PER_WORN, PEDULI_MAX);

    // Cek apakah meter penuh → aktifkan bonus
    var justFilled = false;
    if (this.peduliMeter >= PEDULI_MAX && !this.bonusActive) {
      this.bonusActive = true;
      this.bonusTimeLeft = BONUS_DURATION;
      justFilled = true;
    }

    return { bonus: bonus, justFilled: justFilled };
  },

  /**
   * Combo putus (meleset / salah pilah).
   */
  breakCombo: function() {
    this.combo = 0;
  },

  /**
   * Update bonus timer.
   */
  updateBonus: function(dt) {
    if (this.bonusActive) {
      this.bonusTimeLeft -= dt;
      if (this.bonusTimeLeft <= 0) {
        this.bonusActive = false;
        this.bonusTimeLeft = 0;
        this.peduliMeter = 0; // Reset meter setelah bonus habis
      }
    }
  },

  /**
   * Load high scores dari localStorage.
   */
  loadHighScores: function() {
    try {
      var s = localStorage.getItem('pancing_highscores');
      return s ? JSON.parse(s) : [];
    } catch(e) { return []; }
  },

  /**
   * Simpan skor ke high scores.
   */
  saveHighScore: function(score, name) {
    try {
      var scores = this.loadHighScores();
      scores.push({ score: score, name: name || 'Anon', date: new Date().toISOString() });
      scores.sort(function(a, b) { return b.score - a.score; });
      scores = scores.slice(0, MAX_HIGH_SCORES);
      localStorage.setItem('pancing_highscores', JSON.stringify(scores));
      return scores;
    } catch(e) { return []; }
  }
};

// Expose globally (non-module script)
window.ScoreManager = ScoreManager;