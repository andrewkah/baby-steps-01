import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Onboarding from './components/Onboarding'
import { View, Text, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
  }
})