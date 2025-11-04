# Derelict Station

A roguelike RPG set on an abandoned space station, playable via both web browser and telnet!

## Story

You awaken in a cryopod aboard the deep space station "Prometheus." The emergency lights flicker. Silence. No crew. No sounds of life. Only the eerie hum of failing systems and... something else.

The station AI, NEXUS, has gone rogue. The crew is gone. Your mission: **Survive. Discover what happened. Escape.**

## Features

- **Dual Interface**: Play via web browser or telnet client
- **Procedural Generation**: Every session creates a unique station layout with consistent maps
- **Roguelike Combat**: D10 dice-based combat system (strength + roll)
- **Character Progression**: Level up, gain XP, and become stronger
- **Rich Story**: Find data logs scattered throughout the station to uncover the mystery
- **Multiple Items**: Med-kits, weapon upgrades, and quest items
- **Diverse Enemies**: Face malfunctioning robots, alien parasites, infected crew, and more

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd silver-eureka
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

The server will start on:
- **Web Interface**: http://localhost:3000
- **Telnet Interface**: `telnet localhost 2323`

## How to Play

### Web Browser

1. Open http://localhost:3000 in your browser
2. Type commands in the input field at the bottom
3. Press Enter to execute
4. Use quick command buttons for faster gameplay

### Telnet

1. Connect using any telnet client:
```bash
telnet localhost 2323
```

2. Type commands and press Enter
3. Enjoy the classic terminal experience!

## Game Commands

### Movement
- `n` or `north` - Move north
- `s` or `south` - Move south
- `e` or `east` - Move east
- `w` or `west` - Move west
- `look` or `l` - Examine your surroundings

### Inventory & Items
- `inventory` or `i` - View your inventory
- `use <item>` - Use an item (e.g., "use medkit")
- `read <item>` - Read a data log (e.g., "read log")

### Combat
- `attack` or `fight` - Attack an enemy
- `flee` or `run` - Try to escape from combat (50% chance)

### Other
- `stats` - View your character stats
- `help` - Show available commands
- `quit` - Exit the game (telnet only)

## Game Mechanics

### Combat System

Combat uses a D10 (10-sided die) system:
- **Your Attack** = Your Strength + D10 roll
- **Enemy Attack** = Enemy Strength + D10 roll
- Higher total deals damage equal to the difference
- Defeating enemies grants XP

### Character Progression

- Start at Level 1 with 100 HP and 5 Strength
- Gain XP by defeating enemies
- Level up every 50 XP
- Each level grants: +10 Max HP, +1 Strength, Full HP restore

### Items

- **Med-Kits**: Restore health (20-40 HP)
- **Weapon Upgrades**: Permanently increase Strength (+2 to +4)
- **Data Logs**: Reveal the station's dark secrets
- **Quest Items**: Special items for completing objectives

### Map Generation

Each game session generates a unique procedurally-created station with:
- 8-12 rooms of various types (Bridge, Engineering, Medbay, Cargo, etc.)
- Interconnected corridors
- Randomly placed enemies and items
- Consistent layout per session (same seed = same map)

## Room Types

- **Corridor**: Standard passages with emergency lighting
- **Bridge**: Command center with flickering screens
- **Engineering**: Machinery and consoles
- **Medbay**: Medical facilities (abandoned)
- **Cargo**: Storage areas with scattered crates
- **Quarters**: Crew living spaces
- **Airlock**: Sealed chambers
- **Generic Rooms**: Various station facilities

## Development

### Project Structure

```
silver-eureka/
├── src/
│   ├── game/
│   │   ├── types.ts          # Type definitions
│   │   ├── SeededRandom.ts   # RNG for map generation
│   │   ├── MapGenerator.ts   # Procedural map creation
│   │   ├── Player.ts         # Player character class
│   │   ├── Enemy.ts          # Enemy definitions
│   │   ├── Combat.ts         # Combat system
│   │   ├── Story.ts          # Items and data logs
│   │   └── GameEngine.ts     # Core game logic
│   ├── servers/
│   │   ├── TelnetServer.ts   # Telnet interface
│   │   └── WebServer.ts      # Web/Socket.io interface
│   └── server.ts             # Main entry point
├── public/
│   └── index.html            # Web client UI
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the server
- `npm run dev` - Build and start in one command
- `npm run watch` - Watch for changes and recompile

### Environment Variables

You can customize ports using environment variables:

```bash
WEB_PORT=3000 TELNET_PORT=2323 npm start
```

## Tips for Playing

1. **Explore carefully** - Each room may contain valuable items or dangerous enemies
2. **Read all data logs** - They contain clues about the station and its fate
3. **Manage your health** - Don't be afraid to flee and heal before fighting
4. **Upgrade when possible** - Weapon upgrades are permanent and stack
5. **Level up strategically** - You get full HP restore on level up, time it well!

## Technologies Used

- **TypeScript** - Type-safe game logic
- **Node.js** - Server runtime
- **Express** - Web server framework
- **Socket.io** - Real-time web communication
- **Native TCP** - Telnet server implementation
- **HTML/CSS/JavaScript** - Terminal-style web UI

## License

MIT License

## Credits

Created as a demonstration of multi-protocol game server architecture.

---

**Good luck, survivor. The station awaits...**
