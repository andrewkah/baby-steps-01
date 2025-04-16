import React, { useState, useEffect } from 'react';
import { useChild } from '@/context/ChildContext';
import { saveActivity } from '@/lib/utils';

interface CountingGameTrackerProps {
  gameId: string;
  gameName: string;
  stage: number;
  level: number;
  totalLevels: number;
  correctAnswers: number;
  totalQuestions: number;
  children: React.ReactNode;
}

export const CountingGameTracker: React.FC<CountingGameTrackerProps> = ({
  gameId,
  gameName,
  stage,
  level,
  totalLevels,
  correctAnswers,
  totalQuestions,
  children
}) => {
  const { activeChild } = useChild();
  const [startTime] = useState(Date.now());
  const [hasTrackedLevel, setHasTrackedLevel] = useState(false);

  useEffect(() => {
    const trackProgress = async () => {
      if (!activeChild || hasTrackedLevel || totalQuestions === 0) return;

      // Track progress when all questions in a level are answered
      const duration = Math.round((Date.now() - startTime) / 1000);
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

      await saveActivity({
        child_id: activeChild.id,
        activity_type: 'counting',
        activity_name: `${gameName} - Stage ${stage}, Level ${level}`,
        score: `${accuracy}%`,
        duration,
        completed_at: new Date().toISOString(),
        details: `Completed level ${level} with ${correctAnswers}/${totalQuestions} correct answers`,
        stage,
        level
      });
      
      setHasTrackedLevel(true);

      // If this is the last level in the stage, record stage completion
      if (level === totalLevels) {
        await saveActivity({
          child_id: activeChild.id,
          activity_type: 'counting',
          activity_name: `Completed ${gameName} Stage ${stage}`,
          completed_at: new Date().toISOString(),
          details: `Completed all ${totalLevels} levels in stage ${stage}`,
          stage,
          level: totalLevels
        });
      }
    };

    trackProgress();
  }, [
    correctAnswers,
    totalQuestions,
    activeChild,
    gameId,
    gameName,
    stage,
    level,
    totalLevels,
    startTime,
    hasTrackedLevel
  ]);

  // Reset tracking when level changes
  useEffect(() => {
    setHasTrackedLevel(false);
  }, [level]);

  return <>{children}</>;
};

export default CountingGameTracker;