// Tower Defense Game with Phaser

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a3a1a');

    // Title
    this.add.text(400, 150, 'TOWER DEFENSE', {
      font: 'bold 48px Arial',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(400, 300, 'Click towers to place them\nDefend against enemy waves\nEarn money from destroyed enemies', {
      font: '18px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.rectangle(400, 450, 200, 60, 0x00ff00);
    startButton.setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('TowerDefenseScene');
    });

    this.add.text(400, 450, 'START GAME', {
      font: 'bold 24px Arial',
      fill: '#000000',
      align: 'center'
    }).setOrigin(0.5);
  }
}

class TowerDefenseScene extends Phaser.Scene {
  constructor() {
    super('TowerDefenseScene');
    this.money = 100;
    this.lives = 20;
    this.levelNumber = 1;
    this.waveNumber = 1;
    this.enemies = [];
    this.towers = [];
    this.bullets = [];
    this.selectedTower = null;
    this.towerCost = 50;
    this.gameOverShown = false;
    this.totalWaves = 0;
    this.waveActive = false;
    this.levelCompleteShown = false;
  }

  create() {
    // Reset game state
    this.money = 100;
    this.lives = 20;
    this.levelNumber = 1;
    this.waveNumber = 1;
    this.enemies = [];
    this.towers = [];
    this.bullets = [];
    this.gameOverShown = false;
    this.levelCompleteShown = false;
    this.waveActive = false;
    this.totalWaves = Phaser.Math.Between(3, 6);

    // Set background
    this.cameras.main.setBackgroundColor('#2d5016');

    // Draw grid
    this.drawGrid();
    this.createPath();
    this.createUI();
    this.setupInput();
    
    // Start first wave after a short delay
    this.time.delayedCall(1000, () => this.startNextWave());
  }

  drawGrid() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(1, 0x444444, 0.5);

