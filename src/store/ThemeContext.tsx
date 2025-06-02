import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../theme/colors';
import { UserPreferences } from '../types';

interface ThemeContextType {
  theme: typeof Colors.light;
  isDarkMode: boolean;
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkMode: false,
    fontStyle: 'default',
    layout: 'list',
    sortBy: 'newest',
  });

  const theme = preferences.isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await SecureStore.getItemAsync('userPreferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await SecureStore.setItemAsync('userPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.log('Error saving preferences:', error);
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const toggleDarkMode = () => {
    updatePreferences({ isDarkMode: !preferences.isDarkMode });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: preferences.isDarkMode,
        preferences,
        updatePreferences,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};