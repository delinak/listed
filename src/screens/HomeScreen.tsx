import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActionSheetIOS,
  Keyboard,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../store/ThemeContext';
import { useLists } from '../hooks/useLists';
import { useTags } from '../hooks/useTags';
import { useItems } from '../hooks/useItems';
import ListModal from '../components/ListModal';
import TagModal from '../components/TagModal';
import { List, Tag } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { theme, preferences } = useTheme();
  const { lists, isLoading: listsLoading, createList, updateList, deleteList } = useLists();
  const { tags, isLoading: tagsLoading, createTag, updateTag, deleteTag } = useTags();
  const [showListModal, setShowListModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editingList, setEditingList] = useState<List | undefined>(undefined);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [expandedListId, setExpandedListId] = useState<number | null>(null);
  const { items: allItems } = useItems(-1); // -1 means fetch all items
  const [initialListTags, setInitialListTags] = useState<number[] | undefined>(undefined);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2196F3'); // default blue

  const styles = createStyles(theme);

  // Filter lists by selected tag and exclude deleted lists
  const filteredLists = selectedTagId
    ? lists.filter(list => !list.deletedAt && list.tags?.includes(selectedTagId))
    : lists.filter(list => !list.deletedAt);

  const handleExpand = (listId: number) => {
    setExpandedListId(prev => (prev === listId ? null : listId));
  };

  const handleCreateList = async (data: { name: string; description?: string }) => {
    try {
      await createList(data);
      setShowListModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const handleUpdateList = async (data: { name: string; description?: string }) => {
    if (!editingList) return;
    try {
      await updateList({ id: editingList.id, data });
      setShowListModal(false);
      setEditingList(undefined);
    } catch (error) {
      Alert.alert('Error', 'Failed to update list');
    }
  };

  const handleDeleteList = async (listId: number) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list? It will be moved to trash for 14 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateList({ 
                id: listId, 
                data: { 
                  deletedAt: new Date().toISOString(),
                  name: lists.find(l => l.id === listId)?.name || '',
                  description: lists.find(l => l.id === listId)?.description,
                  tags: lists.find(l => l.id === listId)?.tags || []
                } 
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const handleCreateTag = async (data: { name: string; color: string }) => {
    try {
      await createTag(data);
      setShowTagModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create tag');
    }
  };

  const handleUpdateTag = async (data: { name: string; color: string }) => {
    if (!editingTag) return;
    try {
      await updateTag({ id: editingTag.id, data });
      setShowTagModal(false);
      setEditingTag(undefined);
    } catch (error) {
      Alert.alert('Error', 'Failed to update tag');
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    Alert.alert(
      'Delete Tag',
      'Are you sure you want to delete this tag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tagId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tag');
            }
          },
        },
      ]
    );
  };

  // Handler for ListModal save
  const handleListModalSave = (data: { name: string; description?: string; tags?: number[] }) => {
    if (editingList) {
      updateList({ id: editingList.id, data: { name: data.name, description: data.description, tags: data.tags || [] } });
    } else {
      createList({ name: data.name, description: data.description, tags: data.tags || [] });
    }
  };

  // Handler for three-dot menu
  const handleListMenu = (list: List) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Edit', 'Delete'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          setEditingList(list);
          setShowListModal(true);
        } else if (buttonIndex === 2) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          handleDeleteList(list.id);
        }
      }
    );
  };

  // Handler for tag three-dot menu
  const handleTagMenu = (tag: Tag) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Edit', 'Delete'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          setEditingTag(tag);
          setShowTagModal(true);
        } else if (buttonIndex === 2) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          handleDeleteTag(tag.id);
        }
      }
    );
  };

  const renderRightActions = (listId: number) => (
    <TouchableOpacity
      style={styles.openSwipeButton}
      onPress={() => navigation.navigate('ListDetail', { listId })}
    >
      <Ionicons name="open-outline" size={24} color="#fff" />
      <Text style={styles.openSwipeText}>Open</Text>
    </TouchableOpacity>
  );

  const renderList = ({ item: list }: { item: List }) => {
    const listTags = tags.filter(tag => list.tags?.includes(tag.id));
    const isExpanded = expandedListId === list.id;
    // Filter items for this list
    const items = allItems.filter(i => i.listId === list.id);
    const totalCount = items.length;
    const completedCount = items.filter(i => i.completed).length;
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(list.id)}
        overshootRight={false}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          style={[
            styles.listCard,
            isExpanded && styles.listCardExpanded,
            { backgroundColor: theme.surface },
          ]}
          onPress={() => handleExpand(list.id)}
        >
          <View style={styles.listCardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listItemCount}>{totalCount} item{totalCount !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity
              style={styles.actionButtonSmall}
              onPress={() => handleListMenu(list)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          {isExpanded && (
            <>
              {list.description ? (
                <Text style={styles.listDescription}>{list.description}</Text>
              ) : null}
              {listTags.length > 0 && (
                <View style={styles.tagsInlineContainerSmall}>
                  {listTags.map(tag => (
                    <View
                      key={tag.id}
                      style={[styles.tagPillSmall, { backgroundColor: tag.color }]}
                    >
                      <Text style={styles.tagPillTextSmall}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.listExpandedFooter}>
                <Text style={styles.listItemsExpanded}>{completedCount} of {totalCount} completed</Text>
                <Text style={styles.listDate}>{new Date(list.createdAt).toLocaleDateString()}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Tag pills for tag filter bar, with All Tags pill
  const renderTagFilterBar = () => (
    <FlatList
      data={[{ id: null, name: 'All Tags', color: theme.primary }, ...tags]}
      renderItem={({ item }) => {
        if (item.id === null) {
          // All Tags pill
          return (
            <TouchableOpacity
              style={[
                styles.tagPill,
                {
                  backgroundColor: selectedTagId === null ? theme.primary : theme.surface,
                  borderWidth: 1,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setSelectedTagId(null)}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.tagPillText,
                { color: selectedTagId === null ? '#fff' : theme.primary },
              ]}>All Tags</Text>
            </TouchableOpacity>
          );
        }
        // Regular tag pill
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tagPill,
              { backgroundColor: selectedTagId === item.id ? item.color : theme.surface, borderWidth: 1, borderColor: item.color },
            ]}
            onPress={() => setSelectedTagId(item.id)}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.tagPillText,
              { color: selectedTagId === item.id ? '#fff' : item.color },
            ]}>{item.name}</Text>
            <TouchableOpacity
              style={styles.tagPillMenu}
              onPress={() => handleTagMenu(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={selectedTagId === item.id ? '#fff' : item.color} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      keyExtractor={item => (item.id === null ? 'all' : item.id.toString())}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tagsList}
    />
  );

  // When '+ New List' is clicked, pre-select the tag if one is selected
  const handleNewList = () => {
    if (selectedTagId) {
      setInitialListTags([selectedTagId]);
    } else {
      setInitialListTags(undefined);
    }
    setEditingList(undefined);
    setShowListModal(true);
  };

  // Sort lists based on preferences
  const sortedLists = React.useMemo(() => {
    const sorted = [...filteredLists];
    if (preferences.sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (preferences.sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return sorted;
  }, [filteredLists, preferences.sortBy]);

  if (listsLoading || tagsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Title and Date Header */}
        <View style={styles.appHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>Listed</Text>
            <Text style={styles.appDate}>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIconButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Tags Section with + New Tag above */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => {
                setEditingTag(undefined);
                setShowTagModal(true);
              }}
            >
              <Text style={styles.buttonText}>+ New Tag</Text>
            </TouchableOpacity>
          </View>
          {renderTagFilterBar()}
        </View>

        {/* Lists Section with + New List above */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lists</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleNewList}
            >
              <Text style={styles.buttonText}>+ New List</Text>
            </TouchableOpacity>
          </View>
          {sortedLists.map(list => renderList({ item: list }))}
        </View>
      </ScrollView>

      {/* Modals */}
      <ListModal
        visible={showListModal}
        onClose={() => {
          setShowListModal(false);
          setEditingList(undefined);
          setInitialListTags(undefined);
        }}
        onSave={handleListModalSave}
        list={editingList}
        tags={tags}
        initialTags={initialListTags}
      />
      <TagModal
        visible={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setEditingTag(undefined);
        }}
        onSave={editingTag ? handleUpdateTag : handleCreateTag}
        tag={editingTag}
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
    section: {
      padding: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    buttonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    tagsList: {
      gap: 8,
      paddingRight: 16,
    },
    listsList: {
      gap: 12,
      paddingBottom: 16,
    },
    listCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    listCardExpanded: {
      transform: [{ scale: 1.02 }],
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 2,
    },
    listCardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    listName: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
    },
    listItemCount: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
      marginBottom: 2,
    },
    actionButtonSmall: {
      padding: 4,
      borderRadius: 12,
      minWidth: 28,
      minHeight: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 6,
      marginBottom: 4,
    },
    tagsInlineContainerSmall: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 2,
      marginTop: 2,
      marginBottom: 2,
    },
    tagPillSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 1,
      marginRight: 2,
      marginBottom: 2,
      minHeight: 16,
      backgroundColor: theme.surface,
    },
    tagPillTextSmall: {
      fontSize: 10,
      fontWeight: '500',
      marginRight: 1,
      color: '#fff',
    },
    listExpandedFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    listItemsExpanded: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    listDate: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    listMetaRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
      marginBottom: 2,
    },
    listMetaText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    tagsInlineContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
      marginBottom: 2,
    },
    tagPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 4,
      minHeight: 32,
      backgroundColor: theme.surface,
    },
    tagPillText: {
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4,
    },
    tagPillMenu: {
      padding: 2,
      borderRadius: 12,
      marginLeft: 2,
      minWidth: 24,
      minHeight: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 24,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    appTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
    },
    appDate: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 2,
    },
    openSwipeButton: {
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '90%',
      borderRadius: 12,
      marginVertical: 6,
      flexDirection: 'column',
    },
    openSwipeText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      marginTop: 4,
    },
    addTagPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 4,
      minHeight: 32,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    addTagInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      marginRight: 6,
      padding: 0,
      backgroundColor: 'transparent',
    },
    addTagColor: {
      marginRight: 6,
    },
    addTagButton: {
      padding: 4,
      borderRadius: 12,
      marginLeft: 2,
      minWidth: 24,
      minHeight: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addTagText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    profileIconButton: {
      padding: 4,
      marginLeft: 8,
    },
  });