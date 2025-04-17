import React, { useState, useEffect } from 'react';
import { useChild } from '@/context/ChildContext';
import { saveActivity } from '@/lib/utils';

interface GameProgressTrackerProps {
  gameId: string;
  gameName: string;
  totalArtworks: number;
  viewedArtworks: number;
  score: number;
  children: React.ReactNode;
}

export const GameProgressTracker: React.FC<GameProgressTrackerProps> = ({
  gameId,
  gameName,
  totalArtworks,
  viewedArtworks,
  score,
  children
}) => {
  const { activeChild } = useChild();
  const [startTime] = useState(Date.now());
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);

  useEffect(() => {
    const trackProgress = async () => {
      if (!activeChild || hasTrackedCompletion) return;

      // Consider game complete when all artworks are viewed
      if (viewedArtworks === totalArtworks) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const accuracy = Math.round((score / (totalArtworks * 100)) * 100); // Assuming max score per artwork is 100

        await saveActivity({
          child_id: activeChild.id,
          activity_type: 'museum',
          activity_name: `Completed "${gameName}"`,
          score: `${accuracy}%`,
          duration,
          completed_at: new Date().toISOString(),
          details: `Explored ${viewedArtworks} artworks with ${accuracy}% accuracy`
        });
        
        setHasTrackedCompletion(true);
      }
    };

    trackProgress();
  }, [viewedArtworks, totalArtworks, activeChild, gameId, gameName, startTime, hasTrackedCompletion, score]);

  return <>{children}</>;
};

export default GameProgressTracker;