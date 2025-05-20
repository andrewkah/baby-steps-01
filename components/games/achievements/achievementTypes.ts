export interface AchievementDefinition {
  id: string; // uuid
  name: string;
  description: string;
  icon_name: string; // e.g., 'star', 'trophy-outline'
  activity_type: string; // e.g., 'counting_game_stage_complete', 'counting_game_score'
  points: number;
  // Add a trigger condition, could be a value or a specific ID
  // For 'counting_game_stage_complete', trigger_value could be the stage ID
  // For 'counting_game_score', trigger_value could be the score threshold
  trigger_value?: number | string; 
  created_at?: string;
}

export interface ChildAchievement {
  id: string; // uuid
  child_id: string; // uuid
  achievement_id: string; // uuid
  earned_at: string;
  created_at?: string;
}