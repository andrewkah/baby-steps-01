import AsyncStorage from "@react-native-async-storage/async-storage"

// Define key prefixes for different game types
export const STORAGE_KEYS = {
  COUNTING_GAME: "counting_game_",
  CARDS_MATCHING: "cards_matching_",
  PUZZLE_GAME: "puzzle_game_",
  LEARNING_GAME: "learning_game_",
  CHILD_PROGRESS: "child_progress_",
  ACTIVITIES: "activities_",
}

// Generic function to save game progress
export const saveGameProgress = async (childId: string, gameType: string, data: any): Promise<void> => {
  try {
    const key = `${gameType}${childId}`
    await AsyncStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${gameType} progress:`, error)
  }
}

// Generic function to load game progress
export const loadGameProgress = async <T>(
  childId: string,
  gameType: string,
  defaultValue: T
)
: Promise<T> =>
{
  try {
    const key = `${gameType}${childId}`
    const data = await AsyncStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${gameType} progress:`, error)
    return defaultValue;
  }
}

// Function to save activities
export const saveActivityToStorage = async (childId: string, activity: any): Promise<void> => {
  try {
    // Get existing activities
    const key = `${STORAGE_KEYS.ACTIVITIES}${childId}`
    const existingActivitiesJson = await AsyncStorage.getItem(key)
    const existingActivities = existingActivitiesJson ? JSON.parse(existingActivitiesJson) : []

    // Add new activity to the beginning of the array
    const updatedActivities = [activity, ...existingActivities]

    // Limit to last 50 activities to prevent storage issues
    const limitedActivities = updatedActivities.slice(0, 50)

    // Save back to storage
    await AsyncStorage.setItem(key, JSON.stringify(limitedActivities))
  } catch (error) {
    console.error("Error saving activity:", error)
  }
}

// Function to load activities
export const loadActivities = async (childId: string): Promise<any[]> => {
  try {
    const key = `${STORAGE_KEYS.ACTIVITIES}${childId}`
    const activitiesJson = await AsyncStorage.getItem(key)
    return activitiesJson ? JSON.parse(activitiesJson) : []
  } catch (error) {
    console.error("Error loading activities:", error)
    return []
  }
}

// Function to update child's overall progress
export const updateChildProgress = async (childId: string, progressData: any): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.CHILD_PROGRESS}${childId}`

    // Get existing progress
    const existingProgressJson = await AsyncStorage.getItem(key)
    const existingProgress = existingProgressJson ? JSON.parse(existingProgressJson) : {}

    // Merge with new progress data
    const updatedProgress = {
      ...existingProgress,
      ...progressData,
      lastUpdated: new Date().toISOString(),
    }

    await AsyncStorage.setItem(key, JSON.stringify(updatedProgress))
  } catch (error) {
    console.error("Error updating child progress:", error)
  }
}

// Function to get child's overall progress
export const getChildProgress = async (childId: string): Promise<any> => {
  try {
    const key = `${STORAGE_KEYS.CHILD_PROGRESS}${childId}`
    const progressJson = await AsyncStorage.getItem(key)
    return progressJson ? JSON.parse(progressJson) : {}
  } catch (error) {
    console.error("Error getting child progress:", error)
    return {}
  }
}

// Function to clear all game data for a child
export const clearChildData = async (childId: string): Promise<void> => {
  try {
    const keys = [
      `${STORAGE_KEYS.COUNTING_GAME}${childId}`,
      `${STORAGE_KEYS.CARDS_MATCHING}${childId}`,
      `${STORAGE_KEYS.PUZZLE_GAME}${childId}`,
      `${STORAGE_KEYS.LEARNING_GAME}${childId}`,
      `${STORAGE_KEYS.CHILD_PROGRESS}${childId}`,
      `${STORAGE_KEYS.ACTIVITIES}${childId}`,
    ]

    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)))
  } catch (error) {
    console.error("Error clearing child data:", error)
  }
}
