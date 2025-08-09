import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { StartupIdea } from '@/types';
import { getIdeas } from '@/utils/storage';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform } from 'react-native';
import { DarkModeToggle } from '@/components/DarkModeToggle';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen() {
  const [topIdeas, setTopIdeas] = useState<StartupIdea[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [swipeAnim] = useState(new Animated.ValueXY());
  const { showToast } = useToast();
  const { isDark } = useTheme();

  // Swipe gesture handler
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: Animated.event(
      [null, { dx: swipeAnim.x }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -100) {
        // Swipe left - go to submit
        Animated.timing(swipeAnim, {
          toValue: { x: -width, y: 0 },
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          router.push('/');
          swipeAnim.setValue({ x: 0, y: 0 });
        });
      } else {
        // Return to center
        Animated.spring(swipeAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadTopIdeas = async () => {
    try {
      const ideas = await getIdeas();
      const sorted = [...ideas]
        .sort((a, b) => b.votes - a.votes || b.rating - a.rating)
        .slice(0, 5);
      setTopIdeas(sorted);
      
      if (sorted.length > 0) {
        showToast(`Leaderboard updated! Top idea: "${sorted[0].name}"`, 'info');
      }
    } catch (error) {
      showToast('Failed to load leaderboard', 'error');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTopIdeas();
    }, [])
  );

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  const getRankGradient = (index: number): [string, string] => {
    switch (index) {
      case 0: return ['#FFD700', '#FFA500'];
      case 1: return ['#C0C0C0', '#A8A8A8'];
      case 2: return ['#CD7F32', '#B8860B'];
      default: return ['#e8f4f8', '#d4e6ea'];
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? '#111827' : '#F9FAFB',
          transform: [{ translateX: swipeAnim.x }]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.premiumBackground}>
        <LinearGradient 
          colors={['#FFD700', '#FFA500']} 
          style={styles.goldOrb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient 
          colors={['#C0392B', '#E74C3C']} 
          style={styles.redOrb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient 
          colors={['#8E44AD', '#9B59B6']} 
          style={styles.purpleOrb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.themeToggle}
            onPress={() => {}}
          >
            <DarkModeToggle />
          </TouchableOpacity>
          <ThemedText style={styles.title}>IdeaSpark</ThemedText>
          <ThemedText style={styles.subtitle}>Startup Idea Evaluator - Leaderboard</ThemedText>
        </Animated.View>
        
        {topIdeas.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={styles.emptyGradient}
            >
              <ThemedText style={styles.emptyIcon}>🎯</ThemedText>
              <ThemedText style={styles.emptyText}>No rankings yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>Submit and vote on ideas to see the leaderboard!</ThemedText>
            </LinearGradient>
          </Animated.View>
        ) : (
          topIdeas.map((idea, index) => (
            <Animated.View
              key={idea.id}
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, 50 + (index * 20)]
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity 
                onPress={() => showToast(`"${idea.name}" - ${idea.tagline}`, 'info')}
                activeOpacity={0.8}
                style={styles.leaderCardTouch}
              >
                <LinearGradient colors={getRankGradient(index)} style={styles.leaderCard}>
                  <View style={styles.rankSection}>
                    <View style={styles.rankBadge}>
                      <View style={styles.rankEmojiContainer}>
                        {index === 0 ? (
                          <IconSymbol name="crown.fill" size={24} color="#FFD700" />
                        ) : index === 1 ? (
                          <IconSymbol name="medal.fill" size={24} color="#C0C0C0" />
                        ) : index === 2 ? (
                          <IconSymbol name="medal.fill" size={24} color="#CD7F32" />
                        ) : (
                          <ThemedText style={styles.rankEmoji}>{getRankEmoji(index)}</ThemedText>
                        )}
                      </View>
                      {index < 3 && <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>}
                    </View>
                    
                    <View style={styles.ideaDetails}>
                      <ThemedText style={[styles.ideaName, { color: isDark ? '#FFFFFF' : '#111827' }]}>{idea.name}</ThemedText>
                      <ThemedText style={styles.ideaTagline}>{idea.tagline}</ThemedText>
                    </View>
                  </View>
                  
                  <View style={styles.statsSection}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                      style={styles.statsGradient}
                    >
                      <View style={styles.statBox}>
                        <ThemedText style={styles.statValue}>{idea.votes}</ThemedText>
                        <View style={styles.statLabelContainer}>
                          <IconSymbol name="hand.thumbsup.fill" size={12} color="#6B7280" />
                          <ThemedText style={styles.statLabel}>Votes</ThemedText>
                        </View>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <ThemedText style={styles.statValue}>{idea.rating}</ThemedText>
                        <View style={styles.statLabelContainer}>
                          <IconSymbol name="brain.head.profile" size={12} color="#6B7280" />
                          <ThemedText style={styles.statLabel}>AI Score</ThemedText>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                  
                  {index === 0 && (
                    <View style={styles.crownContainer}>
                      <View style={styles.crownBackground}>
                        <ThemedText style={styles.crown}>👑</ThemedText>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
        
        <ThemedText style={[styles.poweredBy, { color: isDark ? '#F59E0B' : '#7C3AED' }]}>
          Powered by Pgagi ✨
        </ThemedText>
      </ScrollView>
      
      {/* Swipe hint */}
      <Animated.View style={[styles.swipeHint, { opacity: fadeAnim }]}>
        <IconSymbol name="arrow.left" size={16} color={isDark ? '#F59E0B' : '#7C3AED'} />
        <ThemedText style={[styles.swipeText, { color: isDark ? '#F59E0B' : '#7C3AED' }]}>
          Swipe left to submit ideas
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  goldOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: 50,
    right: -50,
    opacity: 0.1,
  },
  redOrb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 100,
    left: -30,
    opacity: 0.08,
  },
  purpleOrb: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '50%',
    left: '40%',
    opacity: 0.06,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: -10,
    right: 0,
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 10,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
  },
  subtitle: {
    color: '#F59E0B',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  poweredBy: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  emptyCard: {
    marginBottom: 20,
  },
  emptyGradient: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  leaderCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
  },
  leaderCardTouch: {
    transform: [{ scale: 1 }],
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankBadge: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  rankEmojiContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  ideaDetails: {
    flex: 1,
  },
  ideaName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  ideaTagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
    lineHeight: 18,
  },
  statsSection: {
    marginTop: 8,
  },
  statsGradient: {
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  swipeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  crownContainer: {
    position: 'absolute',
    top: -10,
    right: 15,
  },
  crownBackground: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 15,
    padding: 6,
  },
  crown: {
    fontSize: 24,
  },
});