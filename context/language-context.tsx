"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { translateText } from "@/lib/sunbirdApi"

// Create a simple context
export const LanguageContext = createContext({
  isLuganda: false,
  toggleLanguage: () => {},
  translateText: async (text: string) => text,
})

// Provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLuganda, setIsLuganda] = useState(false)

  // Load saved preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("isLuganda")
        if (savedLanguage === "true") {
          setIsLuganda(true)
          console.log("Loaded language preference: Luganda")
        } else {
          console.log("Loaded language preference: English")
        }
      } catch (error) {
        console.error("Failed to load language preference:", error)
      }
    }

    loadLanguage()
  }, [])

  // Toggle language function
  const toggleLanguage = () => {
    const newValue = !isLuganda
    setIsLuganda(newValue)
    console.log("Language toggled to:", newValue ? "Luganda" : "English")

    // Save preference
    AsyncStorage.setItem("isLuganda", newValue.toString()).catch((err) =>
      console.error("Failed to save language preference:", err),
    )
  }

  // Simple translate function
  const translate = async (text: string) => {
    if (!isLuganda) return text
    if (!text || typeof text !== "string") return text

    try {
      console.log("Translating:", text)
      const result = await translateText(text, "en", "lug")

      // Check if the result has the expected structure
      if (result && typeof result === "object") {
        // Log the full result to see its structure
        console.log("Full translation result:", JSON.stringify(result))

        // Try different possible response structures
        const translatedText =
          result.translated_text || // Check standard format
          (result.result && result.result.translated_text) || // Check nested format
          (result.data && result.data.translated_text) || // Another possible format
          text // Fallback to original text

        console.log("Final translated text:", translatedText)
        return translatedText
      }

      return text // Fallback to original text if result is not as expected
    } catch (error) {
      console.error("Translation error:", error)
      return text
    }
  }

  return (
    <LanguageContext.Provider value={{ isLuganda, toggleLanguage, translateText: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook
export const useLanguage = () => useContext(LanguageContext)
