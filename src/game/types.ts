export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  description: string;
  enemy?: Enemy;
  item?: Item;
  discovered: boolean;
  searchCount: number; // Tracks how many times this tile has been searched
}

export enum TileType {
  CORRIDOR = 'corridor',
  DOOR = 'door',
  ROOM = 'room',
  AIRLOCK = 'airlock',
  ENGINEERING = 'engineering',
  MEDBAY = 'medbay',
  BRIDGE = 'bridge',
  CARGO = 'cargo',
  QUARTERS = 'quarters',
  WALL = 'wall'
}

export interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  strength: number;
  xpReward: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  content?: string; // For data logs
  healthRestore?: number;
  strengthBonus?: number;
  defenseBonus?: number;
}

export enum ItemType {
  DATA_LOG = 'data_log',
  MED_KIT = 'med_kit',
  WEAPON_UPGRADE = 'weapon_upgrade',
  ARMOR_UPGRADE = 'armor_upgrade',
  QUEST_ITEM = 'quest_item'
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  strength: number;
  defense: number;
  xp: number;
  level: number;
}
