const Particles = {
  pool: [],

  spawn(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.pool.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        life: 0.4,
        maxLife: 0.4,
        color: color || '#ff4444'
      });
    }
  },

  spawnSpark(x, y) {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.pool.push({
        x, y,
        vx: Math.cos(angle) * (30 + Math.random() * 60),
        vy: Math.sin(angle) * (30 + Math.random() * 60),
        size: 1 + Math.random() * 2,
        life: 0.15,
        maxLife: 0.15,
        color: '#ffff88'
      });
    }
  },

  update(dt) {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const p = this.pool[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= dt;
      if (p.life <= 0) this.pool.splice(i, 1);
    }
  },

  draw(ctx) {
    for (const p of this.pool) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const sz = Math.max(1, Math.floor(p.size));
      ctx.fillRect(Math.floor(p.x - sz / 2), Math.floor(p.y - sz / 2), sz, sz);
    }
    ctx.globalAlpha = 1;
  },

  clear() {
    this.pool = [];
  }
};
