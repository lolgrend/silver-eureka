import { Item, ItemType, TileType } from './types';
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
    },
    {
      name: 'Bridge Terminal Access Code',
      content: `[ENCRYPTED NOTE - CAPTAIN'S QUARTERS]
"Emergency access code for Bridge Terminal: PROMETHEUS
Use this if NEXUS locks us out. - Captain Rodriguez"`
    },
    {
      name: 'Engineering Override Password',
      content: `[CHIEF ENGINEER'S LOG]
"Set engineering terminal password to: REACTOR
Easy to remember during emergencies. Don't tell NEXUS. Wait, NEXUS already knows everything. Damn."`
    },
    {
      name: 'Medical Database Access',
      content: `[DR. CHEN'S NOTES]
"Medbay terminal credentials: XENOBIOLOGY
I've hidden my research on the specimens here. If something goes wrong... someone needs to know what we found."`
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

  static createKeycardAlpha(): Item {
    return {
      id: 'keycard_alpha',
      name: 'Security Keycard Alpha',
      type: ItemType.QUEST_ITEM,
      description: 'A red security keycard marked "ALPHA - EMERGENCY PROTOCOLS". Half of the emergency shutdown authorization.'
    };
  }

  static createKeycardBeta(): Item {
    return {
      id: 'keycard_beta',
      name: 'Security Keycard Beta',
      type: ItemType.QUEST_ITEM,
      description: 'A blue security keycard marked "BETA - EMERGENCY PROTOCOLS". The second half of the emergency shutdown authorization.'
    };
  }
}

export class SearchDescriptions {
  private static medbaySearches = [
    "You carefully open the cryogenic chambers, their doors hissing open with escaping frost. Inside, you plunge your hands into the strange anti-gravitational gel, feeling it cling to your skin like cold syrup. Your fingers brush against something...",
    "You search through the medical cabinets, pushing aside broken syringes and expired medications. The smell of antiseptic mixed with decay fills your nostrils as you dig deeper...",
    "You examine the overturned surgical table, its restraints still clasped as if someone vanished mid-procedure. Underneath, in a pool of dried fluids, you notice...",
    "The medical scanner flickers to life as you approach, displaying corrupted patient data. You check the storage compartment beneath it...",
    "You rifle through the pharmaceutical locker, its door hanging loose. Most vials are shattered, their contents long evaporated, but in the back corner..."
  ];

  private static medbayEmpty = [
    "...only the remnants of someone's last meal, now a dried, unidentifiable mass.",
    "...nothing but broken glass and dried chemicals.",
    "...empty packaging from supplies long since used.",
    "...just more medical waste and contamination.",
    "...only dust and the ghosts of the crew who once worked here."
  ];

  private static engineeringSearches = [
    "You pry open an access panel, revealing a nest of tangled cables and blinking diagnostic lights. Reaching into the mechanical guts of the station, you feel around...",
    "You search the tool locker, its contents scattered across the floor. Plasma cutters, welding torches, calibration devices - all abandoned in haste...",
    "You examine the main reactor console, its screens displaying warnings in seventeen different colors. In the maintenance tray below...",
    "You check the emergency supply closet, stepping over spilled coolant that has crystallized on the floor. On the top shelf...",
    "You investigate the workbench, covered in half-disassembled machinery and burned circuit boards. Buried beneath the technical debris..."
  ];

  private static engineeringEmpty = [
    "...nothing but outdated spare parts and corroded components.",
    "...only instruction manuals written in three languages, all equally useless now.",
    "...just more broken tools and failed repairs.",
    "...nothing salvageable, just the corpse of failed engineering.",
    "...empty containers and shattered dreams of keeping the station running."
  ];

  private static cargoSearches = [
    "You force open a sealed shipping container, its hydraulic lock protesting with a screech. Inside, among scattered packing materials and manifest sheets...",
    "You climb atop a stack of crates marked 'FRAGILE - RESEARCH MATERIALS' and pry open the top one. Nestled in protective foam...",
    "You search through an overturned storage locker, its contents spilled across the deck. Emergency rations, spare uniforms, personal effects of the crew...",
    "You investigate a locked storage cage, its door forced open by something with tremendous strength. Among the carnage of torn packages...",
    "You examine the cargo manifest terminal, then follow its directions to bay 7-B. There, in a corner covered in suspicious stains..."
  ];

  private static cargoEmpty = [
    "...you find only empty ration wrappers and worthless shipping documents.",
    "...nothing remains but packing materials and broken dreams of home.",
    "...just inventory logs listing supplies that never arrived.",
    "...only damaged goods, all beyond salvage.",
    "...you discover that someone else already looted this spot."
  ];

  private static quartersSearches = [
    "You search through personal lockers, reading the names of crew members you'll never meet. Inside one, beneath folded clothes that still smell of detergent...",
    "You check under the bunks, finding the usual collection of contraband, personal photos, and hidden possessions. In one particularly well-hidden spot...",
    "You examine a desk covered in personal effects: a child's drawing, a worn book, love letters never sent. In the drawer...",
    "You search the communal bathroom, checking medicine cabinets and shower stalls. Behind a loose panel near the ventilation system...",
    "You investigate a crew member's footlocker, its combination lock broken. Among the personal belongings and civilian clothing..."
  ];

