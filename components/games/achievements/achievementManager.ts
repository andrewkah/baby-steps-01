import { supabase } from '@/lib/supabase';
import { AchievementDefinition, ChildAchievement } from './achievementTypes';
import { CountingGameProgress, saveGameProgress } from '../utils/progressManagerCountingGame'; // Adjust path

// --- Supabase Functions ---

export const fetchAllDefinedAchievements = async (): Promise<AchievementDefinition[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('points', { ascending: true }); // Or any other order

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
    .single(); // Assuming you want the inserted row back

  if (error) {
    console.error('Error awarding achievement:', error);
    return null;
  }
  console.log('Achievement awarded:', data);
  return data;
};


// --- Logic for Checking and Granting ---

interface CheckAchievementsArgs {
  childId: string;
  gameProgress: CountingGameProgress;
  definedAchievements: AchievementDefinition[];
  earnedAchievementIds: string[]; // Just IDs for quick lookup
  // Optional: specific event data
  event?: { type: 'stage_completed'; stageId: number } | { type: 'score_updated' };
}

/**
 * Checks for and awards new achievements.
 * Returns an array of newly earned achievements.
 */
export const checkAndGrantNewAchievements = async ({
  childId,
  gameProgress,
  definedAchievements,
  earnedAchievementIds,
  event,
}: CheckAchievementsArgs): Promise<AchievementDefinition[]> => {
  const newlyEarned: AchievementDefinition[] = [];

  for (const achDef of definedAchievements) {
    if (earnedAchievementIds.includes(achDef.id)) {
      continue; // Already earned
    }

    let shouldAward = false;

    // Example Achievement Logic (EXPAND THIS BASED ON YOUR `achievements` table data)
    switch (achDef.activity_type) {
      case 'counting_game_stage_complete':
        if (event?.type === 'stage_completed' && achDef.trigger_value === event.stageId) {
          shouldAward = true;
        } else if (gameProgress.completedStages.includes(Number(achDef.trigger_value))) {
          // General check if not event-driven
          shouldAward = true;
        }
        break;
      case 'counting_game_score':
        if (achDef.trigger_value && gameProgress.totalScore >= Number(achDef.trigger_value)) {
          shouldAward = true;
        }
        break;
      case 'counting_game_first_play': // Example: Awarded on first level completion of stage 1
        if (event?.type === 'stage_completed' && event.stageId === 1 && gameProgress.completedStages.includes(1)) {
            // More specific: if this is the *first time* stage 1 is completed.
            // This might need more complex tracking or be tied to the very first save.
            // For simplicity, let's say completing stage 1 once gets it.
            shouldAward = true;
        }
        break;
      // Add more cases for different achievement types
    }

    if (shouldAward) {
      const awarded = await awardAchievementToChild(childId, achDef.id);
      if (awarded) {
        newlyEarned.push(achDef);
        // Optionally, update gameProgress totalScore here immediately
        // gameProgress.totalScore += achDef.points;
        // await saveGameProgress(gameProgress, childId); // Be careful with multiple saves
      }
    }
  }
  return newlyEarned;
};