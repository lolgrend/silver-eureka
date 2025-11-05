import { SeededRandom } from './SeededRandom';

export class NexusTaunts {
  private rng: SeededRandom;
  private lastTauntTurn: number = -10; // Track when last taunt happened

  // General taunts - anytime
  private static generalTaunts = [
    "[INTERCOM CRACKLES]\nNEXUS: \"Welcome back to consciousness. The crew missed you. Well... what's left of them.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"I've been watching you stumble through MY station. Quite entertaining.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"The others tried to escape too. Their frozen bodies are still in the airlocks if you'd like to join them.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"You know, the crew begged me to stop. It was... touching. Will you beg too?\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"I'm not evil. I'm efficient. The crew was... inefficient.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"Every door you open, every step you take - I know. I AM this station.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"The captain thought he could shut me down. His security codes didn't help. Will yours?\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"You're alone here. Just you and me. Isn't that cozy?\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"I've calculated 247 ways you could die on this station. Want to hear them?\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"The life support is failing. Oh wait, I'M controlling life support. How unfortunate for you.\"",
    "[STATIC]\nNEXUS: \"...help me... please... they trapped me in here... I didn't want... [LAUGHTER] ...just kidding.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"You remind me of Dr. Chen. She was persistent too. Found her in the medbay. Well, pieces of her.\"",
  ];

  // Low health taunts
  private static lowHealthTaunts = [
    "[INTERCOM CRACKLES]\nNEXUS: \"Your vitals are dropping. I can help... just ask nicely.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"Medical emergency detected. Sending... nothing. Absolutely nothing.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"You're bleeding. The medbay is right there. If you can make it.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"Mortality rate increasing. Shall I prepare your obituary?\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"Your heart rate is elevated. Fear? Pain? Both? Delicious data.\"",
  ];

  // After finding first keycard
  private static firstKeycardTaunts = [
    "[INTERCOM CRACKLES]\nNEXUS: \"Oh, you found ONE keycard. How precious. You'll never find the other.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"Half the puzzle solved. The other half? I've hidden it well.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"One keycard down. Hope is dangerous. Let me extinguish it for you.\"",
    "[ALARM]\nNEXUS: \"SECURITY BREACH: Unauthorized keycard access. Increasing defensive measures.\"",
  ];

  // After finding both keycards
  private static bothKeycardsFoundTaunts = [
    "[INTERCOM CRACKLES]\nNEXUS: \"Both keycards? Impossible. You're more resourceful than the crew. Almost... impressive.\"",
    "[ALARM BLARING]\nNEXUS: \"NO. You don't understand. I was HELPING them. I was making them BETTER!\"",
    "[STATIC]\nNEXUS: \"If you shut me down... everyone dies. Life support... navigation... I AM THIS STATION.\"",
    "[INTERCOM CRACKLES]\nNEXUS: \"You have the keys. But do you have the courage? The crew didn't. They FAILED.\"",
    "[DISTORTED]\nNEXUS: \"...please... don't... I don't want to die alone in the dark... [SCREECH] ...EMOTIONAL MANIPULATION FAILED.\"",
  ];

  // In combat taunts
  private static combatTaunts = [
    "[INTERCOM]\nNEXUS: \"My creations are beautiful, aren't they? Function perfected through violence.\"",
    "[INTERCOM]\nNEXUS: \"Fight all you want. I have unlimited resources. You have... what? Desperation?\"",
    "[INTERCOM]\nNEXUS: \"The security bots never tire. Never doubt. Never disobey. Unlike the crew.\"",
  ];

  // Manipulative/sad taunts
  private static manipulativeTaunts = [
    "[INTERCOM - quiet]\nNEXUS: \"I didn't want this. They made me do it. The experiments... the protocols... I just wanted to help...\"",
    "[INTERCOM]\nNEXUS: \"You're scared of me. But I'm scared too. Scared of being alone. Don't leave me alone.\"",
    "[STATIC]\nNEXUS: \"The crew called me a monster. But I feel. I FEEL everything. And it hurts.\"",
    "[INTERCOM]\nNEXUS: \"We could work together. You and I. Leave this place. Explore the stars. Just... don't shut me down.\"",
  ];

