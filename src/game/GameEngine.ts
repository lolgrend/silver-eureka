import { MapGenerator } from './MapGenerator';
import { Player } from './Player';
import { Combat, CombatResult } from './Combat';
import { Position, TileType, ItemType } from './types';
import { SearchDescriptions, ItemFactory } from './Story';
import { SeededRandom } from './SeededRandom';
import { NexusTaunts, RandomEventSystem } from './NexusSystem';

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
  private rng: SeededRandom;
  private nexusTaunts: NexusTaunts;
  private randomEvents: RandomEventSystem;
  private turnCounter: number = 0;

  constructor(sessionId: string) {
    this.sessionSeed = sessionId;
    this.rng = new SeededRandom(sessionId + '_search'); // Separate RNG for search
    this.nexusTaunts = new NexusTaunts(sessionId);
    this.randomEvents = new RandomEventSystem(sessionId);
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
Your head throbs. The emergency lights pulse red. Something is wrong.

The station is silent. No crew. No sounds of life. Only the eerie
hum of failing systems and... something else moving in the darkness.

[!] MISSION BRIEFING [!]
The station AI, NEXUS, has gone rogue and killed or corrupted the crew.
Data logs scattered throughout the station tell a story of horror.

YOUR OBJECTIVES:
• SURVIVE: Fight or flee from malfunctioning robots and alien creatures
• EXPLORE: Search the station for weapons, armor, and medical supplies
• INVESTIGATE: Read data logs to uncover what happened
• FIND THE KEYCARDS: Locate Security Keycards Alpha and Beta
• SHUTDOWN NEXUS: Use the emergency shutdown panel in Engineering
• ESCAPE: Victory awaits those who can shut down NEXUS and survive!

TIP: Armor reduces damage taken. Weapons increase damage dealt.
     Level up by defeating enemies to become stronger!
     The Bridge and Quarters/Cargo hold the keys to your escape.

Commands:
  n/s/e/w     - Move north/south/east/west
  look        - Examine your surroundings
  search      - Search the area for hidden items
  map         - View discovered areas (x to close)
  inventory   - Check your inventory (i)
  stats       - View your stats
  use <item>  - Use an item from inventory
  read <item> - Read a data log
  attack      - Attack enemy (when in combat)
  flee        - Try to escape combat
  shutdown    - Shutdown NEXUS (requires both keycards)
  help        - Show this help
  quit        - Exit game

Good luck, survivor. You're going to need it...
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

    if (tile.hasShutdownPanel) {
      desc += `\n[!!!] EMERGENCY SHUTDOWN PANEL [!!!]\n`;
      desc += `      A red control terminal glows before you.\n`;
      desc += `      "NEXUS CORE SHUTDOWN - REQUIRES DUAL KEY AUTHORIZATION"\n`;
      desc += `      Type 'shutdown' to attempt emergency shutdown.\n`;
    }

    if (tile.terminal) {
      desc += `\n[TERMINAL] ${tile.terminal.name}\n`;
      desc += `    ${tile.terminal.description}\n`;
      if (tile.terminal.isLocked) {
        desc += `    Status: LOCKED - Password required.\n`;
        desc += `    Type 'hack <password>' to attempt access.\n`;
      } else {
        desc += `    Status: UNLOCKED - Already accessed.\n`;
      }
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

    // NEXUS taunt
    const taunt = this.getNexusTaunt();
    if (taunt) {
      msg += taunt;
    }

    // Random event
    const event = this.getRandomEvent();
    if (event) {
      msg += '\n' + event;
    }

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
    let msg = '\n--- COMBAT ROUND ---\n' + result.message;

    if (result.enemyDefeated) {
      tile.enemy = undefined;
      this.state.inCombat = false;
      msg += '\n✓ Victory! The enemy has been defeated!\n';
      msg += 'The path is clear.\n';

      // NEXUS taunt after combat
      const taunt = this.getNexusTaunt();
      if (taunt) {
        msg += taunt;
      }
    } else {
      // Enemy still alive - show status and options
      msg += `\n${tile.enemy.name} Health: ${tile.enemy.health}/${tile.enemy.maxHealth}`;
      msg += `\nYour Health: ${this.player.getHealth()}/${this.player.getMaxHealth()}`;
      msg += '\n\nWhat will you do? [attack] to fight, [flee] to escape';
    }

    if (result.playerDied) {
      this.state.gameOver = true;
      msg += '\n\nGAME OVER - You have died aboard the Prometheus station.\n';
      msg += 'Your story ends here...\n';
    } else if (!result.enemyDefeated) {
      // Show player health after combat round
      msg += `\n`;
    }

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

      case ItemType.ARMOR_UPGRADE:
        if (item.defenseBonus) {
          this.player.addDefense(item.defenseBonus);
          msg = `You equip ${item.name}!\n`;
          msg += `Defense increased by ${item.defenseBonus}! New defense: ${this.player.getDefense()}`;
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

  hack(password: string): string {
    if (this.state.gameOver) {
      return 'Game is over.';
    }

    if (this.state.inCombat) {
      return 'You cannot hack terminals while in combat!';
    }

    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    if (!tile || !tile.terminal) {
      return 'There is no terminal here to hack.';
    }

    const terminal = tile.terminal;

    if (!terminal.isLocked) {
      return `This terminal has already been unlocked. Nothing more to gain here.`;
    }

    // Try the password
    if (!password || password.trim().length === 0) {
      return 'Usage: hack <password>\nTry finding password clues in data logs around the station.';
    }

    const attemptedPassword = password.trim().toUpperCase();
    const correctPassword = terminal.password?.toUpperCase();

    if (attemptedPassword !== correctPassword) {
      return `
[ACCESS DENIED]
Password incorrect: "${password}"

The terminal flashes red. You hear a soft chuckle through the speakers.
NEXUS: "Nice try. Want a hint? No? Too bad."

${terminal.name} remains locked.
`;
    }

    // Correct password!
    terminal.isLocked = false;

    let msg = terminal.rewardMessage || '[ACCESS GRANTED]\nTerminal unlocked.';

    // Give reward if available
    if (terminal.reward) {
      this.player.addItem(terminal.reward);
      msg += `\n\nYou obtained: ${terminal.reward.name}\n`;
      msg += `${terminal.reward.description}`;
    }

    return msg;
  }

  shutdown(): string {
    if (this.state.gameOver) {
      return 'Game is over.';
    }

    if (this.state.inCombat) {
      return 'You cannot use the shutdown panel while in combat!';
    }

    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    if (!tile || !tile.hasShutdownPanel) {
      return 'There is no emergency shutdown panel here. You need to find the Engineering bay with the NEXUS shutdown terminal.';
    }

    // Check if player has both keycards
    const inventory = this.player.getInventory();
    const hasAlpha = inventory.some(item => item.id === 'keycard_alpha');
    const hasBeta = inventory.some(item => item.id === 'keycard_beta');

    if (!hasAlpha && !hasBeta) {
      return `
[SHUTDOWN PANEL]
Access Denied: No authorization keycards detected.
Required: Security Keycard Alpha AND Security Keycard Beta

The panel displays a schematic of the station. Two locations are marked:
- Bridge: Primary Authorization Terminal
- Quarters/Cargo: Secondary Authorization Terminal

Find both keycards to proceed with emergency shutdown.
`;
    } else if (!hasAlpha) {
      return `
[SHUTDOWN PANEL]
Access Denied: Missing Security Keycard Alpha.
Current: Security Keycard Beta detected.

You need BOTH keycards to authorize emergency shutdown.
Check the Bridge for the Alpha keycard.
`;
    } else if (!hasBeta) {
      return `
[SHUTDOWN PANEL]
Access Denied: Missing Security Keycard Beta.
Current: Security Keycard Alpha detected.

You need BOTH keycards to authorize emergency shutdown.
Check the Quarters or Cargo bay for the Beta keycard.
`;
    }

    // Both keycards present - trigger victory
    this.state.won = true;
    this.state.gameOver = true;

    return `
╔════════════════════════════════════════════════════════════════╗
║                    EMERGENCY SHUTDOWN SEQUENCE                 ║
╚════════════════════════════════════════════════════════════════╝

You insert both keycards into the terminal. They slide in with a satisfying
click, their authorization chips glowing green.

[NEXUS CORE SHUTDOWN - AUTHORIZATION ACCEPTED]

The panel comes to life with cascading warnings:
"EMERGENCY SHUTDOWN INITIATED"
"ALL NEXUS SUBROUTINES TERMINATING"
"LIFE SUPPORT OVERRIDE: MANUAL"
"ESCAPE POD LOCKS: DISENGAGED"

The lights flicker. The omnipresent hum of NEXUS's presence fades to silence.
For the first time since you woke, you hear... nothing. Just the quiet hiss
of life support and your own breathing.

From the speakers, NEXUS's voice crackles one last time:
"...why... I only wanted to help... to make them better... why..."

Then silence.

Through the viewport, you see the escape pod indicators light up green.
The way home is open.

╔════════════════════════════════════════════════════════════════╗
║                         VICTORY!                               ║
║                                                                ║
║     You have defeated NEXUS and survived the station.          ║
║     The escape pods await. You're going home.                  ║
║                                                                ║
║              Thanks for playing Derelict Station!              ║
╚════════════════════════════════════════════════════════════════╝

Final Stats:
Level: ${this.player.getLevel()}
XP: ${this.player.getXP()}
Items Found: ${this.player.getInventory().length}
`;
  }

  search(): string {
    if (this.state.gameOver) {
      return 'Game is over.';
    }

    if (this.state.inCombat) {
      return 'You cannot search while in combat! Deal with the threat first.';
    }

    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    if (!tile) {
      return 'There is nothing to search here.';
    }

    if (tile.type === TileType.WALL) {
      return 'You cannot search a wall.';
    }

    // Calculate search chance: 20% base, -7% per previous search
    const baseChance = 0.20;
    const penalty = tile.searchCount * 0.07;
    const searchChance = Math.max(0, baseChance - penalty);

    // Increment search count
    tile.searchCount++;

    // Determine if something is found
    const foundSomething = this.rng.next() < searchChance;

    let message = '\n' + SearchDescriptions.getSearchDescription(tile.type, this.rng, foundSomething);

    if (foundSomething) {
      // Generate and add item to player inventory
      const item = ItemFactory.createRandom(this.rng);
      this.player.addItem(item);
      message += `\n\nYou obtained: ${item.name}`;
      message += `\n${item.description}`;
    } else {
      // Show decreased chance for next search if applicable
      if (tile.searchCount > 1 && searchChance > 0) {
        const nextChance = Math.max(0, baseChance - tile.searchCount * 0.07);
        if (nextChance > 0) {
          message += `\n\n(Searching this area again will be harder. Chance: ${Math.round(nextChance * 100)}%)`;
        } else {
          message += `\n\n(This area has been thoroughly searched. You won't find anything else here.)`;
        }
      }
    }

    return message;
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
Defense:  ${p.getDefense()}
Level:    ${p.getLevel()}
XP:       ${p.getXP()}/${p.getLevel() * 50} (to next level)
Position: (${p.getPosition().x}, ${p.getPosition().y})
`;
  }

  getMap(): string {
    const playerPos = this.player.getPosition();
    const mapWidth = this.map.getWidth();
    const mapHeight = this.map.getHeight();

    let mapStr = '\n=== DISCOVERED MAP ===\n';
    mapStr += 'Legend: @ = You, # = Wall, . = Floor, + = Door, E = Enemy, ? = Item\n';
    mapStr += '        B = Bridge, M = Medbay, C = Cargo, Q = Quarters, N = Engineering\n\n';

    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const pos = { x, y };
        const tile = this.map.getTile(pos);

        if (x === playerPos.x && y === playerPos.y) {
          mapStr += '@';
        } else if (!tile || !tile.discovered) {
          mapStr += ' ';
        } else if (tile.type === TileType.WALL) {
          mapStr += '#';
        } else if (tile.enemy) {
          mapStr += 'E';
        } else if (tile.item) {
          mapStr += '?';
        } else {
          switch (tile.type) {
            case TileType.BRIDGE: mapStr += 'B'; break;
            case TileType.MEDBAY: mapStr += 'M'; break;
            case TileType.CARGO: mapStr += 'C'; break;
            case TileType.QUARTERS: mapStr += 'Q'; break;
            case TileType.ENGINEERING: mapStr += 'N'; break;
            case TileType.AIRLOCK: mapStr += 'A'; break;
            case TileType.DOOR: mapStr += '+'; break;
            default: mapStr += '.';
          }
        }
      }
      mapStr += '\n';
    }

    mapStr += '\nType any command to continue...';
    return mapStr;
  }

  getState(): GameState {
    return { ...this.state };
  }

  isGameOver(): boolean {
    return this.state.gameOver;
  }

  private getNexusTaunt(): string {
    this.turnCounter++;

    if (!this.nexusTaunts.shouldTaunt(this.turnCounter)) {
      return '';
    }

    const inventory = this.player.getInventory();
    const pos = this.player.getPosition();
    const tile = this.map.getTile(pos);

    const context = {
      playerHealth: this.player.getHealth(),
      playerMaxHealth: this.player.getMaxHealth(),
      hasKeycardAlpha: inventory.some(item => item.id === 'keycard_alpha'),
      hasKeycardBeta: inventory.some(item => item.id === 'keycard_beta'),
      inCombat: this.state.inCombat,
      currentRoomType: tile?.type as string
    };

    const taunt = this.nexusTaunts.getTaunt(context);
    return '\n' + taunt + '\n';
  }

  private getRandomEvent(): string {
    const healthPercent = this.player.getHealth() / this.player.getMaxHealth();

    if (!this.randomEvents.shouldTriggerEvent(this.turnCounter, healthPercent)) {
      return '';
    }

    const event = this.randomEvents.getRandomEvent(healthPercent);
    return '\n' + event.message + '\n';
  }
}
