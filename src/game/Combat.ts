import { Player } from './Player';
import { Enemy } from './types';

export interface CombatResult {
  playerDamage: number;
  enemyDamage: number;
  playerRoll: number;
  enemyRoll: number;
  playerTotal: number;
  enemyTotal: number;
  enemyDefeated: boolean;
  playerDied: boolean;
  message: string;
}

export class Combat {
  /**
   * Roll a d10 (10-sided die)
   */
  private static rollD10(): number {
    return Math.floor(Math.random() * 10) + 1;
  }

  /**
   * Execute one round of combat
   */
  static fight(player: Player, enemy: Enemy): CombatResult {
    // Player attack
    const playerRoll = this.rollD10();
    const playerTotal = player.getStrength() + playerRoll;

    // Enemy attack
    const enemyRoll = this.rollD10();
    const enemyTotal = enemy.strength + enemyRoll;

    let message = `You rolled ${playerRoll} + ${player.getStrength()} STR = ${playerTotal}\n`;
    message += `${enemy.name} rolled ${enemyRoll} + ${enemy.strength} STR = ${enemyTotal}\n\n`;

    let playerDamage = 0;
    let enemyDamage = 0;

    // Determine damage
    if (playerTotal > enemyTotal) {
      enemyDamage = playerTotal - enemyTotal;
      enemy.health -= enemyDamage;
      enemy.health = Math.max(0, enemy.health);
      message += `You strike ${enemy.name} for ${enemyDamage} damage!\n`;
    } else if (enemyTotal > playerTotal) {
      const rawDamage = enemyTotal - playerTotal;
      const defense = player.getDefense();
      playerDamage = Math.max(1, rawDamage - defense); // Always at least 1 damage
      player.takeDamage(playerDamage);

      if (defense > 0) {
        message += `${enemy.name} attacks for ${rawDamage} damage, but your armor absorbs ${defense}!\n`;
        message += `You take ${playerDamage} damage!\n`;
      } else {
        message += `${enemy.name} hits you for ${playerDamage} damage!\n`;
      }
    } else {
      message += `Both attacks clash! No damage dealt.\n`;
    }

    const enemyDefeated = enemy.health <= 0;
    const playerDied = player.isDead();

    if (enemyDefeated) {
      message += `\n${enemy.name} has been defeated!\n`;
      message += `You gain ${enemy.xpReward} XP!\n`;
      player.addXP(enemy.xpReward);

      if (player.getLevel() > 1 && player.getXP() >= player.getLevel() * 50) {
        message += `\nLEVEL UP! You are now level ${player.getLevel()}!\n`;
      }
    }

    if (playerDied) {
      message += `\nYou have been defeated...\n`;
    }

    return {
      playerDamage,
      enemyDamage,
      playerRoll,
      enemyRoll,
      playerTotal,
      enemyTotal,
      enemyDefeated,
      playerDied,
      message
    };
  }
}
