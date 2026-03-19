(function () {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const W = 800;
  const H = 600;
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  // ─── State machine ────────────────────────────────────────────────────────
  const STATES = {
    MENU:           'menu',
    PLAYING:        'playing',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER:      'game_over'
  };

  let state = STATES.MENU;
  let score = 0;
  let levelScore = 0;
  let currentLevel = 1;
  let highScore = parseInt(localStorage.getItem('topdownShooterHigh') || '0', 10);
  let menuAnimTime = 0;
  let levelCompleteTimer = 0;
  let blinkTime = 0;
  let contactDamageCooldown = 0;
  let lastTime = 0;
  let audioStarted = false;

  // ─── Init input ───────────────────────────────────────────────────────────
  Input.init(canvas);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function ensureAudio() {
    if (!audioStarted) {
      Audio.init();
      Audio.resume();
      audioStarted = true;
    } else {
      Audio.resume();
    }
  }

  function startGame() {
    ensureAudio();
    Audio.stopMenuMusic();
    score = 0;
    levelScore = 0;
    currentLevel = 1;
    contactDamageCooldown = 0;
    Enemies.clear();
    BulletPool.clear();
    Particles.clear();
    Player.init(W, H);
    LevelManager.init(currentLevel);
    state = STATES.PLAYING;
  }

  function nextLevel() {
    currentLevel++;
    levelScore = 0;
    contactDamageCooldown = 0;
    Enemies.clear();
    BulletPool.clear();
    Particles.clear();
    Player.init(W, H);
    LevelManager.init(currentLevel);
    state = STATES.PLAYING;
  }

  function triggerGameOver() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('topdownShooterHigh', highScore);
    }
    Audio.gameOver();
    blinkTime = 0;
    state = STATES.GAME_OVER;
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  function update(dt) {
    switch (state) {
      // ── MENU ──────────────────────────────────────────────────────────────
      case STATES.MENU:
        menuAnimTime += dt;
        if (Input.enterPressed) {
          startGame();
        } else {
          if (audioStarted) Audio.startMenuMusic();
        }
        break;

      // ── PLAYING ───────────────────────────────────────────────────────────
      case STATES.PLAYING:
        Player.update(dt, Input, W, H);
        Enemies.update(dt, Player.x, Player.y);
        BulletPool.update(dt, W, H);
        Particles.update(dt);
        LevelManager.update(dt, W, H);

        // Bullet ↔ enemy collisions
        Enemies.checkBulletCollisions(BulletPool.bullets, (enemy) => {
          score     += enemy.score;
          levelScore += enemy.score;
        });

        // Enemy bullets ↔ player
        if (Player.alive) {
          Enemies.checkPlayerBulletCollision(Player);
        }

        // Enemy body ↔ player contact
        if (Player.alive) {
          if (contactDamageCooldown > 0) {
            contactDamageCooldown -= dt;
          } else {
            const contactEnemy = Enemies.checkPlayerContact(Player);
            if (contactEnemy) {
              Player.takeDamage(contactEnemy.damage);
              contactDamageCooldown = 0.55;
            }
          }
        }

        if (!Player.alive) {
          triggerGameOver();
        }

        if (LevelManager.allWavesComplete) {
          Audio.levelComplete();
          levelCompleteTimer = 2.5;
          state = STATES.LEVEL_COMPLETE;
        }
        break;

      // ── LEVEL COMPLETE ────────────────────────────────────────────────────
      case STATES.LEVEL_COMPLETE:
        Particles.update(dt);
        levelCompleteTimer -= dt;
        if (levelCompleteTimer <= 0) {
          nextLevel();
        }
        break;

      // ── GAME OVER ─────────────────────────────────────────────────────────
      case STATES.GAME_OVER:
        blinkTime += dt;
        if (Input.enterPressed) {
          startGame();
        }
        break;
    }

    Input.consume();
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────
  function draw() {
    ctx.imageSmoothingEnabled = false;

    switch (state) {
      case STATES.MENU:
        Renderer.drawMenuScreen(ctx, W, H, highScore, menuAnimTime);
        break;

      case STATES.PLAYING:
        Renderer.drawBackground(ctx, W, H);
        Particles.draw(ctx);
        BulletPool.draw(ctx);
        Enemies.draw(ctx);
        Player.draw(ctx);
        Renderer.drawHUD(ctx, W, H, Player, score, LevelManager);
        Renderer.drawScanlines(ctx, W, H);
        break;

      case STATES.LEVEL_COMPLETE:
        Renderer.drawBackground(ctx, W, H);
        Particles.draw(ctx);
        BulletPool.draw(ctx);
        Enemies.draw(ctx);
        Player.draw(ctx);
        Renderer.drawHUD(ctx, W, H, Player, score, LevelManager);
        Renderer.drawLevelComplete(ctx, W, H, currentLevel, levelScore);
        Renderer.drawScanlines(ctx, W, H);
        break;

      case STATES.GAME_OVER:
        Renderer.drawBackground(ctx, W, H);
        Renderer.drawGameOver(ctx, W, H, score, highScore, blinkTime);
        break;
    }
  }

  // ─── Game loop ────────────────────────────────────────────────────────────
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Kick off — first Enter press also unlocks AudioContext
  canvas.addEventListener('click', () => {
    if (!audioStarted) {
      ensureAudio();
    }
  }, { once: true });

  window.addEventListener('keydown', () => {
    if (!audioStarted) {
      ensureAudio();
    }
  }, { once: true });

  requestAnimationFrame((ts) => {
    lastTime = ts;
    requestAnimationFrame(gameLoop);
  });
})();
