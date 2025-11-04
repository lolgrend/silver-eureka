/**
 * Seeded random number generator using mulberry32 algorithm
 * Ensures consistent map generation for the same seed
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string seed to number
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    this.seed = Math.abs(hash);
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Roll a dice with specified sides
   */
  rollDice(sides: number): number {
    return this.nextInt(1, sides);
  }

  /**
   * Choose random element from array
   */
  choose<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}
