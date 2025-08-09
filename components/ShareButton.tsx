import React from 'react';
import { TouchableOpacity, Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { IconSymbol } from './ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ShareButtonProps {
  idea: {
    title: string;
    description: string;
    category: string;
    rating: number;
  };
  onShare?: (wasShared: boolean) => void;
}

export function ShareButton({ idea, onShare }: ShareButtonProps) {
  const tintColor = useThemeColor({}, 'tint');

  const handleShare = async () => {
    const shareText = `💡 Check out this startup idea: "${idea.title}"\n\n${idea.description}\n\nCategory: ${idea.category}\nRating: ${idea.rating}/5 stars\n\n🚀 Shared via Startup Evaluator`;

    try {
      const result = await Share.share({
        message: shareText,
        title: 'Startup Idea',
      });
      
      if (result.action === Share.sharedAction) {
        onShare?.(true);
      } else {
        onShare?.(false);
      }
    } catch (error) {
      await Clipboard.setStringAsync(shareText);
      Alert.alert('✅ Copied!', 'Idea copied to clipboard');
      onShare?.(true);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handleShare}
      style={{ padding: 8, borderRadius: 8 }}
      activeOpacity={0.7}
    >
      <IconSymbol name="paperplane.fill" size={20} color={tintColor} />
    </TouchableOpacity>
  );
}