import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Text, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, usePathname } from "expo-router";
import "@/global.css";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

  // Handle routing based on authentication and onboarding state
  useEffect(() => {
    if (isLoading) return;

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
  }, [isLoading, showOnboarding, session, pathname]);

  // Show loading while we're determining app state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
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
          headerShown: true,
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
