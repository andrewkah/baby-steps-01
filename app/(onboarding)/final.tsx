import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext'; // Assuming you have a UserContext for global state

export default function FinalScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading process
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      router.push('../profile'); // Replace with actual route to the thank-you screen or homepage
    }, 3000); // Simulate loading for 3 seconds
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creating Your Personalized Learning Path</Text>
      <Text style={styles.description}>Please wait while we generate a custom path for your child...</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Text style={styles.description}>Your personalized plan is ready!</Text>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={() => router.push("/add-child")}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  skipButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
});
