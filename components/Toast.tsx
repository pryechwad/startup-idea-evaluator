import React, { useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, type, visible, onHide }: ToastProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const textColor = '#fff';

  const getTypeConfig = () => {
    switch (type) {
      case 'success': 
        return {
          colors: ['#4CAF50', '#45a049'] as const,
          icon: '✅',
          shadowColor: '#4CAF50'
        };
      case 'error': 
        return {
          colors: ['#F44336', '#d32f2f'] as const,
          icon: '❌',
          shadowColor: '#F44336'
        };
      case 'info': 
        return {
          colors: ['#2196F3', '#1976d2'] as const,
          icon: 'ℹ️',
          shadowColor: '#2196F3'
        };
      default: 
        return {
          colors: ['#2196F3', '#1976d2'] as const,
          icon: 'ℹ️',
          shadowColor: '#2196F3'
        };
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onHide());
    }
  }, [visible, onHide, scaleAnim, slideAnim]);

  if (!visible) return null;

  const typeConfig = getTypeConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          shadowColor: typeConfig.shadowColor,
        }
      ]}
    >
      <LinearGradient
        colors={typeConfig.colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{typeConfig.icon}</Text>
          <Text style={[styles.message, { color: textColor }]}>{message}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  gradient: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});