import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';

export default function ReasonForDownloadingScreen() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const { setReason } = useUser();
  const router = useRouter();

  const handleNext = () => {
    if (selectedReason) {
      setReason(selectedReason);
      // Navigate to next screen (info about professionals guiding the development)
      router.push('/activities');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What was the main reason for downloading BabySteps for your child?</Text>

      <View style={styles.reasonContainer}>
        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Develop logical thinking and memory' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Develop logical thinking and memory')}
        >
          <Text style={styles.reasonLabel}>Develop logical thinking and memory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Boost creativity' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Boost creativity')}
        >
          <Text style={styles.reasonLabel}>Boost creativity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Learn culture' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Learn culture')}
        >
          <Text style={styles.reasonLabel}>Learn culture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Prepare for school' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Prepare for school')}
        >
          <Text style={styles.reasonLabel}>Prepare for school</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Healthy screen time' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Healthy screen time')}
        >
          <Text style={styles.reasonLabel}>Healthy screen time</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reasonButton,
            selectedReason === 'Other' && styles.selectedReason,
          ]}
          onPress={() => setSelectedReason('Other')}
        >
          <Text style={styles.reasonLabel}>Other</Text>
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
  reasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  reasonButton: {
    width: '45%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedReason: {
    backgroundColor: '#007bff',
  },
  reasonLabel: {
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
