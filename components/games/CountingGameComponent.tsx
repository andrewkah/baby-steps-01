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

const { width, height } = Dimensions.get('window');

// Define TypeScript interfaces for our data structures
interface LugandaNumber {
  number: number;
  luganda: string;
  audio: string;
}

interface CulturalItem {
  name: string;
  image: string;
}

interface CountItem {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

interface WindowDimensions {
  width: number;
  height: number;
}

// Luganda numbers 1-10 with their pronunciations
const lugandaNumbers: LugandaNumber[] = [
  { number: 1, luganda: 'Emu', audio: 'correct.mp3' },
  { number: 2, luganda: 'Bbiri', audio: 'correct.mp3' },
  { number: 3, luganda: 'Ssatu', audio: 'correct.mp3' },
  { number: 4, luganda: 'Nnya', audio: 'correct.mp3' },
  { number: 5, luganda: 'Ttaano', audio: 'correct.mp3' },
  { number: 6, luganda: 'Mukaaga', audio: 'correct.mp3' },
  { number: 7, luganda: 'Musanvu', audio: 'correct.mp3' },
  { number: 8, luganda: 'Munaana', audio: 'correct.mp3' },
  { number: 9, luganda: 'Mwenda', audio: 'correct.mp3' },
  { number: 10, luganda: 'Kkumi', audio: 'correct.mp3' },
];

// Ugandan cultural items to count
const culturalItems: CulturalItem[] = [
  { name: 'Matoke', image: 'coin.png' },
  { name: 'Engoma', image: 'coin.png' },
  { name: 'Ensiimbi', image: 'coin.png' },
  { name: 'Amatooke', image: 'coin.png' },
  { name: 'Ekikomera', image: 'coin.png' },
];

const LugandaCountingGame: React.FC = () => {
  const router = useRouter();
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
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Add orientation locking
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation(): Promise<void> {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    
    setLandscapeOrientation();
    
    return () => {
      // Reset orientation when component unmounts
      ScreenOrientation.unlockAsync();
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
  
  // Setup level when component mounts or level changes
  useEffect(() => {
    setupLevel();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentLevel]);
  
  const setupLevel = (): void => {
    // Choose a random item from cultural items
    const randomItemIndex = Math.floor(Math.random() * culturalItems.length);
    const newItem = culturalItems[randomItemIndex];
    
    // Number of items to display (1-5 for early levels, 1-10 for later levels)
    const maxItems = currentLevel <= 5 ? 5 : 10;
    const itemCount = Math.max(1, Math.min(currentLevel, maxItems));
    
    // Calculate safe boundaries for items to prevent them from going off-screen
    // We'll use container width/height constraints with padding to keep items visible
    const containerWidth = width * 0.6; // Center section is 4/6 of width = ~60%
    const containerHeight = 200; // Fixed height for items container (adjusted from h-56)
    
    // Item dimensions (approximate)
    const itemSize = 64; // 16 * 4 = 64px (w-16 h-16)
    
    // Calculate safe boundaries with padding to ensure items stay fully visible
    const safeAreaPadding = 10;
    const minX = safeAreaPadding;
    const maxX = containerWidth - itemSize - safeAreaPadding;
    const minY = safeAreaPadding;
    const maxY = containerHeight - itemSize - safeAreaPadding;
    
    // Generate the items to count with constrained positions
    const newItemsToCount: CountItem[] = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
      rotate: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
    }));
    
    // Generate number options here and store them in state
    const correctAnswer = itemCount;
    const options: number[] = [correctAnswer];
    
    // Generate all possible options that are within range
    const possibleOptions: number[] = [];
    for (let i = 1; i <= 10; i++) {
      if (i !== correctAnswer) {
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
    setNumberOptions(options); // Store generated options
  };
  
  const playNumberSound = async (number: number): Promise<void> => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      // In a real app, you'd have actual audio files
      // For this example, we'll just log which sound would play
      console.log(`Playing sound for: ${lugandaNumbers[number-1].luganda}`);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/correct.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  // Modify the handleNumberPress function to allow retrying after incorrect answers
  const handleNumberPress = (number: number): void => {
    setSelectedCount(number);
    playNumberSound(number);
    
    // Check if the answer is correct
    const isAnswerCorrect = number === itemsToCount.length;
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
      
      // Move to next level after a delay, but only if not at level 10
      setTimeout(() => {
        if (currentLevel < 10) {
          setCurrentLevel(prevLevel => prevLevel + 1);
        } else {
          // Game completed!
          Alert.alert(
            "Oyenze bulungi! (Well done!)",
            `Congratulations! You've completed all 10 levels with a score of ${score + 10}!`,
            [
              { 
                text: "Play Again", 
                onPress: () => {
                  setCurrentLevel(1);
                  setScore(0);
                } 
              }
            ]
          );
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
  
  // Modify renderNumberOptions to use the stored options instead of generating new ones
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
        <Text className="text-2xl font-bold text-white">
          {number}
        </Text>
        <Text className="text-xs font-bold text-white">
          {number >= 1 && number <= lugandaNumbers.length ? lugandaNumbers[number-1].luganda : ""}
        </Text>
      </TouchableOpacity>
    ));
  };
  
  const renderItemsToCount = (): JSX.Element[] => {
    return itemsToCount.map(item => (
      <Animated.Image
        key={item.id}
        source={require('@/assets/images/coin.png')} // Replace with your item image
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
  
  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <StatusBar style="auto" />
      
      {/* Add Back Button similar to the WordGame */}
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
      
      {/* Main content area - remove top bar to prevent content overflow */}
      <View className="flex-1 flex-row w-full px-6 pt-4">
        {/* Left section - Level and character */}
        <View className="w-1/6 items-center justify-between py-6">
          <View className="bg-success p-3 rounded-xl">
            <Text className="text-lg font-bold text-white">
              Level {currentLevel}
            </Text>
          </View>
          
          {/* Removed bird image */}
          
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
              Balanga {currentItem.name} emeka?
            </Text>
            <Text className="text-sm italic text-primary-700 opacity-70 text-center">
              (How many {currentItem.name} do you see?)
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
            {renderNumberOptions()}
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
            {isCorrect ? 'Kirungi! (Correct!)' : 'Gezaako nate! (Try again!)'}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default LugandaCountingGame;