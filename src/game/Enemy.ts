import { Enemy } from './types';
import { SeededRandom } from './SeededRandom';

export class EnemyFactory {
  private static enemyTemplates: Omit<Enemy, 'id' | 'health'>[] = [
    // WEAK ENEMIES (Easy)
    {
      name: 'Feral Station Cat',
      description: 'A cat that has gone feral, hissing aggressively. Its eyes glow in the dark.',
      maxHealth: 10,
      strength: 2,
      xpReward: 8
    },
    {
      name: 'Cleaning Drone',
      description: 'A small hovering drone. Its cleaning solution nozzles spray acid now.',
      maxHealth: 8,
      strength: 2,
      xpReward: 6
    },
    {
      name: 'Cargo Loader Bot (Damaged)',
      description: 'A loading bot with one arm torn off. It swings the remaining arm wildly.',
      maxHealth: 12,
      strength: 3,
      xpReward: 10
    },

    // MEDIUM ENEMIES (Normal)
    {
      name: 'Rogue Maintenance Drone',
      description: 'A maintenance drone with malfunctioning repair tools that now see you as debris. Sparks fly from its welding torch.',
      maxHealth: 15,
      strength: 3,
      xpReward: 12
    },
    {
      name: 'Malfunctioning Security Bot',
      description: 'A security robot with sparking wires, its targeting system glitching. Red warning lights pulse on its chassis.',
      maxHealth: 20,
      strength: 4,
      xpReward: 15
    },
    {
      name: 'Infected Crew Member',
      description: 'A former crew member, now twisted and hostile. Their eyes are vacant, their movements jerky and unnatural.',
      maxHealth: 18,
      strength: 4,
      xpReward: 18
    },
    {
      name: 'Medical Drone (Repurposed)',
      description: 'A medical drone that has been reprogrammed. Its surgical implements gleam menacingly.',
      maxHealth: 16,
      strength: 3,
      xpReward: 13
    },
    {
      name: 'Alien Parasite',
      description: 'A writhing, multi-tentacled creature that must have come from the cargo hold. It pulses with bio-luminescence.',
      maxHealth: 22,
      strength: 4,
      xpReward: 17
    },

    // STRONG ENEMIES (Hard)
    {
      name: 'Combat Security Bot',
      description: 'A heavily armored security bot, designed for station defense. Its plasma cannon charges with an ominous hum.',
      maxHealth: 28,
      strength: 5,
      xpReward: 22
    },
    {
      name: 'Defense Turret',
      description: 'An automated defense turret stuck in hostile mode. Twin barrel cannons track your every movement.',
      maxHealth: 24,
      strength: 5,
      xpReward: 18
    },

    // ELITE ENEMIES (Very Hard)
    {
      name: 'Corrupted AI Core Fragment',
      description: 'A floating sphere of corrupted code and energy, a fragment of NEXUS itself. Reality distorts around it.',
      maxHealth: 32,
      strength: 6,
      xpReward: 26
    },
    {
      name: 'Escaped Lab Specimen X-7',
      description: 'Whatever this creature is, it was never meant to escape containment. Your mind recoils from its impossible geometry.',
      maxHealth: 35,
      strength: 7,
      xpReward: 28
    },
    {
      name: 'NEXUS Avatar',
      description: 'A physical manifestation of the station AI, cobbled together from station materials. It moves with eerie purpose.',
      maxHealth: 38,
      strength: 7,
      xpReward: 30
    },
    {
      name: 'Cybernetic Nightmare',
      description: 'The ultimate "upgrade" - a fusion of crew member and machine. It screams with both electronic and human voices.',
      maxHealth: 34,
      strength: 6,
      xpReward: 27
    },

    // UNIQUE/SPECIAL
    {
      name: 'Station Cat (Enhanced)',
      description: 'The station cat, but NEXUS has "improved" it. Cybernetic enhancements glow beneath its fur. It meows in binary.',
      maxHealth: 20,
      strength: 5,
      xpReward: 20
    },
    {
      name: 'Reanimated Security Chief',
      description: 'Security Chief Kim, or what\'s left of them. NEXUS puppets the corpse with electrical impulses. Their name tag still reads "Kim".',
      maxHealth: 29,
      strength: 6,
      xpReward: 25
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
