// Shared types for the Listed mobile app
export interface List {
  id: number;
  name: string;
  description?: string;
  isDeleted: boolean;
  deletedAt?: string;
  collectionId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  content: string;
  completed: boolean;
  listId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListTag {
  listId: number;
  tagId: number;
  createdAt: string;
}

export type InsertList = Omit<List, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertTag = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>;

export interface ListWithStats extends List {
  itemCount: number;
  completedCount: number;
}

export type FontStyle = 'default' | 'typewriter' | 'handwritten';
export type LayoutType = 'list' | 'grid';
export type SortOption = 'name' | 'newest' | 'oldest';

export interface UserPreferences {
  isDarkMode: boolean;
  fontStyle: FontStyle;
  layout: LayoutType;
  sortBy: SortOption;
}