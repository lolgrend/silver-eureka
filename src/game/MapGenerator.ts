import { SeededRandom } from './SeededRandom';
import { Tile, TileType, Position } from './types';
import { EnemyFactory } from './Enemy';
import { ItemFactory } from './Story';

export class MapGenerator {
  private rng: SeededRandom;
  private width: number;
  private height: number;
  private map: Map<string, Tile>;

  constructor(seed: string, width: number = 30, height: number = 30) {
    this.rng = new SeededRandom(seed);
    this.width = width;
    this.height = height;
    this.map = new Map();
    this.generateMap();
  }

  private posKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  private generateMap(): void {
    // Fill with walls initially
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.map.set(this.posKey({ x, y }), {
          type: TileType.WALL,
          description: 'A solid metallic wall.',
          discovered: false
        });
      }
    }

    // Generate rooms using BSP (Binary Space Partitioning)
    this.generateRooms();

    // Place enemies and items
    this.populateMap();
  }

  private generateRooms(): void {
    const rooms: { x: number, y: number, width: number, height: number, type: TileType }[] = [];

    // Create 8-12 rooms
    const numRooms = this.rng.nextInt(8, 12);

    for (let i = 0; i < numRooms; i++) {
      const roomWidth = this.rng.nextInt(3, 6);
      const roomHeight = this.rng.nextInt(3, 6);
      const roomX = this.rng.nextInt(1, this.width - roomWidth - 1);
      const roomY = this.rng.nextInt(1, this.height - roomHeight - 1);

      // Choose room type
      const roomTypes = [
        TileType.ROOM, TileType.ENGINEERING, TileType.MEDBAY,
        TileType.BRIDGE, TileType.CARGO, TileType.QUARTERS, TileType.AIRLOCK
      ];
      const roomType = this.rng.choose(roomTypes);

      rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight, type: roomType });

      // Carve out room
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          this.map.set(this.posKey({ x, y }), {
            type: roomType,
            description: this.getRoomDescription(roomType),
            discovered: false
          });
        }
      }
    }

    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];

      const x1 = room1.x + Math.floor(room1.width / 2);
      const y1 = room1.y + Math.floor(room1.height / 2);
      const x2 = room2.x + Math.floor(room2.width / 2);
      const y2 = room2.y + Math.floor(room2.height / 2);

      // Horizontal corridor
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        const key = this.posKey({ x, y: y1 });
        if (this.map.get(key)?.type === TileType.WALL) {
          this.map.set(key, {
            type: TileType.CORRIDOR,
            description: 'A narrow corridor with flickering emergency lights.',
            discovered: false
          });
        }
      }

      // Vertical corridor
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      for (let y = startY; y <= endY; y++) {
        const key = this.posKey({ x: x2, y });
        if (this.map.get(key)?.type === TileType.WALL) {
          this.map.set(key, {
            type: TileType.CORRIDOR,
            description: 'A narrow corridor with flickering emergency lights.',
            discovered: false
          });
        }
      }
    }
  }

  private getRoomDescription(type: TileType): string {
    const descriptions: Record<TileType, string> = {
      [TileType.CORRIDOR]: 'A narrow corridor with flickering emergency lights.',
      [TileType.ROOM]: 'A generic station room with scattered debris.',
      [TileType.AIRLOCK]: 'An airlock chamber. The outer door is sealed shut.',
      [TileType.ENGINEERING]: 'Engineering bay filled with humming machinery and blinking consoles.',
      [TileType.MEDBAY]: 'Medical bay with overturned gurneys and broken medical equipment.',
      [TileType.BRIDGE]: 'The command bridge. Screens flicker with corrupted data.',
      [TileType.CARGO]: 'Cargo hold with scattered crates and containers.',
      [TileType.QUARTERS]: 'Crew quarters. Personal belongings scattered everywhere.',
      [TileType.WALL]: 'A solid metallic wall.'
    };
    return descriptions[type];
  }

  private populateMap(): void {
    const walkableTiles: Position[] = [];

    // Find all walkable tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.map.get(this.posKey({ x, y }));
        if (tile && tile.type !== TileType.WALL) {
          walkableTiles.push({ x, y });
        }
      }
    }

    // Place enemies (10-15% of walkable tiles)
    const numEnemies = Math.floor(walkableTiles.length * this.rng.next() * 0.05 + walkableTiles.length * 0.1);
    for (let i = 0; i < numEnemies; i++) {
      const pos = this.rng.choose(walkableTiles);
      const tile = this.map.get(this.posKey(pos));
      if (tile && !tile.enemy && !tile.item) {
        tile.enemy = EnemyFactory.createRandom(this.rng);
      }
    }

    // Place items (5-10% of walkable tiles)
    const numItems = Math.floor(walkableTiles.length * this.rng.next() * 0.05 + walkableTiles.length * 0.05);
    for (let i = 0; i < numItems; i++) {
      const pos = this.rng.choose(walkableTiles);
      const tile = this.map.get(this.posKey(pos));
      if (tile && !tile.enemy && !tile.item) {
        tile.item = ItemFactory.createRandom(this.rng);
      }
    }
  }

  getTile(pos: Position): Tile | undefined {
    return this.map.get(this.posKey(pos));
  }

  setTile(pos: Position, tile: Tile): void {
    this.map.set(this.posKey(pos), tile);
  }

  getRandomWalkablePosition(): Position {
    const walkableTiles: Position[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.map.get(this.posKey({ x, y }));
        if (tile && tile.type !== TileType.WALL && !tile.enemy) {
          walkableTiles.push({ x, y });
        }
      }
    }
    return this.rng.choose(walkableTiles);
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}
