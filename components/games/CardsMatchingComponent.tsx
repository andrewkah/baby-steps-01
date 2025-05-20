import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/StyledText";
import { useChild } from "@/context/ChildContext";  // Add this import
import { saveActivity } from "@/lib/utils";  // Add this import

// Define card interface
interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
  info: string;
  imageSymbol: string;
}

// Define Buganda cultural items data
const bugandaItems = [
  {
    value: "Kabaka",
    info: "The King of Buganda, one of the most powerful traditional monarchs in Uganda.",
    imageSymbol: "👑",
  },
  {
    value: "Lubiri",
    info: "The royal palace of the Kabaka of Buganda located in Mengo, Kampala.",
    imageSymbol: "🏰",
  },
  {
    value: "Matoke",
    info: "Steamed green bananas, a staple food in Buganda cuisine.",
    imageSymbol: "🍌",
  },
  {
    value: "Kanzu",
    info: "Traditional white robe worn by Baganda men, especially during ceremonies.",
    imageSymbol: "👘",
  },
  {
    value: "Gomesi",
    info: "A colorful floor-length dress worn by Baganda women during ceremonies.",
    imageSymbol: "👗",
  },
  {
    value: "Engoma",
    info: "Traditional drums used in Kiganda music and royal ceremonies.",
    imageSymbol: "🥁",
  },
  {
    value: "Lukiiko",
    info: "The parliament or council of the Buganda Kingdom.",
    imageSymbol: "🏛️",
  },
  {
    value: "Olugero",
    info: "Traditional fables and stories that teach moral lessons in Buganda culture.",
    imageSymbol: "📚",
  },
];

// Card gradient colors for backside based on position
const cardGradients: string[][] = [
  ["#FF9AA2", "#FFB7B2"], // Pink
  ["#FFDAC1", "#E2F0CB"], // Peach to Light Green
  ["#B5EAD7", "#C7CEEA"], // Light Teal to Light Blue
  ["#E2F0CB", "#FFDAC1"], // Light Green to Peach
  ["#C7CEEA", "#FF9AA2"], // Light Blue to Pink
  ["#FFB7B2", "#B5EAD7"], // Light Pink to Teal
];

