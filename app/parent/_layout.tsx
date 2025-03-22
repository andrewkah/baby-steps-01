import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-child"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CalendarTrackingPage"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="child-progress"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RankingsPage"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
