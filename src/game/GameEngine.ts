import { MapGenerator } from './MapGenerator';
import { Player } from './Player';
import { Combat, CombatResult } from './Combat';
import { Position, TileType, ItemType } from './types';

export interface GameState {
  inCombat: boolean;
  gameOver: boolean;
  won: boolean;
}

export class GameEngine {
  private map: MapGenerator;
  private player: Player;
  private state: GameState;
  private sessionSeed: string;

  constructor(sessionId: string) {
    this.sessionSeed = sessionId;
    this.map = new MapGenerator(sessionId);
    const startPos = this.map.getRandomWalkablePosition();
    this.player = new Player(startPos);
    this.state = {
      inCombat: false,
      gameOver: false,
      won: false
    };

    // Discover starting position
    const startTile = this.map.getTile(startPos);
    if (startTile) {
      startTile.discovered = true;
    }
  }

  getWelcomeMessage(): string {
    return `
╔════════════════════════════════════════════════════════════════╗
║              DERELICT STATION: A Sci-Fi Roguelike              ║
╚════════════════════════════════════════════════════════════════╝

You awaken in a cryopod aboard the deep space station "Prometheus."
The emergency lights flicker. Silence. No crew. No sounds of life.

Only the eerie hum of failing systems and... something else.
The station AI, NEXUS, has gone rogue. The crew is gone.
Your mission: Survive. Discover what happened. Escape.

Commands:
  n/s/e/w     - Move north/south/east/west
  look        - Examine your surroundings
  inventory   - Check your inventory (i)
  stats       - View your stats
  use <item>  - Use an item from inventory
  read <item> - Read a data log
  attack      - Attack enemy (when in combat)
  flee        - Try to escape combat
  help        - Show this help
  quit        - Exit game

Press any key to begin your journey...
`;
  }

  getLook(): string {
    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    if (!tile) {
      return 'You see nothing but void.';
    }

    tile.discovered = true;
    let desc = `\n${tile.description}\n`;

    // Add surroundings
    desc += this.getSurroundings();

    if (tile.enemy) {
      desc += `\n[!] ${tile.enemy.name} blocks your path!\n`;
      desc += `    ${tile.enemy.description}\n`;
      desc += `    Health: ${tile.enemy.health}/${tile.enemy.maxHealth}\n`;
      this.state.inCombat = true;
    }

    if (tile.item) {
      desc += `\n[?] You notice: ${tile.item.name}\n`;
      desc += `    ${tile.item.description}\n`;
    }

    return desc;
  }

  private getSurroundings(): string {
    const pos = this.player.getPosition();
    const directions = [
      { dir: 'North', dx: 0, dy: -1 },
      { dir: 'South', dx: 0, dy: 1 },
      { dir: 'East', dx: 1, dy: 0 },
      { dir: 'West', dx: -1, dy: 0 }
    ];

    let desc = '\nExits: ';
    const exits: string[] = [];

    for (const { dir, dx, dy } of directions) {
      const checkPos = { x: pos.x + dx, y: pos.y + dy };
      const checkTile = this.map.getTile(checkPos);
      if (checkTile && checkTile.type !== TileType.WALL) {
        exits.push(dir);
      }
    }

    desc += exits.length > 0 ? exits.join(', ') : 'None (You are trapped!)';
    return desc;
  }

  move(direction: string): string {
    if (this.state.gameOver) {
      return 'Game is over. Type "quit" to exit.';
    }

    if (this.state.inCombat) {
      return 'You cannot move while in combat! Use "attack" or "flee".';
    }

    const pos = this.player.getPosition();
    let newPos = { ...pos };

    switch (direction.toLowerCase()) {
      case 'n': case 'north': newPos.y--; break;
      case 's': case 'south': newPos.y++; break;
      case 'e': case 'east': newPos.x++; break;
      case 'w': case 'west': newPos.x--; break;
      default:
        return 'Invalid direction. Use n/s/e/w.';
    }

    const newTile = this.map.getTile(newPos);

    if (!newTile || newTile.type === TileType.WALL) {
      return 'You cannot move that way. A wall blocks your path.';
    }

    this.player.setPosition(newPos);
    newTile.discovered = true;

    let msg = `You move ${direction}.\n`;

    // Auto-pickup items
    if (newTile.item) {
      msg += `\nYou pick up: ${newTile.item.name}\n`;
      this.player.addItem(newTile.item);
      newTile.item = undefined;
    }

    // Check for enemy
    if (newTile.enemy) {
      msg += `\n[!] ${newTile.enemy.name} attacks!\n`;
      msg += `    ${newTile.enemy.description}\n`;
      this.state.inCombat = true;
    }

    msg += '\n' + this.getLook();

    return msg;
  }