const BugandaMatchingGame: React.FC = () => {
  const router = useRouter();
  const { activeChild } = useChild();  // Add this line to get active child
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    show: boolean;
    info: string;
    value: string;
    symbol: string;
  }>({
    show: false,
    info: "",
    value: "",
    symbol: "",
  });

  // Animation references
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Add game start time reference for duration tracking
  const gameStartTime = useRef(Date.now());

  // Initialize game
  useEffect(() => {
    initGame();

    // Initial bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset start time whenever game initializes
    gameStartTime.current = Date.now();
  }, []);

  // Shuffle function for cards
  const shuffleCards = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initGame = () => {
    // Create pairs of cards
    const cardPairs: Card[] = [...bugandaItems, ...bugandaItems].map(
      (item, index) => ({
        id: index,
        value: item.value,
        flipped: false,
        matched: false,
        info: item.info,
        imageSymbol: item.imageSymbol,
      })
    );

    // Shuffle cards
    const shuffledCards = shuffleCards(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCount(0);
    setMoves(0);
    setGameOver(false);
    setInfoModal({ show: false, info: "", value: "", symbol: "" });
    
    // Reset start time when restarting game
    gameStartTime.current = Date.now();
  };

  // Track activity when a match is found
  const trackMatchActivity = async (matchedCard: Card) => {
    if (!activeChild) return;
    
    await saveActivity({
      child_id: activeChild.id,
      activity_type: "cultural",
      activity_name: "Matched Cultural Cards",
      score: `${matchedCount+1}/${bugandaItems.length}`,
      completed_at: new Date().toISOString(),
      details: `Found a match: ${matchedCard.value} - ${matchedCard.info.substring(0, 30)}...`
    });
  };

  // Track activity when game completes
  const trackGameCompletion = async () => {
    if (!activeChild) return;
    
    // Calculate efficiency - lower moves is better
    const perfectMoves = bugandaItems.length; // Perfect score would be one move per match
    const efficiency = Math.max(0, 100 - Math.floor(((moves - perfectMoves) / perfectMoves) * 50));
    
    // Calculate duration in seconds
    const duration = Math.round((Date.now() - gameStartTime.current) / 1000);
    
    await saveActivity({
      child_id: activeChild.id,
      activity_type: "cultural",
      activity_name: "Completed Matching Game",
      score: `${efficiency}%`,
      duration: duration,
      completed_at: new Date().toISOString(),
      details: `Completed Buganda Cultural Cards matching game in ${moves} moves and ${duration} seconds`
    });
  };

  const handleCardPress = async (card: Card) => {
    // Prevent flipping if card is already flipped or matched, or if two cards are already flipped
    if (card.flipped || card.matched || flippedCards.length >= 2) {
      return;
    }

    // Play sound effect
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require("@/assets/audio/page-turn.mp3"));
      await soundObject.playAsync();
    } catch (error) {
      console.log("Error playing sound", error);
    }

    // Flip the card
    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    );

    setCards(updatedCards);

    const updatedFlippedCards = [...flippedCards, card];
    setFlippedCards(updatedFlippedCards);

    // If this is the second flipped card
    if (updatedFlippedCards.length === 2) {
      setMoves((prevMoves) => prevMoves + 1);

      // Check for a match
      const [firstCard, secondCard] = updatedFlippedCards;
      if (firstCard.value === secondCard.value) {
        // It's a match
        setTimeout(async () => {
          const matchedCards = cards.map((c) =>
            c.value === firstCard.value ? { ...c, matched: true } : c
          );

          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedCount((prevCount) => prevCount + 1);
          
          // Track match activity
          await trackMatchActivity(firstCard);

          // Play match sound
          const matchSound = new Audio.Sound();
          try {
            await matchSound.loadAsync(require("@/assets/sounds/correct.mp3"));
            await matchSound.playAsync();
          } catch (error) {
            console.log("Error playing sound", error);
          }

          // Show info modal with symbol
          setInfoModal({
            show: true,
            info: firstCard.info,
            value: firstCard.value,
            symbol: firstCard.imageSymbol,
          });

          // Celebrate with animation
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1.05,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(bounceAnim, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true,
            }),
          ]).start();

          // Check if all pairs are matched
          if (matchedCount + 1 === bugandaItems.length) {
            setTimeout(async () => {
              // Track game completion before showing game over screen
              await trackGameCompletion();
              setGameOver(true);
            }, 1000);
          }
        }, 500);
      } else {
        // Not a match, flip cards back
        setTimeout(() => {
          const resetCards = cards.map((c) =>
            (c.id === firstCard.id || c.id === secondCard.id) && !c.matched
              ? { ...c, flipped: false }
              : c
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const closeInfoModal = () => {
    setInfoModal({ ...infoModal, show: false });
  };

  // Calculate optimal number of columns and card size
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const isLandscape = screenWidth > screenHeight;

  // Determine number of columns based on device orientation
  const numColumns = isLandscape ? 8 : 4;

  // Calculate card size to fit the screen width perfectly
  const cardWidth = (screenWidth - 32) / numColumns - 6; // 32 for outer padding, 6 for margin between cards
  // Adjust card height to be shorter (originally 1.4x width)
  const cardHeight = cardWidth * 1.25; // Reduced aspect ratio to show more rows

  // Calculate how much vertical space we need for 3 rows plus header
  const neededHeight = cardHeight * 3 + 32; // 3 rows + gaps + padding

  // Get gradient colors for a card based on its index
  const getCardGradient = (index: number): readonly [string, string] => {
    const colors = cardGradients[index % cardGradients.length];
    return [colors[0], colors[1]] as const;
  };

  return (
    <View className="flex-1 flex-col bg-primary-50">
      <StatusBar style="dark" />

      {/* Decorative Background Elements */}
      <View className="absolute top-5 left-5">
        <View className="w-10 h-10 rounded-full bg-yellow-200 opacity-60" />
      </View>
      <View className="absolute bottom-5 right-5">
        <View className="w-12 h-12 rounded-full bg-purple-200 opacity-50" />
      </View>
      <View className="absolute top-1/3 right-10">
        <View className="w-8 h-8 rounded-full bg-blue-200 opacity-40" />
      </View>

      {/* Top navigation bar with all elements aligned horizontally */}
      <View className="flex-row justify-between items-center px-4 pt-8 pb-2">
        {/* Back button */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-md border-2 border-primary-200"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#7b5af0" />
        </TouchableOpacity>

        {/* Game title in the middle */}
        <View className="flex-1 mx-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-md border-2 border-secondary-100">
          <Text
            className=" text-primary-700 text-center"
            variant="bold"
            numberOfLines={1}
          >
            Buganda Cultural Cards
          </Text>
        </View>

        {/* Right side container for stats and new game button */}
        <View className="flex-row items-center space-x-2">
          {/* Moves counter */}
          <View className="bg-white px-2 py-1 rounded-xl shadow-md border-2 border-primary-200">
            <View className="flex-row items-center">
              <Text className="text-xs text-primary-500 mr-1">Moves:</Text>
              <Text className="text-sm  text-primary-700">{moves}</Text>
            </View>
          </View>

          {/* Matches counter */}
          <View className="bg-white px-2 py-1 rounded-xl shadow-md border-2 border-primary-200">
            <View className="flex-row items-center">
              <Text className="text-xs text-primary-500 mr-1">Matches:</Text>
              <Text className="text-sm  text-primary-700">
                {matchedCount}/{bugandaItems.length}
              </Text>
            </View>
          </View>

          {/* New Game button */}
          <TouchableOpacity
            className="bg-secondary-300 py-1.5 px-3 rounded-full shadow-md border-2 border-secondary-200"
            onPress={initGame}
            activeOpacity={0.7}
          >
            <Text className="text-primary-700 text-xs ">New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Game board with improved visuals - reduced padding */}
      <View className="flex-1 p-2">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 6,
            paddingVertical: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View className="flex-row flex-wrap justify-center">
            {cards.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  margin: 3, // Reduced from 4 to 3
                }}
                className={`
                  rounded-xl overflow-hidden justify-center items-center 
                  shadow-md border-2
                  ${card.matched ? "border-green-400" : "border-white"}
                `}
                onPress={() => handleCardPress(card)}
                activeOpacity={0.85}
              >
                {card.flipped || card.matched ? (
                  // Front of card (flipped)
                  <LinearGradient
                    colors={["#ffffff", "#f8f8ff"]}
                    className="flex-1 w-full justify-center items-center p-1"
                  >
                    <View
                      style={{
                        width: cardWidth * 0.6,
                        height: cardWidth * 0.6,
                      }}
                      className={`
                      rounded-full mb-1 justify-center items-center
                      ${card.matched ? "bg-green-100" : "bg-blue-100"}
                    `}
                    >
                      <Text
                        variant="bold"
                        style={{ fontSize: cardWidth * 0.35 }}
                      >
                        {card.imageSymbol}
                      </Text>
                    </View>
                    <Text
                      className="text-center text-primary-700  px-1"
                      numberOfLines={1}
                      style={{ fontSize: Math.max(10, cardWidth * 0.15) }}
                      variant="bold"
                    >
                      {card.value}
                    </Text>
                  </LinearGradient>
                ) : (
                  // Back of card (unflipped) with gradient
                  <LinearGradient
                    colors={getCardGradient(index)}
                    className="flex-1 w-full justify-center items-center"
                  >
                    {/* Fun question mark design */}
                    <View
                      style={{
                        width: cardWidth * 0.5,
                        height: cardWidth * 0.5,
                      }}
                      className="bg-white/30 rounded-full justify-center items-center"
                    >
                      <Text
                        className=" text-primary-700"
                        style={{ fontSize: cardWidth * 0.3 }}
                      >
                        ?
                      </Text>
                    </View>
                    <View className="absolute bottom-2 right-2">
                      <View className="w-3 h-3 rounded-full bg-white/20" />
                    </View>
                    <View className="absolute top-2 left-2">
                      <View className="w-2 h-2 rounded-full bg-white/20" />
                    </View>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Info modal when match is found - with fun styling */}
      {infoModal.show && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View
            className="w-4/5 rounded-3xl p-6 items-center shadow-xl border-4 border-primary-200 bg-white"
          >
            {/* Symbol display at top */}
            <View className="absolute -top-8 bg-yellow-100 w-16 h-16 rounded-full border-4 border-white justify-center items-center">
              <Text className="text-4xl">{infoModal.symbol}</Text>
            </View>

            {/* Decorative elements */}
            <View className="absolute top-3 right-3">
              <Text className="text-xl">✨</Text>
            </View>
            <View className="absolute bottom-3 left-3">
              <Text className="text-xl">🎉</Text>
            </View>

            <Text variant="bold" className="text-2xl  text-primary-700 mb-2 mt-4">
              {infoModal.value}
            </Text>

            <View className="bg-primary-50 w-full rounded-xl p-4 mb-5">
              <Text className="text-lg text-primary-700 text-center">
                {infoModal.info}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary-500 py-3 px-7 rounded-full shadow-md border-2 border-primary-400"
              onPress={closeInfoModal}
            >
              <Text variant="bold" className="text-white text-lg ">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game over modal with celebration styling */}
      {gameOver && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View
            className="w-4/5 rounded-3xl p-6 items-center shadow-xl border-4 border-primary-200 bg-white"
          >
            {/* Trophy at top */}
            <View className="absolute -top-8 bg-yellow-300 w-20 h-20 rounded-full border-4 border-white justify-center items-center">
              <Text className="text-5xl">🏆</Text>
            </View>

            {/* Confetti and stars decorations */}
            <View className="absolute top-4 left-5">
              <Text className="text-2xl">🎊</Text>
            </View>
            <View className="absolute top-4 right-5">
              <Text className="text-2xl">✨</Text>
            </View>
            <View className="absolute bottom-12 left-8">
              <Text className="text-2xl">🎉</Text>
            </View>
            <View className="absolute bottom-12 right-8">
              <Text className="text-2xl">⭐</Text>
            </View>

            <Text variant="bold" className="text-3xl  text-primary-600 mb-2 mt-6">
              Congratulations!
            </Text>

            <View className="bg-primary-50 w-full rounded-xl p-4 mb-5">
              <Text className="text-xl text-primary-700 text-center font-medium">
                You've completed the game in {moves} moves!
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary-500 py-4 px-8 rounded-full shadow-md border-2 border-primary-400"
              onPress={initGame}
            >
              <Text variant="bold" className="text-white text-xl ">Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default BugandaMatchingGame;