// API service for local storage operations
import { List, Item, Tag, InsertList, InsertItem, InsertTag } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private async getStoredData<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  private async setStoredData<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  // Lists API
  async getLists(): Promise<List[]> {
    return this.getStoredData<List>('lists');
  }

  async getList(id: number): Promise<List | undefined> {
    const lists = await this.getStoredData<List>('lists');
    return lists.find(list => list.id === id);
  }

  async createList(data: InsertList): Promise<List> {
    const lists = await this.getStoredData<List>('lists');
    const newList: List = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.setStoredData('lists', [...lists, newList]);
    return newList;
  }

  async updateList({ id, data }: { id: number; data: InsertList }): Promise<List> {
    const lists = await this.getStoredData<List>('lists');
    const updatedLists = lists.map(list => 
      list.id === id 
        ? { ...list, ...data, updatedAt: new Date().toISOString() }
        : list
    );
    await this.setStoredData('lists', updatedLists);
    return updatedLists.find(list => list.id === id)!;
  }

  async deleteList(id: number): Promise<void> {
    const lists = await this.getStoredData<List>('lists');
    await this.setStoredData('lists', lists.filter(list => list.id !== id));
  }

  // Items API
  async getItems(listId: number): Promise<Item[]> {
    const items = await this.getStoredData<Item>('items');
    return items.filter(item => item.listId === listId);
  }

  async createItem(data: InsertItem): Promise<Item> {
    const items = await this.getStoredData<Item>('items');
    const newItem: Item = {
      id: Date.now(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.setStoredData('items', [...items, newItem]);
    return newItem;
  }

  async updateItem({ id, data }: { id: number; data: InsertItem }): Promise<Item> {
    const items = await this.getStoredData<Item>('items');
    const updatedItems = items.map(item =>
      item.id === id
        ? { ...item, ...data, updatedAt: new Date().toISOString() }
        : item
    );
    await this.setStoredData('items', updatedItems);
    return updatedItems.find(item => item.id === id)!;
  }

  async deleteItem(id: number): Promise<void> {
    const items = await this.getStoredData<Item>('items');
    await this.setStoredData('items', items.filter(item => item.id !== id));
  }

  // Tags API
  async getTags(): Promise<Tag[]> {
    return this.getStoredData<Tag>('tags');
  }

  async createTag(data: InsertTag): Promise<Tag> {
    const tags = await this.getStoredData<Tag>('tags');
    const newTag: Tag = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.setStoredData('tags', [...tags, newTag]);
    return newTag;
  }

  async updateTag({ id, data }: { id: number; data: InsertTag }): Promise<Tag> {
    const tags = await this.getStoredData<Tag>('tags');
    const updatedTags = tags.map(tag =>
      tag.id === id
        ? { ...tag, ...data, updatedAt: new Date().toISOString() }
        : tag
    );
    await this.setStoredData('tags', updatedTags);
    return updatedTags.find(tag => tag.id === id)!;
  }

  async deleteTag(id: number): Promise<void> {
    const tags = await this.getStoredData<Tag>('tags');
    await this.setStoredData('tags', tags.filter(tag => tag.id !== id));
  }

  // List-Tag relationships
  async getListTags(listId: number): Promise<Tag[]> {
    const listTags = await this.getStoredData<{ listId: number; tagId: number }>('listTags');
    const tags = await this.getTags();
    const tagIds = listTags
      .filter(lt => lt.listId === listId)
      .map(lt => lt.tagId);
    return tags.filter(tag => tagIds.includes(tag.id));
  }

  async addTagToList(listId: number, tagId: number): Promise<void> {
    const listTags = await this.getStoredData<{ listId: number; tagId: number }>('listTags');
    if (!listTags.some(lt => lt.listId === listId && lt.tagId === tagId)) {
      await this.setStoredData('listTags', [...listTags, { listId, tagId }]);
    }
  }

  async removeTagFromList(listId: number, tagId: number): Promise<void> {
    const listTags = await this.getStoredData<{ listId: number; tagId: number }>('listTags');
    await this.setStoredData(
      'listTags',
      listTags.filter(lt => !(lt.listId === listId && lt.tagId === tagId))
    );
  }
}

export const apiService = new ApiService();