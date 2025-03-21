import { Stack } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { View, Text, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { Audio } from "expo-av"; // Import Audio from expo-av
import "@/global.css";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null); // Use ref instead of state for sound
  const isMusicInitialized = useRef(false); // Track if music has been initialized
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

  // Audio setup for playing background music
  const playBackgroundMusic = async () => {
    // Only initialize music if it hasn't been initialized yet
    if (isMusicInitialized.current) return;

    try {
      // Configure audio mode first
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true, // Lower volume when notifications occur
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/background-music.mp3"),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.2, // Set volume during creation
        }
      );

      // Store the sound in the ref
      soundRef.current = sound;
      isMusicInitialized.current = true;

      // Add status update listener to handle interruptions
      sound.setOnPlaybackStatusUpdate((status) => {
        if (
          status.isLoaded &&
          !status.isPlaying &&
          isMusicInitialized.current
        ) {
          // If music stops unexpectedly but should be playing, restart it
          sound.playAsync();
        }
      });

      console.log("Background music started successfully");
    } catch (error) {
      console.error("Error playing background music:", error);
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

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
        isMusicInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Start playing the background music when the component is ready
  useEffect(() => {
    if (!isLoading && fontsLoaded && !isMusicInitialized.current) {
      playBackgroundMusic(); // Start background music only once
    }
  }, [isLoading, fontsLoaded]);

  // Handle routing based on authentication and onboarding state
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    // Only redirect if we're on the root ("/") to avoid redirect loops
    if (pathname === "/") {
      if (showOnboarding) {
        router.replace("/onboarding");
      } else if (session) {
        router.replace("/child-list");
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
        name="child-list"
        options={{
          title: "List",
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
        name="AfricanThemeGameInterface"
        options={{
          title: "",
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
      <Stack.Screen
        name="tester"
        options={{
          title: "Testing",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "Tabs",
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
