import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { useLists } from '../hooks/useLists';
import { useTags } from '../hooks/useTags';
import { useItems } from '../hooks/useItems';
import { ListDetailScreenProps, Item } from '../types';
import ListModal from '../components/ListModal';

export default function ListDetailScreen({ route, navigation }: ListDetailScreenProps) {
  const { listId } = route.params;
  const { theme } = useTheme();
  const { lists, isLoading: listsLoading, updateList, deleteList } = useLists();
  const { tags, isLoading: tagsLoading } = useTags();
  const { items, isLoading: itemsLoading, createItem, updateItem, deleteItem } = useItems(listId);
  const [newItemName, setNewItemName] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showTagEdit, setShowTagEdit] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const list = lists.find(l => l.id === listId);
  const assignedTags = tags.filter(tag => list?.tags?.includes(tag.id));
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const styles = createStyles(theme);

  if (listsLoading || tagsLoading || itemsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={styles.errorText}>List not found</Text>
      </View>
    );
  }

  // Header three-dot menu (edit/delete)
  const handleListMenu = () => {
    Alert.alert('List Actions', '', [
      { text: 'Edit', onPress: () => setShowEditModal(true) },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    try {
      await createItem({
        listId,
        name: newItemName.trim(),
      });
      setNewItemName('');
      setIsAddingItem(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const handleToggleItem = async (item: Item) => {
    try {
      await updateItem({
        id: item.id,
        data: {
          ...item,
          completed: !item.completed,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  // Save description edit
  const handleSaveDescription = async () => {
    if (!list) return;
    if (descriptionValue !== list.description) {
      await updateList({ id: list.id, data: { name: list.name, description: descriptionValue, tags: list.tags || [] } });
    }
    setEditingDescription(false);
    Keyboard.dismiss();
  };

  // Save edit from modal
  const handleEditList = async (data: { name: string; description?: string; tags?: number[] }) => {
    if (!list) return;
    await updateList({ id: list.id, data: { name: data.name, description: data.description, tags: data.tags || [] } });
    setShowEditModal(false);
  };

  // Handler for random uncompleted entry
  const handleRandomUncompleted = () => {
    const uncompleted = items.filter(i => !i.completed);
    if (uncompleted.length === 0) {
      Alert.alert('No uncompleted items', 'All items are completed!');
      return;
    }
    const randomItem = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    Alert.alert('Random Item', randomItem.name);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.surface }]}>
      <TouchableOpacity
        style={styles.itemCheckbox}
        onPress={() => handleToggleItem(item)}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && (
            <Ionicons name="checkmark" size={16} color={theme.text} />
          )}
        </View>
      </TouchableOpacity>
      <Text
        style={[
          styles.itemName,
          item.completed && styles.itemNameCompleted,
        ]}
      >
        {item.name}
      </Text>
      <TouchableOpacity
        style={styles.itemMenuButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{list?.name}</Text>
          {list?.description && (
            <Text style={styles.headerDescription}>{list.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleListMenu()}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.randomButton}
          onPress={handleRandomUncompleted}
        >
          <Ionicons name="shuffle" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Tags Section */}
      {assignedTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollContent}
          >
            {assignedTags.map(tag => (
              <View
                key={tag.id}
                style={[styles.tagPill, { backgroundColor: tag.color }]}
              >
                <Text style={styles.tagPillText}>{tag.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content Area with Fixed Bottom */}
      <View style={styles.mainContent}>
        {/* Scrollable Items List */}
        <ScrollView
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemCheckbox}
                onPress={() => handleToggleItem(item)}
              >
                <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                  {item.completed && (
                    <Ionicons name="checkmark" size={16} color={theme.text} />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  styles.itemName,
                  item.completed && styles.itemNameCompleted,
                ]}
              >
                {item.name}
              </Text>
              <TouchableOpacity
                style={styles.itemMenuButton}
                onPress={() => handleDeleteItem(item.id)}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={styles.fixedBottom}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(completedCount / totalCount) * 100}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount} of {totalCount} completed
            </Text>
          </View>

          {/* Add Item Input */}
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, { color: theme.text }]}
              placeholder="Add new item..."
              placeholderTextColor={theme.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addItemButton, { backgroundColor: theme.primary }]}
              onPress={handleAddItem}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Edit List Modal */}
      <ListModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditList}
        list={list}
        tags={tags}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 8,
    },
    backButton: {
      padding: 4,
      marginRight: 8,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
    },
    headerDescription: {
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: 2,
      marginBottom: 2,
    },
    descriptionInput: {
      fontSize: 15,
      color: theme.text,
      marginTop: 2,
      marginBottom: 2,
      borderBottomWidth: 1,
      borderColor: theme.primary,
      padding: 0,
    },
    tagPillsRowTop: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginLeft: 8,
      alignSelf: 'flex-start',
    },
    menuButton: {
      padding: 4,
    },
    randomButton: {
      padding: 4,
      marginLeft: 8,
    },
    tagSection: {
      padding: 16,
      paddingBottom: 0,
    },
    tagSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    tagSectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagPillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    tagPill: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 6,
      marginBottom: 4,
    },
    tagPillText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '500',
    },
    addItemSection: {
      padding: 16,
      paddingBottom: 0,
    },
    addItemInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addItemButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    itemsList: {
      padding: 16,
      gap: 8,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    itemCheckbox: {
      marginRight: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
    },
    itemName: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
    },
    itemNameCompleted: {
      textDecorationLine: 'line-through',
      color: theme.textSecondary,
    },
    itemMenuButton: {
      padding: 4,
      marginLeft: 8,
    },
    progressSection: {
      marginTop: 16,
      marginHorizontal: 16,
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    progressLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    progressBarBg: {
      width: '100%',
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
    },
    errorText: {
      fontSize: 16,
      color: theme.error,
      textAlign: 'center',
      marginTop: 20,
    },
    mainContent: {
      flex: 1,
      position: 'relative',
    },
    itemsListContent: {
      paddingBottom: 140, // Add padding to account for fixed bottom section
    },
    fixedBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 16,
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    addItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addItemInput: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 10,
      fontSize: 15,
      backgroundColor: theme.surface,
    },
    addItemButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tagsContainer: {
      padding: 16,
      paddingBottom: 0,
    },
    tagsScrollContent: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 4,
    },
  });