import AsyncStorage from '@react-native-async-storage/async-storage';
import { StartupIdea } from '@/types';

const IDEAS_KEY = 'startup_ideas';
const VOTES_KEY = 'user_votes';

export const saveIdea = async (idea: StartupIdea): Promise<void> => {
  try {
    const ideas = await getIdeas();
    ideas.push(idea);
    await AsyncStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error saving idea:', error);
    throw error;
  }
};

export const getIdeas = async (): Promise<StartupIdea[]> => {
  try {
    const data = await AsyncStorage.getItem(IDEAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting ideas:', error);
    return [];
  }
};

export const voteForIdea = async (ideaId: string): Promise<boolean> => {
  try {
    const votes = await getUserVotes();
    if (votes.includes(ideaId)) return false;
    
    votes.push(ideaId);
    await AsyncStorage.setItem(VOTES_KEY, JSON.stringify(votes));
    
    const ideas = await getIdeas();
    const updatedIdeas = ideas.map(idea => 
      idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
    );
    await AsyncStorage.setItem(IDEAS_KEY, JSON.stringify(updatedIdeas));
    return true;
  } catch (error) {
    console.error('Error voting for idea:', error);
    throw error;
  }
};

export const getUserVotes = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(VOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting user votes:', error);
    return [];
  }
};

export const generateAIRating = (): number => {
  return Math.floor(Math.random() * 101);
};