import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/IconSymbol';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [featuresAnim] = useState(new Animated.Value(0));
  const [swipeHintAnim] = useState(new Animated.Value(0));
  const [pan] = useState(new Animated.ValueXY());

  // Swipe gesture handler
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      
      // Swipe up to continue
      if (gestureState.dy < -50) {
        Animated.timing(pan, {
          toValue: { x: 0, y: -height },
          duration: 300,
          useNativeDriver: false,
        }).start(() => onFinish());
        return;
      }
      
      // Swipe left/right for different animations
      if (Math.abs(gestureState.dx) > 100) {
        Animated.sequence([
          Animated.timing(pan, {
            toValue: { x: gestureState.dx > 0 ? width : -width, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(pan, {
            toValue: { x: 0, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
        return;
      }
      
      // Return to center
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  useEffect(() => {
    // Main entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(featuresAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Swipe hint animation
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(swipeHintAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 2000);

    const timer = setTimeout(onFinish, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background circles */}
        <View style={styles.backgroundElements}>
          <Animated.View style={[styles.circle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.circle2, { opacity: fadeAnim }]} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* App Icon with pulse animation */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { 
                transform: [
                  { scale: scaleAnim },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            <IconSymbol name="lightbulb.fill" size={60} color="#FFD700" />
          </Animated.View>
          
          {/* App Name */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.appName}>IdeaSpark</Text>
            <Text style={styles.subtitle}>Startup Idea Evaluator</Text>
            <Text style={styles.tagline}>AI + Voting App</Text>
          </Animated.View>

          {/* Features with custom icons */}
          <Animated.View 
            style={[
              styles.featuresContainer,
              { 
                opacity: featuresAnim,
                transform: [{
                  translateY: featuresAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.feature}>
              <IconSymbol name="paperplane.fill" size={20} color="#FF6B6B" />
              <Text style={styles.featureText}>Submit Ideas</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="brain.head.profile" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>AI Evaluation</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="hand.thumbsup.fill" size={20} color="#95E1D3" />
              <Text style={styles.featureText}>Community Voting</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol name="trophy.fill" size={20} color="#FFD700" />
              <Text style={styles.featureText}>Leaderboard</Text>
            </View>
          </Animated.View>

          {/* Powered by */}
          <Animated.View
            style={[
              styles.poweredByContainer,
              { opacity: featuresAnim }
            ]}
          >
            <Text style={styles.poweredBy}>Powered by Pgagi ✨</Text>
          </Animated.View>
        </Animated.View>

        {/* Swipe hints */}
        <Animated.View 
          style={[
            styles.swipeHints,
            { opacity: swipeHintAnim }
          ]}
        >
          <View style={styles.swipeHint}>
            <IconSymbol name="arrow.up" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.swipeText}>Swipe up to continue</Text>
          </View>
          <View style={styles.swipeHintSide}>
            <IconSymbol name="arrow.left.arrow.right" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.swipeTextSmall}>Swipe left/right to explore</Text>
          </View>
        </Animated.View>

        {/* Skip button */}
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={onFinish}
          activeOpacity={0.8}
        >
          <IconSymbol name="xmark" size={16} color="#fff" />
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Loading indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                {
                  transform: [{
                    scaleX: featuresAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }]
                }
              ]}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 100,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 150,
    left: -30,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
    minWidth: 200,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 12,
  },
  poweredByContainer: {
    marginBottom: 20,
  },
  poweredBy: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    textAlign: 'center',
  },
  swipeHints: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  swipeHint: {
    alignItems: 'center',
    marginBottom: 10,
  },
  swipeHintSide: {
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    fontWeight: '500',
  },
  swipeTextSmall: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: width - 80,
  },
  loadingBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
    transformOrigin: 'left',
  },
});