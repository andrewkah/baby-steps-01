import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // This will run both on initial mount AND when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Child tabs screen focused - locking to landscape");
      const lockToLandscape = async () => {
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
          );
        } catch (error) {
          console.error("Failed to lock orientation:", error);
        }
      };

      lockToLandscape();

      // Cleanup function when screen loses focus
      return () => {
        console.log("Child screen unfocused");
        const resetOrientation = async () => {
          await ScreenOrientation.unlockAsync();
        };

        resetOrientation();
      };
    }, [])
  );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="parent-gate"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
