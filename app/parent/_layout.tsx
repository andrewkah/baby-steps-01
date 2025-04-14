import { Stack } from "expo-router";
import { LanguageProvider } from '@/context/languageContext'; // Adjust the import based on your actual path

export default function OnboardingLayout() {
  return (
    <LanguageProvider>
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
          name="child-progress"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </LanguageProvider>
  );
}
