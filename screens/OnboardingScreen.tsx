import React from 'react';
import { View, StyleSheet } from 'react-native';
import Onboarding from '../components/Onboarding';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const handleOnboardingComplete = async () => {
    try {
      // Save that onboarding is completed
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      
      // Manually trigger a re-check in App.tsx by forcing a re-render
      // We'll use a fake navigation action that will trigger the state change listener
      // but won't actually navigate anywhere
      navigation.setParams({});
    } catch (error) {
      console.error('Failed to save onboarding status', error);
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding onComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});