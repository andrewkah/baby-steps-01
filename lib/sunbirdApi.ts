
  export const translateText = async (text: string, sourceLang = 'en', targetLang = 'lug') => {
    const res = await fetch('https://api.sunbird.ai/tasks/nllb_translate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTb2NjZXJEZXZDIiwiYWNjb3VudF90eXBlIjoiRnJlZSIsImV4cCI6NDg5ODIzNDY1MH0.R4KBL_aYqA1ZGXa6w8blGZDMErOXBWAdqGpLEPT24dY`,
        'Content-Type': 'application/json',
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
  