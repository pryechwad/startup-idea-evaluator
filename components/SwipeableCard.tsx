import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: string;
  rightAction?: string;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  leftAction = 'Dislike',
  rightAction = 'Like'
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const backgroundColor = useThemeColor({}, 'background');

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX: number }) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: { startX: number }) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        opacity.value = withSpring(0);
        if (onSwipeLeft) runOnJS(onSwipeLeft)();
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(SCREEN_WIDTH);
        opacity.value = withSpring(0);
        if (onSwipeRight) runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-30, 0, 30],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.95],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity: opacity.value,
    };
  });

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -50, 0],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, 50, SWIPE_THRESHOLD],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, 50, SWIPE_THRESHOLD],
      [0.8, 1, 1.2],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actionLeft, leftActionStyle]}>
        <Text style={styles.actionText}>{leftAction}</Text>
      </Animated.View>
      
      <Animated.View style={[styles.actionRight, rightActionStyle]}>
        <Text style={styles.actionText}>{rightAction}</Text>
      </Animated.View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, { backgroundColor }, cardStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionLeft: {
    position: 'absolute',
    left: 30,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionRight: {
    position: 'absolute',
    right: 30,
    backgroundColor: '#51CF66',
    padding: 16,
    borderRadius: 12,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});