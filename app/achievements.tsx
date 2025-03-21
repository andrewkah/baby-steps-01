import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar, IconButton } from "react-native-paper"; // Ensure correct import

const progress = 0.75; // 75% Completion
const achievements = [
  {
    id: "1",
    title: "First Steps 👣",
    description: "Completed the first activity!",
    icon: "emoticon-happy-outline", // Using React Native Paper Icon name
    emoji: "👣", // Emoji icon as fallback
  },
  {
    id: "2",
    title: "Explorer 🧭",
    description: "Visited 5 different sections.",
    icon: "compass-outline", // Using React Native Paper Icon name
    emoji: "🧭", // Emoji icon as fallback
  },
  {
    id: "3",
    title: "Fast Learner 🧠",
    description: "Completed 10 challenges!",
    icon: "brain", // Using React Native Paper Icon name
    emoji: "🧠", // Emoji icon as fallback
  },
  {
    id: "4",
    title: "Buganda Historian 📜",
    description: "Learned about Buganda culture!",
    icon: "book-open-outline", // Using React Native Paper Icon name
    emoji: "📜", // Emoji icon as fallback
  },
];

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="ribbon" size={26} color="white" />
        <Text style={styles.title}>📊 Progress & Achievements</Text>
      </View>

      {/* Progress Bar Section */}
      <Text style={styles.progressText}>Your Learning Journey</Text>
      <ProgressBar progress={progress} color="#FFD700" style={styles.progressBar} />
      <Text style={styles.progressPercentage}>{Math.round(progress * 100)}% Completed</Text>

      {/* Achievements Section */}
      <Text style={styles.sectionTitle}>🏆 Achievements</Text>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.achievementList}
        renderItem={({ item }) => (
          <View style={styles.achievementCard}>
            {/* Use IconButton and correctly pass the props */}
            <IconButton
              icon={item.icon} // React Native Paper Icon name
              size={50} // Set the size
              style={styles.achievementIcon} // Custom styles
            />
            <View>
              <Text style={styles.achievementTitle}>{item.title}</Text>
              <Text style={styles.achievementDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E", // Dark theme for contrast
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD700",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  progressText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#555",
  },
  progressPercentage: {
    color: "#FFD700",
    fontSize: 16,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 30,
  },
  achievementList: {
    marginTop: 20,
  },
  achievementCard: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  achievementIcon: {
    marginRight: 15,
  },
  achievementTitle: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
  achievementDescription: {
    color: "white",
    fontSize: 14,
  },
});
