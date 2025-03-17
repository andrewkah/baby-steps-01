import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Text, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font"; // Change to useFonts hook
import "@/global.css";
import { SplashScreen } from "expo-router"; // For handling splash screen

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Use the useFonts hook instead of loadAsync
  const [fontsLoaded] = useFonts({
    "Atma-Bold": require("../assets/fonts/Atma-Bold.ttf"),
    "Atma-Light": require("../assets/fonts/Atma-Light.ttf"),
    "Atma-Medium": require("../assets/fonts/Atma-Medium.ttf"),
    "Atma-Regular": require("../assets/fonts/Atma-Regular.ttf"),
    "Atma-SemiBold": require("../assets/fonts/Atma-SemiBold.ttf"),
  });

  // Add a function to check onboarding status
  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("@onboarding_completed");
      setShowOnboarding(value !== "true");
    } catch (error) {
      console.error("Failed to get onboarding status", error);
      setShowOnboarding(true);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await checkOnboardingStatus();

      // Check Supabase session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      setIsLoading(false);
    };

    initApp();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Hide splash screen once fonts are loaded AND app initialization is complete
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Handle routing based on authentication and onboarding state
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    // Only redirect if we're on the root ("/") to avoid redirect loops
    if (pathname === "/") {
      if (showOnboarding) {
        router.replace("/onboarding");
      } else if (session) {
        router.replace("/profile");
      } else {
        router.replace("/login");
      }
    }
  }, [isLoading, fontsLoaded, showOnboarding, session, pathname]);

  // Return null until everything is ready
  if (!fontsLoaded || isLoading) {
    return null; // This keeps the splash screen visible
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontFamily: "Atma-Medium" }, // Use Atma for headers
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Sign Up",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Forgot password",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Welcome",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
        
      />
      <Stack.Screen
        name="CalendarTrackingPage"
        options={{
          title: "Dashboard",
          headerShown: false,
        }}
        
      />
      <Stack.Screen
        name="parent-gate"
        options={{
          title: "Parent Gate",
          headerShown: false,
        }}
        />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
