const Renderer = {
  // Draw tiled grid background
  drawBackground(ctx, W, H) {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#191919';
    ctx.lineWidth = 1;
    const g = 40;
    for (let x = 0; x <= W; x += g) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += g) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  },

  drawScanlines(ctx, W, H) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < H; y += 2) {
      ctx.fillRect(0, y, W, 1);
    }
  },

  drawHUD(ctx, W, H, player, score, levelManager) {
    ctx.imageSmoothingEnabled = false;

    // Top bar background
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, 32);

    // Level
    ctx.fillStyle = '#aaaaff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`LVL ${levelManager.currentLevel}`, 10, 22);

    // Wave
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(levelManager.getWaveText(), W / 2, 22);

    // Score
    ctx.fillStyle = '#ffff44';
    ctx.textAlign = 'right';
    ctx.fillText(`${score}`, W - 10, 22);

    // Health bar
    const barX = 10;
    const barY = H - 28;
    const barW = 160;
    const barH = 14;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    ctx.fillStyle = '#221111';
    ctx.fillRect(barX, barY, barW, barH);

    const ratio = player.health / player.maxHealth;
    const hpColor = ratio > 0.5 ? '#44ff44' : ratio > 0.25 ? '#ffdd00' : '#ff3333';
    const blockW = 6, blockGap = 2;
    const totalBlocks = Math.floor(barW / (blockW + blockGap));
    const filledBlocks = Math.round(ratio * totalBlocks);

    ctx.fillStyle = hpColor;
    for (let i = 0; i < filledBlocks; i++) {
      ctx.fillRect(barX + i * (blockW + blockGap), barY, blockW, barH);
    }

    ctx.fillStyle = '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${player.health}`, barX + barW + 8, barY + barH - 1);
  },

  drawMenuScreen(ctx, W, H, highScore, menuAnimTime) {
    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#181818';
    ctx.lineWidth = 1;
    const g = 40;
    for (let x = 0; x <= W; x += g) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += g) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Decorative corner enemies
    this._drawMenuEnemy(ctx, 80,  H / 2 - 60, menuAnimTime, '#cc2222');
    this._drawMenuEnemy(ctx, W - 80, H / 2 - 60, menuAnimTime + 1.0, '#dd6600');
    this._drawMenuEnemy(ctx, 80,  H / 2 + 80, menuAnimTime + 0.5, '#771188');
    this._drawMenuEnemy(ctx, W - 80, H / 2 + 80, menuAnimTime + 1.5, '#334455');

    // Title shadow
    ctx.fillStyle = '#882200';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOP-DOWN', W / 2 + 3, H / 2 - 85 + 3);
    ctx.fillText('SHOOTER', W / 2 + 3, H / 2 - 32 + 3);

    // Title
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('TOP-DOWN', W / 2, H / 2 - 85);
    ctx.fillStyle = '#ff8800';
    ctx.fillText('SHOOTER', W / 2, H / 2 - 32);

    // Subtitle
    ctx.fillStyle = '#ff4444';
    ctx.font = '18px monospace';
    ctx.fillText('** RETRO EDITION **', W / 2, H / 2 + 10);

    // Blink: press enter
    if (Math.floor(menuAnimTime * 2) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('[ PRESS ENTER TO PLAY ]', W / 2, H / 2 + 52);
    }

    // High score
    ctx.fillStyle = '#44aaff';
    ctx.font = '15px monospace';
    ctx.fillText(`HIGH SCORE: ${highScore}`, W / 2, H / 2 + 88);

    // Controls help
    ctx.fillStyle = '#555555';
    ctx.font = '12px monospace';
    ctx.fillText('ARROWS / WASD: MOVE     MOUSE: AIM     CLICK: SHOOT', W / 2, H - 18);

    this.drawScanlines(ctx, W, H);
  },

  _drawMenuEnemy(ctx, x, y, t, color) {
    const bob = Math.sin(t * 2) * 8;
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y + bob));
    ctx.fillStyle = color;
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  },

  drawLevelComplete(ctx, W, H, level, levelScore) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#44ff44';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${level}`, W / 2, H / 2 - 50);
    ctx.fillText('COMPLETE!', W / 2, H / 2 + 4);

    ctx.fillStyle = '#ffff00';
    ctx.font = '22px monospace';
    ctx.fillText(`+${levelScore} POINTS`, W / 2, H / 2 + 54);

    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.fillText('NEXT LEVEL STARTING...', W / 2, H / 2 + 96);
  },

  drawGameOver(ctx, W, H, finalScore, highScore, blinkTime) {
    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ff1111';
    ctx.font = 'bold 60px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`SCORE: ${finalScore}`, W / 2, H / 2 - 10);

    if (finalScore > 0 && finalScore >= highScore) {
      ctx.fillStyle = '#ffff00';
      ctx.font = '20px monospace';
      ctx.fillText('** NEW HIGH SCORE! **', W / 2, H / 2 + 32);
    } else {
      ctx.fillStyle = '#888888';
      ctx.font = '16px monospace';
      ctx.fillText(`HIGH SCORE: ${highScore}`, W / 2, H / 2 + 32);
    }

    if (Math.floor(blinkTime * 2) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px monospace';
      ctx.fillText('[ PRESS ENTER TO RESTART ]', W / 2, H / 2 + 90);
    }

    this.drawScanlines(ctx, W, H);
  }
};
