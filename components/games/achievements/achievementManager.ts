import { supabase } from '@/lib/supabase';
import { AchievementDefinition, ChildAchievement } from './achievementTypes';
import { UserStats as LugandaLearningUserStats } from '../utils/progressManagerLugandaLearning'; 
import { CountingGameProgress, saveGameProgress } from '../utils/progressManagerCountingGame'; // Adjust path

// --- Supabase Functions ---

export const fetchAllDefinedAchievements = async (gameKey?: string): Promise<AchievementDefinition[]> => {
  let query = supabase.from('achievements').select('*');
  if (gameKey) {
    query = query.eq('game_key', gameKey);
  }
  query = query.order('points', { ascending: true });
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching defined achievements:', error);
    return [];
  }
  return data || [];
};

export const fetchChildEarnedAchievements = async (childId: string): Promise<ChildAchievement[]> => {
  if (!childId) return [];
  const { data, error } = await supabase
    .from('child_achievements')
    .select('*')
    .eq('child_id', childId);

  if (error) {
    console.error('Error fetching child achievements:', error);
    return [];
  }
  return data || [];
};

export const awardAchievementToChild = async (
  childId: string,
  achievementId: string
): Promise<ChildAchievement | null> => {
  if (!childId || !achievementId) return null;

  const { data, error } = await supabase
    .from('child_achievements')
    .insert([{ child_id: childId, achievement_id: achievementId }])
    .select()
    .single(); 

  if (error) {
    console.error('Error awarding achievement:', error);
    // Check for unique constraint violation specifically if you added it
    if (error.code === '23505') { // PostgreSQL unique violation error code
        console.warn(`Attempted to award already earned achievement (ID: ${achievementId}) to child ${childId}. Constraint prevented duplicate.`);
        // Find the existing record to return, so the calling function thinks it "succeeded" in a way
        const existing = await supabase.from('child_achievements').select('*').eq('child_id', childId).eq('achievement_id', achievementId).single();
        return existing.data;
    }
    return null;
  }
  console.log('Achievement awarded:', data);
  return data;
};


// --- Logic for Checking and Granting ---

interface GameSpecificProgress {
    // For Luganda Learning Game
    totalScore?: number;
    completedLevels?: number[]; // IDs of completed levels
    completedStages?: number[]; // IDs of completed stages (derived or explicitly tracked)
    userStats?: LugandaLearningUserStats; // from LugandaLearningGame's progress
}

interface CheckAchievementsArgs {
  childId: string;
  // gameProgress: any; // Or a union type of all possible game progress structures
  definedAchievements: AchievementDefinition[];
  earnedAchievementIds: string[];
  event: {
    type: // General event types
      | 'level_completed'
      | 'stage_completed'
      | 'score_updated'
      | 'stats_updated' // For things like total words, streak
      | 'level_perfect_clear'
      // Card Matching Game Specific Event Types
      | 'match_made'
      | 'game_completed' // For card matching
      | 'match_streak_achieved';
    gameKey: string; // e.g., 'luganda_learning_game', 'counting_game'
    // Game-specific data carried by the event
    levelId?: number;
    stageId?: number;
    newTotalScore?: number;
    currentLevelScore?: number; // for perfect clear
    currentLevelMaxScore?: number; // for perfect clear
    currentUserStats?: LugandaLearningUserStats; // For Luganda Learning game
    // Card Matching Game specific event data
    moves?: number;                       // For game_completed, matching_game_low_moves
    durationSeconds?: number;             // For game_completed, matching_game_quick_time
    matchedCardValue?: string;            // For match_made, matching_game_specific_match
    streakCount?: number;                 // For matching_game_match_streak
    totalPairsMatchedAcrossGames?: number; // For matching_game_total_pairs (if tracked)
    // isFirstMatchEver?: boolean; // For matching_game_first_match (alternative to just awarding once)
    // isFirstGameEverCompleted?: boolean; // For matching_game_first_play
  };
}

/**
 * Checks for and awards new achievements.
 * Returns an array of newly earned achievements.
 */
