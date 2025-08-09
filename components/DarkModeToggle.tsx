import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const iconColor = useThemeColor({}, 'tint');

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIconName = () => {
    switch (theme) {
      case 'light': return 'sun.max.fill' as const;
      case 'dark': return 'moon.fill' as const;
      case 'system': return 'house.fill' as const;
    }
  };

  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.container}>
      <IconSymbol name={getIconName()} size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    padding: 8,
  },
});