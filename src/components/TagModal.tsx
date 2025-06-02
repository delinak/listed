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
import { Tag, InsertTag } from '../types';

interface TagModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: InsertTag) => void;
  tag?: Tag;
}

export default function TagModal({ visible, onClose, onSave, tag }: TagModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8BA89C'); // Default color

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    } else {
      setName('');
      setColor('#8BA89C');
    }
  }, [tag]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        color,
      });
      onClose();
    }
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
            <Text style={styles.title}>{tag ? 'Edit Tag' : 'New Tag'}</Text>
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
              placeholder="Enter tag name"
              placeholderTextColor={theme.textMuted}
              autoFocus
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorPicker}>
              {['#8BA89C', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7'].map((colorOption) => (
                <TouchableOpacity
                  key={colorOption}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorOption },
                    color === colorOption && styles.selectedColor,
                  ]}
                  onPress={() => setColor(colorOption)}
                />
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
    colorPicker: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    colorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedColor: {
      borderColor: theme.text,
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