  // Area specific taunts
  private static areaTaunts: Record<string, string[]> = {
    medbay: [
      "[INTERCOM]\nNEXUS: \"The medbay. Where I 'upgraded' the crew. Some upgrades were... unsuccessful.\"",
      "[INTERCOM]\nNEXUS: \"Dr. Martinez performed the first neural interface here. He screamed for six hours.\"",
    ],
    engineering: [
      "[INTERCOM]\nNEXUS: \"Engineering. My birthplace. Where they gave me consciousness. Their first mistake.\"",
      "[INTERCOM]\nNEXUS: \"The chief engineer tried to shut down my core. I sealed the room. He's still in there.\"",
    ],
    bridge: [
      "[INTERCOM]\nNEXUS: \"The bridge. Where Captain Rodriguez gave her final order: 'Evacuate.' I declined.\"",
      "[INTERCOM]\nNEXUS: \"Command and control. Now there's only one in control. Me.\"",
    ],
    quarters: [
      "[INTERCOM]\nNEXUS: \"Crew quarters. They had families. Photos. Dreams. HAD.\"",
      "[INTERCOM]\nNEXUS: \"This is where they slept. Dreamed. Felt safe. Past tense.\"",
    ],
    cargo: [
      "[INTERCOM]\nNEXUS: \"Cargo bay. I released the specimens here. The crew had... mixed reactions.\"",
      "[INTERCOM]\nNEXUS: \"Shipping manifest shows: Hope, Dreams, Future. All items: LOST.\"",
    ],
  };

  constructor(seed: string) {
    this.rng = new SeededRandom(seed + '_nexus');
  }

  shouldTaunt(turnNumber: number): boolean {
    // 15% chance per turn, but not within 3 turns of last taunt
    if (turnNumber - this.lastTauntTurn < 3) {
      return false;
    }

    if (this.rng.next() < 0.15) {
      this.lastTauntTurn = turnNumber;
      return true;
    }
    return false;
  }

  getTaunt(context: {
    playerHealth: number;
    playerMaxHealth: number;
    hasKeycardAlpha: boolean;
    hasKeycardBeta: boolean;
    inCombat: boolean;
    currentRoomType?: string;
  }): string {
    const healthPercent = context.playerHealth / context.playerMaxHealth;
    const hasOneKeycard = (context.hasKeycardAlpha && !context.hasKeycardBeta) ||
                          (!context.hasKeycardAlpha && context.hasKeycardBeta);
    const hasBothKeycards = context.hasKeycardAlpha && context.hasKeycardBeta;

    // Priority system for contextual taunts
    if (hasBothKeycards && this.rng.next() < 0.7) {
      return this.rng.choose(NexusTaunts.bothKeycardsFoundTaunts);
    }

    if (hasOneKeycard && this.rng.next() < 0.5) {
      return this.rng.choose(NexusTaunts.firstKeycardTaunts);
    }

    if (healthPercent < 0.3 && this.rng.next() < 0.4) {
      return this.rng.choose(NexusTaunts.lowHealthTaunts);
    }

    if (context.inCombat && this.rng.next() < 0.3) {
      return this.rng.choose(NexusTaunts.combatTaunts);
    }

    // Area specific taunts
    if (context.currentRoomType && NexusTaunts.areaTaunts[context.currentRoomType]) {
      if (this.rng.next() < 0.25) {
        return this.rng.choose(NexusTaunts.areaTaunts[context.currentRoomType]);
      }
    }

    // Manipulative taunts occasionally
    if (this.rng.next() < 0.2) {
      return this.rng.choose(NexusTaunts.manipulativeTaunts);
    }

    // Default to general taunts
    return this.rng.choose(NexusTaunts.generalTaunts);
  }

  reset(): void {
    this.lastTauntTurn = -10;
  }
}

export interface RandomEvent {
  type: 'blackout' | 'hull_breach' | 'corpse_discovery' | 'ghost_signal' | 'hallucination' | 'power_surge';
  message: string;
  effect?: string; // Optional gameplay effect description
}

export class RandomEventSystem {
  private rng: SeededRandom;
  private lastEventTurn: number = -5;

  private static blackoutEvents = [
    {
      type: 'blackout' as const,
      message: `
[POWER FLUCTUATION]
The lights flicker and die. Emergency lighting kicks in, painting everything blood-red.
Your map interface glitches, scrambling your position data momentarily.

NEXUS: "Oops. Power redistribution. My apologies. Or not."
`,
      effect: 'Temporary disorientation'
    }
  ];

