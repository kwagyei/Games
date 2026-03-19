const BulletPool = {
  bullets: [],
  maxBullets: 60,

  spawn(x, y, dx, dy, isEnemy) {
    if (!isEnemy && this.bullets.filter(b => !b.isEnemy).length >= this.maxBullets) return;
    const speed = isEnemy ? 180 : 420;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) return;
    this.bullets.push({
      x, y,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      isEnemy: isEnemy || false,
      trailX: x,
      trailY: y
    });
  },

  update(dt, canvasW, canvasH) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.trailX = b.x;
      b.trailY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -10 || b.x > canvasW + 10 || b.y < -10 || b.y > canvasH + 10) {
        this.bullets.splice(i, 1);
      }
    }
  },

  draw(ctx) {
    for (const b of this.bullets) {
      if (b.isEnemy) {
        // Enemy bullet: magenta, slightly larger
        ctx.fillStyle = '#ff44ff';
        ctx.fillRect(Math.floor(b.x - 4), Math.floor(b.y - 3), 8, 6);
        ctx.fillStyle = 'rgba(255,100,255,0.4)';
        ctx.fillRect(Math.floor(b.trailX - 3), Math.floor(b.trailY - 2), 6, 4);
      } else {
        // Player bullet: yellow with trail
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(Math.floor(b.x - 4), Math.floor(b.y - 2), 8, 4);
        ctx.fillStyle = 'rgba(255,200,0,0.35)';
        ctx.fillRect(Math.floor(b.trailX - 3), Math.floor(b.trailY - 1), 6, 2);
      }
    }
  },

  clear() {
    this.bullets = [];
  }
};
