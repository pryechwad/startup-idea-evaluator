import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ShareButton } from '@/components/ShareButton';
import { StartupIdea } from '@/types';
import { getIdeas, voteForIdea, getUserVotes } from '@/utils/storage';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform } from 'react-native';
import { DarkModeToggle } from '@/components/DarkModeToggle';


export default function IdeasScreen() {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'votes'>('rating');
  const [expandedIdeas, setExpandedIdeas] = useState<Set<string>>(new Set());
  const { showToast } = useToast();
  const { isDark } = useTheme();

  const loadData = async () => {
    try {
      const [ideasData, votesData] = await Promise.all([getIdeas(), getUserVotes()]);
      console.log('Loaded ideas:', ideasData.length);
      console.log('Loaded votes:', votesData.length);
      setIdeas(ideasData);
      setUserVotes(votesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleVote = async (ideaId: string) => {
    console.log('Voting for idea:', ideaId);
    try {
      const success = await voteForIdea(ideaId);
      console.log('Vote result:', success);
      if (success) {
        showToast('Vote recorded!', 'success');
        await loadData();
      } else {
        showToast('Already voted', 'info');
      }
    } catch (error) {
      console.error('Vote error:', error);
      showToast('Vote failed', 'error');
    }
  };

  const handleShare = (idea: StartupIdea, wasShared: boolean) => {
    if (wasShared) {
      showToast('Idea shared!', 'success');
    }
  };

  const toggleExpanded = (ideaId: string) => {
    const newExpanded = new Set(expandedIdeas);
    if (newExpanded.has(ideaId)) {
      newExpanded.delete(ideaId);
    } else {
      newExpanded.add(ideaId);
    }
    setExpandedIdeas(newExpanded);
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    return sortBy === 'rating' ? b.rating - a.rating : b.votes - a.votes;
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <View style={styles.modernBackground}>
        <LinearGradient 
          colors={['#7C3AED', '#F59E0B']} 
          style={styles.wave1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient 
          colors={['#10B981', '#7C3AED']} 
          style={styles.wave2}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.themeToggle}
          onPress={() => {}}
        >
          <DarkModeToggle />
        </TouchableOpacity>
        <ThemedText style={styles.appTitle}>IdeaSpark</ThemedText>
        <ThemedText style={styles.subtitle}>Startup Idea Evaluator - AI + Voting</ThemedText>
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >

        
        <View style={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
            onPress={() => setSortBy('rating')}
          >
            <ThemedText style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
              🤖 By AI Rating
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'votes' && styles.sortButtonActive]}
            onPress={() => setSortBy('votes')}
          >
            <ThemedText style={[styles.sortButtonText, sortBy === 'votes' && styles.sortButtonTextActive]}>
              👍 By Votes
            </ThemedText>
          </TouchableOpacity>
        </View>

        {sortedIdeas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <ThemedText style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#111827' }]}>No ideas submitted yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Be the first to share your startup idea!</ThemedText>
          </View>
        ) : (
          sortedIdeas.map((idea) => (
            <View key={idea.id} style={[styles.ideaCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
              <View style={styles.ideaHeader}>
                <View style={styles.ideaTitleContainer}>
                  <ThemedText style={[styles.ideaName, { color: isDark ? '#FFFFFF' : '#111827' }]}>{idea.name}</ThemedText>
                  <ThemedText style={styles.tagline}>{idea.tagline}</ThemedText>
                </View>
                <View style={styles.headerActions}>
                  <View style={styles.metrics}>
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricValue}>{idea.rating}</ThemedText>
                      <ThemedText style={styles.metricLabel}>AI Score</ThemedText>
                    </View>
                    <View style={styles.metric}>
                      <ThemedText style={styles.metricValue}>{idea.votes}</ThemedText>
                      <ThemedText style={styles.metricLabel}>Votes</ThemedText>
                    </View>
                  </View>
                  <ShareButton 
                    idea={{
                      title: idea.name,
                      description: idea.description,
                      category: idea.tagline,
                      rating: Math.round(idea.rating / 20)
                    }}
                    onShare={(wasShared) => handleShare(idea, wasShared)}
                  />
                </View>
              </View>
              
              <ThemedText style={[styles.description, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                {expandedIdeas.has(idea.id) ? idea.description : `${idea.description.substring(0, 120)}...`}
              </ThemedText>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => toggleExpanded(idea.id)}
                >
                  <ThemedText style={styles.readMoreText}>
                    {expandedIdeas.has(idea.id) ? '📖 Show Less' : '📖 Read More'}
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.voteButtonNew,
                    userVotes.includes(idea.id) && styles.voteButtonDisabled
                  ]}
                  onPress={() => handleVote(idea.id)}
                  disabled={userVotes.includes(idea.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={userVotes.includes(idea.id) ? ['#95a5a6', '#7f8c8d'] : ['#4ECDC4', '#44A08D']}
                    style={styles.voteGradient}
                  >
                    <ThemedText style={styles.voteButtonTextNew}>
                      {userVotes.includes(idea.id) ? '✅ Voted' : '👍 Upvote'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        <ThemedText style={[styles.poweredBy, { color: isDark ? '#F59E0B' : '#7C3AED' }]}>
          Powered by Pgagi ✨
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modernBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave1: {
    position: 'absolute',
    width: '120%',
    height: '60%',
    top: -50,
    left: -20,
    opacity: 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  wave2: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    bottom: -30,
    right: -10,
    opacity: 0.08,
    transform: [{ rotate: '10deg' }],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 10,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
  },
  subtitle: {
    color: '#10B981',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  poweredBy: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  sortButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sortButtonActive: {
    backgroundColor: '#fff',
  },
  sortButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#2193b0',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  ideaCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  ideaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ideaTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  ideaName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  metrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  metricLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  readMoreText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  voteButton: {
    borderRadius: 20,
  },
  voteButtonInner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  voteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  voteButtonNew: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  voteGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  voteButtonTextNew: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  voteButtonTextDisabled: {
    color: '#fff',
  },
});