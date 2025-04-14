// hooks/useTranslate.ts
import { useEffect, useState } from "react"
import { translateText } from "@/lib/sunbirdApi"
import { useLanguage } from "@/context/languageContext"

export const useTranslate = (text: string) => {
  const { language } = useLanguage()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    const fetchTranslation = async () => {
      if (language === "en") {
        setTranslated(text)
      } else {
        try {
          const result = await translateText(text, "en", "lug")
          setTranslated(result.output || text)
        } catch (err) {
          console.error("Translation failed:", err)
          setTranslated(text)
        }
      }
    }

    fetchTranslation()
  }, [text, language])

  return translated
}
