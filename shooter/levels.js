const LevelConfigs = [
  // Level 1 — Tutorial: Grunts only, slow spawns
  {
    level: 1,
    waves: [
      { enemies: [{ type: 'grunt', count: 4 }], spawnInterval: 1.8 },
      { enemies: [{ type: 'grunt', count: 7 }], spawnInterval: 1.4 }
    ]
  },
  // Level 2 — Grunts + Runners
  {
    level: 2,
    waves: [
      { enemies: [{ type: 'grunt', count: 5 }, { type: 'runner', count: 2 }], spawnInterval: 1.3 },
      { enemies: [{ type: 'grunt', count: 4 }, { type: 'runner', count: 4 }], spawnInterval: 1.1 },
      { enemies: [{ type: 'runner', count: 7 }], spawnInterval: 0.9 }
    ]
  },
  // Level 3 — Brutes introduced
  {
    level: 3,
    waves: [
      { enemies: [{ type: 'grunt', count: 5 }, { type: 'runner', count: 3 }], spawnInterval: 1.1 },
      { enemies: [{ type: 'brute', count: 2 }, { type: 'grunt', count: 4 }], spawnInterval: 1.2 },
      { enemies: [{ type: 'brute', count: 2 }, { type: 'runner', count: 5 }, { type: 'grunt', count: 3 }], spawnInterval: 1.0 }
    ]
  },
  // Level 4 — Shooters fire back
  {
    level: 4,
    waves: [
      { enemies: [{ type: 'grunt', count: 6 }, { type: 'shooter', count: 2 }], spawnInterval: 1.1 },
      { enemies: [{ type: 'runner', count: 5 }, { type: 'shooter', count: 3 }], spawnInterval: 0.9 },
      { enemies: [{ type: 'brute', count: 2 }, { type: 'shooter', count: 3 }], spawnInterval: 1.1 },
      { enemies: [{ type: 'grunt', count: 4 }, { type: 'runner', count: 4 }, { type: 'shooter', count: 2 }], spawnInterval: 0.85 }
    ]
  }
];

const LevelManager = {
  currentLevel: 1,
  currentWave: 0,
  config: null,
  spawnTimer: 0,
  spawnQueue: [],
  waveStarted: false,
  waveClearTimer: 0,
  waitingForNextWave: false,
  allWavesComplete: false,
  totalWaves: 0,

  init(level) {
    this.currentLevel = level;
    this.currentWave = 0;
    this.waitingForNextWave = false;
    this.allWavesComplete = false;
    this.waveStarted = false;
    this.spawnQueue = [];
    this.spawnTimer = 0;

    if (level <= LevelConfigs.length) {
      this.config = LevelConfigs[level - 1];
    } else {
      this.config = this._generateLevel(level);
    }
    this.totalWaves = this.config.waves.length;
    this.startWave(0);
  },

  _generateLevel(level) {
    const scale = level - 4;
    const waveCount = 4 + Math.min(scale, 4);
    const waves = [];
    for (let w = 0; w < waveCount; w++) {
      waves.push({
        enemies: [
          { type: 'grunt',   count: 4 + scale * 2 },
          { type: 'runner',  count: 3 + scale },
          { type: 'brute',   count: 1 + Math.floor(scale / 2) },
          { type: 'shooter', count: 2 + scale }
        ],
        spawnInterval: Math.max(0.35, 1.0 - scale * 0.1)
      });
    }
    return { level, waves };
  },

  startWave(waveIdx) {
    this.currentWave = waveIdx;
    const waveConfig = this.config.waves[waveIdx];
    this.spawnQueue = [];
    this.spawnTimer = 0.5; // brief pause before first spawn
    this.waveStarted = true;
    this.waitingForNextWave = false;

    for (const group of waveConfig.enemies) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push(group.type);
      }
    }
    // Shuffle
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
  },

  update(dt, canvasW, canvasH) {
    if (!this.waveStarted || this.allWavesComplete) return;

    const waveConfig = this.config.waves[this.currentWave];

    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const type = this.spawnQueue.shift();
        Enemies.spawnAtEdge(type, canvasW, canvasH);
        this.spawnTimer = waveConfig.spawnInterval;
      }
    }

    // Wave cleared when queue empty and no enemies alive
    if (this.spawnQueue.length === 0 && Enemies.count() === 0) {
      if (!this.waitingForNextWave) {
        this.waitingForNextWave = true;
        this.waveClearTimer = 2.0;
      }
      this.waveClearTimer -= dt;
      if (this.waveClearTimer <= 0) {
        const nextWave = this.currentWave + 1;
        if (nextWave < this.config.waves.length) {
          this.startWave(nextWave);
        } else {
          this.allWavesComplete = true;
        }
      }
    }
  },

  getWaveText() {
    return `WAVE ${this.currentWave + 1}/${this.totalWaves}`;
  }
};
