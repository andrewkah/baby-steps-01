import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Session } from "@supabase/supabase-js";
import { Button } from "@rneui/themed";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import AfricanThemeGameInterface from './AfricanThemeGameInterface';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Audio } from 'expo-av'; // Import the audio module

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const [sound, setSound] = useState<any>(null); // State for managing the audio
  const soundRef = useRef<any>(null); // Ref to store the sound object
  // Function to start background song
  const playBackgroundMusic = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync(); // Stop the previous sound instance
    }

    const { sound } = await Audio.Sound.createAsync(
      
      require('../assets/audio/background-music.mp3'), // Ensure your audio file is in the correct path
      { shouldPlay: true, isLooping: true }
    );
    await sound.setVolumeAsync(0.2); // Set the volume to a low level (e.g., 0.2)

    soundRef.current = sound;
  };
    // Function to stop background music
    const stopBackgroundMusic = async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
    };
  // Lock screen orientation to landscape as soon as the component is mounted
  useLayoutEffect(() => {
    const lockToLandscape = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    };

    lockToLandscape(); // Lock to landscape immediately

    // Optionally unlock the orientation on unmount or when leaving the screen
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []); // Run only once when the component mounts

  useEffect(() => {
    // Fetch session details
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    playBackgroundMusic(); // Start playing music when the component is mounted

    return () => {
      stopBackgroundMusic(); // Stop the music when navigating away from the page
    };
  }, []);

  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("Signed out successfully");
      router.replace("/");
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AfricanThemeGameInterface />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  profileCard: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileLabel: {
    fontSize: 16,
    color: "#666",
  },
  profileEmail: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 5,
  },
  signOutButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  signOutButtonText: {
    fontWeight: "bold",
  },
  settingsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  pressing: {
    position: 'absolute',
    right: 20,
    top: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  settingsText: {
    color: '#FF6F61',
    fontSize: 8,
    marginTop: 4,
  },
});
