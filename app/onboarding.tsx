import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Onboarding from "../components/Onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleOnboardingComplete = async () => {
    try {
      // Save that onboarding is completed
      await AsyncStorage.setItem("@onboarding_completed", "true");

      // Navigate to the appropriate screen
      // This will trigger the useEffect in index.tsx which will
      // redirect based on the updated onboarding status
      router.replace("/auth");
    } catch (error) {
      console.error("Failed to save onboarding status", error);
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding onComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
