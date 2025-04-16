import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useChild } from '@/context/ChildContext';
import { saveActivity } from '@/lib/utils';
import {
  COUNTING_GAME_STAGES,
  CountingGameStage,
  culturalItems,
  getRandomNumbersForStage,
  getLugandaWord,
  CulturalItem,
  ugandanCurrency
} from './utils/countingGameStages';

const { width, height } = Dimensions.get('window');

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

const LugandaCountingGame: React.FC = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentItem, setCurrentItem] = useState<CulturalItem>(culturalItems[0]);
  const [itemsToCount, setItemsToCount] = useState<CountItem[]>([]);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [numberOptions, setNumberOptions] = useState<number[]>([]);
  const [dimensions, setDimensions] = useState<WindowDimensions>({ width, height });
  const [targetNumber, setTargetNumber] = useState<number>(1);
  const [gameLevels, setGameLevels] = useState<number[]>([]);
  const [stageCompleted, setStageCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { activeChild } = useChild();
  const gameStartTime = useRef(Date.now());

  // Add orientation locking
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation(): Promise<void> {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (error) {
        console.error('Failed to lock orientation:', error);
      }
    }
    
    setLandscapeOrientation();
    
    return () => {
      // Reset orientation when component unmounts
    };
  }, []);
  
  // Add listener for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => {
      subscription?.remove();
    };
  }, []);
  
  // Initialize game with stage 1 levels
  useEffect(() => {
    console.log('Initial game setup');
    initializeStage(currentStage);
  }, []);
  
  // When the stage changes, initialize the new stage
  useEffect(() => {
    console.log(`Stage changed to ${currentStage}`);
    setIsLoading(true);
    initializeStage(currentStage);
    // Reset UI states when changing stages
    setShowFeedback(false);
    setSelectedCount(null);
    setNumberOptions([]);
    setIsLoading(false);
  }, [currentStage]);
  
  // When level changes, setup the level
  useEffect(() => {
    console.log(`Setting up level ${currentLevel} with game levels:`, gameLevels);
    if (gameLevels.length > 0) {
      const levelIndex = currentLevel - 1;
      if (levelIndex < gameLevels.length) {
        setupLevel(gameLevels[levelIndex], currentStage);
      } else {
        console.error(`Level index ${levelIndex} out of bounds for game levels array of length ${gameLevels.length}`);
        // Handle edge case
        if (gameLevels.length > 0) {
          setupLevel(gameLevels[0], currentStage);
        }
      }
    }
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentLevel, gameLevels]);

  // Initialize a stage with randomized levels
  const initializeStage = (stageId: number): void => {
    try {
      // Get random numbers for this stage
      const randomNumbers = getRandomNumbersForStage(stageId);
      
      // Verify we have numbers before proceeding
      if (randomNumbers.length === 0) {
        console.error(`No numbers generated for stage ${stageId}`);
        // Default to some fallback numbers based on stage
        const stage = COUNTING_GAME_STAGES.find(s => s.id === stageId) || COUNTING_GAME_STAGES[0];
        const { min } = stage.numbersRange;
        setGameLevels([min, min + 1, min + 2, min + 3]);
      } else {
        console.log(`Stage ${stageId} initialized with levels:`, randomNumbers);
        setGameLevels(randomNumbers);
      }
      
      // Reset level to 1 when starting a new stage
      setCurrentLevel(1);
      setStageCompleted(false);
      
      // Ensure clean UI state
      setShowFeedback(false);
      setSelectedCount(null);
    } catch (error) {
      console.error('Error initializing stage:', error);
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
      const stage = COUNTING_GAME_STAGES.find(s => s.id === stageId) || COUNTING_GAME_STAGES[0];
      
      // Get the target number for this level from the randomized levels
      const levelIndex = currentLevel - 1;
      // Use provided targetNum if available, otherwise get from gameLevels
      const numberToUse = targetNum || (gameLevels[levelIndex] ?? stage.numbersRange.min);
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
        newItemsToCount = [{
          id: 0,
          x: containerWidth / 2 - itemSize / 2,
          y: containerHeight / 2 - itemSize / 2,
          rotate: 0,
          scale: 1.5,
        }];
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
      console.error('Error setting up level:', error);
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
          require('@/assets/sounds/correct.mp3')
        );
        setSound(newSound);
        await newSound.playAsync();
      } catch (audioError) {
        console.error('Error loading sound file:', audioError);
      }
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  const trackActivity = async (isStageComplete: boolean = false) => {
    if (!activeChild) return;
    
    const duration = Math.round((Date.now() - gameStartTime.current) / 1000); // duration in seconds
    
    await saveActivity({
      child_id: activeChild.id,
      activity_type: 'counting',
      activity_name: isStageComplete ? `Completed Counting Stage ${currentStage}` : 'Practiced Counting',
      score: score.toString(),
      duration,
      completed_at: new Date().toISOString(),
      details: `${isStageComplete ? 
        `Completed all levels in Stage ${currentStage}` : 
        `Completed level ${currentLevel} in Stage ${currentStage}`}`,
      stage: currentStage,
      level: currentLevel
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
      })
    ]).start();
    
    // If correct, add to score and prepare for next level
    if (isAnswerCorrect) {
      setScore(score + 10);
      
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
        const currentStageData = COUNTING_GAME_STAGES.find(s => s.id === currentStage) || COUNTING_GAME_STAGES[0];
        if (currentLevel < currentStageData.levels) {
          await trackActivity(false);
          setCurrentLevel(prevLevel => prevLevel + 1);
        } else {
          // Stage completed!
          setStageCompleted(true);
          await trackActivity(true);
          
          if (currentStage < COUNTING_GAME_STAGES.length) {
            Alert.alert(
              "Oyenze bulungi! (Well done!)",
              `Stage ${currentStage} completed with a score of ${score + 10}! Ready for Stage ${currentStage + 1}?`,
              [
                { 
                  text: "Next Stage", 
                  onPress: () => {
                    // Clear UI before advancing stage
                    setNumberOptions([]);
                    setShowFeedback(false);
                    setSelectedCount(null);
                    setItemsToCount([]);
                    
                    // Set new stage and reset score
                    const nextStage = currentStage + 1;
                    setCurrentStage(nextStage);
                    setScore(0);
                    // Reset game start time for new stage
                    gameStartTime.current = Date.now();
                  } 
                }
              ]
            );
          } else {
            // Game fully completed!
            Alert.alert(
              "Congratulations!",
              `You've mastered all stages of Luganda counting with a final score of ${score + 10}!`,
              [
                { 
                  text: "Play Again", 
                  onPress: () => {
                    // Clear UI before restarting
                    setNumberOptions([]);
                    setShowFeedback(false);
                    setSelectedCount(null);
                    setItemsToCount([]);
                    
                    // Reset to stage 1
                    setCurrentStage(1);
                    setCurrentLevel(1);
                    setScore(0);
                    // Reset game start time for new game
                    gameStartTime.current = Date.now();
                  } 
                }
              ]
            );
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
    return numberOptions.map(number => (
      <TouchableOpacity
        key={number}
        className={`w-16 h-16 rounded-full justify-center items-center shadow mb-3
          ${selectedCount === number && isCorrect ? 'bg-success' : 
            selectedCount === number && !isCorrect ? 'bg-destructive' : 
            'bg-secondary'}`}
        onPress={() => handleNumberPress(number)}
        disabled={showFeedback && isCorrect} // Only disable if showing correct feedback
      >
        <Text className="text-lg font-bold text-white">
          {number}
        </Text>
        <Text className="text-xs font-bold text-white">
          {getLugandaWord(number, currentStage)}
        </Text>
      </TouchableOpacity>
    ));
  };
  
  const getImageSource = () => {
    try {
      return require('@/assets/images/coin.png');
    } catch (error) {
      console.error('Failed to load image:', error);
      // Return null if image can't be loaded, will be handled in rendering
      return null;
    }
  };
  
  const renderItemsToCount = (): JSX.Element[] => {
    const stage = COUNTING_GAME_STAGES.find(s => s.id === currentStage) || COUNTING_GAME_STAGES[0];
    
    // For currency stage, render the currency item
    if (stage.usesCurrency) {
      const currencyItem = ugandanCurrency.find(item => item.value === targetNumber);
      
      if (!currencyItem) {
        console.warn(`No currency item found for value ${targetNumber}`);
        // Display a fallback
        return [
          <View key="currency-fallback" className="items-center justify-center absolute" style={{
            left: dimensions.width * 0.3,
            top: dimensions.height * 0.3,
          }}>
            <Text className="text-xl font-bold text-primary-800">
              {`Shs ${targetNumber}`}
            </Text>
          </View>
        ];
      }
      
      const imageSource = getImageSource();
      
      return [
        <View key="currency-item" className="items-center justify-center absolute" style={{
          left: itemsToCount[0]?.x || dimensions.width * 0.3,
          top: itemsToCount[0]?.y || dimensions.height * 0.3,
        }}>
          {imageSource && (
            <Animated.Image
              source={imageSource}
              className="w-24 h-24"
              style={{
                transform: [
                  { scale: itemsToCount[0]?.scale || 1.5 }
                ]
              }}
              resizeMode="contain"
            />
          )}
          <Text className="text-lg font-bold text-primary-800 mt-2">
            {currencyItem.name}
          </Text>
        </View>
      ];
    }
    
    const imageSource = getImageSource();
    if (!imageSource) {
      // If image can't be loaded, show text placeholders
      return itemsToCount.map(item => (
        <View key={item.id} className="items-center justify-center absolute bg-primary rounded-full w-16 h-16" style={{
          left: item.x,
          top: item.y,
        }}>
          <Text className="text-white font-bold">{item.id + 1}</Text>
        </View>
      ));
    }
    
    // For stages with bunches
    if (stage.useBunches) {
      return itemsToCount.map(item => (
        <View key={item.id} className="items-center absolute" style={{
          left: item.x,
          top: item.y,
        }}>
          <Animated.Image
            source={imageSource}
            className="w-16 h-16"
            style={{
              transform: [
                { rotate: `${item.rotate}deg` },
                { scale: item.scale }
              ]
            }}
            resizeMode="contain"
          />
          <Text className="text-xs font-bold bg-white/80 px-2 py-1 rounded mt-1">
            {item.bunch} {currentItem.name}
          </Text>
        </View>
      ));
    }
    
    // For basic counting (Stage 1)
    return itemsToCount.map(item => (
      <Animated.Image
        key={item.id}
        source={imageSource}
        className="w-16 h-16 absolute"
        style={{
          left: item.x,
          top: item.y,
          transform: [
            { rotate: `${item.rotate}deg` },
            { scale: item.scale }
          ]
        }}
        resizeMode="contain"
      />
    ));
  };
  
  const getQuestionText = (): string => {
    const stage = COUNTING_GAME_STAGES.find(s => s.id === currentStage) || COUNTING_GAME_STAGES[0];
    
    if (stage.usesCurrency) {
      return "How much is this Ugandan currency worth?";
    }
    
    if (stage.useBunches) {
      return `Each bunch has ${stage.itemsPerBunch} ${currentItem.name}. How many ${currentItem.name} are there in total?`;
    }
    
    return `Balanga ${currentItem.name} emeka? (How many ${currentItem.name} do you see?)`;
  };
  
  // Show loading state if game is loading
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <StatusBar style="auto" />
        <Text className="text-xl font-bold text-primary">Loading stage...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <StatusBar style="auto" />
      
      {/* Add Back Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 8,
          borderRadius: 20,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#7b5af0" />
      </TouchableOpacity>
      
      {/* Main content area */}
      <View className="flex-1 flex-row w-full px-6 pt-4">
        {/* Left section - Stage, Level and Score */}
        <View className="w-1/6 items-center justify-between py-6">
          <View className="bg-primary p-3 rounded-xl">
            <Text className="text-lg font-bold text-white">
              Stage {currentStage}
            </Text>
          </View>
          
          <View className="bg-success p-3 rounded-xl mt-3">
            <Text className="text-lg font-bold text-white">
              Level {currentLevel}
            </Text>
          </View>
          
          <View className="bg-secondary rounded-xl p-3 mt-4">
            <Text className="text-lg font-bold text-white">
              Score: {score}
            </Text>
          </View>
        </View>
        
        {/* Center section - Items to count and prompt */}
        <View className="w-4/6 items-center px-4">
          {/* Question prompt */}
          <View className="items-center mb-4 bg-white/80 px-6 py-3 rounded-xl shadow">
            <Text className="text-xl font-bold text-primary-900 text-center">
              {getQuestionText()}
            </Text>
            <Text className="text-sm italic text-primary-700 opacity-70 text-center">
              {COUNTING_GAME_STAGES[currentStage - 1]?.description || "Learn to count in Luganda"}
            </Text>
          </View>
          
          {/* Items to count with improved container */}
          <View className="w-full h-56 relative bg-white/30 rounded-2xl p-4 shadow">
            {renderItemsToCount()}
          </View>
        </View>
        
        {/* Right section - Number options */}
        <View className="w-1/6 items-center justify-center">
          <View className="items-center justify-around h-4/5 py-4">
            {numberOptions.length > 0 ? renderNumberOptions() : 
              <Text className="text-sm italic text-primary-700">Loading options...</Text>}
          </View>
        </View>
      </View>
      
      {/* Feedback animation */}
      {showFeedback && (
        <Animated.View 
          className={`absolute top-1/2 self-center bg-white/90 px-8 py-4 rounded-3xl shadow-lg
            ${isCorrect ? 'border-4 border-success' : 'border-4 border-destructive'}`}
          style={{
            transform: [
              { scale: bounceAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }}
        >
          <Text 
            className={`text-2xl font-bold text-center
              ${isCorrect ? 'text-success' : 'text-destructive'}`}
          >
            {isCorrect ? 'Kirungi! (Correct!)' : 'Gezaako nela! (Try again!)'}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default LugandaCountingGame;