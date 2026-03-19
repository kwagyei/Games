const EnemyTypes = {
  GRUNT:   'grunt',
  RUNNER:  'runner',
  BRUTE:   'brute',
  SHOOTER: 'shooter'
};

class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.rotation = 0;
    this.shootCooldown = 1 + Math.random(); // stagger initial shots
    this.zigzagTimer = Math.random() * 0.5;
    this.zigzagDir = Math.random() < 0.5 ? 1 : -1;
    this.hitFlash = 0;

    switch (type) {
      case EnemyTypes.GRUNT:
        this.hp = 1; this.maxHp = 1;
        this.speed = 75 + Math.random() * 20;
        this.size = 14;
        this.color = '#cc2222';
        this.headColor = '#ffaa88';
        this.score = 10;
        this.damage = 10;
        break;

      case EnemyTypes.RUNNER:
        this.hp = 1; this.maxHp = 1;
        this.speed = 150 + Math.random() * 30;
        this.size = 10;
        this.color = '#dd6600';
        this.headColor = '#ffcc44';
        this.score = 20;
        this.damage = 8;
        break;

      case EnemyTypes.BRUTE:
        this.hp = 5; this.maxHp = 5;
        this.speed = 45 + Math.random() * 10;
        this.size = 24;
        this.color = '#334455';
        this.headColor = '#556677';
        this.score = 50;
        this.damage = 20;
        break;

      case EnemyTypes.SHOOTER:
        this.hp = 2; this.maxHp = 2;
        this.speed = 65 + Math.random() * 15;
        this.size = 14;
        this.color = '#771188';
        this.headColor = '#cc44cc';
        this.score = 30;
        this.damage = 8;
        this.shootRange = 240;
        this.shootRate = 2.2;
        break;

      default:
        this.hp = 1; this.maxHp = 1;
        this.speed = 80; this.size = 14;
        this.color = '#888888'; this.headColor = '#aaaaaa';
        this.score = 10; this.damage = 10;
    }
  }

  update(dt, playerX, playerY) {
    if (!this.alive) return;

    if (this.hitFlash > 0) this.hitFlash -= dt;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.5) return;

    this.rotation = Math.atan2(dy, dx);

    if (this.type === EnemyTypes.RUNNER) {
      this.zigzagTimer += dt;
      if (this.zigzagTimer > 0.45) {
        this.zigzagTimer = 0;
        this.zigzagDir *= -1;
      }
      const perp = this.rotation + Math.PI / 2;
      this.x += (Math.cos(this.rotation) * this.speed + Math.cos(perp) * 60 * this.zigzagDir) * dt;
      this.y += (Math.sin(this.rotation) * this.speed + Math.sin(perp) * 60 * this.zigzagDir) * dt;

    } else if (this.type === EnemyTypes.SHOOTER) {
      if (dist > this.shootRange) {
        this.x += Math.cos(this.rotation) * this.speed * dt;
        this.y += Math.sin(this.rotation) * this.speed * dt;
      }
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0 && dist < this.shootRange + 60) {
        this.shootCooldown = this.shootRate;
        BulletPool.spawn(this.x, this.y, dx, dy, true);
      }

    } else {
      this.x += Math.cos(this.rotation) * this.speed * dt;
      this.y += Math.sin(this.rotation) * this.speed * dt;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.08;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(Math.floor(this.x), Math.floor(this.y));

    const flash = this.hitFlash > 0;
    const s = this.size / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-s, s - 2, this.size, 5);

    if (this.type === EnemyTypes.GRUNT) {
      ctx.fillStyle = flash ? '#ffffff' : this.color;
      ctx.fillRect(-s, -s, this.size, this.size);
      // Armor detail
      if (!flash) { ctx.fillStyle = '#aa1111'; ctx.fillRect(-s+2, -s+2, this.size-4, this.size-4); }
      ctx.fillStyle = flash ? '#ffffff' : this.headColor;
      ctx.fillRect(-4, -s - 5, 8, 6);
      // Eyes
      if (!flash) { ctx.fillStyle = '#ffff00'; ctx.fillRect(-3, -s - 3, 2, 2); ctx.fillRect(1, -s - 3, 2, 2); }

    } else if (this.type === EnemyTypes.RUNNER) {
      ctx.fillStyle = flash ? '#ffffff' : this.color;
      ctx.fillRect(-s, -s, this.size, this.size);
      if (!flash) { ctx.fillStyle = '#cc4400'; ctx.fillRect(-s+1, -s+1, this.size-2, this.size-2); }
      ctx.fillStyle = flash ? '#ffffff' : this.headColor;
      ctx.fillRect(-3, -s - 4, 6, 5);
      if (!flash) { ctx.fillStyle = '#ff2200'; ctx.fillRect(-1, -s - 2, 2, 2); ctx.fillRect(1, -s - 2, 2, 2); }

    } else if (this.type === EnemyTypes.BRUTE) {
      ctx.fillStyle = flash ? '#ffffff' : this.color;
      ctx.fillRect(-s, -s, this.size, this.size);
      if (!flash) {
        ctx.fillStyle = '#445566';
        ctx.fillRect(-s+3, -s+3, this.size-6, this.size-6);
        // Rivets
        ctx.fillStyle = '#778899';
        ctx.fillRect(-s+1, -s+1, 3, 3);
        ctx.fillRect(s-4, -s+1, 3, 3);
        ctx.fillRect(-s+1, s-4, 3, 3);
        ctx.fillRect(s-4, s-4, 3, 3);
      }
      // Brute head
      ctx.fillStyle = flash ? '#ffffff' : this.headColor;
      ctx.fillRect(-5, -s - 6, 10, 7);
      if (!flash) { ctx.fillStyle = '#ff3300'; ctx.fillRect(-3, -s - 4, 3, 3); ctx.fillRect(1, -s - 4, 3, 3); }

    } else if (this.type === EnemyTypes.SHOOTER) {
      ctx.fillStyle = flash ? '#ffffff' : this.color;
      ctx.fillRect(-s, -s, this.size, this.size);
      if (!flash) { ctx.fillStyle = '#aa22aa'; ctx.fillRect(-s+2, -s+2, this.size-4, this.size-4); }
      ctx.fillStyle = flash ? '#ffffff' : this.headColor;
      ctx.fillRect(-4, -s - 5, 8, 6);
      if (!flash) { ctx.fillStyle = '#ff88ff'; ctx.fillRect(-2, -s - 3, 2, 2); ctx.fillRect(1, -s - 3, 2, 2); }
      // Gun barrel pointing at player
      ctx.save();
      ctx.rotate(this.rotation);
      ctx.fillStyle = flash ? '#ffffff' : '#888888';
      ctx.fillRect(s, -2, 10, 4);
      ctx.restore();
    }

    // HP bar for multi-HP enemies
    if (this.maxHp > 1) {
      const barW = this.size + 4;
      const barH = 4;
      const barX = -barW / 2;
      const barY = -s - 12;
      ctx.fillStyle = '#331111';
      ctx.fillRect(barX, barY, barW, barH);
      const ratio = this.hp / this.maxHp;
      ctx.fillStyle = ratio > 0.5 ? '#44ff44' : ratio > 0.25 ? '#ffff00' : '#ff4444';
      ctx.fillRect(barX, barY, Math.ceil(barW * ratio), barH);
    }

    ctx.restore();
  }
}