  private static quartersEmpty = [
    "...nothing but someone's old civilian clothes and faded photographs of people they'll never see again.",
    "...only personal journals you feel too guilty to read and too sad to ignore.",
    "...just the everyday detritus of lives interrupted.",
    "...you find nothing but memories that don't belong to you.",
    "...only reminders that real people lived, worked, and died here."
  ];

  private static bridgeSearches = [
    "You search the command consoles, their screens flickering with corrupted data streams. NEXUS has been here, you can tell. In the captain's override compartment...",
    "You check the navigation station, its star charts still displaying the station's lonely position in deep space. In the emergency protocols locker...",
    "You investigate the communication array, listening to the static of dead channels. Behind the main terminal...",
    "You search the captain's ready room, finding reports of the station's final days. In a hidden safe behind the station charter...",
    "You examine the tactical station, its weapons systems long disabled. In the ammunition storage compartment..."
  ];

  private static bridgeEmpty = [
    "...nothing but corrupted files and NEXUS's digital fingerprints.",
    "...only logs of distress calls that were never answered.",
    "...just command codes for systems that no longer respond.",
    "...you find operational manuals for a station that stopped operating long ago.",
    "...only the chain of command for a crew that no longer exists."
  ];

  private static airlockSearches = [
    "You search the emergency equipment locker, finding EVA suits hanging like empty corpses. In the supply compartment...",
    "You check the airlock's maintenance access, where tools for external repairs are stored. Among the magnetic boots and tether cables...",
    "You examine the inner seal, looking for anything left by crew members who tried to escape this way. In a hidden pocket of an EVA suit...",
    "You search the emergency beacon storage, finding several already deployed. In the survival kit box...",
    "You investigate the pressure suit rack, checking each one's emergency pouches..."
  ];

  private static airlockEmpty = [
    "...nothing but spent oxygen cartridges and broken seals.",
    "...only maintenance logs of successful evacuations from other emergencies, in better times.",
    "...just empty oxygen tanks and useless repair supplies.",
    "...you find only the tools for escaping a station that won't let you leave.",
    "...nothing but the cold certainty that the escape pods were locked long ago."
  ];

  private static corridorSearches = [
    "You check the wall panels, some hanging loose from the emergency that swept through here. Behind one panel...",
    "You search a damaged maintenance drone, its chassis cracked open. In its cargo compartment...",
    "You investigate an emergency supply alcove, its access panel forced open. Inside the cramped space...",
    "You examine a debris pile against the wall - looks like someone made a barricade here once. Scattered among the wreckage...",
    "You search the ceiling access panels, standing on scattered debris to reach them. In the ventilation maintenance box..."
  ];

  private static corridorEmpty = [
    "...nothing but tangled wiring and dust.",
    "...only emergency instructions no one will ever follow again.",
    "...just broken light fixtures and shattered dreams of escape.",
    "...you find nothing but evidence of panic and flight.",
    "...only the scars of whatever happened here."
  ];

  private static roomSearches = [
    "You search through scattered debris and overturned furniture. This room saw some kind of struggle. Among the chaos...",
    "You check the storage compartments built into the walls. Most are empty, looted long ago, but one in the corner...",
    "You examine the room's environmental control panel. In the maintenance access below it...",
    "You investigate a pile of equipment someone gathered but never used. Underneath the tangle of cables and devices...",
    "You search the room systematically, checking every corner and crevice. In a spot you almost missed..."
  ];

  private static roomEmpty = [
    "...nothing of value remains.",
    "...only broken equipment and shattered hopes.",
    "...just more evidence of NEXUS's complete victory.",
    "...you find nothing but silence and shadows.",
    "...only dust and the weight of abandonment."
  ];

  static getSearchDescription(roomType: TileType, rng: SeededRandom, foundItem: boolean): string {
    let searches: string[];
    let empty: string[];

    switch (roomType) {
      case TileType.MEDBAY:
        searches = this.medbaySearches;
        empty = this.medbayEmpty;
        break;
      case TileType.ENGINEERING:
        searches = this.engineeringSearches;
        empty = this.engineeringEmpty;
        break;
      case TileType.CARGO:
        searches = this.cargoSearches;
        empty = this.cargoEmpty;
        break;
      case TileType.QUARTERS:
        searches = this.quartersSearches;
        empty = this.quartersEmpty;
        break;
      case TileType.BRIDGE:
        searches = this.bridgeSearches;
        empty = this.bridgeEmpty;
        break;
      case TileType.AIRLOCK:
        searches = this.airlockSearches;
        empty = this.airlockEmpty;
        break;
      case TileType.CORRIDOR:
        searches = this.corridorSearches;
        empty = this.corridorEmpty;
        break;
      default: // ROOM and others
        searches = this.roomSearches;
        empty = this.roomEmpty;
    }

    const searchDesc = rng.choose(searches);

    if (foundItem) {
      return searchDesc + "\n\n[!] You found something!";
    } else {
      const emptyDesc = rng.choose(empty);
      return searchDesc + emptyDesc;
    }
  }
}
