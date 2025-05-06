import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";
import { gameLevels } from "./utils/wordgamewords"; // Import game levels
import { Text } from "@/components/StyledText";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Define types for the component's state and props
type LetterPosition = {
  letter: string;
  index: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
  destWidth: number;
  destHeight: number;
};

type GameLevel = {
  word: string;
  question: string;
  firstLetter: string;
};

const WordGame: React.FC = () => {
  // State variables
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [displayWord, setDisplayWord] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [letters, setLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | undefined>();
  const [wrongSound, setWrongSound] = useState<Audio.Sound | undefined>();
  const [successSound, setSuccessSound] = useState<Audio.Sound | undefined>();
  const [animatingLetter, setAnimatingLetter] = useState<LetterPosition | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);

  // Animation values
  const letterScale = useState(new Animated.Value(1))[0];
  const bounceValue = useState(new Animated.Value(0))[0];

  // For letter flying animation
  const flyingLetterPosition = useRef(
    new Animated.ValueXY({ x: 0, y: 0 })
  ).current;
  const flyingLetterOpacity = useRef(new Animated.Value(0)).current;
  const flyingLetterScale = useRef(new Animated.Value(1)).current;

  // References to measure positions
  const letterRefs = useRef<{ [key: number]: View | null }>({});
  const wordSlotRefs = useRef<{ [key: number]: View | null }>({});
  const containerRef = useRef<View | null>(null);

  const router = useRouter();

  // Function to generate random letters for choices
  const generateLetterChoices = (word: string): string[] => {
    // Remove the first letter which is always given
    const wordLetters = word.slice(1).split("");

    // Create array of unique letters from the word
    const uniqueLetters = Array.from(new Set(wordLetters));

    // Add some random letters to make it challenging
    const alphabetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const remainingCount = 10 - uniqueLetters.length;

    // Filter out letters that are already in uniqueLetters
    const availableLetters = alphabetLetters.filter(
      (letter) => !uniqueLetters.includes(letter)
    );

    // Randomly select remaining letters
    const randomLetters = [];
    for (let i = 0; i < remainingCount && availableLetters.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableLetters.length);
      randomLetters.push(availableLetters[randomIndex]);
      availableLetters.splice(randomIndex, 1);
    }

    // Combine and shuffle
    const allLetters = [...uniqueLetters, ...randomLetters];
    return allLetters.sort(() => Math.random() - 0.5);
  };

  // Load current level
  const loadLevel = (levelIndex: number) => {
    if (levelIndex >= gameLevels.length) {
      setIsGameCompleted(true);
      return;
    }

    const level = gameLevels[levelIndex];
    const word = level.word;
    const firstLetter = level.firstLetter || word[0];

    // Create display word with first letter shown
    let initialDisplay = firstLetter;
    for (let i = 1; i < word.length; i++) {
      initialDisplay += "_";
    }

    setCurrentWord(word);
    setDisplayWord(initialDisplay);
    setCurrentQuestion(level.question);
    setLetters(generateLetterChoices(word));

    // Instead of adding to selectedLetters, we'll check if letter is available in the renderLetters logic
    setSelectedLetters([]);

    // Reset refs
    letterRefs.current = {};
    wordSlotRefs.current = {};
  };

  // Updated useEffect to lock screen orientation and load the first level
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }

    // Load sounds
    async function loadSounds() {
      const correctSoundObject = new Audio.Sound();
      const wrongSoundObject = new Audio.Sound();
      const successSoundObject = new Audio.Sound();

      try {
        // Add error handling for each sound file
        try {
          await correctSoundObject.loadAsync(
            require("@/assets/sounds/correct.mp3")
          );
          setCorrectSound(correctSoundObject);
        } catch (error) {
          console.log("Could not load correct sound:", error);
        }

        try {
          await wrongSoundObject.loadAsync(
            require("@/assets/sounds/wrong.mp3")
          );
          setWrongSound(wrongSoundObject);
        } catch (error) {
          console.log("Could not load wrong sound:", error);
        }

        try {
          await successSoundObject.loadAsync(
            require("@/assets/sounds/correct.mp3")
          );
          setSuccessSound(successSoundObject);
        } catch (error) {
          console.log("Could not load success sound:", error);
        }
      } catch (error) {
        console.error("Error in sound loading process", error);
      }
    }

    setLandscapeOrientation();
    loadSounds();
    loadLevel(0);

    return () => {
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
      if (successSound) successSound.unloadAsync();
    };
  }, []);

  // Move to next level
  const goToNextLevel = () => {
    const nextLevelIndex = currentLevelIndex + 1;
    setCurrentLevelIndex(nextLevelIndex);
    setShowSuccessModal(false);
    setSelectedLetters([]);
    loadLevel(nextLevelIndex);
  };

  // Animation logic
  const animateLetterToWord = (
    letter: string,
    letterIndex: number,
    destinationIndex: number
  ) => {
    const letterRef = letterRefs.current[letterIndex];
    const wordRef = wordSlotRefs.current[destinationIndex];

    if (!letterRef || !wordRef || !containerRef.current) return;

    letterRef.measureLayout(
      containerRef.current,
      (letterX, letterY, letterWidth, letterHeight) => {
        wordRef?.measureLayout(
          containerRef.current!,
          (wordX, wordY, wordWidth, wordHeight) => {
            setAnimatingLetter({
              letter,
              index: destinationIndex,
              startX: letterX,
              startY: letterY,
              endX: wordX,
              endY: wordY,
              width: letterWidth,
              height: letterHeight,
              destWidth: wordWidth,
              destHeight: wordHeight,
            });

            flyingLetterOpacity.setValue(1);
            flyingLetterPosition.setValue({ x: 0, y: 0 });

            Animated.parallel([
              Animated.timing(flyingLetterPosition.x, {
                toValue: wordX - letterX + (wordWidth - letterWidth) / 2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(flyingLetterPosition.y, {
                toValue: wordY - letterY + (wordHeight - letterHeight) / 2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(flyingLetterScale, {
                  toValue: 1.2,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(flyingLetterScale, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              flyingLetterOpacity.setValue(0);
              setAnimatingLetter(null);

              updateDisplayWord(letter);
            });
          },
          () => console.error("Failed to measure word slot")
        );
      },
      () => console.error("Failed to measure letter")
    );
  };

  const updateDisplayWord = (letter: string) => {
    let newDisplay = "";
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] === letter || displayWord[i] !== "_") {
        newDisplay += currentWord[i];
      } else {
        newDisplay += "_";
      }
    }

    setDisplayWord(newDisplay);

    // Check if word is complete
    if (!newDisplay.includes("_")) {
      // Play success sound
      if (successSound) {
        successSound.replayAsync();
      }

      // Animate word bounce
      Animated.spring(bounceValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          bounceValue.setValue(0);
        }, 1000);
      });
    }
  };

  const handleLetterPress = (letter: string, letterIndex: number) => {
    Animated.sequence([
      Animated.timing(letterScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(letterScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentWord.includes(letter)) {
      // Count remaining occurrences of this letter that still need to be filled
      let remainingOccurrences = 0;
      for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] === letter && displayWord[i] === "_") {
          remainingOccurrences++;
        }
      }

      if (remainingOccurrences > 0) {
        if (correctSound) {
          correctSound.replayAsync();
        }

        // Only add to selectedLetters if all occurrences are now filled
        if (remainingOccurrences === 1) {
          const newSelectedLetters = [...selectedLetters, letter];
          setSelectedLetters(newSelectedLetters);
        }

        const positions = [];
        for (let i = 0; i < currentWord.length; i++) {
          if (currentWord[i] === letter && displayWord[i] === "_") {
            positions.push(i);
            break; // Just get the first unfilled position
          }
        }

        if (positions.length > 0) {
          animateLetterToWord(letter, letterIndex, positions[0]);
        }
      } else {
        if (wrongSound) {
          wrongSound.replayAsync();
        }
      }
    } else {
      if (wrongSound) {
        wrongSound.replayAsync();
      }
    }
  };

  // Modified layout for landscape orientation with NativeWind styling
  return (
    <View ref={containerRef} className="flex-1 bg-primary-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Background decorative elements */}
      <View className="absolute top-5 left-5">
        <View className="w-12 h-12 rounded-full bg-primary-200 opacity-50" />
      </View>
      <View className="absolute bottom-10 right-10">
        <View className="w-16 h-16 rounded-full bg-secondary-200 opacity-30" />
      </View>

      {/* Top navigation bar with all elements aligned horizontally */}
      <View className="flex-row justify-between items-center px-4 pt-8">
        {/* Back button */}
        <TouchableOpacity
          className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-md border-2 border-primary-200"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#7b5af0" />
        </TouchableOpacity>

        {/* Question text in the middle */}
        <View className="flex-1 mx-3 bg-white/95 px-5 py-3 rounded-2xl shadow-md border-2 border-secondary-100">
          <Text
            variant="medium"
            className="text-lg text-primary-700 text-center"
            numberOfLines={2}
          >
            {currentQuestion}
          </Text>
        </View>

        {/* Level indicator */}
        <View className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-md border-2 border-primary-200">
          <Text variant="bold" className="text-primary-700">
            {currentLevelIndex + 1}/{gameLevels.length}
          </Text>
        </View>
      </View>

      {/* Coin display - moved to separate row */}
      <View className="items-end px-4 py-2">
        <View className="bg-white p-1 rounded-full shadow-md border-2 border-accent-100">
          <Image
            source={require("@/assets/images/wildlife.jpg")}
            className="w-10 h-10 rounded-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Main content area */}
      <View className="flex-1 flex-row justify-between items-center px-5">
        {/* Left character */}
        <View className="w-[15%] items-center justify-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-lg border-4 border-secondary-200">
            <Image
              source={require("@/assets/images/textile.jpg")}
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Center game area */}
        <View className="w-[70%] items-center justify-center">
          {/* Word to guess */}
          <Animated.View
            className="flex-row items-center justify-center py-4 px-6 bg-white/80 rounded-3xl shadow-md mb-5 border-2 border-primary-100"
            style={{
              transform: [
                {
                  scale: bounceValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1],
                  }),
                },
              ],
            }}
          >
            {displayWord.split("").map((char, index) => (
              <View
                key={index}
                ref={(ref) => (wordSlotRefs.current[index] = ref)}
                className="w-14 h-14 justify-center items-center mx-1.5 relative"
              >
                <Text variant="bold" className="text-4xl text-primary-700 pt-3">
                  {char !== "_" ? char : ""}
                </Text>
                {char === "_" && (
                  <View className="absolute bottom-0 w-12 h-1.5 bg-primary-500 rounded-full" />
                )}
              </View>
            ))}
          </Animated.View>

          {/* Letter choices */}
          <View className="flex-row flex-wrap justify-center w-full pb-6">
            {letters.map((letter, index) => {
              // Check if this letter still has any unfilled positions in the word
              const hasUnfilledPositions = currentWord
                .split("")
                .some((char, i) => char === letter && displayWord[i] === "_");

              // A letter is disabled only if it doesn't appear in the word OR has no unfilled positions left
              const isDisabled =
                !currentWord.includes(letter) || !hasUnfilledPositions;

              // A letter is greyed out if it's disabled
              const isGreyedOut = isDisabled && currentWord.includes(letter);

              return (
                <TouchableOpacity
                  key={index}
                  ref={(ref) => (letterRefs.current[index] = ref)}
                  className={`w-16 h-16 rounded-full m-2 justify-center items-center shadow-lg border-2 ${
                    isGreyedOut
                      ? "bg-gray-300 border-gray-400 opacity-70"
                      : "bg-secondary-500 border-secondary-300"
                  }`}
                  onPress={() => handleLetterPress(letter, index)}
                  disabled={isDisabled}
                  activeOpacity={0.8}
                >
                  <Text variant="bold" className="text-white text-2xl">
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Right hint button */}
        <View className="w-[15%] items-center justify-center">
          <TouchableOpacity className="w-20 h-20 bg-white rounded-full justify-center items-center shadow-lg border-4 border-accent-200">
            <Image
              source={require("@/assets/images/river.jpg")}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Flying letter animation */}
      {animatingLetter && (
        <Animated.View
          style={[
            {
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
              left: animatingLetter.startX,
              top: animatingLetter.startY,
              width: animatingLetter.width,
              height: animatingLetter.height,
              transform: [
                { translateX: flyingLetterPosition.x },
                { translateY: flyingLetterPosition.y },
                { scale: flyingLetterScale },
              ],
              opacity: flyingLetterOpacity,
            },
          ]}
        >
          <Text variant="bold" className="text-3xl text-primary-600 shadow">
            {animatingLetter.letter}
          </Text>
        </Animated.View>
      )}

      {/* Success Modal */}
      <Modal transparent={true} visible={showSuccessModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 pt-8 w-4/5 items-center shadow-xl border-4 border-primary-100">
            {/* Decorative elements */}
            <View className="absolute -top-6 left-1/2 -ml-12 w-24 h-24 bg-primary-100 rounded-full items-center justify-center border-4 border-white shadow-lg">
              <Text className="text-5xl">🎉</Text>
            </View>
            <View className="absolute top-3 left-6">
              <View className="w-8 h-8 rounded-full bg-accent-200 opacity-60" />
            </View>
            <View className="absolute bottom-4 right-8">
              <View className="w-6 h-6 rounded-full bg-primary-200 opacity-50" />
            </View>

            {/* Title with styling matching app */}
            <Text
              variant="bold"
              className="text-3xl text-primary-600 mb-3 mt-2"
            >
              Good Job!
            </Text>

            {/* Word display with highlight */}
            <View className="bg-primary-50/70 w-full rounded-2xl px-4 py-4 mb-6 border-2 border-primary-100">
              <Text
                variant="medium"
                className="text-lg text-primary-700 text-center mb-2"
              >
                You correctly guessed the word:
              </Text>
              <View className="flex-row justify-center items-center">
                {currentWord.split("").map((letter, index) => (
                  <View
                    key={index}
                    className="w-12 h-12 mx-1 justify-center items-center bg-white rounded-lg shadow-sm border border-primary-200"
                  >
                    <Text variant="bold" className="text-2xl text-primary-700">
                      {letter}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Button with improved styling */}
            <TouchableOpacity
              className="bg-primary-500 py-4 px-8 rounded-full shadow-lg border-2 border-primary-400 active:scale-95"
              onPress={goToNextLevel}
              activeOpacity={0.7}
            >
              <Text variant="bold" className="text-white text-xl">
                {isGameCompleted ? "Play Again" : "Next Level"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Game Completed Modal */}
      <Modal transparent={true} visible={isGameCompleted} animationType="fade">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 bg-black/50"
        >
          <View className="flex-1 justify-center items-center px-4 py-10">
            <View className="bg-white rounded-3xl p-6 w-[70%] items-center shadow-xl border-4 border-primary-100">
              {/* Trophy decoration on top - repositioned to be more visible */}
              <View className="absolute -top-6 left-1/2 -ml-10 w-20 h-20 bg-accent-100 rounded-full items-center justify-center border-4 border-white shadow-lg">
                <Text className="text-4xl">🏆</Text>
              </View>

              {/* Decorative elements - positions adjusted */}
              <View className="absolute top-4 left-6">
                <View className="w-8 h-8 rounded-full bg-primary-200 opacity-60" />
              </View>
              <View className="absolute bottom-4 right-6">
                <View className="w-6 h-6 rounded-full bg-secondary-200 opacity-50" />
              </View>

              {/* Confetti-like elements - made smaller and repositioned */}
              <View className="absolute top-12 left-10">
                <Text className="text-xl">✨</Text>
              </View>
              <View className="absolute bottom-6 left-6">
                <Text className="text-xl">🎊</Text>
              </View>
              <View className="absolute top-8 right-10">
                <Text className="text-xl">🎉</Text>
              </View>

              {/* Title with styling matching app */}
              <Text
                variant="bold"
                className="text-2xl text-primary-600 mb-3 mt-8"
              >
                Congratulations!
              </Text>

              {/* Completion message - made more compact */}
              <View className="bg-primary-50/80 w-full rounded-2xl px-4 py-3 mb-4 border-2 border-primary-100">
                <Text
                  variant="medium"
                  className="text-lg text-primary-700 text-center"
                >
                  You have completed all levels!
                </Text>

                {/* Badge or achievement indicator */}

                {/* uncomment this when needed */}
                {/* <View className="flex-row justify-center items-center mt-2 py-1.5 px-3 bg-white/90 rounded-full self-center border-2 border-accent-100">
                  <Ionicons
                    name="star"
                    size={18}
                    color="#ffb900"
                    style={{ marginRight: 4 }}
                  />
                  <Text variant="bold" className="text-sm text-primary-700">
                    Word Master Badge Earned!
                  </Text>
                </View> */}
              </View>

              {/* Button with improved styling */}
              <TouchableOpacity
                className="bg-primary-500 py-3 px-8 rounded-full shadow-lg border-2 border-primary-400 active:scale-95"
                onPress={() => {
                  setIsGameCompleted(false);
                  setCurrentLevelIndex(0);
                  loadLevel(0);
                }}
                activeOpacity={0.7}
              >
                <Text variant="bold" className="text-white text-lg">
                  Play Again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

export default WordGame;
