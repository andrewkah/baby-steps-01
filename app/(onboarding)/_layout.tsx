import { Stack } from "expo-router";
import { UserProvider } from "../../context/UserContext"; // adjust if needed

export default function OnboardingLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen 
        name="age" 
        options={{
          title: "What is your child's age?",
          headerShown: false,
        }}
        />
        <Stack.Screen name="reason" />
        <Stack.Screen name="final" />
      </Stack>

    </UserProvider>
  );
}
