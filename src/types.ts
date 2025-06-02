// Import types from shared schema to maintain consistency
export interface Collection {
  id: number;
  name: string;
  description?: string;
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

export interface List {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  tags?: number[];
  items?: Item[];
}

export interface Item {
  id: number;
  listId: number;
  name: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListTag {
  listId: number;
  tagId: number;
}

// Insert types for creating new records
export interface InsertCollection {
  name: string;
  description?: string;
}

export interface InsertTag {
  name: string;
  color: string;
}

export interface InsertList {
  name: string;
  description?: string;
  tags?: number[];
  deletedAt?: string;
}

export interface InsertItem {
  listId: number;
  name: string;
  description?: string;
  completed?: boolean;
}

export interface InsertListTag {
  listId: number;
  tagId: number;
}

// User preferences for the mobile app
export interface UserPreferences {
  isDarkMode: boolean;
  sortBy: 'newest' | 'oldest' | 'name';
}

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  ListDetail: { listId: number };
};

export type ListDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ListDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'ListDetail'>;
};

export type FontStyle = 'default' | 'typewriter' | 'handwritten';
export type LayoutType = 'list' | 'grid';
export type SortOption = 'newest' | 'oldest';