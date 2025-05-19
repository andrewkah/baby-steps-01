import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  ScrollView
} from "react-native";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useChild } from "@/context/ChildContext";
import { saveActivity } from "@/lib/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  COUNTING_GAME_STAGES,
  CountingGameStage,
  culturalItems,
  getRandomNumbersForStage,
  getLugandaWord,
  CulturalItem,
  ugandanCurrency,
} from "./utils/countingGameStages";
import { Text } from "@/components/StyledText";
import {
  CountingGameProgress,
  DEFAULT_PROGRESS,
  loadGameProgress,
  saveGameProgress,
  updateProgressForStageCompletion,
  updateLastPlayedLevel,
  isStageUnlocked
} from "./utils/progressManagerCountingGame";

const { width, height } = Dimensions.get("window");

// Define TypeScript interfaces for our data structures
interface CountItem {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  bunch?: number; // Optional bunch number for grouped items
}

interface WindowDimensions {
  width: number;
  height: number;
}

// Game states
type GameState = "stageSelect" | "playing" | "stageComplete";

const LugandaCountingGame: React.FC = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("stageSelect");
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentItem, setCurrentItem] = useState<CulturalItem>(
    culturalItems[0]
  );
  const [itemsToCount, setItemsToCount] = useState<CountItem[]>([]);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [numberOptions, setNumberOptions] = useState<number[]>([]);
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width,
    height,
  });
  const [targetNumber, setTargetNumber] = useState<number>(1);
  const [gameLevels, setGameLevels] = useState<number[]>([]);
  const [stageCompleted, setStageCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Progress state
  const [progress, setProgress] = useState<CountingGameProgress>(DEFAULT_PROGRESS);
  const [fadeAnim] = useState(new Animated.Value(0));

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { activeChild } = useChild();
  const gameStartTime = useRef(Date.now());

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (activeChild) {
        try {
          console.log(`Loading progress for child: ${activeChild.id}`);
          const savedProgress = await loadGameProgress(activeChild.id);
          setProgress(savedProgress);
          
          // If we have a current stage saved, set it
          if (savedProgress.currentStage) {
            setCurrentStage(savedProgress.currentStage);
          }
        } catch (error) {
          console.error("Error loading progress:", error);
          // Set default progress specific to this child
          setProgress({...DEFAULT_PROGRESS, childId: activeChild.id});
        } finally {
          setIsLoading(false);
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }
      } else {
        setIsLoading(false);
        // Set a temporary default progress 
        setProgress(DEFAULT_PROGRESS);
      }
    };

    loadSavedProgress();
  }, [activeChild]);

  // Add orientation locking
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation(): Promise<void> {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (error) {
        console.error("Failed to lock orientation:", error);
      }
    }

    setLandscapeOrientation();

    return () => {
      // Reset orientation when component unmounts
    };
  }, []);

  // Add listener for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle stage completion and update progress
  const handleStageCompletion = async () => {
    if (!activeChild) return;
    
    // Update progress to mark this stage as completed
    const updatedProgress = updateProgressForStageCompletion(
      progress,
      currentStage,
      score + 10, // Add bonus points for completing the stage
      activeChild.id
    );
    
    setProgress(updatedProgress);
    await saveGameProgress(updatedProgress, activeChild.id);
    console.log(`Stage ${currentStage} completed for child: ${activeChild.id}`);
  };

  // When game state changes to playing, initialize the stage
  useEffect(() => {
    if (gameState === "playing") {
      initializeStage(currentStage);
    }
  }, [gameState]);

  // When the stage changes, initialize the new stage
  useEffect(() => {
    if (gameState === "playing") {
      console.log(`Stage changed to ${currentStage}`);
      setIsLoading(true);
      initializeStage(currentStage);
      // Reset UI states when changing stages
      setShowFeedback(false);
      setSelectedCount(null);
      setNumberOptions([]);
      setScore(0);
      setIsLoading(false);
    }
  }, [currentStage]);

  // When level changes, setup the level
  useEffect(() => {
    if (gameState === "playing" && gameLevels.length > 0) {
      console.log(
        `Setting up level ${currentLevel} with game levels:`,
        gameLevels
      );
      const levelIndex = currentLevel - 1;
      if (levelIndex < gameLevels.length) {
        setupLevel(gameLevels[levelIndex], currentStage);
      } else {
        console.error(
          `Level index ${levelIndex} out of bounds for game levels array of length ${gameLevels.length}`
        );
        // Handle edge case
        if (gameLevels.length > 0) {
          setupLevel(gameLevels[0], currentStage);
        }
      }

      if (activeChild) {
        // Update last played level in progress
        const updatedProgress = updateLastPlayedLevel(
          progress, 
          currentStage, 
          currentLevel,
          activeChild.id // Pass the child ID to ensure it's set correctly
        );
        setProgress(updatedProgress);
        saveGameProgress(updatedProgress, activeChild.id);
      }
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentLevel, gameLevels, gameState, activeChild]);

  // Initialize a stage with randomized levels
  const initializeStage = (stageId: number): void => {
    try {
      // Get random numbers for this stage
      const randomNumbers = getRandomNumbersForStage(stageId);

      // Verify we have numbers before proceeding
      if (randomNumbers.length === 0) {
        console.error(`No numbers generated for stage ${stageId}`);
        // Default to some fallback numbers based on stage
        const stage =
          COUNTING_GAME_STAGES.find((s) => s.id === stageId) ||
          COUNTING_GAME_STAGES[0];
        const { min } = stage.numbersRange;
        setGameLevels([min, min + 1, min + 2, min + 3]);
      } else {
        console.log(`Stage ${stageId} initialized with levels:`, randomNumbers);
        setGameLevels(randomNumbers);
      }

      // Check if we have a saved level for this stage
      const savedLevel = progress.lastPlayedLevel[stageId];
      if (savedLevel && savedLevel > 1) {
        setCurrentLevel(savedLevel);
      } else {
        // Reset level to 1 when starting a new stage
        setCurrentLevel(1);
      }
      
      setStageCompleted(false);

      // Ensure clean UI state
      setShowFeedback(false);
      setSelectedCount(null);
    } catch (error) {
      console.error("Error initializing stage:", error);
      // Set some default game levels to prevent the game from breaking
      setGameLevels([1, 2, 3, 4, 5]);
    }
  };

  const setupLevel = (targetNum = 0, stageId = currentStage): void => {
    try {
      // Choose a random item from cultural items
      const randomItemIndex = Math.floor(Math.random() * culturalItems.length);
      const newItem = culturalItems[randomItemIndex];

      // Get the current stage
      const stage =
        COUNTING_GAME_STAGES.find((s) => s.id === stageId) ||
        COUNTING_GAME_STAGES[0];

      // Get the target number for this level from the randomized levels
      const levelIndex = currentLevel - 1;
      // Use provided targetNum if available, otherwise get from gameLevels
      const numberToUse =
        targetNum || (gameLevels[levelIndex] ?? stage.numbersRange.min);
      console.log(`Setting up level with target number: ${numberToUse}`);
      setTargetNumber(numberToUse);

      // Calculate container dimensions
      const containerWidth = dimensions.width * 0.6; // Center section is 4/6 of width = ~60%
      const containerHeight = 200; // Fixed height for items container

      // Item dimensions
      const itemSize = 64; // 16 * 4 = 64px (w-16 h-16)

      // Calculate safe boundaries with padding to ensure items stay fully visible
      const safeAreaPadding = 10;
      const minX = safeAreaPadding;
      const maxX = containerWidth - itemSize - safeAreaPadding;
      const minY = safeAreaPadding;
      const maxY = containerHeight - itemSize - safeAreaPadding;

      let newItemsToCount: CountItem[] = [];

      if (stage.useBunches) {
        // For stages with bunches, we show fewer visual items representing groups
        const bunches = Math.ceil(numberToUse / (stage.itemsPerBunch || 10));

        // Create one item per bunch
        newItemsToCount = Array.from({ length: bunches }, (_, i) => ({
          id: i,
          x: minX + Math.random() * (maxX - minX),
          y: minY + Math.random() * (maxY - minY),
          rotate: Math.random() * 360,
          scale: 0.8 + Math.random() * 0.4,
          bunch: stage.itemsPerBunch || 10,
        }));
      } else if (stage.usesCurrency) {
        // For currency stage, show notes/coins based on the value
        // We'll simplify by showing one currency item
        newItemsToCount = [
          {
            id: 0,
            x: containerWidth / 2 - itemSize / 2,
            y: containerHeight / 2 - itemSize / 2,
            rotate: 0,
            scale: 1.5,
          },
        ];
      } else {
        // For basic counting (Stage 1), show individual items
        newItemsToCount = Array.from({ length: numberToUse }, (_, i) => ({
          id: i,
          x: minX + Math.random() * (maxX - minX),
          y: minY + Math.random() * (maxY - minY),
          rotate: Math.random() * 360,
          scale: 0.8 + Math.random() * 0.4,
        }));
      }

      // Generate number options here and store them in state
      const correctAnswer = numberToUse;
      const options: number[] = [correctAnswer];

      // Generate possible options within the stage's range
      const { min, max } = stage.numbersRange;
      const possibleOptions: number[] = [];

      // Add numbers within the range as possible options
      for (let i = min; i <= max; i++) {
        // For stages with bunches, only add multiples of the bunch size
        if (stage.useBunches && stage.itemsPerBunch) {
          if (i % stage.itemsPerBunch === 0 && i !== correctAnswer) {
            possibleOptions.push(i);
          }
        } else if (i !== correctAnswer) {
          possibleOptions.push(i);
        }
      }

      // Randomly select 2 more options
      while (options.length < 3 && possibleOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleOptions.length);
        options.push(possibleOptions[randomIndex]);
        possibleOptions.splice(randomIndex, 1);
      }

      // Shuffle the options
      options.sort(() => Math.random() - 0.5);

      setCurrentItem(newItem);
      setItemsToCount(newItemsToCount);
      setSelectedCount(null);
      setShowFeedback(false);
      setNumberOptions(options);
    } catch (error) {
      console.error("Error setting up level:", error);
      // Set default values to prevent crashes
      setItemsToCount([]);
      setNumberOptions([1, 2, 3]);
    }
  };

  const playNumberSound = async (number: number): Promise<void> => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // In a real app, you'd have actual audio files
      // For this example, we'll just log which sound would play
      console.log(`Playing sound for: ${getLugandaWord(number, currentStage)}`);

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/correct.mp3")
        );
        setSound(newSound);
        await newSound.playAsync();
      } catch (audioError) {
        console.error("Error loading sound file:", audioError);
      }
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  const trackActivity = async (isStageComplete: boolean = false) => {
    if (!activeChild) return;

    const duration = Math.round((Date.now() - gameStartTime.current) / 1000); // duration in seconds

    await saveActivity({
      child_id: activeChild.id,
      activity_type: "counting",
      activity_name: isStageComplete
        ? `Completed Counting Stage ${currentStage}`
        : "Practiced Counting",
      score: score.toString(),
      duration,
      completed_at: new Date().toISOString(),
      details: `${
        isStageComplete
          ? `Completed all levels in Stage ${currentStage}`
          : `Completed level ${currentLevel} in Stage ${currentStage}`
      }`,
      stage: currentStage,
      level: currentLevel,
    });
  };

  const handleNumberPress = async (number: number): Promise<void> => {
    setSelectedCount(number);
    playNumberSound(number);

    // Check if the answer is correct
    const isAnswerCorrect = number === targetNumber;
    setIsCorrect(isAnswerCorrect);

    // Show feedback
    setShowFeedback(true);

    // Animate the feedback
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // If correct, add to score and prepare for next level
    if (isAnswerCorrect) {
      setScore((prevScore) => prevScore + 10);

      // Rotate animation for correct answer
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
      });

      // Move to next level after a delay
      setTimeout(async () => {
        const currentStageData =
          COUNTING_GAME_STAGES.find((s) => s.id === currentStage) ||
          COUNTING_GAME_STAGES[0];
        if (currentLevel < currentStageData.levels) {
          await trackActivity(false);
          setCurrentLevel((prevLevel) => prevLevel + 1);
        } else {
          // Stage completed!
          setStageCompleted(true);
          await trackActivity(true);
          
          // Use the new stage completion handler
          if (activeChild) {
            await handleStageCompletion();
          }
        }
      }, 1500);
    } else {
      // For incorrect answers, clear feedback after a short delay to allow another try
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedCount(null);
      }, 1500);
    }
  };

  const renderNumberOptions = (): JSX.Element[] => {
    return numberOptions.map((number) => (
      <TouchableOpacity
        key={number}
        className={`w-16 h-16 rounded-full justify-center items-center shadow mb-3
          ${
            selectedCount === number && isCorrect
              ? "bg-success"
              : selectedCount === number && !isCorrect
              ? "bg-destructive"
              : "bg-secondary"
          }`}
        onPress={() => handleNumberPress(number)}
        disabled={showFeedback && isCorrect} // Only disable if showing correct feedback
      >
        <Text variant="bold" className="text-lg text-white">{number}</Text>
        <Text variant="bold" className="text-xs text-white">
          {getLugandaWord(number, currentStage)}
        </Text>
      </TouchableOpacity>
    ));
  };

  const getImageSource = () => {
    try {
      return require("@/assets/images/african-logic.png");
    } catch (error) {
      console.error("Failed to load image:", error);
      // Return null if image can't be loaded, will be handled in rendering
      return null;
    }
  };

  const renderItemsToCount = (): JSX.Element[] => {
    const stage =
      COUNTING_GAME_STAGES.find((s) => s.id === currentStage) ||
      COUNTING_GAME_STAGES[0];

    // For currency stage, render the currency item
    if (stage.usesCurrency) {
      const currencyItem = ugandanCurrency.find(
        (item) => item.value === targetNumber
      );

      if (!currencyItem) {
        console.warn(`No currency item found for value ${targetNumber}`);
        // Display a fallback
        return [
          <View
            key="currency-fallback"
            className="items-center justify-center absolute"
            style={{
              left: dimensions.width * 0.3,
              top: dimensions.height * 0.3,
            }}
          >
            <Text variant="bold" className="text-xl text-primary-800">
              {`Shs ${targetNumber}`}
            </Text>
          </View>,
        ];
      }

      const imageSource = getImageSource();

      return [
        <View
          key="currency-item"
          className="items-center justify-center absolute"
          style={{
            left: itemsToCount[0]?.x || dimensions.width * 0.3,
            top: itemsToCount[0]?.y || dimensions.height * 0.3,
          }}
        >
          {imageSource && (
            <Animated.Image
              source={imageSource}
              className="w-24 h-24"
              style={{
                transform: [{ scale: itemsToCount[0]?.scale || 1.5 }],
              }}
              resizeMode="contain"
            />
          )}
          <Text variant="bold" className="text-lg text-primary-800 mt-2">
            {currencyItem.name}
          </Text>
        </View>,
      ];
    }

    const imageSource = getImageSource();
    if (!imageSource) {
      // If image can't be loaded, show text placeholders
      return itemsToCount.map((item) => (
        <View
          key={item.id}
          className="items-center justify-center absolute bg-primary rounded-full w-16 h-16"
          style={{
            left: item.x,
            top: item.y,
          }}
        >
          <Text variant="bold" className="text-white">{item.id + 1}</Text>
        </View>
      ));
    }

    // For stages with bunches
    if (stage.useBunches) {
      return itemsToCount.map((item) => (
        <View
          key={item.id}
          className="items-center absolute"
          style={{
            left: item.x,
            top: item.y,
          }}
        >
          <Animated.Image
            source={imageSource}
            className="w-16 h-16"
            style={{
              transform: [
                { rotate: `${item.rotate}deg` },
                { scale: item.scale },
              ],
            }}
            resizeMode="contain"
          />
          <Text variant="bold" className="text-xs bg-white/80 px-2 py-1 rounded mt-1">
            {item.bunch} {currentItem.name}
          </Text>
        </View>
      ));
    }

    // For basic counting (Stage 1)
    return itemsToCount.map((item) => (
      <Animated.Image
        key={item.id}
        source={imageSource}
        className="w-16 h-16 absolute"
        style={{
          left: item.x,
          top: item.y,
          transform: [{ rotate: `${item.rotate}deg` }, { scale: item.scale }],
        }}
        resizeMode="contain"
      />
    ));
  };

  const getQuestionText = (): string => {
    const stage =
      COUNTING_GAME_STAGES.find((s) => s.id === currentStage) ||
      COUNTING_GAME_STAGES[0];

    if (stage.usesCurrency) {
      return "How much is this Ugandan currency worth?";
    }

    if (stage.useBunches) {
      return `Each bunch has ${stage.itemsPerBunch} ${currentItem.name}. How many ${currentItem.name} are there in total?`;
    }

    return `Balanga ${currentItem.name} emeka? (How many ${currentItem.name} do you see?)`;
  };

  const selectStage = (stageId: number) => {
    if (isStageUnlocked(progress, stageId)) {
      setCurrentStage(stageId);
      
      if (activeChild) {
        // Update current stage in progress
        const updatedProgress = {
          ...progress,
          currentStage: stageId,
          childId: activeChild.id // Ensure child ID is set
        };
        setProgress(updatedProgress);
        saveGameProgress(updatedProgress, activeChild.id);
        console.log(`Selected stage ${stageId} for child: ${activeChild.id}`);
      }
      
      setGameState("playing");
    }
  };

  const continueStage = () => {
    // Continue with current stage
    setStageCompleted(false);
    setShowFeedback(false);
    setSelectedCount(null);
    
    if (currentStage < COUNTING_GAME_STAGES.length) {
      setCurrentStage((prevStage) => prevStage + 1);
    } else {
      // If this was the last stage, go back to stage selection
      setGameState("stageSelect");
    }
  };
  
  // RENDER: Stage Selection Screen
  const renderStageSelectionScreen = () => {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar style="dark" />

        {/* Header with back button and title */}
        <View className="flex-row justify-between items-center px-4 pt-6 pb-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-indigo-100"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#818cf8" />
          </TouchableOpacity>

          <Text variant="bold" className="text-xl text-indigo-800">
            Luganda Counting Game
          </Text>

          <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <Image
              source={require("@/assets/images/coin.png")}
              className="w-5 h-5 mr-1"
              resizeMode="contain"
            />
            <Text variant="bold" className="text-amber-500">{progress.totalScore}</Text>
          </View>
        </View>

        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 15,
              paddingVertical: 20,
              alignItems: 'center'
            }}
          >
            {COUNTING_GAME_STAGES.map((stage) => {
              const isUnlocked = isStageUnlocked(progress, stage.id);
              const isCompleted = progress.completedStages.includes(stage.id);
              
              return (
                <TouchableOpacity
                  key={stage.id}
                  onPress={() => selectStage(stage.id)}
                  disabled={!isUnlocked}
                  className={`mx-3 rounded-2xl overflow-hidden shadow-md ${!isUnlocked ? 'opacity-60' : ''}`}
                  style={{ width: width * 0.35, height: height * 0.65 }}
                >
                  <LinearGradient
                    colors={isCompleted ? ['#10b981', '#059669'] : ['#6366f1', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-6 flex-1 justify-between"
                  >
                    {/* Stage Header */}
                    <View>
                      <View className="flex-row justify-between items-center mb-4">
                        <View className="bg-white/20 px-3 py-1 rounded-full">
                          <Text variant="bold" className="text-white">Stage {stage.id}</Text>
                        </View>
                        
                        {!isUnlocked ? (
                          <View className="bg-black/30 p-2 rounded-full">
                            <Ionicons name="lock-closed" size={18} color="white" />
                          </View>
                        ) : isCompleted ? (
                          <View className="bg-white p-2 rounded-full">
                            <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                          </View>
                        ) : (
                          <View className="bg-white p-2 rounded-full">
                            <Ionicons name="play" size={18} color="#6366f1" />
                          </View>
                        )}
                      </View>

                      <Text variant="bold" className="text-white text-xl mb-2">
                        {stage.title}
                      </Text>
                      
                      <Text className="text-white/90 mb-4">
                        {stage.description}
                      </Text>
                      
                      {/* Range info */}
                      <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-lg mb-3">
                        <Ionicons name="calculator-outline" size={16} color="white" />
                        <Text className="text-white ml-2">
                          {stage.numbersRange.min} - {stage.numbersRange.max}
                        </Text>
                      </View>
                      
                      {/* Levels info */}
                      <View className="flex-row items-center bg-white/20 px-3 py-2 rounded-lg">
                        <Ionicons name="layers-outline" size={16} color="white" />
                        <Text className="text-white ml-2">
                          {stage.levels} levels
                        </Text>
                      </View>
                    </View>
                    
                    {/* Bottom action area */}
                    <View className="mt-6">
                      {isUnlocked ? (
                        <TouchableOpacity
                          className="bg-white py-3 rounded-xl items-center"
                          onPress={() => selectStage(stage.id)}
                        >
                          <Text variant="bold" className={isCompleted ? "text-emerald-600" : "text-indigo-600"}>
                            {isCompleted ? "Play Again" : "Start"}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View className="bg-black/20 py-3 rounded-xl items-center">
                          <Text className="text-white/80">Complete Previous Stage</Text>
                        </View>
                      )}
                      
                      {progress.lastPlayedLevel[stage.id] && isUnlocked && !isCompleted && (
                        <Text className="text-white/80 text-center mt-2 text-xs">
                          Continue from Level {progress.lastPlayedLevel[stage.id]}
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {/* Bottom section with instructions */}
          <View className="mx-4 p-4 bg-indigo-50 rounded-xl mb-4">
            <Text variant="bold" className="text-indigo-800 mb-2">How to Play</Text>
            <Text className="text-slate-700 mb-1">• Count the items and select the correct number</Text>
            <Text className="text-slate-700 mb-1">• Learn Luganda numbers as you play</Text>
            <Text className="text-slate-700">• Complete all levels in a stage to unlock the next one</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  };

  // Show loading state if game is loading
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4ff" }}>
        <LinearGradient
          colors={["#f3f4ff", "#e9ebff"]}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <StatusBar style="dark" />
          <Image
            source={require("@/assets/images/coin.png")}
            style={{ width: 80, height: 80, marginBottom: 16, opacity: 0.7 }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#6366f1" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 18,
              color: "#6366f1",
              fontWeight: "600",
            }}
          >
            Loading your counting adventure...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  // Render the appropriate screen based on game state
  if (gameState === "stageSelect") {
    return renderStageSelectionScreen();
  }

  // Render the game screen
  return (
    <SafeAreaView className="flex-1 bg-indigo-50 pt-3">
      <StatusBar style="dark" />

      {/* Decorative elements */}
      <View className="absolute top-5 right-5">
        <View className="w-12 h-12 rounded-full bg-indigo-500 opacity-10" />
      </View>

      <View className="absolute bottom-10 left-16">
        <View className="w-16 h-16 rounded-full bg-emerald-500 opacity-10" />
      </View>

      {/* Header with back button and game info */}
      <View className="flex-row justify-between items-center px-4 pt-3 pb-2">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white justify-center items-center shadow-sm border border-indigo-100"
          onPress={() => setGameState("stageSelect")}
        >
          <Ionicons name="arrow-back" size={20} color="#818cf8" />
        </TouchableOpacity>

        <View className="flex-row items-center  px-4 py-2 rounded-xl">
          <View className="flex-row items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Image
              source={require("@/assets/images/coin.png")}
              className="w-5 h-5 mr-1"
              resizeMode="contain"
            />
            <Text variant="bold" className="text-amber-500">{score}</Text>
          </View>
        </View>
      </View>

      {/* Main content area */}
      <View className="flex-1 flex-row w-full px-4 py-2">
        {/* Left section - Stage indicator */}
        <View className="w-1/6 items-center pt-4">
          <View className="bg-white rounded-xl shadow-sm p-3 w-full">
            <Text className="text-center text-sm text-indigo-400">
              STAGE
            </Text>
            <View className="items-center justify-center my-2">
              <View
                className="w-16 h-16 rounded-full items-center justify-center shadow-md"
                style={{
                  backgroundColor:
                    (COUNTING_GAME_STAGES[currentStage - 1] as any)?.color ||
                    "#818cf8",
                }}
              >
                <Text variant="bold" className="text-2xl text-white">
                  {currentStage}
                </Text>
              </View>
            </View>

            <View className="bg-indigo-100 rounded-full h-2 w-full mt-1 mb-2">
              <View
                className="bg-indigo-500 rounded-full h-2"
                style={{
                  width: `${
                    (currentLevel /
                      (COUNTING_GAME_STAGES[currentStage - 1]?.levels || 5)) *
                    100
                  }%`,
                }}
              />
            </View>

            <Text className="text-center text-xs text-indigo-500">
              Level {currentLevel}/
              {COUNTING_GAME_STAGES[currentStage - 1]?.levels || 5}
            </Text>
          </View>

          
        </View>

        {/* Center section - Items to count */}
        <View className="w-3/5 items-center px-4 -top-20">
          {/* Question prompt */}
          <View className="items-center mb-1 bg-white px-6 py-2 rounded-xl shadow-sm">
            <Text variant="bold" className="text-lg text-slate-800 text-center">
              {getQuestionText()}
            </Text>
            <Text className="text-sm text-indigo-600 text-center mt-1">
              {COUNTING_GAME_STAGES[currentStage - 1]?.description ||
                "Learn to count in Luganda"}
            </Text>
          </View>

          {/* Items container */}
          <View className="w-full h-56 relative bg-white rounded-xl p-4 shadow-sm">
            {/* Grid for visual guidance */}
            <View className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={`grid-h-${i}`}
                  className="absolute border-t border-indigo-50"
                  style={{
                    top: (i * 224) / 10,
                    left: 0,
                    right: 0,
                  }}
                />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={`grid-v-${i}`}
                  className="absolute border-l border-indigo-50"
                  style={{
                    left: `${(i * 100) / 10}%`,
                    top: 0,
                    bottom: 0,
                  }}
                />
              ))}
            </View>

            {/* Render counting items */}
            {renderItemsToCount()}
          </View>

          {/* Lugandan word */}
          <View className="flex-row items-center justify-center bg-blue-50 mt-3 px-4 py-2 rounded-lg border border-blue-100">
            <Text className="text-blue-600 text-center">
              {getLugandaWord(targetNumber, currentStage)} = {targetNumber}
            </Text>
          </View>
        </View>

        {/* Right section - Number options */}
        <View className="w-1/4 items-center justify-center">
          <View className="bg-white rounded-xl shadow-sm p-4 w-full">
            <Text className="text-center text-sm text-indigo-400 mb-3">
              BALANGA EMEKA?
            </Text>

            <View className="items-center justify-around py-2 space-y-3">
              {numberOptions.length > 0 ? (
                numberOptions.map((number) => (
                  <TouchableOpacity
                    key={number}
                    className={`w-20 h-20 rounded-full justify-center items-center shadow mb-2 ${
                      selectedCount === number && isCorrect
                        ? "bg-emerald-500 border-2 border-emerald-200"
                        : selectedCount === number && !isCorrect
                        ? "bg-red-500 border-2 border-red-200"
                        : "bg-indigo-500"
                    }`}
                    onPress={() => handleNumberPress(number)}
                    disabled={showFeedback && isCorrect}
                  >
                    <Text variant="bold" className="text-xl text-white">
                      {number}
                    </Text>
                    <Text className="text-xs text-white opacity-90">
                      {getLugandaWord(number, currentStage).split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <ActivityIndicator size="small" color="#818cf8" />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Feedback animation */}
      {showFeedback && (
        <Animated.View
          className={`absolute bg-white px-6 py-5 rounded-3xl shadow-lg ${
            isCorrect
              ? "border-4 border-emerald-400"
              : "border-4 border-red-400"
          }`}
          style={{
            top: "50%",
            left: "50%",
            marginLeft: -110, // Half of width
            marginTop: -60, // Approximate half of height
            width: 220,
            transform: [
              { scale: bounceAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }) as any, // Type assertion for TypeScript
              },
            ],
          }}
        >
          <View className="items-center">
            <Text className="text-4xl mb-2 pt-3">{isCorrect ? "🎉" : "😕"}</Text>
            <Text
            variant="bold"
              className={`text-xl text-center mb-1 ${
                isCorrect ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "Kirungi!" : "Gezaako nela!"}
            </Text>
            <Text className="text-slate-600 text-center">
              {isCorrect ? "Correct!" : "Try again!"}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Stage completion overlay */}
      {stageCompleted && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center pt-12">
          <View className="bg-white rounded-2xl p-6 w-3/5 max-w-md items-center shadow-xl">
            <View className="absolute -top-10 bg-indigo-500 w-20 h-20 rounded-full items-center justify-center border-4 border-white">
              <Text className="text-4xl">🏆</Text>
            </View>

            <Text variant="bold" className="text-2xl text-indigo-800 mt-6 mb-3 text-center">
              Stage {currentStage} Complete!
            </Text>

            <Text className="text-slate-600 text-center mb-5 text-base">
              You've mastered counting from{" "}
              {COUNTING_GAME_STAGES[currentStage - 1]?.numbersRange.min} to{" "}
              {COUNTING_GAME_STAGES[currentStage - 1]?.numbersRange.max}!
            </Text>

            <View className="bg-blue-50 w-full rounded-xl p-4 mb-5">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={20} color="#f59e0b" />
                  <Text  className="ml-2 text-slate-700">
                    Score
                  </Text>
                </View>
                <Text variant="bold" className="text-amber-500 text-lg">
                  {score + 10}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="ml-2 text-slate-700">
                    Levels Completed
                  </Text>
                </View>
                <Text variant="bold" className="text-emerald-600 text-lg">
                  {COUNTING_GAME_STAGES[currentStage - 1]?.levels || 5}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-indigo-500 py-4 px-6 rounded-xl shadow-md"
              onPress={continueStage}
            >
              <Text variant="bold" className="text-white text-lg text-center">
                {currentStage < COUNTING_GAME_STAGES.length
                  ? "Next Stage"
                  : "Play Again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LugandaCountingGame;
