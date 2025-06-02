import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { SortOption } from '../types';
import { useLists } from '../hooks/useLists';
import { useTags } from '../hooks/useTags';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { theme, preferences, updatePreferences, toggleDarkMode } = useTheme();
  const { lists, updateList, deleteList } = useLists();
  const { tags } = useTags();
  const [deletedLists, setDeletedLists] = useState<Array<{ list: any; daysLeft: number }>>([]);

  const styles = createStyles(theme);

  // Calculate days left for deleted lists
  useEffect(() => {
    const now = new Date();
    const deleted = lists
      .filter(list => list.deletedAt)
      .map(list => {
        const deletedDate = new Date(list.deletedAt!);
        const daysLeft = 14 - Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
        return { list, daysLeft };
      })
      .filter(({ daysLeft }) => daysLeft > 0);
    setDeletedLists(deleted);
  }, [lists]);

  // Permanently delete lists older than 2 weeks
  useEffect(() => {
    const now = new Date();
    lists.forEach(list => {
      if (list.deletedAt) {
        const deletedDate = new Date(list.deletedAt);
        const daysSinceDeletion = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceDeletion >= 14) {
          deleteList(list.id);
        }
      }
    });
  }, [lists, deleteList]);

  const handleRestoreList = async (listId: number) => {
    try {
      await updateList({ id: listId, data: { deletedAt: null } });
      Alert.alert('Success', 'List restored successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore list');
    }
  };

  const handlePermanentDelete = async (listId: number) => {
    Alert.alert(
      'Delete Permanently',
      'Are you sure you want to permanently delete this list? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
              Alert.alert('Success', 'List permanently deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const renderPreferenceCard = (
    title: string,
    description: string,
    children: React.ReactNode
  ) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );

  const renderToggleOption = (
    label: string,
    value: boolean,
    onToggle: () => void,
    icon?: string
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabel}>
        {icon && (
          <Ionicons name={icon as any} size={20} color={theme.textSecondary} />
        )}
        <Text style={styles.toggleText}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? '#ffffff' : '#f4f4f4'}
      />
    </View>
  );

  const renderButtonGroup = (
    options: { label: string; value: string; icon?: string }[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.buttonGroup}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.groupButton,
            selectedValue === option.value && styles.groupButtonSelected,
            index === 0 && styles.groupButtonFirst,
            index === options.length - 1 && styles.groupButtonLast,
          ]}
          onPress={() => onSelect(option.value)}
        >
          {option.icon && (
            <Ionicons
              name={option.icon as any}
              size={16}
              color={
                selectedValue === option.value ? '#ffffff' : theme.textSecondary
              }
            />
          )}
          <Text
            style={[
              styles.groupButtonText,
              selectedValue === option.value && styles.groupButtonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{lists.filter(l => !l.deletedAt).length}</Text>
            <Text style={styles.statLabel}>Total Lists</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tags.length}</Text>
            <Text style={styles.statLabel}>Tags Created</Text>
          </View>
        </View>

        {/* Appearance Settings */}
        {renderPreferenceCard(
          'Appearance',
          'Customize how your lists look and feel',
          <View>
            {renderToggleOption(
              'Dark Mode',
              preferences.isDarkMode,
              toggleDarkMode,
              preferences.isDarkMode ? 'moon' : 'sunny'
            )}
          </View>
        )}

        {/* List Sorting */}
        {renderPreferenceCard(
          'List Sorting',
          'Set your default sort order for lists',
          <View style={styles.preferenceSection}>
            <Text style={styles.preferenceLabel}>Default Sort Order</Text>
            {renderButtonGroup(
              [
                { label: 'Newest First', value: 'newest', icon: 'arrow-up' },
                { label: 'Oldest First', value: 'oldest', icon: 'arrow-down' },
              ],
              preferences.sortBy,
              (value) => updatePreferences({ sortBy: value as SortOption })
            )}
          </View>
        )}

        {/* Trash */}
        {renderPreferenceCard(
          'Trash',
          'Manage deleted lists',
          <View style={styles.trashContent}>
            {deletedLists.length === 0 ? (
              <Text style={styles.emptyTrashText}>No deleted lists</Text>
            ) : (
              deletedLists.map(({ list, daysLeft }) => (
                <View key={list.id} style={styles.trashItem}>
                  <View style={styles.trashItemInfo}>
                    <Text style={styles.trashItemName}>{list.name}</Text>
                    <Text style={styles.trashItemDate}>
                      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                    </Text>
                  </View>
                  <View style={styles.trashItemActions}>
                    <TouchableOpacity
                      style={styles.trashItemButton}
                      onPress={() => handleRestoreList(list.id)}
                    >
                      <Ionicons name="refresh" size={20} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.trashItemButton}
                      onPress={() => handlePermanentDelete(list.id)}
                    >
                      <Ionicons name="trash" size={20} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
      borderRadius: 20,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cardHeader: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    cardContent: {
      gap: 16,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toggleText: {
      fontSize: 16,
      color: theme.text,
    },
    preferenceSection: {
      gap: 8,
    },
    preferenceLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 4,
    },
    buttonGroup: {
      flexDirection: 'row',
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    groupButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      gap: 6,
    },
    groupButtonFirst: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    },
    groupButtonLast: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    groupButtonSelected: {
      backgroundColor: theme.primary,
    },
    groupButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    groupButtonTextSelected: {
      color: '#ffffff',
    },
    trashContent: {
      gap: 12,
    },
    emptyTrashText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      padding: 16,
    },
    trashItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 8,
    },
    trashItemInfo: {
      flex: 1,
    },
    trashItemName: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 2,
    },
    trashItemDate: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    trashItemActions: {
      flexDirection: 'row',
      gap: 8,
    },
    trashItemButton: {
      padding: 8,
      borderRadius: 8,
    },
  });