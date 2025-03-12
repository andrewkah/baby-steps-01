import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Session } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { resetOnboardingStatus } from './lib/utils'

// Navigation imports
import { NavigationContainer, DefaultTheme, NavigationState } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from './navigation/types'

// Screen imports
import AuthScreen from './screens/AuthScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import ProfileScreen from './screens/ProfileScreen'

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Add a function to check onboarding status
  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_completed')
      setShowOnboarding(value !== 'true')
    } catch (error) {
      console.error('Failed to get onboarding status', error)
      setShowOnboarding(true)
    }
  };
  
  // Add a navigation state change handler
  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    // When navigation state changes, re-check onboarding status
    // This ensures App.tsx picks up AsyncStorage changes from child components
    if (state) {
      checkOnboardingStatus();
    }
  };

  useEffect(() => {
    const initApp = async () => {
      await checkOnboardingStatus();

      // Check Supabase session
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      
      setIsLoading(false)
    }

    initApp()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Cleanup subscription
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  // Show loading while we're determining app state
  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>
  }

  return (
    <>
      <NavigationContainer onStateChange={handleNavigationStateChange}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : session ? (
            <Stack.Screen name="Profile" component={ProfileScreen} />
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      {isDev && (
        <TouchableOpacity 
          style={styles.devButton} 
          onPress={async () => {
            await resetOnboardingStatus();
            alert('Onboarding reset. Restart the app to see changes.');
          }}
        >
          <Text style={styles.devButtonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 100,
  },
  devButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
})