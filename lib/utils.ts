import AsyncStorage from "@react-native-async-storage/async-storage";

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