const Enemies = {
  list: [],

  spawn(x, y, type) {
    this.list.push(new Enemy(x, y, type));
  },

  spawnAtEdge(type, canvasW, canvasH) {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 30;
    switch (edge) {
      case 0: x = Math.random() * canvasW; y = -margin; break;
      case 1: x = canvasW + margin; y = Math.random() * canvasH; break;
      case 2: x = Math.random() * canvasW; y = canvasH + margin; break;
      default: x = -margin; y = Math.random() * canvasH; break;
    }
    this.spawn(x, y, type);
  },

  update(dt, playerX, playerY) {
    for (const e of this.list) {
      e.update(dt, playerX, playerY);
    }
    this.list = this.list.filter(e => e.alive);
  },

  draw(ctx) {
    for (const e of this.list) {
      e.draw(ctx);
    }
  },

  checkBulletCollisions(bullets, onKill) {
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (b.isEnemy) continue;
      for (let ei = this.list.length - 1; ei >= 0; ei--) {
        const e = this.list[ei];
        if (!e.alive) continue;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        const half = e.size / 2;
        if (Math.abs(dx) < half && Math.abs(dy) < half) {
          const killed = e.takeDamage(1);
          bullets.splice(bi, 1);
          if (killed) {
            Particles.spawn(e.x, e.y, 6 + Math.floor(Math.random() * 4), e.color);
            Particles.spawn(e.x, e.y, 3, '#ffaa00');
            Audio.enemyDeath();
            onKill(e);
          } else {
            Audio.enemyHit();
            Particles.spawn(e.x, e.y, 2, '#ffffff');
          }
          break;
        }
      }
    }
  },

  checkPlayerBulletCollision(player) {
    const bullets = BulletPool.bullets;
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.isEnemy) continue;
      const dx = b.x - player.x;
      const dy = b.y - player.y;
      if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
        player.takeDamage(10);
        bullets.splice(bi, 1);
        Particles.spawn(player.x, player.y, 3, '#aaddff');
      }
    }
  },

  checkPlayerContact(player) {
    for (const e of this.list) {
      if (!e.alive) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const minDist = e.size / 2 + 14;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) {
        return e;
      }
    }
    return null;
  },

  count() {
    return this.list.length; // already filtered each frame
  },

  clear() {
    this.list = [];
  }
};
