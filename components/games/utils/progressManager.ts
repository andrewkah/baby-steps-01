// progressManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stage, Level, LUGANDA_STAGES } from './lugandawords';

// Keys for AsyncStorage
const SCORE_KEY = 'luganda_total_score';
const COMPLETED_LEVELS_KEY = 'luganda_completed_levels';
const STAGES_DATA_KEY = 'luganda_stages';
const USER_STATS_KEY = 'luganda_user_stats';

// User Statistics Interface
interface UserStats {
  totalWords: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastPlayed: string;
  streakDays: number;
}

// Default user stats
const DEFAULT_USER_STATS: UserStats = {
  totalWords: 0,
  correctAnswers: 0, 
  wrongAnswers: 0,
  lastPlayed: new Date().toISOString(),
  streakDays: 1
};

// Load user's game progress
export const loadGameProgress = async () => {
  try {
    const scoreData = await AsyncStorage.getItem(SCORE_KEY);
    const completedLevelsData = await AsyncStorage.getItem(COMPLETED_LEVELS_KEY);
    const stagesData = await AsyncStorage.getItem(STAGES_DATA_KEY);
    const userStatsData = await AsyncStorage.getItem(USER_STATS_KEY);
    
    return {
      totalScore: scoreData ? parseInt(scoreData) : 0,
      completedLevels: completedLevelsData ? JSON.parse(completedLevelsData) : [],
      stages: stagesData ? JSON.parse(stagesData) : LUGANDA_STAGES,
      userStats: userStatsData ? JSON.parse(userStatsData) : DEFAULT_USER_STATS,
    };
  } catch (error) {
    console.error('Error loading game progress', error);
    return {
      totalScore: 0,
      completedLevels: [],
      stages: LUGANDA_STAGES,
      userStats: DEFAULT_USER_STATS
    };
  }
};

// Save user's game progress
export const saveGameProgress = async (
  totalScore: number,
  completedLevels: number[],
  stages: Stage[],
  userStats: UserStats
) => {
  try {
    await AsyncStorage.setItem(SCORE_KEY, totalScore.toString());
    await AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completedLevels));
    await AsyncStorage.setItem(STAGES_DATA_KEY, JSON.stringify(stages));
    await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(userStats));
    return true;
  } catch (error) {
    console.error('Error saving game progress', error);
    return false;
  }
};

// Update user stats when completing a game session
export const updateUserStats = async (
  correctAnswers: number,
  wrongAnswers: number,
  wordsLearned: number
) => {
  try {
    // Get current stats
    const userStatsData = await AsyncStorage.getItem(USER_STATS_KEY);
    let userStats: UserStats = userStatsData ? JSON.parse(userStatsData) : DEFAULT_USER_STATS;
    
    // Check if the last played date was yesterday or earlier
    const lastPlayed = new Date(userStats.lastPlayed);
    const today = new Date();
    const isNewDay = 
      today.getDate() !== lastPlayed.getDate() || 
      today.getMonth() !== lastPlayed.getMonth() || 
      today.getFullYear() !== lastPlayed.getFullYear();
    
    // Update stats
    userStats = {
      totalWords: userStats.totalWords + wordsLearned,
      correctAnswers: userStats.correctAnswers + correctAnswers,
      wrongAnswers: userStats.wrongAnswers + wrongAnswers,
      lastPlayed: today.toISOString(),
      streakDays: isNewDay ? userStats.streakDays + 1 : userStats.streakDays
    };
    
    // Save updated stats
    await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(userStats));
    return userStats;
  } catch (error) {
    console.error('Error updating user stats', error);
    return null;
  }
};

// Reset all game progress (for testing or user-requested reset)
export const resetGameProgress = async () => {
  try {
    await AsyncStorage.removeItem(SCORE_KEY);
    await AsyncStorage.removeItem(COMPLETED_LEVELS_KEY);
    await AsyncStorage.removeItem(STAGES_DATA_KEY);
    await AsyncStorage.removeItem(USER_STATS_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting game progress', error);
    return false;
  }
};

// Check and unlock next level in a stage
export const unlockNextLevel = (
  currentStageId: number, 
  currentLevelId: number, 
  stages: Stage[]
): Stage[] => {
  const updatedStages = [...stages];
  const stageIndex = updatedStages.findIndex(stage => stage.id === currentStageId);
  
  if (stageIndex === -1) return updatedStages;
  
  const currentStage = updatedStages[stageIndex];
  const currentLevelIndex = currentStage.levels.findIndex(level => level.id === currentLevelId);
  
  if (currentLevelIndex !== -1 && currentLevelIndex < currentStage.levels.length - 1) {
    // Unlock the next level within this stage
    currentStage.levels[currentLevelIndex + 1].isLocked = false;
    updatedStages[stageIndex] = currentStage;
  }
  
  return updatedStages;
};

// Check if stage is completed and unlock next stage if applicable
export const checkAndUnlockNextStage = (
  currentStageId: number,
  completedLevels: number[],
  totalScore: number,
  stages: Stage[]
): Stage[] => {
  const updatedStages = [...stages];
  const currentStageIndex = updatedStages.findIndex(stage => stage.id === currentStageId);
  
  if (currentStageIndex === -1 || currentStageIndex >= updatedStages.length - 1) {
    return updatedStages;
  }
  
  const currentStage = updatedStages[currentStageIndex];
  const nextStage = updatedStages[currentStageIndex + 1];
  
  // Check if all levels in current stage are completed
  const allLevelsCompleted = currentStage.levels.every(level => 
    completedLevels.includes(level.id)
  );
  
  // Check if user has enough score to unlock next stage
  const hasEnoughScore = totalScore >= nextStage.requiredScore;
  
  if (allLevelsCompleted && hasEnoughScore) {
    // Unlock next stage
    nextStage.isLocked = false;
    
    // Unlock first level of next stage
    if (nextStage.levels.length > 0) {
      nextStage.levels[0].isLocked = false;
    }
    
    updatedStages[currentStageIndex + 1] = nextStage;
  }
  
  return updatedStages;
};