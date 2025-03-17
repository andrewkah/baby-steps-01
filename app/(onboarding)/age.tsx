import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';
import { useRouter } from 'expo-router';
import SkipButton from '@/components/SkipButtonOnboarding';

export default function AgeSelectionScreen() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const { setAge } = useUser();
  const router = useRouter();

  const handleNext = () => {
    if (selectedAge) {
      setAge(selectedAge);
      // Navigate to next screen (reason for downloading)
      router.push('/(onboarding)/reason');
    }
  };

  return (
    <View style={styles.container}>
      <SkipButton />
      <Text style={styles.title}>What is your child's age?</Text>

      <View style={styles.ageContainer}>
        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === 'Under 4' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('Under 4')}
        >
          <Text style={styles.ageLabel}>Under 4</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === '4-5 years' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('4-5 years')}
        >
          <Text style={styles.ageLabel}>4-5 years</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === '6 years' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('6 years')}
        >
          <Text style={styles.ageLabel}>6 years</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === '7 years' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('7 years')}
        >
          <Text style={styles.ageLabel}>7 years</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === '8 years' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('8 years')}
        >
          <Text style={styles.ageLabel}>8 years</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.ageButton,
            selectedAge === '9-15 years' && styles.selectedAge,
          ]}
          onPress={() => setSelectedAge('9-15 years')}
        >
          <Text style={styles.ageLabel}>9-15 years</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  ageButton: {
    width: '45%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedAge: {
    backgroundColor: '#007bff',
  },
  ageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
