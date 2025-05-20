// features/achievements/useAchievements.ts
import { useState, useEffect, useCallback } from 'react';
import { useChild } from '@/context/ChildContext';
import {
  fetchAllDefinedAchievements,
  fetchChildEarnedAchievements,
  checkAndGrantNewAchievements as checkAndGrantNewAchievementsLogic,
} from './achievementManager';
import { AchievementDefinition, ChildAchievement } from './achievementTypes';
import { CountingGameProgress } from '../utils/progressManagerCountingGame'; // Adjust path as needed

export const useAchievements = (specificChildId?: string) => { // Add optional specificChildId
  const { activeChild } = useChild();
  // Prioritize specificChildId if provided, otherwise use activeChild from context
  const childIdToFetchFor = specificChildId || activeChild?.id;

  const [definedAchievements, setDefinedAchievements] = useState<AchievementDefinition[]>([]);
  const [earnedChildAchievements, setEarnedChildAchievements] = useState<ChildAchievement[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

  const loadInitialAchievements = useCallback(async () => {
    if (!childIdToFetchFor) { // Use the determined childId
      setIsLoadingAchievements(false);
      setDefinedAchievements([]);
      setEarnedChildAchievements([]);
      return;
    }
    setIsLoadingAchievements(true);
    try {
      const [allDefs, childEarned] = await Promise.all([
        fetchAllDefinedAchievements(),
        fetchChildEarnedAchievements(childIdToFetchFor), // Fetch for the determined childId
      ]);
      setDefinedAchievements(allDefs);
      setEarnedChildAchievements(childEarned);
    } catch (error) {
      console.error("Failed to load achievements data:", error);
      // Optionally set empty arrays on error to prevent UI issues
      setDefinedAchievements([]);
      setEarnedChildAchievements([]);
    } finally {
      setIsLoadingAchievements(false);
    }
  }, [childIdToFetchFor]); // Depend on childIdToFetchFor

  useEffect(() => {
    loadInitialAchievements();
  }, [loadInitialAchievements]);

  const checkAndGrantNewAchievements = useCallback(
    async (
      gameProgress: CountingGameProgress, // This argument implies it's used within a game context
      event?: { type: 'stage_completed'; stageId: number } | { type: 'score_updated' }
    ): Promise<AchievementDefinition[]> => {
      // This function is more relevant for game screens.
      // For displaying on a profile, we mainly need the fetched data.
      // Ensure childIdToFetchFor is valid if this function were to be used from a context where specificChildId is relevant
      const currentChildId = specificChildId || activeChild?.id;
      if (!currentChildId || isLoadingAchievements || !definedAchievements.length) {
        return [];
      }

      const earnedIds = earnedChildAchievements.map(ach => ach.achievement_id);
      const newlyEarned = await checkAndGrantNewAchievementsLogic({
        childId: currentChildId,
        gameProgress,
        definedAchievements,
        earnedAchievementIds: earnedIds,
        event,
      });

      if (newlyEarned.length > 0) {
        // Re-fetch to update the earnedChildAchievements list
        if (childIdToFetchFor) { // Re-fetch for the specific child if one was provided
            const updatedEarned = await fetchChildEarnedAchievements(childIdToFetchFor);
            setEarnedChildAchievements(updatedEarned);
        }
      }
      return newlyEarned;
    },
    [activeChild, specificChildId, definedAchievements, earnedChildAchievements, isLoadingAchievements, childIdToFetchFor]
  );

  return {
    definedAchievements,
    earnedChildAchievements,
    isLoadingAchievements,
    checkAndGrantNewAchievements, // Keep for completeness, though not directly used for display on this screen
    refreshAchievements: loadInitialAchievements,
  };
};