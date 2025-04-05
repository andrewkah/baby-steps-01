// gameLevels.ts
export type GameLevel = {
    word: string;        // The word to guess
    question: string;    // The clue or question for the word
    firstLetter?: string; // Optional: explicitly set the first visible letter (defaults to word[0])
  };
  
  export const gameLevels: GameLevel[] = [
    {
      word: "KANZU",
      question: "Traditional attire in Buganda culture",
      // firstLetter defaults to 'K'
    },
    {
      word: "SAFARI",
      question: "Journey to observe wildlife in their natural habitat",
      // firstLetter defaults to 'S'
    },
    {
      word: "BAOBAB",
      question: "Iconic African tree with a thick trunk",
      // firstLetter defaults to 'B'
    },
    {
      word: "UBUNTU",
      question: "African philosophy meaning 'I am because we are'",
      // firstLetter defaults to 'U'
    },
    {
      word: "MAASAI",
      question: "Indigenous ethnic group in Kenya and Tanzania",
      // firstLetter defaults to 'M'
    },
    {
      word: "SERENGETI",
      question: "Famous ecosystem in Tanzania known for migration",
      // firstLetter defaults to 'S'
    },
    {
      word: "NYAMA",
      question: "Swahili word for meat",
      // firstLetter defaults to 'N'
    },
    {
      word: "DJEMBE",
      question: "West African drum played with bare hands",
      // firstLetter defaults to 'D'
    },
    {
      word: "KENTE",
      question: "Colorful textile from Ghana",
      // firstLetter defaults to 'K'
    },
    {
      word: "MANDELA",
      question: "South African anti-apartheid revolutionary and president",
      // firstLetter defaults to 'M'
    }
  ];