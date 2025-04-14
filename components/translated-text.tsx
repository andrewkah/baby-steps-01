"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Text } from "@/components/StyledText"
import { useLanguage } from "@/context/language-context"

// Declare __DEV__ if it's not already defined (e.g., by webpack or other build tools)
declare const __DEV__: boolean

export const TranslatedText = (props: React.ComponentProps<typeof Text>) => {
  const { children, ...rest } = props
  const { isLuganda, translateText } = useLanguage()
  const [translated, setTranslated] = useState(children)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only translate string children
  useEffect(() => {
    if (typeof children !== "string") {
      setTranslated(children)
      return
    }

    if (!isLuganda) {
      setTranslated(children)
      return
    }

    // Translate the text
    const doTranslate = async () => {
      setIsTranslating(true)
      setError(null)

      try {
        const result = await translateText(children)
        if (result && result !== children) {
          setTranslated(result)
        } else {
          // If translation failed or returned the same text
          console.log(`No translation change for: "${children}"`)
          setTranslated(children)
        }
      } catch (err) {
        console.error(`Translation error for "${children}":`, err)
        setError(err instanceof Error ? err.message : String(err))
        setTranslated(children) // Fallback to original text
      } finally {
        setIsTranslating(false)
      }
    }

    doTranslate()
  }, [children, isLuganda, translateText])

  // If there's an error, we could show it in development
  if (__DEV__ && error) {
    console.warn(`Translation error: ${error}`)
  }

  return <Text {...rest}>{translated}</Text>
}
