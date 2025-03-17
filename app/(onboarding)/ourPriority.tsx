import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function YourChildIsOurPriorityScreen() {
  const router = useRouter();

  const navigateToNextScreen = () => {
    // Navigate to the next screen (e.g., "Can your kid match numbers to objects?")
    router.push('/knowledge'); // Replace '/next-screen' with your actual route
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Child is Our Priority</Text>
      <Text style={styles.message}>
        At BabySteps, we understand the importance of fostering your child’s growth and development. We are committed to providing content and activities that are tailored to their learning journey, helping them grow in a healthy and positive environment.
      </Text>

      <TouchableOpacity onPress={navigateToNextScreen} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
