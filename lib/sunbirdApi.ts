export const translateText = async (text: string, sourceLang = "en", targetLang = "lug") => {
  try {
    console.log(`Sending translation request for: "${text}"`)

    const res = await fetch("https://api.sunbird.ai/tasks/nllb_translate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTb2NjZXJEZXZDIiwiYWNjb3VudF90eXBlIjoiRnJlZSIsImV4cCI6NDg5ODIzNDY1MH0.R4KBL_aYqA1ZGXa6w8blGZDMErOXBWAdqGpLEPT24dY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      }),
    })

    // Log the raw response for debugging
    const rawResponse = await res.text()
    console.log(`Raw API response for "${text}":`, rawResponse)

    // Parse the response
    const data = JSON.parse(rawResponse)

    // Log the structured data
    console.log(`Structured API response:`, data)

    return data
  } catch (error) {
    console.error(`Translation error for "${text}":`, error)
    return { translated_text: text } // Return original text on error
  }
}
