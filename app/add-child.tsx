import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const avatars = ["🐣", "🦄", "🐼"]; // Emoji avatars

export default function AddChildProfile() {
  const [childName, setChildName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const router = useRouter();

  const handleSave = () => {
    if (!childName || selectedAvatar === null) {
      Alert.alert("Oops!", "Please enter a name and select an avatar.");
      return;
    }

    // Simulate saving the data
    console.log("Child Profile:", { name: childName, avatar: avatars[selectedAvatar] });
    
    Alert.alert("Success!", `${childName}'s profile has been created 🎉`);
    router.push("/profile"); // Redirect to the profile page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Child Profile</Text>

      {/* Child Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter child's name..."
        placeholderTextColor="#9CA3AF"
        value={childName}
        onChangeText={setChildName}
      />

      {/* Avatar Selection */}
      <Text style={styles.subHeader}>Choose an Avatar</Text>
      <View style={styles.avatarContainer}>
        {avatars.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.avatar,
              selectedAvatar === index && styles.selectedAvatar,
            ]}
            onPress={() => setSelectedAvatar(index)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.saveText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    color: "#4B5563",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  avatar: {
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedAvatar: {
    borderColor: "#10B981",
    transform: [{ scale: 1.2 }],
  },
  emoji: {
    fontSize: 50,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 5,
  },
  saveText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
