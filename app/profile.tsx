import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import { Button } from "@rneui/themed";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
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
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Baby Steps!</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Signed in as:</Text>
        <Text style={styles.profileEmail}>{session?.user?.email}</Text>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          buttonStyle={styles.signOutButton}
          titleStyle={styles.signOutButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
});
