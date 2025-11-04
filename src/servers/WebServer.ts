import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { GameEngine } from '../game/GameEngine';
import * as path from 'path';

interface WebSession {
  game: GameEngine;
  socketId: string;
}

export class WebServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private sessions: Map<string, WebSession>;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.sessions = new Map();
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer);

    this.setupExpress();
    this.setupSocketIO();
  }

  private setupExpress(): void {
    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, '../../public')));

    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../public/index.html'));
    });
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log(`New web connection: ${socket.id}`);

      // Create new game session
      const sessionId = `web_${Date.now()}_${Math.random()}`;
      const game = new GameEngine(sessionId);

      const session: WebSession = {
        game,
        socketId: socket.id
      };

      this.sessions.set(socket.id, session);

      // Send welcome message
      socket.emit('output', {
        text: game.getWelcomeMessage(),
        type: 'welcome'
      });

      socket.emit('output', {
        text: game.getLook(),
        type: 'look'
      });

      // Handle commands
      socket.on('command', (command: string) => {
        const response = this.processCommand(game, command);
        socket.emit('output', {
          text: response,
          type: 'response'
        });

        // Send stats update
        socket.emit('stats', {
          health: game['player'].getHealth(),
          maxHealth: game['player'].getMaxHealth(),
          strength: game['player'].getStrength(),
          defense: game['player'].getDefense(),
          level: game['player'].getLevel(),
          xp: game['player'].getXP()
        });

        // Check if game over
        if (game.isGameOver()) {
          socket.emit('gameOver', {
            message: 'Game Over'
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Web session ended: ${socket.id}`);
        this.sessions.delete(socket.id);
      });
    });
  }

  private processCommand(game: GameEngine, command: string): string {
    const parts = command.toLowerCase().trim().split(' ');
    const cmd = parts[0];
    const arg = parts.slice(1).join(' ');

    switch (cmd) {
      case 'n': case 'north':
        return game.move('north');
      case 's': case 'south':
        return game.move('south');
      case 'e': case 'east':
        return game.move('east');
      case 'w': case 'west':
        return game.move('west');
      case 'look': case 'l':
        return game.getLook();
      case 'map': case 'm':
        return game.getMap();
      case 'inventory': case 'i':
        return game.getInventory();
      case 'stats':
        return game.getStats();
      case 'use':
        return arg ? game.useItem(arg) : 'Use what? (e.g., "use medkit")';
      case 'read':
        return arg ? game.readItem(arg) : 'Read what? (e.g., "read log")';
      case 'attack': case 'fight':
        return game.attack();
      case 'flee': case 'run': case 'escape':
        return game.flee();
      case 'help': case 'h': case '?':
        return this.getHelp();
      default:
        return `Unknown command: "${command}". Type "help" for available commands.`;
    }
  }

  private getHelp(): string {
    return `
=== COMMANDS ===
Movement:
  n, s, e, w  - Move north, south, east, west
  look        - Examine surroundings
  map         - View discovered areas

Inventory:
  inventory   - View inventory (or 'i')
  use <item>  - Use an item (medkit, weapon, armor)
  read <item> - Read a data log

Combat:
  attack      - Attack enemy
  flee        - Try to escape

Other:
  stats       - View character stats
  help        - Show this help
`;
  }

  start(): void {
    this.httpServer.listen(this.port, '0.0.0.0', () => {
      console.log(`Web server listening on http://0.0.0.0:${this.port}`);
      console.log(`Access from outside: http://<your-host>:${this.port}`);
    });
  }

  stop(): void {
    this.io.close();
    this.httpServer.close();
    this.sessions.clear();
  }
}
