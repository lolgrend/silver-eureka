import * as net from 'net';
import { GameEngine } from '../game/GameEngine';

interface TelnetSession {
  socket: net.Socket;
  game: GameEngine;
  buffer: string;
}

export class TelnetServer {
  private server: net.Server;
  private sessions: Map<string, TelnetSession>;
  private port: number;

  constructor(port: number = 2323) {
    this.port = port;
    this.sessions = new Map();
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  start(): void {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`Telnet server listening on 0.0.0.0:${this.port}`);
      console.log(`Connect with: telnet <your-host> ${this.port}`);
    });
  }

  private handleConnection(socket: net.Socket): void {
    const sessionId = `telnet_${Date.now()}_${Math.random()}`;
    const game = new GameEngine(sessionId);

    const session: TelnetSession = {
      socket,
      game,
      buffer: ''
    };

    this.sessions.set(sessionId, session);

    console.log(`New telnet connection: ${sessionId}`);

    // Send welcome message
    this.send(socket, game.getWelcomeMessage());
    this.send(socket, '\n' + game.getLook());
    this.send(socket, '\n> ');

    // Handle data
    socket.on('data', (data) => {
      this.handleData(session, data);
    });

    // Handle disconnect
    socket.on('end', () => {
      console.log(`Telnet session ended: ${sessionId}`);
      this.sessions.delete(sessionId);
    });

    socket.on('error', (err) => {
      console.error(`Telnet session error: ${sessionId}`, err.message);
      this.sessions.delete(sessionId);
    });
  }

  private handleData(session: TelnetSession, data: Buffer): void {
    const input = data.toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let char of input) {
      if (char === '\n') {
        // Process command
        const command = session.buffer.trim();
        session.buffer = '';

        if (command) {
          const response = this.processCommand(session.game, command);
          this.send(session.socket, '\n' + response + '\n');
        }
        this.send(session.socket, '\n> ');
      } else if (char === '\x7F' || char === '\b') {
        // Backspace
        if (session.buffer.length > 0) {
          session.buffer = session.buffer.slice(0, -1);
          this.send(session.socket, '\b \b');
        }
      } else if (char >= ' ') {
        // Printable character
        session.buffer += char;
        this.send(session.socket, char);
      }
    }
  }

  private processCommand(game: GameEngine, command: string): string {
    const parts = command.toLowerCase().split(' ');
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
      case 'quit': case 'exit':
        return 'Thanks for playing! Goodbye.';
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

Inventory:
  inventory   - View inventory (or 'i')
  use <item>  - Use an item
  read <item> - Read a data log

Combat:
  attack      - Attack enemy
  flee        - Try to escape

Other:
  stats       - View character stats
  help        - Show this help
  quit        - Exit game
`;
  }

  private send(socket: net.Socket, message: string): void {
    socket.write(message);
  }

  stop(): void {
    this.server.close();
    this.sessions.forEach((session) => {
      session.socket.end();
    });
    this.sessions.clear();
  }
}
