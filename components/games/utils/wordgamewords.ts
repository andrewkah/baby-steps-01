export type GameLevel = {
  word: string;        // The word to guess
  question: string;    // The clue or question for the word
  firstLetter?: string; // Optional: explicitly set the first visible letter (defaults to word[0])
};

export const gameLevels: GameLevel[] = [
  // EASY (shorter words, 4-6 letters)
  {
    word: "AMAZZI",
    question: "Essential liquid that falls from the sky in Uganda",
    // firstLetter defaults to 'A'
  },
  {
    word: "EMBWA",
    question: "Loyal four-legged companion in Buganda homes",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUGGA",
    question: "Flowing water body like the mighty Nile",
    // firstLetter defaults to 'O'
  },
  {
    word: "ENYAMA",
    question: "Protein source often grilled at Ugandan celebrations",
    // firstLetter defaults to 'E'
  },
  {
    word: "EMBUZI",
    question: "Horned animal commonly kept in rural homesteads",
    // firstLetter defaults to 'E'
  },
  {
    word: "EMITI",
    question: "Tall plants that provide shade in Kampala streets",
    // firstLetter defaults to 'E'
  },
  {
    word: "ENKOKO",
    question: "Feathered creature that provides breakfast eggs",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMWANA",
    question: "Young person treasured in Buganda culture",
    // firstLetter defaults to 'O'
  },
  {
    word: "EMPETA",
    question: "Circular ornament exchanged during traditional weddings",
    // firstLetter defaults to 'E'
  },
  {
    word: "EKIBIRA",
    question: "Dense collection of trees like Mabira",
    // firstLetter defaults to 'E'
  },
  
  // MEDIUM (medium length words or common concepts)
  {
    word: "EKYALO",
    question: "Rural settlement where many Baganda traditions originate",
    // firstLetter defaults to 'E'
  },
  {
    word: "OLUNAKU",
    question: "24-hour period from sunrise to sunrise",
    // firstLetter defaults to 'O'
  },
  {
    word: "EGGULU",
    question: "Blue expanse where birds and planes fly",
    // firstLetter defaults to 'E'
  },
  {
    word: "EMMERE",
    question: "Nourishment served during meal times",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUKAZI",
    question: "Female adult in Buganda society",
    // firstLetter defaults to 'O'
  },
  {
    word: "AKAMBE",
    question: "Cutting tool used to prepare traditional dishes",
    // firstLetter defaults to 'A'
  },
  {
    word: "AKAANA",
    question: "Infant requiring constant care and attention",
    // firstLetter defaults to 'A'
  },
  {
    word: "OMUSANA",
    question: "Bright light that warms the Equator",
    // firstLetter defaults to 'O'
  },
  {
    word: "EKIKOPO",
    question: "Container for drinking tea or coffee",
    // firstLetter defaults to 'E'
  },
  {
    word: "AMATOKE",
    question: "Green fruit used to make matooke, Uganda's staple food",
    // firstLetter defaults to 'A'
  },
  {
    word: "EGGULI",
    question: "Royal headwear worn by the Kabaka",
    // firstLetter defaults to 'E'
  },
  {
    word: "ABAVUBI",
    question: "Men who catch tilapia on Lake Victoria",
    // firstLetter defaults to 'A'
  },
  {
    word: "EKITABO",
    question: "Bound pages containing knowledge or stories",
    // firstLetter defaults to 'E'
  },
  {
    word: "EBITABO",
    question: "Multiple bound publications in a library",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUSAJJA",
    question: "Adult male figure in a Ugandan household",
    // firstLetter defaults to 'O'
  },
  {
    word: "OMULENZI",
    question: "Young male who will become an omusajja",
    // firstLetter defaults to 'O'
  },
  {
    word: "AKASOLYA",
    question: "Top covering of a traditional hut",
    // firstLetter defaults to 'A'
  },
  {
    word: "OLUGANDA",
    question: "Native tongue of the Baganda people",
    // firstLetter defaults to 'O'
  },
  {
    word: "ABAANA",
    question: "Young ones who attend school to learn",
    // firstLetter defaults to 'A'
  },
  {
    word: "ENNYUMBA",
    question: "Dwelling where families live together",
    // firstLetter defaults to 'E'
  },
  
  // HARDER (longer words, abstract concepts, less common terms)
  {
    word: "AKABENJE",
    question: "Unfortunate collision or mishap on the road",
    // firstLetter defaults to 'A'
  },
  {
    word: "AKAWUKA",
    question: "Tiny creature that may bite or sting",
    // firstLetter defaults to 'A'
  },
  {
    word: "ESSOMERO",
    question: "Institution where children receive education",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUCEERE",
    question: "White grain often served with groundnut sauce",
    // firstLetter defaults to 'O'
  },
  {
    word: "OMULIRO",
    question: "Burning element used for cooking and warmth",
    // firstLetter defaults to 'O'
  },
  {
    word: "OLUGENDO",
    question: "Expedition from one place to another",
    // firstLetter defaults to 'O'
  },
  {
    word: "ENSIMBI",
    question: "Currency used for trade in markets",
    // firstLetter defaults to 'E'
  },
  {
    word: "AMAGEZI",
    question: "Intelligence and knowledge valued by elders",
    // firstLetter defaults to 'A'
  },
  {
    word: "OMUKWANO",
    question: "Bond between people who care for each other",
    // firstLetter defaults to 'O'
  },
  {
    word: "EKIZIBU",
    question: "Challenge that requires solution or patience",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUKUBI",
    question: "Musician who plays traditional percussion",
    // firstLetter defaults to 'O'
  },
  {
    word: "OMUKYALA",
    question: "Respected female title in formal settings",
    // firstLetter defaults to 'O'
  },
  {
    word: "EKIGAMBO",
    question: "Unit of language that carries meaning",
    // firstLetter defaults to 'E'
  },
  {
    word: "OLUZZI",
    question: "Source of fresh water in villages",
    // firstLetter defaults to 'O'
  },
  {
    word: "EKKUBO",
    question: "Path taken between destinations",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUZANNYO",
    question: "Activity played for enjoyment or competition",
    // firstLetter defaults to 'O'
  },
  {
    word: "ENNYANJA",
    question: "Large body of water like Victoria or Kyoga",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMULANGIRA",
    question: "Son of the Kabaka, heir to Buganda kingdom",
    // firstLetter defaults to 'O'
  },
  {
    word: "EKISAAWE",
    question: "Terminal where planes land and take off",
    // firstLetter defaults to 'E'
  },
  {
    word: "OMUYIMBI",
    question: "Performer who uses voice to create music",
    // firstLetter defaults to 'O'
  }
];