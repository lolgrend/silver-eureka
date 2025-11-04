import { Position, PlayerStats, Item } from './types';

export class Player {
  private position: Position;
  private stats: PlayerStats;
  private inventory: Item[];

  constructor(startPosition: Position) {
    this.position = startPosition;
    this.stats = {
      health: 50,
      maxHealth: 50,
      strength: 5,
      defense: 0,
      xp: 0,
      level: 1
    };
    this.inventory = [];
  }

  getPosition(): Position {
    return { ...this.position };
  }

  setPosition(pos: Position): void {
    this.position = pos;
  }

  getStats(): PlayerStats {
    return { ...this.stats };
  }

  addItem(item: Item): void {
    this.inventory.push(item);
  }

  getInventory(): Item[] {
    return [...this.inventory];
  }

  removeItem(itemId: string): Item | undefined {
    const index = this.inventory.findIndex(i => i.id === itemId);
    if (index !== -1) {
      return this.inventory.splice(index, 1)[0];
    }
    return undefined;
  }

  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
  }

  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  addStrength(amount: number): void {
    this.stats.strength += amount;
  }

  addDefense(amount: number): void {
    this.stats.defense += amount;
  }

  addXP(amount: number): void {
    this.stats.xp += amount;

    // Check for level up (every 50 XP)
    const newLevel = Math.floor(this.stats.xp / 50) + 1;
    if (newLevel > this.stats.level) {
      this.levelUp(newLevel);
    }
  }

  private levelUp(newLevel: number): void {
    this.stats.level = newLevel;
    this.stats.maxHealth += 10;
    this.stats.health = this.stats.maxHealth; // Full heal on level up
    this.stats.strength += 1;
  }

  isDead(): boolean {
    return this.stats.health <= 0;
  }

  getStrength(): number {
    return this.stats.strength;
  }

  getDefense(): number {
    return this.stats.defense;
  }

  getHealth(): number {
    return this.stats.health;
  }

  getMaxHealth(): number {
    return this.stats.maxHealth;
  }

  getLevel(): number {
    return this.stats.level;
  }

  getXP(): number {
    return this.stats.xp;
  }
}