export const checkAndGrantNewAchievements = async ({
  childId,
  // gameProgress, // We'll primarily use event.gameData
  definedAchievements,
  earnedAchievementIds,
  event,
}: CheckAchievementsArgs): Promise<AchievementDefinition[]> => {
  const newlyEarned: AchievementDefinition[] = [];
  
  // Filter definedAchievements to only those matching the event's gameKey
  const gameSpecificDefinedAchievements = definedAchievements.filter(
    achDef => achDef.game_key === event.gameKey || !achDef.game_key // Also include generic achievements if any
  );

  for (const achDef of gameSpecificDefinedAchievements) {
    if (earnedAchievementIds.includes(achDef.id)) {
      continue; // Already earned
    }

    let shouldAward = false;

    // Logic for Luganda Learning Game achievements
    if (event.gameKey === 'luganda_learning_game') {
      switch (achDef.activity_type) {
        case 'language_level_complete':
          // Assuming levelId and trigger_value are numbers for this type
          if (event.type === 'level_completed' && event.levelId === Number(achDef.trigger_value)) {
            shouldAward = true;
          }
          break;
        case 'language_stage_complete':
          // Assuming stageId and trigger_value are numbers for this type
          if (event.type === 'stage_completed' && event.stageId === Number(achDef.trigger_value)) {
            shouldAward = true;
          }
          break;
        case 'language_total_words_learned':
          if (event.currentUserStats?.totalWords !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined &&
              event.currentUserStats.totalWords >= Number(achDef.trigger_value)) { // Convert to Number
            shouldAward = true;
          }
          break;
        case 'language_total_score_reach':
          if (event.newTotalScore !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined &&
              event.newTotalScore >= Number(achDef.trigger_value)) { // Convert to Number
            shouldAward = true;
          }
          break;
        case 'language_level_perfect_quiz':
            if (event.type === 'level_perfect_clear' && event.currentLevelScore !== undefined && event.currentLevelMaxScore !== undefined && event.currentLevelScore === event.currentLevelMaxScore) {
                if (achDef.trigger_value === null || achDef.trigger_value === undefined || Number(achDef.trigger_value) === event.levelId) { // Also convert here if trigger_value can be a level ID
                    shouldAward = true;
                }
            }
            break;
        case 'language_streak_days':
          if (event.currentUserStats?.streakDays !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined &&
              event.currentUserStats.streakDays >= Number(achDef.trigger_value)) { // Convert to Number
            shouldAward = true;
          }
          break;
      }
    }
    // Add 'else if (event.gameKey === 'counting_game')' block here for counting game achievements
    // based on your previous logic, adapting to the new event structure.
    else if (event.gameKey === 'counting_game') {
        switch (achDef.activity_type) {
          case 'counting_game_stage_complete': // from your earlier code
            // Assuming trigger_value is stage ID (number)
            if (event.type === 'stage_completed' && event.stageId === Number(achDef.trigger_value)) {
              shouldAward = true;
            }
            break;
          case 'counting_game_score': // from your earlier code, ensure this matches SQL
            // Assuming trigger_value is score threshold (number)
            if (event.newTotalScore !== undefined && 
                achDef.trigger_value !== null && achDef.trigger_value !== undefined &&
                event.newTotalScore >= Number(achDef.trigger_value)) {
                shouldAward = true;
            }
            break;
          // ... other counting game cases
        }
    }

    else if (event.gameKey === 'card_matching_game') {
      switch (achDef.activity_type) {
        case 'matching_game_first_match':
          if (event.type === 'match_made') {
            shouldAward = true;
          }
          break;
        case 'matching_game_first_play':
            if (event.type === 'game_completed') {
                shouldAward = true;
            }
            break;
        case 'matching_game_complete':
          if (event.type === 'game_completed') {
            shouldAward = true;
          }
          break;
        case 'matching_game_low_moves':
          if (event.type === 'game_completed' && event.moves !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined && // Check for null and undefined
              event.moves <= Number(achDef.trigger_value)) { // Convert to Number for comparison
            shouldAward = true;
          }
          break;
        case 'matching_game_quick_time':
          if (event.type === 'game_completed' && event.durationSeconds !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined && 
              event.durationSeconds <= Number(achDef.trigger_value)) { // Convert to Number for comparison
            shouldAward = true;
          }
          break;
        case 'matching_game_match_streak':
          if (event.type === 'match_streak_achieved' && event.streakCount !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined && 
              event.streakCount >= Number(achDef.trigger_value)) { // Convert to Number for comparison
            shouldAward = true;
          }
          break;
        case 'matching_game_specific_match_kabaka': // Specific activity type
          if (event.type === 'match_made' && event.matchedCardValue === 'Kabaka') {
            shouldAward = true;
          }
          break;
        // Add more specific match cases if needed:
        // case 'matching_game_specific_match_lubiri':
        //   if (event.type === 'match_made' && event.matchedCardValue === 'Lubiri') {
        //     shouldAward = true;
        //   }
        //   break;
        case 'matching_game_total_pairs':
          if (event.type === 'stats_updated' && event.totalPairsMatchedAcrossGames !== undefined && 
              achDef.trigger_value !== null && achDef.trigger_value !== undefined && 
              event.totalPairsMatchedAcrossGames >= Number(achDef.trigger_value)) { // Convert to Number for comparison
            shouldAward = true;
          }
          break;
      }
    }

    if (shouldAward) {
      const awarded = await awardAchievementToChild(childId, achDef.id);
      if (awarded) {
        newlyEarned.push(achDef);
      }
    }
  }
  return newlyEarned;
};