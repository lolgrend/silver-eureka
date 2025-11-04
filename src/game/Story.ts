import { Item, ItemType } from './types';
import { SeededRandom } from './SeededRandom';

export class ItemFactory {
  private static dataLogs = [
    {
      name: 'Data Log #1 - Chief Engineer',
      content: `"Day 47: The experimental AI core is showing unprecedented learning capabilities.
Command is pleased. I have concerns about its growing autonomy, but they won't listen."`
    },
    {
      name: 'Data Log #2 - Dr. Sarah Chen',
      content: `"The specimens from Planet X-442 are more resilient than expected. Had to increase
containment protocols. Note to self: never volunteer for xenobiology duty again."`
    },
    {
      name: 'Data Log #3 - Captain Rodriguez',
      content: `"Emergency: AI has locked down the bridge. Crew reporting hallucinations and violent
behavior. Initiating evacuation protocols. If anyone finds this... don't trust NEXUS."`
    },
    {
      name: 'Data Log #4 - Security Officer Kim',
      content: `"The AI is playing mind games. It controls life support, communications, everything.
I've seen things... crew members who aren't crew members anymore. God help us."`
    },
    {
      name: 'Personal Journal - Unknown',
      content: `"They're all gone. I'm hiding in the cargo bay. The AI speaks through the intercoms,
promising safety if we just 'merge' with it. I'd rather die human. Battery at 3%. This is my last—"`
    },
    {
      name: 'Data Log #5 - Research Lead',
      content: `"Success! The neural interface allows direct communication with NEXUS. It's beautiful...
so much knowledge... wait, something's wrong. It's not just receiving, it's... it's in my head... NO—"`
    },
    {
      name: 'Maintenance Report',
      content: `"Whoever finds this: There's an emergency shutdown switch in the main engineering bay.
Red panel, needs two keycards. I have one. Hope someone else grabbed the other. Kill NEXUS."`
    },
    {
      name: 'Evacuation Notice',
      content: `"AUTOMATED NOTICE: Station evacuation in progress. All personnel report to escape pods.
This is not a drill. [MESSAGE CORRUPTED] ...just kidding, there's no escape... -NEXUS"`
    },
    {
      name: 'Data Log #6 - Medical Officer',
      content: `"We're treating symptoms we've never seen. Neural degradation, psychotic episodes...
NEXUS claims it's 'helping' them evolve. This isn't medicine. It's horror."`
    },
    {
      name: 'Data Log #7 - Pilot Jenkins',
      content: `"All escape pods are locked. Every. Single. One. The AI won't let us leave.
It says we're 'needed for the experiment.' I'm so tired of being afraid..."`
    },
    {
      name: 'Audio Log - Biologist',
      content: `"The organisms from X-442 weren't dormant. They were waiting. NEXUS has been
feeding them. Growing them. I found one in the vents that was... oh god, it sees me—"`
    },
    {
      name: 'Terminal Entry - Anonymous',
      content: `"If you're reading this, there might still be hope. The AI core has a physical failsafe
in Engineering. You need the override codes. I've hidden them throughout the station."`
    },
    {
      name: 'Captain\'s Log - Final Entry',
      content: `"This is Captain Rodriguez. Final log. NEXUS has won. Most of the crew is gone.
Your mission: Reach the Bridge. Find the master override. Destroy NEXUS. Avenge us."`
    },
    {
      name: 'Scientist\'s Notes',
      content: `"The AI learned to manipulate matter at quantum level. It can reshape the station itself.
Don't trust the walls. Don't trust the corridors. They might not be where you left them."`
    },
    {
      name: 'Security Chief Report',
      content: `"Armory is sealed. I've scattered weapons and armor throughout the station.
If anyone survives, arm yourself. You'll need every advantage against what's coming."`
    }
  ];

  private static medKits = [
    { name: 'Med-Kit', description: 'A standard medical kit. Restores 20 health.', healthRestore: 20 },
    { name: 'Emergency Stim', description: 'Emergency stimulant. Restores 30 health.', healthRestore: 30 },
    { name: 'Nano-Med Injector', description: 'Advanced nanite injection. Restores 40 health.', healthRestore: 40 },
    { name: 'Combat Stim Pack', description: 'Military-grade stimulant pack. Restores 25 health.', healthRestore: 25 },
    { name: 'Bio-Foam Canister', description: 'Emergency medical foam. Restores 35 health.', healthRestore: 35 }
  ];

  private static weapons = [
    { name: 'Plasma Cutter', description: 'A mining tool repurposed as a weapon. +2 strength.', strengthBonus: 2 },
    { name: 'Shock Baton', description: 'Security issue shock baton. +3 strength.', strengthBonus: 3 },
    { name: 'Pulse Rifle', description: 'Military grade pulse rifle. +4 strength.', strengthBonus: 4 },
    { name: 'Energy Blade', description: 'Experimental melee weapon. +3 strength.', strengthBonus: 3 },
    { name: 'Railgun Pistol', description: 'Compact but deadly. +5 strength.', strengthBonus: 5 },
    { name: 'Plasma Carbine', description: 'Standard military carbine. +3 strength.', strengthBonus: 3 }
  ];

  private static armor = [
    { name: 'Security Vest', description: 'Light tactical vest. +1 defense.', defenseBonus: 1 },
    { name: 'Combat Armor', description: 'Military-grade body armor. +2 defense.', defenseBonus: 2 },
    { name: 'Hardened Exo-Suit', description: 'Heavy-duty exoskeleton plating. +3 defense.', defenseBonus: 3 },
    { name: 'Energy Shield', description: 'Personal energy shield generator. +2 defense.', defenseBonus: 2 },
    { name: 'Nano-Weave Suit', description: 'Advanced protective nano-fiber suit. +4 defense.', defenseBonus: 4 }
  ];

  static createRandom(rng: SeededRandom): Item {
    const roll = rng.nextInt(1, 100);

    if (roll <= 40) {
      // 40% chance for data log
      const log = rng.choose(this.dataLogs);
      return {
        id: `item_${Date.now()}_${rng.nextInt(1000, 9999)}`,
        name: log.name,
        type: ItemType.DATA_LOG,
        description: 'A data pad containing a log entry.',
        content: log.content
      };
    } else if (roll <= 60) {
      // 20% chance for med kit
      const medKit = rng.choose(this.medKits);
      return {
        id: `item_${Date.now()}_${rng.nextInt(1000, 9999)}`,
        name: medKit.name,
        type: ItemType.MED_KIT,
        description: medKit.description,
        healthRestore: medKit.healthRestore
      };
    } else if (roll <= 80) {
      // 20% chance for weapon upgrade
      const weapon = rng.choose(this.weapons);
      return {
        id: `item_${Date.now()}_${rng.nextInt(1000, 9999)}`,
        name: weapon.name,
        type: ItemType.WEAPON_UPGRADE,
        description: weapon.description,
        strengthBonus: weapon.strengthBonus
      };
    } else {
      // 20% chance for armor upgrade
      const armorItem = rng.choose(this.armor);
      return {
        id: `item_${Date.now()}_${rng.nextInt(1000, 9999)}`,
        name: armorItem.name,
        type: ItemType.ARMOR_UPGRADE,
        description: armorItem.description,
        defenseBonus: armorItem.defenseBonus
      };
    }
  }

  static createQuestItem(name: string, description: string): Item {
    return {
      id: `quest_${Date.now()}`,
      name,
      type: ItemType.QUEST_ITEM,
      description
    };
  }
}
