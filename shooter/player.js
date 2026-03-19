const Player = {
  x: 400,
  y: 300,
  speed: 200,
  rotation: 0,
  health: 100,
  maxHealth: 100,
  shootCooldown: 0,
  shootRate: 0.18,
  hitFlash: 0,
  muzzleFlash: 0,
  walkFrame: 0,
  walkTimer: 0,
  walkSpeed: 0.1,
  alive: true,
  isMoving: false,

  init(canvasW, canvasH) {
    this.x = canvasW / 2;
    this.y = canvasH / 2;
    this.health = this.maxHealth;
    this.rotation = 0;
    this.shootCooldown = 0;
    this.hitFlash = 0;
    this.muzzleFlash = 0;
    this.walkFrame = 0;
    this.walkTimer = 0;
    this.alive = true;
    this.isMoving = false;
  },

  update(dt, input, canvasW, canvasH) {
    if (!this.alive) return;

    // Movement
    let dx = 0, dy = 0;
    if (input.keys['ArrowLeft']  || input.keys['KeyA']) dx -= 1;
    if (input.keys['ArrowRight'] || input.keys['KeyD']) dx += 1;
    if (input.keys['ArrowUp']    || input.keys['KeyW']) dy -= 1;
    if (input.keys['ArrowDown']  || input.keys['KeyS']) dy += 1;

    this.isMoving = (dx !== 0 || dy !== 0);

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Clamp to canvas
    this.x = Math.max(16, Math.min(canvasW - 16, this.x));
    this.y = Math.max(16, Math.min(canvasH - 16, this.y));

    // Aim toward mouse
    this.rotation = Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);

    // Walk animation
    if (this.isMoving) {
      this.walkTimer += dt;
      if (this.walkTimer >= this.walkSpeed) {
        this.walkTimer -= this.walkSpeed;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    // Cooldowns
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.muzzleFlash > 0) this.muzzleFlash -= dt;

    // Shoot (held or single click)
    if ((input.mouse.held || input.mouse.clicked) && this.shootCooldown <= 0) {
      this.shoot(input.mouse.x, input.mouse.y);
    }
  },

  shoot(targetX, targetY) {
    if (!this.alive) return;
    const gunDist = 18;
    const bx = this.x + Math.cos(this.rotation) * gunDist;
    const by = this.y + Math.sin(this.rotation) * gunDist;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    BulletPool.spawn(bx, by, dx, dy, false);
    this.shootCooldown = this.shootRate;
    this.muzzleFlash = 0.07;
    Audio.shoot();
  },

  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 0.12;
    Audio.playerHit();
    Particles.spawn(this.x, this.y, 4, '#aaddff');
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  },

  draw(ctx) {
    ctx.save();
    ctx.translate(Math.floor(this.x), Math.floor(this.y));
    ctx.rotate(this.rotation);

    const flash = this.hitFlash > 0;
    const bodyColor   = flash ? '#ffffff' : '#44aaff';
    const headColor   = flash ? '#ffffff' : '#ffcc88';
    const gunColor    = flash ? '#ffffff' : '#999999';
    const legColor    = flash ? '#ffffff' : '#2255aa';
    const legColor2   = flash ? '#ffffff' : '#1a4488';

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-9, 4, 18, 6);

    // Body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-8, -8, 16, 16);

    // Chest detail
    if (!flash) {
      ctx.fillStyle = '#3388cc';
      ctx.fillRect(-5, -5, 10, 8);
    }

    // Head
    ctx.fillStyle = headColor;
    ctx.fillRect(-5, -13, 10, 7);

    // Eye
    if (!flash) {
      ctx.fillStyle = '#222';
      ctx.fillRect(2, -11, 3, 2);
    }

    // Gun
    ctx.fillStyle = gunColor;
    ctx.fillRect(6, -3, 14, 5);
    // Gun grip
    ctx.fillStyle = flash ? '#ffffff' : '#666666';
    ctx.fillRect(7, 2, 5, 4);

    // Muzzle flash
    if (this.muzzleFlash > 0) {
      ctx.fillStyle = '#ffff44';
      ctx.fillRect(19, -5, 8, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, -3, 5, 6);
    }

    // Legs with walk animation
    const legOffsets = [0, 4, 0, -4];
    const legOff = legOffsets[this.walkFrame];
    ctx.fillStyle = legColor;
    ctx.fillRect(-7, 8, 6, 6 + legOff);
    ctx.fillStyle = legColor2;
    ctx.fillRect(1, 8, 6, 6 - legOff);

    // Boots
    if (!flash) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(-8, 13 + legOff, 7, 3);
      ctx.fillRect(0, 13 - legOff, 7, 3);
    }

    ctx.restore();
  }
};