    const cellSize = 20;
    for (let x = 0; x < 800; x += cellSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    for (let y = 0; y < 600; y += cellSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    graphics.strokePath();
    graphics.generateTexture('grid', 800, 600);
    graphics.destroy();

    this.add.image(400, 300, 'grid');
  }

  generateRandomPath() {
    // Generate a random path with waypoints
    const path = [{ x: -50, y: Phaser.Math.Between(50, 550) }];
    
    // Generate 4-5 random waypoints
    const numWaypoints = Phaser.Math.Between(4, 5);
    const xStep = 800 / (numWaypoints + 1);
    
    for (let i = 1; i <= numWaypoints; i++) {
      const x = xStep * i + Phaser.Math.Between(-30, 30);
      const y = Phaser.Math.Between(50, 550);
      path.push({ x, y });
    }
    
    // End point
    path.push({ x: 850, y: Phaser.Math.Between(50, 550) });
    
    return path;
  }

  createPath() {
    // Draw enemy path
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0xffff00, 0.8);
    
    const path = this.generateRandomPath();

    for (let i = 0; i < path.length - 1; i++) {
      graphics.lineBetween(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
    }

    this.path = new Phaser.Curves.Path(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      this.path.lineTo(path[i].x, path[i].y);
    }
  }

  createUI() {
    const uiText = `Money: $${this.money} | Lives: ${this.lives} | Wave: ${this.waveNumber}\nClick to place towers ($${this.towerCost} each)`;
    this.uiText = this.add.text(10, 10, uiText, {
      font: '16px Arial',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // Back button
    const backButton = this.add.rectangle(750, 30, 80, 40, 0xff0000);
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.cleanup();
      this.scene.start('MenuScene');
    });

    this.add.text(750, 30, 'BACK', {
      font: 'bold 16px Arial',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  cleanup() {
    // Stop any running timers
    this.time.removeAllEvents();

    // Destroy all towers and their range graphics
    this.towers.forEach(tower => {
      if (tower.rangeGraphics) tower.rangeGraphics.destroy();
      tower.destroy();
    });
    this.towers = [];

    // Destroy all enemies
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];

    // Destroy all bullets
    this.bullets.forEach(bullet => bullet.destroy());
    this.bullets = [];

    // Reset wave state
    this.waveNumber = 1;
    this.waveActive = false;
    this.levelCompleteShown = false;
    this.gameOverShown = false;
  }

  updateUI() {
    const uiText = `Level: ${this.levelNumber} | Money: $${this.money} | Lives: ${this.lives} | Wave: ${this.waveNumber}\nClick to place towers ($${this.towerCost} each)`;
    this.uiText.setText(uiText);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      this.placeTower(pointer.x, pointer.y);
    });
  }

  placeTower(x, y) {
    if (this.money >= this.towerCost) {
      const tower = this.add.circle(x, y, 15, 0x0099ff);
      tower.range = 100;
      tower.fireRate = 500; // milliseconds between shots
      tower.lastShot = this.time.now - tower.fireRate; // Ready to shoot immediately
      tower.damage = 1;
      this.towers.push(tower);

      // Draw range indicator
      const rangeGraphics = this.make.graphics({ x: 0, y: 0, add: true });
      rangeGraphics.lineStyle(2, 0x00ff00, 0.5);
      rangeGraphics.strokeCircle(x, y, tower.range);
      tower.rangeGraphics = rangeGraphics;

      this.money -= this.towerCost;
      this.updateUI();
    }
  }

  spawnEnemies() {
    if (!this.waveActive) return;
    
    // Calculate difficulty multipliers for current wave
    const waveMultiplier = Math.pow(1.15, this.waveNumber - 1);
    const enemyCount = Phaser.Math.Between(8, 15); // Reduced from 15-40
    
    for (let i = 0; i < enemyCount; i++) {
      // Stagger spawning over time to prevent mass deaths
      this.time.delayedCall(i * 200, () => {
        const enemy = this.add.circle(-50, 100, 8, 0xff0000);
        enemy.speed = 50 * waveMultiplier;
        enemy.pathProgress = 0;
        enemy.health = 1; // All enemies have 1 health, towers can one-shot
        this.enemies.push(enemy);
      });
    }
  }

  startNextWave() {
    if (this.waveNumber > this.totalWaves) return;
    
    this.waveActive = true;
    this.spawnEnemies();
    
    // Schedule next wave after delay (enemies need time to go through)
    this.time.delayedCall(8000, () => {
      if (this.waveNumber < this.totalWaves) {
        this.waveNumber++;
        this.updateUI();
        this.startNextWave();
      }
    });
  }

  shootAtEnemy(tower, enemy) {
    const now = this.time.now;
    if (now - tower.lastShot < tower.fireRate) {
      return; // Tower is on cooldown
    }

    tower.lastShot = now;

    const bullet = this.add.circle(tower.x, tower.y, 4, 0xffff00);
    bullet.speed = 400;
    bullet.damage = tower.damage;
    bullet.targetEnemy = enemy; // Track the enemy object, not a fixed position
    this.bullets.push(bullet);
  }

  showGameOver() {
    // Create flashing red overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0xff0000);
    overlay.setDepth(1000); // Bring to front
    overlay.alpha = 0.7;

    // Add "GAME OVER!" text
    this.add.text(400, 300, 'GAME OVER!', {
      font: 'bold 72px Arial',
      fill: '#000000',
      align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    // Flash effect
    this.tweens.add({
      targets: overlay,
      alpha: { from: 0.7, to: 0.3 },
      duration: 300,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        this.cleanup();
        this.scene.start('MenuScene');
      }
    });
  }

  showLevelComplete() {
    // Create green overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x00ff00);
    overlay.setDepth(1000);
    overlay.alpha = 0.7;

    // Add "LEVEL COMPLETE!" text
    const text = this.add.text(400, 260, 'LEVEL COMPLETE!', {
      font: 'bold 72px Arial',
      fill: '#000000',
      align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    // Ready button
    const readyButton = this.add.rectangle(400, 360, 220, 64, 0x000000).setDepth(1002).setInteractive();
    const readyText = this.add.text(400, 360, 'READY?', {
      font: 'bold 28px Arial',
      fill: '#00ff00'
    }).setOrigin(0.5).setDepth(1003);

    // Store references for cleanup
    this.levelCompleteOverlay = overlay;
    this.levelCompleteText = text;
    this.levelCompleteButton = readyButton;
    this.levelCompleteButtonText = readyText;

    // Pause the game so nothing moves while player decides
    this.levelPaused = true;
    this.waveActive = false;

      // Small pulsating animation to draw attention
      this.tweens.add({
        targets: [readyButton, readyText],
        scale: { from: 1, to: 1.05 },
        ease: 'Sine.easeInOut',
        duration: 600,
        yoyo: true,
        repeat: -1
      });

      // Start next level only when user clicks READY
      readyButton.on('pointerdown', () => {
        this.setupNextLevel();
      });
  }

  setupNextLevel() {
    // Increment level
    this.levelNumber++;

    // Destroy level complete screen if it exists
    if (this.levelCompleteOverlay) {
      this.levelCompleteOverlay.destroy();
      this.levelCompleteOverlay = null;
    }
    if (this.levelCompleteText) {
      this.levelCompleteText.destroy();
      this.levelCompleteText = null;
    }
    if (this.levelCompleteButton) {
      this.levelCompleteButton.destroy();
      this.levelCompleteButton = null;
    }
    if (this.levelCompleteButtonText) {
      this.levelCompleteButtonText.destroy();
      this.levelCompleteButtonText = null;
    }

    // Add bonus money
    this.money += 150;

    // Remove old path graphics and reset
    this.children.list.forEach(child => {
      if (child.type === 'Graphics') {
        child.destroy();
      }
    });

    // Stop all timers and clear entities
    this.time.removeAllEvents();
    this.towers.forEach(tower => {
      if (tower.rangeGraphics) tower.rangeGraphics.destroy();
      tower.destroy();
    });
    this.towers = [];
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
    this.bullets.forEach(bullet => bullet.destroy());
    this.bullets = [];

    // Reset wave state
    this.waveNumber = 1;
    this.waveActive = false;
    this.levelCompleteShown = false;
    this.totalWaves = Phaser.Math.Between(3, 6);

    // Redraw new path
    this.createPath();
    this.updateUI();

    // Start first wave after delay
    // Unpause and start waves
    this.levelPaused = false;
    this.time.delayedCall(1000, () => this.startNextWave());
  }

  update() {
    if (this.levelPaused) return;
    // Move enemies along path
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.active) return false;

      enemy.pathProgress += enemy.speed * this.sys.game.loop.delta / 1000 / 300;

      if (enemy.pathProgress >= 1) {
        enemy.destroy();
        this.lives--;
        this.updateUI();
        return false;
      }

      const point = this.path.getPoint(enemy.pathProgress);
      enemy.x = point.x;
      enemy.y = point.y;

      // Tower targeting
      this.towers.forEach(tower => {
        const distance = Phaser.Math.Distance.Between(
          tower.x, tower.y, enemy.x, enemy.y
        );
        if (distance < tower.range) {
          this.shootAtEnemy(tower, enemy);
        }
      });

      return true;
    });

    // Move and check bullets
    this.bullets = this.bullets.filter(bullet => {
      if (!bullet.active) return false;

      // If target enemy is destroyed, destroy bullet too
      if (!bullet.targetEnemy || !bullet.targetEnemy.active) {
        bullet.destroy();
        return false;
      }

      // Move bullet toward target enemy's current position
      const dx = bullet.targetEnemy.x - bullet.x;
      const dy = bullet.targetEnemy.y - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        bullet.x += dx / distance * bullet.speed * this.sys.game.loop.delta / 1000;
        bullet.y += dy / distance * bullet.speed * this.sys.game.loop.delta / 1000;
      } else {
        // Bullet reached target
        bullet.targetEnemy.health -= bullet.damage;
        if (bullet.targetEnemy.health <= 0) {
          bullet.targetEnemy.destroy();
          this.money += 10;
          this.updateUI();
        }
        bullet.destroy();
        return false;
      }

      return true;
    });

    // Check if all enemies defeated and no more waves coming

    // Check if level is complete
    if (
      this.waveNumber >= this.totalWaves &&
      this.enemies.length === 0 &&
      !this.levelCompleteShown
    ) {
      this.levelCompleteShown = true;
      this.showLevelComplete();
    }

    // Check game over
    if (this.lives <= 0 && !this.gameOverShown) {
      this.gameOverShown = true;
      this.showGameOver();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MenuScene, TowerDefenseScene]
};

const game = new Phaser.Game(config);
