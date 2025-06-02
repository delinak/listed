import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { List, InsertList, Tag } from '../types';

interface ListModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; tags?: number[] }) => void;
  list?: { name: string; description?: string; tags?: number[] };
  tags: Tag[];
  initialTags?: number[];
}

export default function ListModal({ visible, onClose, onSave, list, tags, initialTags }: ListModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [selectedTags, setSelectedTags] = useState<number[]>(list?.tags || initialTags || []);

  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || '');
      setSelectedTags(list.tags || []);
    } else if (initialTags) {
      setName('');
      setDescription('');
      setSelectedTags(initialTags);
    } else {
      setName('');
      setDescription('');
      setSelectedTags([]);
    }
  }, [list, initialTags]);

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), tags: selectedTags });
    onClose();
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{list ? 'Edit List' : 'New List'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter list name"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.surface }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : '#eee',
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    margin: 4,
                  }}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text style={{ color: selectedTags.includes(tag.id) ? '#fff' : '#333' }}>{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, !name.trim() && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    form: {
      gap: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    input: {
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 20,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.surfaceSecondary,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    saveButtonText: {
      color: '#ffffff',
    },
  }); 