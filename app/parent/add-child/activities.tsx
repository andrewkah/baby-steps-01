import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { UserContext } from "@/context/UserContext"; // Ensure this is your context

export default function StatisticsDisplayScreen() {
  const router = useRouter();
  const context = useContext(UserContext);
  if (!context) {
    // Handle the case when context is not available, e.g., show an error message or redirect
    throw new Error("useUser must be used within a UserProvider");
  }

  const handleNext = () => {
    // Navigate to the next screen (e.g., "Does your child pronounce words clearly?")
    router.push("/ourPriority"); // Replace '/next-screen' with your actual route
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Baby Steps is used by over 10,000 kids every day!
      </Text>
      <Image
        source={{ uri: "https://example.com/kids-playing-image.jpg" }} // Replace with an actual image URL
        style={styles.image}
      />
      <Text style={styles.subtitle}>Here’s what some parents are saying:</Text>
      <Text style={styles.quote}>
        "My child has improved so much since we started using Baby Steps!"
      </Text>
      <Text style={styles.quote}>
        "An amazing tool for early childhood learning and development."
      </Text>

      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
  },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
