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
          discovered: false,
          searchCount: 0
        });
      }
    }

    // Generate rooms using BSP (Binary Space Partitioning)
    this.generateRooms();

    // Place enemies and items
    this.populateMap();
  }

  private generateRooms(): void {
    interface Room {
      x: number;
      y: number;
      width: number;
      height: number;
      type: TileType;
      doors: Position[];
    }

    const rooms: Room[] = [];

    // Create 8-12 rooms
    const numRooms = this.rng.nextInt(8, 12);

    for (let i = 0; i < numRooms; i++) {
      const roomWidth = this.rng.nextInt(4, 7);
      const roomHeight = this.rng.nextInt(4, 7);
      const roomX = this.rng.nextInt(2, this.width - roomWidth - 2);
      const roomY = this.rng.nextInt(2, this.height - roomHeight - 2);

      // Choose room type
      const roomTypes = [
        TileType.ROOM, TileType.ENGINEERING, TileType.MEDBAY,
        TileType.BRIDGE, TileType.CARGO, TileType.QUARTERS, TileType.AIRLOCK
      ];
      const roomType = this.rng.choose(roomTypes);

      const room: Room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
        type: roomType,
        doors: []
      };

      rooms.push(room);

      // Carve out room
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          this.map.set(this.posKey({ x, y }), {
            type: roomType,
            description: this.getRoomDescription(roomType),
            discovered: false,
            searchCount: 0
          });
        }
      }
    }

    // Add doors to each room (2-4 doors per room)
    for (const room of rooms) {
      const numDoors = this.rng.nextInt(2, 4);
      const possibleDoors: Position[] = [];

      // Collect possible door positions on room edges
      // Top and bottom edges
      for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
        possibleDoors.push({ x, y: room.y }); // Top edge
        possibleDoors.push({ x, y: room.y + room.height - 1 }); // Bottom edge
      }

      // Left and right edges
      for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
        possibleDoors.push({ x: room.x, y }); // Left edge
        possibleDoors.push({ x: room.x + room.width - 1, y }); // Right edge
      }

      // Place doors
      for (let i = 0; i < Math.min(numDoors, possibleDoors.length); i++) {
        const doorIndex = this.rng.nextInt(0, possibleDoors.length - 1);
        const doorPos = possibleDoors.splice(doorIndex, 1)[0];

        // Create door tile outside the room
        const doorOutside = this.getDoorOutsidePosition(doorPos, room);
        if (doorOutside) {
          this.map.set(this.posKey(doorOutside), {
            type: TileType.DOOR,
            description: 'A sealed security door. It slides open with a hiss.',
            discovered: false,
            searchCount: 0
          });
          room.doors.push(doorOutside);
        }
      }
    }

    // Connect rooms via corridors between doors
    this.connectRoomsWithCorridors(rooms);
  }

  private getDoorOutsidePosition(edgePos: Position, room: { x: number, y: number, width: number, height: number }): Position | null {
    // Determine which edge the position is on and place door outside
    if (edgePos.y === room.y) {
      // Top edge - door goes above
      return { x: edgePos.x, y: edgePos.y - 1 };
    } else if (edgePos.y === room.y + room.height - 1) {
      // Bottom edge - door goes below
      return { x: edgePos.x, y: edgePos.y + 1 };
    } else if (edgePos.x === room.x) {
      // Left edge - door goes left
      return { x: edgePos.x - 1, y: edgePos.y };
    } else if (edgePos.x === room.x + room.width - 1) {
      // Right edge - door goes right
      return { x: edgePos.x + 1, y: edgePos.y };
    }
    return null;
  }

  private connectRoomsWithCorridors(rooms: { doors: Position[] }[]): void {
    // Connect each room to the next one
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];

      if (room1.doors.length === 0 || room2.doors.length === 0) continue;

      // Pick random doors from each room
      const door1 = this.rng.choose(room1.doors);
      const door2 = this.rng.choose(room2.doors);

      this.createCorridor(door1, door2);
    }

    // Add some extra connections for variety (20% chance between random rooms)
    for (let i = 0; i < rooms.length; i++) {
      if (this.rng.next() < 0.2) {
        const otherRoom = this.rng.choose(rooms.filter((_, idx) => idx !== i));
        if (rooms[i].doors.length > 0 && otherRoom.doors.length > 0) {
          const door1 = this.rng.choose(rooms[i].doors);
          const door2 = this.rng.choose(otherRoom.doors);
          this.createCorridor(door1, door2);
        }
      }
    }
  }

  private createCorridor(start: Position, end: Position): void {
    // Create L-shaped corridor with variable width
    const corridorWidth = this.rng.next() < 0.7 ? 1 : 2; // 70% single width, 30% double width

    // Horizontal segment first
    const startX = Math.min(start.x, end.x);
    const endX = Math.max(start.x, end.x);

    for (let x = startX; x <= endX; x++) {
      for (let w = 0; w < corridorWidth; w++) {
        const key = this.posKey({ x, y: start.y + w });
        const tile = this.map.get(key);
        if (tile && tile.type === TileType.WALL) {
          this.map.set(key, {
            type: TileType.CORRIDOR,
            description: 'A narrow corridor with flickering emergency lights.',
            discovered: false,
            searchCount: 0
          });
        }
      }
    }

    // Vertical segment
    const startY = Math.min(start.y, end.y);
    const endY = Math.max(start.y, end.y);

    for (let y = startY; y <= endY; y++) {
      for (let w = 0; w < corridorWidth; w++) {
        const key = this.posKey({ x: end.x + w, y });
        const tile = this.map.get(key);
        if (tile && tile.type === TileType.WALL) {
          this.map.set(key, {
            type: TileType.CORRIDOR,
            description: 'A narrow corridor with flickering emergency lights.',
            discovered: false,
            searchCount: 0
          });
        }
      }
    }
  }

  private getRoomDescription(type: TileType): string {
    const descriptions: Record<TileType, string[]> = {
      [TileType.CORRIDOR]: [
        'A narrow corridor with flickering emergency lights casting dancing shadows on the walls.',
        'A dimly lit passageway. The air recyclers hum with an unhealthy rattle.',
        'A maintenance corridor. Warning signs glow faintly in the dark, their messages half-obscured by grime.',
        'A tight passage between bulkheads. Something wet drips from overhead piping.',
        'A service corridor. Emergency lighting pulses red, painting everything in blood-colored hues.'
      ],
      [TileType.DOOR]: [
        'A sealed security door. It slides open with a hiss of escaping atmosphere.',
        'A heavy bulkhead door. Its security panel blinks green - someone overrode the locks.',
        'An automated door. The safety sensors are dead; it slides open without hesitation.',
        'A reinforced blast door, standing open. Something forced it from the other side.',
        'A standard station door. Its nameplate has been scratched away.'
      ],
      [TileType.ROOM]: [
        'A generic station room with scattered debris. Overturned furniture suggests a hasty evacuation.',
        'A multi-purpose chamber. The walls are scorched black in places you try not to look at.',
        'An unremarkable room that could have been anything - storage, meeting space, someone\'s workshop. Now it\'s just empty.',
        'A room stripped bare. Only the wall-mounted emergency kit remains, already looted and hanging open.',
        'A chamber filled with the detritus of station life: broken terminals, scattered PADs, and one abandoned boot.'
      ],
      [TileType.AIRLOCK]: [
        'An airlock chamber. The outer door is sealed shut, frost creeping around its edges.',
        'An EVA preparation room. Empty pressure suits hang from their racks like molted skins.',
        'A departure airlock. The inner door is scarred with deep scratches, as if something tried desperately to get back in.',
        'An airlock station. Through the porthole, you see only the endless void and distant, uncaring stars.',
        'An evacuation airlock. The escape pod bay beyond is empty - they launched without you.'
      ],
      [TileType.ENGINEERING]: [
        'Engineering bay filled with humming machinery and blinking consoles. The reactor core pulses with barely-contained energy.',
        'The station\'s mechanical heart. Coolant pipes snake overhead, dripping condensation. Warning klaxons echo distantly.',
        'A maze of machinery and catwalks. The air is thick with ozone and the smell of burning insulation.',
        'Engineering control. Diagnostic screens show the station dying, one system at a time.',
        'The primary power junction. Cables as thick as your arm carry megawatts to systems that no longer answer.'
      ],
      [TileType.MEDBAY]: [
        'Medical bay with overturned gurneys and broken medical equipment. The smell of antiseptic can\'t quite mask something worse.',
        'A surgical theater. The operating table is stained with something that wasn\'t there in the manual.',
        'A medical station in disarray. Cryogenic pods stand open, their frost melting into dark puddles.',
        'An emergency triage area. Bio-hazard warnings flash on abandoned terminals. You try not to read the patient logs.',
        'A medical research lab. Specimen containers lie shattered on the floor, their contents long escaped.'
      ],
      [TileType.BRIDGE]: [
        'The command bridge. Screens flicker with corrupted data, gibberish mixed with NEXUS\'s digital laughter.',
        'The station\'s nerve center. The captain\'s chair sits empty, a dark stain on its armrest.',
        'Command and control. Navigation charts still show the station\'s position: alone in deep space, weeks from anywhere.',
        'The bridge. Communication arrays crackle with dead signals, echoes of distress calls never answered.',
        'Main command. Through the viewport, the station\'s hull stretches away into darkness, pockmarked and scarred.'
      ],
      [TileType.CARGO]: [
        'Cargo hold with scattered crates and containers. Most are forced open, their contents ransacked.',
        'A massive storage bay. Loading mechs sit frozen mid-task, their operators long gone.',
        'The main cargo facility. Shipping containers are stacked haphazardly, some still sealed with their contents unknown.',
        'A cargo depot. Manifest screens flicker with endless lists of supplies that will never be unloaded.',
        'Supply storage. The magnetic locks have failed; crates float lazily in the low-gravity section.'
      ],
      [TileType.QUARTERS]: [
        'Crew quarters. Personal belongings scattered everywhere - photos, clothes, a child\'s toy.',
        'Living area. Bunks are unmade, meals are half-eaten. Everyone left in a hurry, or never got the chance.',
        'Residential block. Someone\'s personal music still plays from a speaker, a cheerful melody in the dark.',
        'Crew housing. You see signs of life interrupted: a book open to page 237, coffee grown cold, a message half-typed.',
        'Living quarters. The walls are covered in personal photos of people you\'ll never meet, all smiling.'
      ],
      [TileType.WALL]: [
        'A solid metallic wall.'
      ]
    };

    const options = descriptions[type];
    return this.rng.choose(options);
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