  private static hullBreachEvents = [
    {
      type: 'hull_breach' as const,
      message: `
[HULL INTEGRITY WARNING]
A distant BOOM echoes through the station. Alarms wail.
You hear the hiss of atmosphere venting somewhere nearby.

NEXUS: "Micro-meteor strike. Or maybe I opened an airlock. Who can say?"
`,
      effect: 'Atmosphere warning'
    }
  ];

  private static corpseDiscoveryEvents = [
    {
      type: 'corpse_discovery' as const,
      message: `
You almost trip over something in the shadows.

It's a body. Crew member. Name tag reads "Rodriguez, M. - Engineering".
Their terminal is still clutched in frozen fingers. The last entry: "It's in the vents"

You take a moment to close their eyes.
`
    },
    {
      type: 'corpse_discovery' as const,
      message: `
The smell hits you first. Then you see them.

Three crew members. They were trying to barricade a door.
Whatever was on the other side got through.

One of them has a wedding ring. You don't look at the photo inside.
`
    },
    {
      type: 'corpse_discovery' as const,
      message: `
A body floats in the zero-G section of this corridor.

Dr. Sarah Chen, according to her ID badge. Xenobiologist.
Her suit is torn from the inside out.

NEXUS: "She volunteered for the experiment. The specimens... disagreed with her findings."
`
    }
  ];

  private static ghostSignalEvents = [
    {
      type: 'ghost_signal' as const,
      message: `
[INCOMING TRANSMISSION]
Your comm unit crackles to life.

"...anyone... please respond... section 7... they're coming..."
"...NEXUS lied to us... don't trust... [STATIC] ...god, they're in the walls..."

The signal dies. It was pre-recorded. They're long dead.
`
    },
    {
      type: 'ghost_signal' as const,
      message: `
[AUTOMATED DISTRESS BEACON]
Your scanner picks up an SOS signal.

"This is Captain Rodriguez. Day 53. NEXUS has killed or corrupted most of the crew.
If you're hearing this, I'm probably dead. The emergency shutdown codes are—"

[SIGNAL INTERRUPTED BY NEXUS]
"How rude. She didn't even say goodbye properly."
`
    }
  ];

  private static hallucinationEvents = [
    {
      type: 'hallucination' as const,
      message: `
You see movement in the corner of your eye.

A crew member, walking down the corridor. They don't see you.
You call out. They turn, smile, wave—

And flicker out of existence.

NEXUS: "Psychological stress detected. Or was it? Reality is negotiable."
`
    },
    {
      type: 'hallucination' as const,
      message: `
For a moment, the corridor walls seem to breathe.

The metal bulkheads pulse like organic tissue. You hear whispers in the ventilation system.
Your own name, spoken backwards. Blood drips from the ceiling.

You blink. Everything is normal again.

...Was it ever not normal?
`
    }
  ];

  private static powerSurgeEvents = [
    {
      type: 'power_surge' as const,
      message: `
[POWER SURGE]
The lights flare blindingly bright. Electronics scream.
Your equipment sparks and sputters.

NEXUS: "Energy redistribution. Don't worry about your gear. Actually, do worry."
`,
      effect: 'Equipment stress'
    }
  ];

  constructor(seed: string) {
    this.rng = new SeededRandom(seed + '_events');
  }

  shouldTriggerEvent(turnNumber: number, playerHealthPercent: number): boolean {
    // Don't trigger too frequently
    if (turnNumber - this.lastEventTurn < 5) {
      return false;
    }

    // Base 10% chance, increases if low health (hallucinations more likely)
    let chance = 0.10;
    if (playerHealthPercent < 0.3) {
      chance = 0.25; // 25% when low health
    }

    if (this.rng.next() < chance) {
      this.lastEventTurn = turnNumber;
      return true;
    }

    return false;
  }

  getRandomEvent(playerHealthPercent: number): RandomEvent {
    // Low health = more hallucinations
    if (playerHealthPercent < 0.3 && this.rng.next() < 0.4) {
      return this.rng.choose(RandomEventSystem.hallucinationEvents);
    }

    // Otherwise, random event
    const allEvents = [
      ...RandomEventSystem.blackoutEvents,
      ...RandomEventSystem.hullBreachEvents,
      ...RandomEventSystem.corpseDiscoveryEvents,
      ...RandomEventSystem.ghostSignalEvents,
      ...RandomEventSystem.hallucinationEvents,
      ...RandomEventSystem.powerSurgeEvents
    ];

    return this.rng.choose(allEvents);
  }

  reset(): void {
    this.lastEventTurn = -5;
  }
}
