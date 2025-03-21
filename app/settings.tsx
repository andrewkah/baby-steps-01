import { View, Text, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import * as ScreenOrientation from 'expo-screen-orientation';

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("Signed out successfully");
      router.replace("/");
    }
  };

  useEffect(() => {
    // Lock to portrait initially when screen loads
    const lockToPortrait = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    lockToPortrait();

   

    return () => {
    };
  }, [router]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Child Progress */}
      <TouchableOpacity style={styles.option} onPress={() => router.push("/child-progress")}>
        <Ionicons name="bar-chart" size={28} color="#F87171" />
        <Text style={styles.optionText}>Child Progress</Text>
      </TouchableOpacity>

      {/* Add Child Profile */}
      <TouchableOpacity style={styles.option} onPress={() => router.push("/(onboarding)/gender")}>
        <Ionicons name="person-add" size={28} color="#10B981" />
        <Text style={styles.optionText}>Add Child Profile</Text>
      </TouchableOpacity>

      {/* Achievements */}
      <TouchableOpacity style={styles.option} onPress={() => router.push("/achievements")}>
        <FontAwesome5 name="medal" size={28} color="#6366F1" />
        <Text style={styles.optionText}>Achievements</Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity style={styles.option} onPress={() => console.log("Toggle theme!")}>
        <Ionicons name="moon" size={28} color="#8B5CF6" />
        <Text style={styles.optionText}>Dark Mode</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={[styles.option, styles.logout]} onPress={handleSignOut}>
        <Ionicons name="log-out" size={28} color="white" />
        <Text style={[styles.optionText, { color: "white" }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: "#374151",
  },
  logout: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
  },
});
