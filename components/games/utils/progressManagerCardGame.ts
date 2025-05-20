import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for the game state that needs to be persisted
export interface CardGameState {
  matchedValues: string[]; // Values of cards that have been matched
  moves: number;
  gameStartTime: number;
  childId: string;
}

// Default empty game state
export const DEFAULT_GAME_STATE: CardGameState = {
  matchedValues: [],
  moves: 0,
  gameStartTime: Date.now(),
  childId: 'default'
};

/**
 * Get the storage key for a specific child
 */
const getStorageKey = (childId: string): string => {
  return `@BabySteps:CardGame:${childId}`;
};

/**
 * Load saved game state from AsyncStorage
 */
export const loadGameState = async (childId: string): Promise<CardGameState | null> => {
  if (!childId) {
    console.warn('No child ID provided for loading card game state');
    return null;
  }

  try {
    const key = getStorageKey(childId);
    const savedState = await AsyncStorage.getItem(key);
    
    if (savedState) {
      const parsedState = JSON.parse(savedState) as CardGameState;
      
      // Validate the state belongs to this child
      if (parsedState.childId !== childId) {
        console.warn('Game state childId mismatch, returning null');
        return null;
      }
      
      return parsedState;
    }
    
    return null; // No saved state found
  } catch (error) {
    console.error('Failed to load card game state:', error);
    return null;
  }
};

/**
 * Save game state to AsyncStorage
 */
export const saveGameState = async (
  state: CardGameState,
  childId: string
): Promise<void> => {
  if (!childId) {
    console.warn('No child ID provided for saving card game state, aborting');
    return;
  }

  try {
    // Ensure the state has the correct childId
    const updatedState = {
      ...state,
      childId // Always ensure the childId is set correctly
    };
    
    const key = getStorageKey(childId);
    await AsyncStorage.setItem(key, JSON.stringify(updatedState));
    console.log(`Saved card game state for child: ${childId}`);
  } catch (error) {
    console.error('Failed to save card game state:', error);
  }
};

/**
 * Clear saved game state (e.g. when starting a new game)
 */
export const clearGameState = async (childId: string): Promise<void> => {
  if (!childId) return;
  
  try {
    const key = getStorageKey(childId);
    await AsyncStorage.removeItem(key);
    console.log(`Cleared card game state for child: ${childId}`);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};