// import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetOnboardingStatus } from "@/lib/utils";
import { useRouter, useSegments } from "expo-router";

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development";

// Authentication context provider component
export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

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

    if (showOnboarding) {
      router.replace("/onboarding");
    } else if (session) {
      router.replace("/profile");
    } else {
      router.replace("/auth");
    }
  }, [isLoading, showOnboarding, session, segments]);

  // Show loading while we're determining app state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome!</Text>

      {isDev && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={async () => {
            await resetOnboardingStatus();
            alert("Onboarding reset. Restart the app to see changes.");
          }}
        >
          <Text style={styles.devButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  devButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff5722",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 100,
  },
  devButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
