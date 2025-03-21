import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useUser } from "../../context/UserContext";
import { useRouter } from "expo-router";

export default function GenderScreen() {
  const { setName, setGender, name, gender } = useUser();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your child’s gender and name?</Text>

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, gender === "male" && styles.selected]}
          onPress={() => setGender("male")}
        >
          <Text style={styles.emoji}>👦</Text>
          <Text style={styles.label}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.genderButton, gender === "female" && styles.selected]}
          onPress={() => setGender("female")}
        >
          <Text style={styles.emoji}>👧</Text>
          <Text style={styles.label}>Female</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Name of Kid"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity onPress={() => router.push("/(onboarding)/age")}>
        <Text style={styles.skip}>Prefer not to answer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={() => router.push("/age")}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  genderContainer: { flexDirection: "row", marginBottom: 20 },
  genderButton: { alignItems: "center", padding: 20, marginHorizontal: 10, borderRadius: 10, borderWidth: 2, borderColor: "#ddd" },
  selected: { borderColor: "#007bff", backgroundColor: "#e0f0ff" },
  emoji: { fontSize: 50 },
  label: { fontSize: 18, marginTop: 5 },
  input: { width: "80%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginTop: 20 },
  skip: { marginTop: 20, color: "gray", fontSize: 16 },
  nextButton: { marginTop: 20, backgroundColor: "#007bff", padding: 15, borderRadius: 10 },
  nextText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
