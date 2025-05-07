import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { saveActivityToStorage, updateChildProgress } from "@/utils/storage"

// Activity type definitions
export interface GameActivity {
  id?: string;
  child_id: string;
  activity_type: 'counting' | 'language' | 'cultural' | 'stories' | 'museum' | 'other' | 'words' | 'puzzle';
  activity_name: string;
  score?: number | string;
  duration?: number;
  completed_at: string;
  details?: string;
  stage?: number;
  level?: number;
}

interface Activity {
  child_id: string;
  activity_type: 'stories' | 'counting' | 'museum' | 'other' | 'cultural' | 'words' | 'puzzle' | 'language';
  activity_name: string;
  score?: string;
  duration?: number;
  completed_at: string;
  details?: string;
  stage?: number;
  level?: number;
}

/**
 * Save activity to Supabase
 */
export const saveNewActivity = async (activity: Activity): Promise<boolean> => {
  try {
    // Get child's name first
    const { data: childData } = await supabase
      .from('children')
      .select('name')
      .eq('id', activity.child_id)
      .single();

    if (!childData) {
      console.error('Child not found');
      return false;
    }

    // Add child's name to activity details
    const activityWithChildName = {
      ...activity,
      details: `${childData.name} ${activity.details || ''}`
    };

    const { error } = await supabase
      .from('activities')
      .insert([activityWithChildName]);

    if (error) {
      console.error('Error saving activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveActivity:', error);
    return false;
  }
};

/**
 * Get child's activities
 */
export const getChildActivities = async (childId: string) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

/**
 * Reset onboarding status for testing purposes
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("@onboarding_completed");
    console.log("Onboarding status reset successfully");
  } catch (error) {
    console.error("Failed to reset onboarding status", error);
  }
};

/**
 * Check if onboarding has been completed
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem("@onboarding_completed");
    return value === "true";
  } catch (error) {
    console.error("Failed to get onboarding status", error);
    return false;
  }
};

/**
 * Get formatted recent activities for parent dashboard
 */
export const getFormattedActivities = async (activities: Activity[]) => {
  // Get all unique child IDs from activities
  const childIds = [...new Set(activities.map(a => a.child_id))];
  
  // Fetch all child names at once
  const { data: childrenData } = await supabase
    .from('children')
    .select('id, name')
    .in('id', childIds);

  // Create a map of child IDs to names
  const childNames = (childrenData || []).reduce((map, child) => {
    map[child.id] = child.name;
    return map;
  }, {} as Record<string, string>);

  return activities.map(activity => {
    let icon = 'star'; // default
    let color = '#FF9F43'; // default orange

    // Determine icon and color based on activity type
    switch (activity.activity_type) {
      case 'stories':
        icon = 'book';
        color = '#6C5CE7'; // purple
        break;
      case 'counting':
        icon = 'calculator';
        color = '#1DD1A1'; // green
        break;
      case 'museum':
        icon = 'university';
        color = '#FF6B6B'; // red
        break;
      case 'other':
        icon = 'award';
        color = '#54A0FF'; // blue
        break;
    }

    // Format relative time
    const date = new Date(activity.completed_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let timeDisplay;
    if (diffDays === 0) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      timeDisplay = `${hours}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
    } else if (diffDays === 1) {
      timeDisplay = 'Yesterday';
    } else if (diffDays <= 7) {
      timeDisplay = `${diffDays} days ago`;
    } else {
      timeDisplay = date.toLocaleDateString();
    }

    const childName = childNames[activity.child_id] || 'Unknown Child';

    return {
      id: Math.random().toString(),
      icon,
      color,
      childId: activity.child_id,
      childName,
      category: activity.activity_type,
      activity: activity.activity_name,
      time: timeDisplay,
      date: date.toLocaleDateString(),
      score: activity.score || 'Completed',
      details: activity.details
    };
  });
};

/**
 * Get summary statistics for a child's activities
 */
export const getActivityStats = async (childId: string) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('child_id', childId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // Get activities from last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
    const recentActivities = data.filter(activity => 
      new Date(activity.completed_at) >= sevenDaysAgo
    );

    // Calculate daily activity minutes
    const dailyMinutes = new Array(7).fill(0);
    recentActivities.forEach(activity => {
      if (activity.duration) {
        const date = new Date(activity.completed_at);
        const dayIndex = 6 - Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyMinutes[dayIndex] += Math.round(activity.duration / 60);
        }
      }
    });

    // Calculate completion rates
    const totalActivities = data.length;
    const completedWithScore = data.filter(a => a.score).length;
    const averageScore = data
      .filter(a => a.score)
      .reduce((acc, curr) => {
        const score = parseInt(curr.score!.replace('%', ''));
        return acc + (isNaN(score) ? 0 : score);
      }, 0) / (completedWithScore || 1);

    return {
      dailyMinutes,
      totalActivities,
      averageScore: Math.round(averageScore),
      recentActivities: getFormattedActivities(recentActivities.slice(0, 5)) // Get 5 most recent
    };
  } catch (error) {
    console.error('Error getting activity stats:', error);
    return null;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Interface for activity data
export interface ActivityData {
  child_id: string
  activity_type: "counting" | "cultural" | "puzzle" | "language"
  activity_name: string
  score: string
  duration?: number
  completed_at: string
  details?: string
  level?: number
  stage?: number
}

// Save activity and update child progress
export const saveActivity = async (activityData: ActivityData): Promise<void> => {
  try {
    if (!activityData.child_id) {
      console.error("No child ID provided for activity")
      return
    }

    // Add timestamp if not provided
    if (!activityData.completed_at) {
      activityData.completed_at = new Date().toISOString()
    }

    // Save activity to storage
    await saveActivityToStorage(activityData.child_id, activityData)

    // Update child's overall progress based on activity type
    const progressUpdate: any = {}

    switch (activityData.activity_type) {
      case "counting":
        progressUpdate.countingGameProgress = {
          lastPlayed: activityData.completed_at,
          lastScore: activityData.score,
          level: activityData.level || 1,
        }
        break
      case "cultural":
        progressUpdate.culturalGameProgress = {
          lastPlayed: activityData.completed_at,
          lastScore: activityData.score,
          level: activityData.level || 1,
        }
        break
      case "puzzle":
        progressUpdate.puzzleGameProgress = {
          lastPlayed: activityData.completed_at,
          lastScore: activityData.score,
          level: activityData.level || 1,
        }
        break
      case "language":
        progressUpdate.languageGameProgress = {
          lastPlayed: activityData.completed_at,
          lastScore: activityData.score,
          level: activityData.level || 1,
          stage: activityData.stage || 1,
        }
        break
    }

    // Update child's overall progress
    await updateChildProgress(activityData.child_id, progressUpdate)
  } catch (error) {
    console.error("Error saving activity:", error)
  }
}

// Calculate child's overall level based on game progress
export const calculateChildLevel = async (childId: string): Promise<number> => {
  try {
    // Get all game progress for the child
    const countingKey = `counting_game_${childId}`
    const culturalKey = `cards_matching_${childId}`
    const puzzleKey = `puzzle_game_${childId}`
    const languageKey = `learning_game_${childId}`

    const [countingData, culturalData, puzzleData, languageData] = await Promise.all([
      AsyncStorage.getItem(countingKey),
      AsyncStorage.getItem(culturalKey),
      AsyncStorage.getItem(puzzleKey),
      AsyncStorage.getItem(languageKey),
    ])

    // Parse data and extract levels
    const countingLevel = countingData ? JSON.parse(countingData).level || 1 : 1
    const culturalLevel = culturalData ? JSON.parse(culturalData).level || 1 : 1
    const puzzleLevel = puzzleData ? JSON.parse(puzzleData).level || 1 : 1
    const languageLevel = languageData ? JSON.parse(languageData).level || 1 : 1

    // Calculate average level (weighted if needed)
    const totalLevel = countingLevel + culturalLevel + puzzleLevel + languageLevel
    const averageLevel = Math.ceil(totalLevel / 4)

    return averageLevel
  } catch (error) {
    console.error("Error calculating child level:", error)
    return 1 // Default level
  }
}

// Get formatted date string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Get time ago string (e.g., "2 hours ago")
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}
