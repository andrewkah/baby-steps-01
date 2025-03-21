import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function CanYourChildFigureOutWhatsChangedScreen() {
  const router = useRouter();

  const navigateToNextScreen = () => {
    // Navigate to the next screen (e.g., "Developed a unique system that adjusts difficulty to match child's personal learning path.")
    router.push('/final'); // Replace '/next-screen' with your actual route
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Can Your Child Figure Out What's Changed Between These Two Images?</Text>
      
      {/* Image Display */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://example.com/image1.jpg' }} // Replace with your actual image source
          style={styles.image}
        />
        <Image 
          source={{ uri: 'https://example.com/image2.jpg' }} // Replace with your actual image source
          style={styles.image}
        />
      </View>

      <Text style={styles.description}>
        Can your child spot what has changed between these two images? Look closely!
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>
      </View>

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
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '40%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
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
