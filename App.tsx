import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Session } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { resetOnboardingStatus } from './lib/utils'

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if onboarding has been completed
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@onboarding_completed')
        setShowOnboarding(value !== 'true')
      } catch (error) {
        console.error('Failed to get onboarding status', error)
        setShowOnboarding(true) // Default to showing onboarding if error
      }
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    checkOnboardingStatus()
  }, [])

  // Show loading while we're determining if onboarding should be shown
  if (showOnboarding === null) {
    return <View style={styles.container}><Text>Loading...</Text></View>
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  return (
    <View style={styles.container}>
      {showOnboarding ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <>
          <Auth />
          {session && session.user && (
            <View style={styles.userInfo}>
              <Text>Logged in as:</Text>
              <Text>{session.user.email}</Text>
            </View>
          )}
        </>
      )}
      
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userInfo: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  devButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  devButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
})