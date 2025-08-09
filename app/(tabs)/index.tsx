import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, View, Animated, Dimensions, KeyboardAvoidingView, Platform, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StartupIdea } from '@/types';
import { saveIdea, generateAIRating } from '@/utils/storage';
import { useToast } from '@/contexts/ToastContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/contexts/ThemeContext';
import { DarkModeToggle } from '@/components/DarkModeToggle';

const { width } = Dimensions.get('window');

export default function SubmitScreen() {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      if (gestureState.dx > 100) {
        // Swipe right - go to explore
        Animated.timing(swipeAnim, {
          toValue: { x: width, y: 0 },
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          router.push('/explore');
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

  const handleSubmit = async () => {
    if (!name.trim() || !tagline.trim() || !description.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const idea: StartupIdea = {
      id: Date.now().toString(),
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      rating: generateAIRating(),
      votes: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveIdea(idea);
      showToast(`Idea "${idea.name}" submitted! AI Rating: ${idea.rating}/100`, 'success');
      setName('');
      setTagline('');
      setDescription('');
      setTimeout(() => router.push('/explore'), 1500);
    } catch (error) {
      showToast('Failed to save your idea. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
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
      <View style={styles.meshGradient}>
        <LinearGradient 
          colors={['#7C3AED', '#F59E0B']} 
          style={styles.blob1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient 
          colors={['#10B981', '#7C3AED']} 
          style={styles.blob2}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient 
          colors={['#F59E0B', '#F43F5E']} 
          style={styles.blob3}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
      <View style={styles.overlay} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
        <View style={styles.appHeader}>
          <TouchableOpacity 
            style={styles.themeToggle}
            onPress={() => {}}
          >
            <DarkModeToggle />
          </TouchableOpacity>
          <Animated.Text style={[styles.appName, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            IdeaSpark
          </Animated.Text>
          <Animated.Text style={[styles.appTagline, { opacity: fadeAnim }]}>
            Startup Idea Evaluator - AI + Voting App
          </Animated.Text>
        </View>
        <Animated.View 
          style={[
            styles.formHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ThemedText style={styles.formTitle}>🚀 LAUNCH YOUR VISION</ThemedText>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={isDark ? ['rgba(40,40,40,0.95)', 'rgba(30,30,30,0.85)'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.cardGradient}
          >
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <IconSymbol name="rocket.fill" size={20} color="#FF6B6B" />
                <ThemedText style={[styles.label, { color: isDark ? '#FFFFFF' : '#111827' }]}>Startup Name</ThemedText>
              </View>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#374151' : 'rgba(255,255,255,0.9)' }]}>
                <TextInput
                  style={[styles.input, { color: isDark ? '#F9FAFB' : '#111827' }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your startup name"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  selectionColor={isDark ? '#7C3AED' : '#7C3AED'}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <IconSymbol name="star.fill" size={20} color="#FFD700" />
                <ThemedText style={[styles.label, { color: isDark ? '#FFFFFF' : '#111827' }]}>Tagline</ThemedText>
              </View>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#374151' : 'rgba(255,255,255,0.9)' }]}>
                <TextInput
                  style={[styles.input, { color: isDark ? '#F9FAFB' : '#111827' }]}
                  value={tagline}
                  onChangeText={setTagline}
                  placeholder="A catchy one-liner"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  selectionColor={isDark ? '#7C3AED' : '#7C3AED'}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <IconSymbol name="doc.text.fill" size={20} color="#4ECDC4" />
                <ThemedText style={[styles.label, { color: isDark ? '#FFFFFF' : '#111827' }]}>Description</ThemedText>
              </View>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#374151' : 'rgba(255,255,255,0.9)' }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: isDark ? '#F9FAFB' : '#111827' }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your startup idea in detail..."
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  selectionColor={isDark ? '#7C3AED' : '#7C3AED'}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
            
            <Animated.View style={{ transform: [{ scale: isSubmitting ? 0.95 : 1 }] }}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={isSubmitting ? ['#95a5a6', '#7f8c8d'] : ['#FF6B6B', '#4ECDC4']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.submitButtonContent}>
                    <IconSymbol 
                      name={isSubmitting ? "bolt.fill" : "paperplane.fill"} 
                      size={20} 
                      color="#fff" 
                    />
                    <ThemedText style={styles.submitButtonText}>
                      {isSubmitting ? 'Processing...' : 'LAUNCH IDEA'}
                    </ThemedText>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            <ThemedText style={[styles.poweredBy, { color: isDark ? '#F59E0B' : '#7C3AED' }]}>
              Powered by Pgagi ✨
            </ThemedText>
          </LinearGradient>
        </Animated.View>
        
        {/* Swipe hint */}
        <Animated.View style={[styles.swipeHint, { opacity: fadeAnim }]}>
          <IconSymbol name="arrow.right" size={16} color={isDark ? '#F59E0B' : '#7C3AED'} />
          <ThemedText style={[styles.swipeText, { color: isDark ? '#F59E0B' : '#7C3AED' }]}>
            Swipe right to explore ideas
          </ThemedText>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  meshGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blob1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -100,
    opacity: 0.3,
  },
  blob2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -50,
    left: -80,
    opacity: 0.25,
  },
  blob3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '40%',
    left: '30%',
    opacity: 0.2,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  appHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  appName: {
    fontSize: 38,
    fontWeight: '400',
    color: '#FFFFFF',
    textShadowColor: 'rgba(124,58,237,0.8)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 12,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
  },
  appTagline: {
    fontSize: 16,
    color: '#F59E0B',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  formTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  formCard: {
    marginBottom: 30,
    marginHorizontal: 20,
  },
  cardGradient: {
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  inputGroup: {
    marginBottom: 25,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 30,
    right: 20,
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

  label: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputContainer: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    padding: 18,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    transform: [{ scale: 1 }],
  },
  submitButtonDisabled: {
    transform: [{ scale: 0.95 }],
  },
  submitGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 25,
  },
  poweredBy: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});