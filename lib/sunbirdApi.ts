const EXPO_SUNBIRD_TOKEN = process.env.EXPO_SUNBIRD_TOKEN as string;


export const translateText = async (text: string, sourceLang = "lug", targetLang = "eng") => {
    const res = await fetch("https://api.sunbird.ai/tasks/nllb_translate", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${EXPO_SUNBIRD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      }),
    });
  
    const data = await res.json();
    return data;
  };
  