  attack(): string {
    if (this.state.gameOver) {
      return 'Game is over.';
    }

    if (!this.state.inCombat) {
      return 'There is nothing to attack.';
    }

    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    if (!tile || !tile.enemy) {
      this.state.inCombat = false;
      return 'There is no enemy here.';
    }

    const result = Combat.fight(this.player, tile.enemy);
    let msg = '\n--- COMBAT ---\n' + result.message;

    if (result.enemyDefeated) {
      tile.enemy = undefined;
      this.state.inCombat = false;
      msg += '\nThe path is clear.\n';
    }

    if (result.playerDied) {
      this.state.gameOver = true;
      msg += '\n\nGAME OVER - You have died aboard the Prometheus station.\n';
      msg += 'Your story ends here...\n';
    }

    msg += `\nYour Health: ${this.player.getHealth()}/${this.player.getMaxHealth()}`;

    return msg;
  }

  flee(): string {
    if (!this.state.inCombat) {
      return 'You are not in combat.';
    }

    // 50% chance to flee
    if (Math.random() < 0.5) {
      this.state.inCombat = false;

      // Move to random adjacent walkable tile
      const pos = this.player.getPosition();
      const directions = [
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }
      ];

      const validMoves: Position[] = [];
      for (const { dx, dy } of directions) {
        const newPos = { x: pos.x + dx, y: pos.y + dy };
        const tile = this.map.getTile(newPos);
        if (tile && tile.type !== TileType.WALL && !tile.enemy) {
          validMoves.push(newPos);
        }
      }

      if (validMoves.length > 0) {
        const escapePos = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.player.setPosition(escapePos);
        return 'You successfully flee from combat!\n\n' + this.getLook();
      }
    }

    return 'You failed to escape! The enemy blocks your way.';
  }

  useItem(itemName: string): string {
    const inventory = this.player.getInventory();
    const item = inventory.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!item) {
      return `You don't have "${itemName}" in your inventory.`;
    }

    let msg = '';

    switch (item.type) {
      case ItemType.MED_KIT:
        if (item.healthRestore) {
          const oldHealth = this.player.getHealth();
          this.player.heal(item.healthRestore);
          const healed = this.player.getHealth() - oldHealth;
          msg = `You use ${item.name} and restore ${healed} health.\n`;
          msg += `Health: ${this.player.getHealth()}/${this.player.getMaxHealth()}`;
          this.player.removeItem(item.id);
        }
        break;

      case ItemType.WEAPON_UPGRADE:
        if (item.strengthBonus) {
          this.player.addStrength(item.strengthBonus);
          msg = `You equip ${item.name}!\n`;
          msg += `Strength increased by ${item.strengthBonus}! New strength: ${this.player.getStrength()}`;
          this.player.removeItem(item.id);
        }
        break;

      case ItemType.DATA_LOG:
        msg = `Use "read ${itemName}" to read data logs.`;
        break;

      default:
        msg = `You cannot use ${item.name}.`;
    }

    return msg;
  }

  readItem(itemName: string): string {
    const inventory = this.player.getInventory();
    const item = inventory.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!item) {
      return `You don't have "${itemName}" in your inventory.`;
    }

    if (item.type === ItemType.DATA_LOG && item.content) {
      return `\n--- ${item.name} ---\n\n${item.content}\n`;
    }

    return `You cannot read ${item.name}.`;
  }

  getInventory(): string {
    const items = this.player.getInventory();
    if (items.length === 0) {
      return 'Your inventory is empty.';
    }

    let msg = '\n=== INVENTORY ===\n';
    items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name}\n`;
      msg += `   ${item.description}\n`;
    });
    return msg;
  }

  getStats(): string {
    const p = this.player;
    return `
=== CHARACTER STATS ===
Health:   ${p.getHealth()}/${p.getMaxHealth()}
Strength: ${p.getStrength()}
Level:    ${p.getLevel()}
XP:       ${p.getXP()}/${p.getLevel() * 50} (to next level)
Position: (${p.getPosition().x}, ${p.getPosition().y})
`;
  }

  getState(): GameState {
    return { ...this.state };
  }

  isGameOver(): boolean {
    return this.state.gameOver;
  }
}
