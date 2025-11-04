import { Enemy } from './types';
import { SeededRandom } from './SeededRandom';

export class EnemyFactory {
  private static enemyTemplates: Omit<Enemy, 'id' | 'health'>[] = [
    {
      name: 'Malfunctioning Security Bot',
      description: 'A security robot with sparking wires, its targeting system glitching.',
      maxHealth: 20,
      strength: 4,
      xpReward: 15
    },
    {
      name: 'Feral Station Cat',
      description: 'A cat that has gone feral, hissing aggressively. Its eyes glow in the dark.',
      maxHealth: 10,
      strength: 2,
      xpReward: 8
    },
    {
      name: 'Rogue Maintenance Drone',
      description: 'A maintenance drone with malfunctioning repair tools that now see you as debris.',
      maxHealth: 15,
      strength: 3,
      xpReward: 12
    },
    {
      name: 'Corrupted AI Core Fragment',
      description: 'A floating sphere of corrupted code and energy, remnant of the station AI.',
      maxHealth: 30,
      strength: 6,
      xpReward: 25
    },
    {
      name: 'Alien Parasite',
      description: 'A writhing, multi-tentacled creature that must have come from the cargo hold.',
      maxHealth: 25,
      strength: 5,
      xpReward: 20
    },
    {
      name: 'Infected Crew Member',
      description: 'A former crew member, now twisted and hostile. Their eyes are vacant.',
      maxHealth: 18,
      strength: 4,
      xpReward: 18
    },
    {
      name: 'Defense Turret',
      description: 'An automated defense turret stuck in hostile mode.',
      maxHealth: 22,
      strength: 5,
      xpReward: 16
    },
    {
      name: 'Escaped Lab Specimen',
      description: 'Whatever this creature is, it was never meant to escape containment.',
      maxHealth: 28,
      strength: 6,
      xpReward: 22
    }
  ];

  static createRandom(rng: SeededRandom): Enemy {
    const template = rng.choose(this.enemyTemplates);
    const healthVariation = rng.nextInt(-3, 3);
    const maxHealth = Math.max(5, template.maxHealth + healthVariation);

    return {
      id: `enemy_${Date.now()}_${rng.nextInt(1000, 9999)}`,
      name: template.name,
      description: template.description,
      maxHealth,
      health: maxHealth,
      strength: template.strength,
      xpReward: template.xpReward
    };
  }

  static createBoss(): Enemy {
    return {
      id: `boss_${Date.now()}`,
      name: 'Station AI Core - NEXUS',
      description: 'The corrupted central AI of the station. It pulses with unstable energy.',
      maxHealth: 50,
      health: 50,
      strength: 8,
      xpReward: 100
    };
  }
}
