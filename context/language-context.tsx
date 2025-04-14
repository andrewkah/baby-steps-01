"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { translateText } from "@/lib/sunbirdApi"
import { Text } from "@/components/StyledText"
import type { TextProps } from "react-native"

// Define our language types
type Language = "en" | "lug"

// Define the context shape
type LanguageContextType = {
  language: Language
  toggleLanguage: () => Promise<void>
  translate: (text: string) => Promise<string>
  isLoading: boolean
  translations: Record<string, string>
}

// Create our own type definition for the Text component props
type FontVariant = "regular" | "medium" | "bold" | "semibold" | string

// Define our own version of the StyledText props
interface CustomStyledTextProps extends TextProps {
  variant?: FontVariant
  className?: string
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: async () => {},
  translate: async (text: string) => text,
  isLoading: false,
  translations: {},
})

// Common phrases to pre-translate for better performance
const commonPhrases = {
  Settings: "Settings",
  "Child Management": "Child Management",
  "Manage Child Profiles": "Manage Child Profiles",
  "Learning Progress & Achievements": "Learning Progress & Achievements",
  "App Settings": "App Settings",
  Notifications: "Notifications",
  "Sound Effects": "Sound Effects",
  Language: "Language",
  "Dark Mode": "Dark Mode",
  "Content & Privacy": "Content & Privacy",
  "Content Management": "Content Management",
  "Privacy Settings": "Privacy Settings",
  "Help & Support": "Help & Support",
  Account: "Account",
  "Account Information": "Account Information",
  Logout: "Logout",
  "Parent Dashboard": "Parent Dashboard",
  "Monitor your children's learning journey": "Monitor your children's learning journey",
  "Child Profiles": "Child Profiles",
  "View All": "View All",
  "Add Child": "Add Child",
  "New profile": "New profile",
  "Recent Activities": "Recent Activities",
  "View All Activities": "View All Activities",
  "Weekly Learning Time": "Weekly Learning Time",
  "Total this week:": "Total this week:",
  minutes: "minutes",
  "Parent Tools": "Parent Tools",
  Schedule: "Schedule",
  Achievements: "Achievements",
  Preferences: "Preferences",
  Resources: "Resources",
  "Parenting Tips": "Parenting Tips",
  "Supporting your child's learning at home": "Supporting your child's learning at home",
  "Create a comfortable learning environment with minimal distractions and regular routines.":
    "Create a comfortable learning environment with minimal distractions and regular routines.",
  "Read More": "Read More",
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("language")
        if (savedLanguage === "lug") {
          setLanguage("lug")
          // Load cached translations if available
          const cachedTranslations = await AsyncStorage.getItem("translations")
          if (cachedTranslations) {
            setTranslations(JSON.parse(cachedTranslations))
          } else {
            // Pre-translate common phrases
            await preTranslateCommonPhrases()
          }
        }
      } catch (error) {
        console.error("Failed to load language preference:", error)
      }
    }

    loadLanguagePreference()
  }, [])

  // Pre-translate common phrases for better performance
  const preTranslateCommonPhrases = async () => {
    setIsLoading(true)
    const newTranslations: Record<string, string> = {}

    try {
      // Batch translations to avoid too many API calls at once
      const batchSize = 5
      const phrases = Object.keys(commonPhrases)

      for (let i = 0; i < phrases.length; i += batchSize) {
        const batch = phrases.slice(i, i + batchSize)
        const translationPromises = batch.map(async (phrase) => {
          try {
            const result = await translateText(phrase, "en", "lug")
            return { phrase, translation: result.translated_text }
          } catch (error) {
            console.error(`Failed to translate "${phrase}":`, error)
            return { phrase, translation: phrase }
          }
        })

        const results = await Promise.all(translationPromises)
        results.forEach(({ phrase, translation }) => {
          newTranslations[phrase] = translation
        })

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setTranslations(newTranslations)
      await AsyncStorage.setItem("translations", JSON.stringify(newTranslations))
    } catch (error) {
      console.error("Failed to pre-translate common phrases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle between English and Luganda
  const toggleLanguage = async () => {
    try {
      const newLanguage = language === "en" ? "lug" : "en"
      setLanguage(newLanguage)
      await AsyncStorage.setItem("language", newLanguage)

      // If switching to Luganda and we don't have translations yet, pre-translate
      if (newLanguage === "lug" && Object.keys(translations).length === 0) {
        await preTranslateCommonPhrases()
      }
    } catch (error) {
      console.error("Failed to toggle language:", error)
    }
  }

  // Translate a single text string
  const translate = async (text: string): Promise<string> => {
    // If language is English, return the original text
    if (language === "en") return text

    // Check if we already have a translation cached
    if (translations[text]) return translations[text]

    try {
      // Translate the text using Sunbird API
      const result = await translateText(text, "en", "lug")
      const translatedText = result.translated_text

      // Cache the translation
      setTranslations((prev) => {
        const newTranslations = { ...prev, [text]: translatedText }
        // Asynchronously update the stored translations
        AsyncStorage.setItem("translations", JSON.stringify(newTranslations)).catch((err) =>
          console.error("Failed to save translation:", err),
        )
        return newTranslations
      })

      return translatedText
    } catch (error) {
      console.error(`Failed to translate "${text}":`, error)
      return text // Fallback to original text on error
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        translate,
        isLoading,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext)

// TranslatedText component for easy text translation
type TranslatedTextProps = Omit<CustomStyledTextProps, "children"> & {
  children: string
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ children, variant, className, style, ...rest }) => {
  const { language, translations } = useLanguage()
  const [translatedText, setTranslatedText] = useState(children)

  useEffect(() => {
    if (language === "en") {
      setTranslatedText(children)
      return
    }

    // Use cached translation if available
    if (translations[children]) {
      setTranslatedText(translations[children])
      return
    }

    // Otherwise translate on the fly
    const doTranslate = async () => {
      try {
        const result = await translateText(children, "en", "lug")
        setTranslatedText(result.translated_text)
      } catch (error) {
        console.error(`Failed to translate "${children}":`, error)
      }
    }

    doTranslate()
  }, [children, language, translations])

  return (
    <Text variant={variant} className={className} style={style} {...rest}>
      {translatedText}
    </Text>
  )
}
