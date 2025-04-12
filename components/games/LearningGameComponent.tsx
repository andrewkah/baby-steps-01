import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

// TypeScript interfaces
interface WordItem {
  luganda: string;
  english: string;
  audio: string;
  example: string;
  exampleTranslation: string;
  image: any; // for React Native image require
}

interface OptionStyleProps {
  isSelected: boolean;
  isCorrect: boolean | null;
  isCorrectOption: boolean;
}

// Enhanced Luganda vocabulary data with examples and image references
const LUGANDA_WORDS: WordItem[] = [
  { 
    luganda: 'Omukazi', 
    english: 'Woman', 
    audio: 'correct.mp3',
    example: 'Omukazi oyo mulungi nnyo.',
    exampleTranslation: 'That woman is very beautiful.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Omusajja', 
    english: 'Man', 
    audio: 'wrong.mp3',
    example: 'Omusajja oyo mugumikiriza.',
    exampleTranslation: 'That man is patient.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Amazzi', 
    english: 'Water', 
    audio: 'correct.mp3',
    example: 'Amazzi gano mangi.',
    exampleTranslation: 'This water is a lot.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Emmere', 
    english: 'Food', 
    audio: 'wrong.mp3',
    example: 'Emmere eno nnungi.',
    exampleTranslation: 'This food is delicious.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Ekibuga', 
    english: 'City', 
    audio: 'correct.mp3',
    example: 'Ekibuga kya Kampala kinene.',
    exampleTranslation: 'Kampala city is big.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Okukyala', 
    english: 'To visit', 
    audio: 'wrong.mp3',
    example: 'Njagala okukyala mu kyalo kyange.',
    exampleTranslation: 'I want to visit my village.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Okuyiga', 
    english: 'To learn', 
    audio: 'correct.mp3',
    example: 'Njagala okuyiga Oluganda.',
    exampleTranslation: 'I want to learn Luganda.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Ennyumba', 
    english: 'House', 
    audio: 'wrong.mp3',
    example: 'Ennyumba yange nnungi.',
    exampleTranslation: 'My house is beautiful.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Eggulu', 
    english: 'Sky', 
    audio: 'correct.mp3',
    example: 'Eggulu lino bbululu.',
    exampleTranslation: 'The sky is blue.',
    image: require('../../assets/images/coin.png') 
  },
  { 
    luganda: 'Emmunyeenye', 
    english: 'Star', 
    audio: 'wrong.mp3',
    example: 'Emmunyeenye nyingi ziri mu ggulu.',
    exampleTranslation: 'There are many stars in the sky.',
    image: require('../../assets/images/coin.png') 
  },
];

const LugandaLearningGame: React.FC = () => {
  const router = useRouter();
  
  // Get dimensions for landscape orientation
  const { width, height } = Dimensions.get('window');
  
  // Game state management
  const [gameState, setGameState] = useState<'learning' | 'playing'>('learning');
  const [currentLearningIndex, setCurrentLearningIndex] = useState<number>(0);
  
  // Existing game state
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<WordItem>(LUGANDA_WORDS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [correctSound, setCorrectSound] = useState<Audio.Sound | undefined>();
  const [wrongSound, setWrongSound] = useState<Audio.Sound | undefined>();
  const [progressWidth] = useState<Animated.Value>(new Animated.Value(0));
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const shakeAnimation = useState<Animated.Value>(new Animated.Value(0))[0];

  // Load initial game state
  useEffect(() => {
    if (gameState === 'playing') {
      generateOptions();
    }
    loadSounds();
    
    return () => {
      if (sound) sound.unloadAsync();
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, [gameState]);

  // Update progress bar
  useEffect(() => {
    if (gameState === 'playing') {
      Animated.timing(progressWidth, {
        toValue: (currentWordIndex / LUGANDA_WORDS.length) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentWordIndex, gameState]);

  // Handle shaking animation for wrong answers
  useEffect(() => {
    if (shakingOption !== null) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
      ]).start(() => {
        setShakingOption(null);
      });
    }
  }, [shakingOption]);

  const loadSounds = async (): Promise<void> => {
    try {
      const correctSoundObject = new Audio.Sound();
      await correctSoundObject.loadAsync(require('../../assets/sounds/correct.mp3'));
      setCorrectSound(correctSoundObject);
      
      const wrongSoundObject = new Audio.Sound();
      await wrongSoundObject.loadAsync(require('../../assets/sounds/wrong.mp3'));
      setWrongSound(wrongSoundObject);
    } catch (error) {
      console.error('Error loading sounds', error);
    }
  };

  const playWordSound = async (word: WordItem = currentWord): Promise<void> => {
    try {
      console.log(`Playing sound for: ${word.luganda}`);
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/wrong.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  // Learning screen navigation
  const nextLearningWord = (): void => {
    if (currentLearningIndex < LUGANDA_WORDS.length - 1) {
      setCurrentLearningIndex(currentLearningIndex + 1);
    }
  };
  
  const previousLearningWord = (): void => {
    if (currentLearningIndex > 0) {
      setCurrentLearningIndex(currentLearningIndex - 1);
    }
  };
  
  const startGame = (): void => {
    setGameState('playing');
    setCurrentWordIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    generateOptions();
  };
  
  // Game functionality
  const generateOptions = (): void => {
    const correctAnswer = LUGANDA_WORDS[currentWordIndex].english;
    let optionsArray: string[] = [correctAnswer];
    
    // Add 3 random incorrect options
    while (optionsArray.length < 4) {
      const randomIndex = Math.floor(Math.random() * LUGANDA_WORDS.length);
      const randomOption = LUGANDA_WORDS[randomIndex].english;
      
      if (!optionsArray.includes(randomOption)) {
        optionsArray.push(randomOption);
      }
    }
    
    // Shuffle options
    optionsArray = optionsArray.sort(() => Math.random() - 0.5);
    setOptions(optionsArray);
    setCurrentWord(LUGANDA_WORDS[currentWordIndex]);
  };
  
  const handleOptionSelect = (option: string): void => {
    setSelectedOption(option);
    
    if (option === currentWord.english) {
      // Correct answer
      setIsCorrect(true);
      setScore(score + 10);
      
      if (correctSound) {
        correctSound.replayAsync();
      }
      
      // Move to next word after a short delay
      setTimeout(() => {
        nextWord();
      }, 1000);
    } else {
      // Wrong answer
      setIsCorrect(false);
      setShakingOption(option);
      
      if (wrongSound) {
        wrongSound.replayAsync();
      }
      
      // Allow trying again after a short delay
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };
  
  const nextWord = (): void => {
    const nextIndex = currentWordIndex + 1;
    
    if (nextIndex < LUGANDA_WORDS.length) {
      setCurrentWordIndex(nextIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      
      setTimeout(() => {
        generateOptions();
      }, 300);
    } else {
      // Game completed - could show a success screen in a real app
      console.log('Game Completed! Final score:', score);
      // Return to learning mode
      setGameState('learning');
      setCurrentLearningIndex(0);
    }
  };
  
  const resetGame = (): void => {
    setGameState('learning');
    setCurrentLearningIndex(0);
    setCurrentWordIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
  };
  
  const getOptionClassNames = (option: string): string => {
    let baseClasses = "bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 items-center shadow";
    
    if (selectedOption === null) {
      return baseClasses;
    }
    
    if (option === currentWord.english) {
      return `${baseClasses} bg-green-100 border-green-500`;
    }
    
    if (option === selectedOption && option !== currentWord.english) {
      return `${baseClasses} bg-red-100 border-red-500`;
    }
    
    return baseClasses;
  };
  
  // Render the Learning Screen - Adapted for landscape orientation
  const renderLearningScreen = () => {
    const currentLearnWord = LUGANDA_WORDS[currentLearningIndex];
    const router = useRouter();
    
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
        
        <ScrollView contentContainerClassName="flex-grow">
          <View className="flex-row h-full">
            {/* Left panel - Image */}
            <View className="w-1/2 justify-center items-center p-4">
              <Image 
                source={currentLearnWord.image} 
                className="w-full h-3/5"
                resizeMode="contain"
              />
            </View>
            
            {/* Right panel - Word info */}
            <View className="w-1/2 p-6 justify-between">
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-bold text-blue-500">Learn Luganda Words</Text>
                  <TouchableOpacity 
                    className="bg-blue-100 py-2 px-4 rounded-full"
                    onPress={startGame}
                  >
                    <Text className="text-blue-500 font-semibold">Skip to Game</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="bg-white rounded-xl p-6 shadow mb-4">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-3xl font-bold text-blue-500">{currentLearnWord.luganda}</Text>
                    <TouchableOpacity 
                      className="ml-3 p-2 bg-blue-100 rounded-full"
                      onPress={() => playWordSound(currentLearnWord)}
                    >
                      <Image 
                        source={require('../../assets/images/coin.png')} 
                        className="w-5 h-5" 
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                  
                  <Text className="text-xl text-gray-700 font-semibold mb-4">{currentLearnWord.english}</Text>
                  
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <Text className="text-base italic text-gray-700 mb-2">{currentLearnWord.example}</Text>
                    <Text className="text-base text-gray-500">{currentLearnWord.exampleTranslation}</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mt-4">
                <TouchableOpacity 
                  className={`py-3 px-5 rounded-xl ${currentLearningIndex === 0 ? 'bg-blue-200' : 'bg-blue-500'}`}
                  onPress={previousLearningWord}
                  disabled={currentLearningIndex === 0}
                >
                  <Text className="text-white font-semibold">Previous</Text>
                </TouchableOpacity>
                
                <Text className="text-base font-semibold text-gray-600">
                  {currentLearningIndex + 1} / {LUGANDA_WORDS.length}
                </Text>
                
                {currentLearningIndex < LUGANDA_WORDS.length - 1 ? (
                  <TouchableOpacity 
                    className="bg-blue-500 py-3 px-5 rounded-xl"
                    onPress={nextLearningWord}
                  >
                    <Text className="text-white font-semibold">Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    className="bg-green-500 py-3 px-5 rounded-xl"
                    onPress={startGame}
                  >
                    <Text className="text-white font-semibold">Start Game</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  // Render the Game Screen - Adapted for landscape orientation
  const renderGameScreen = () => {
    const router = useRouter();
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
        
        <View className="flex-1 p-4">
          <View className="flex-row h-full">
            {/* Left panel - Question */}
            <View className="w-1/2 justify-center items-center p-4">
              <View className="w-full">
                {/* Progress & stats */}
                <View className="w-full h-2 bg-gray-200 rounded mb-4">
                  <Animated.View 
                    className="h-full bg-green-500 rounded" 
                    style={{ 
                      width: progressWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      })
                    }} 
                  />
                </View>
                
                <View className="flex-row justify-between mb-6">
                  <View className="flex-row items-center">
                    <Image 
                      source={require('../../assets/images/coin.png')} 
                      className="w-6 h-6 mr-1" 
                      resizeMode="contain"
                    />
                    <Text className="text-lg font-bold text-yellow-500">{score}</Text>
                  </View>
                </View>
                
                {/* Question */}
                <View className="items-center mb-8">
                  <Text className="text-base text-gray-500 mb-4">Select the correct translation:</Text>
                  <View className="flex-row items-center justify-center">
                    <Text className="text-4xl font-bold text-blue-500">{currentWord.luganda}</Text>
                    <TouchableOpacity 
                      className="ml-4 p-2 bg-blue-100 rounded-full"
                      onPress={() => playWordSound()}
                    >
                      <Image 
                        source={require('../../assets/images/coin.png')} 
                        className="w-6 h-6" 
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Feedback message */}
                {isCorrect !== null && (
                  <View className="items-center mb-4">
                    <Text className={`text-2xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrect ? 'Correct! 🎉' : 'Try again! 😕'}
                    </Text>
                  </View>
                )}
                
                {/* Next button - shown after answering */}
                {isCorrect === true && (
                  <TouchableOpacity 
                    className="bg-green-500 py-3 px-6 rounded-xl self-center mt-4"
                    onPress={nextWord}
                  >
                    <Text className="text-white font-bold text-lg">Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Right panel - Options */}
            <View className="w-1/2 p-4 justify-center">
              <View className="w-full">
                {options.map((option, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      option === shakingOption ? 
                      { transform: [{ translateX: shakeAnimation }] } : 
                      {}
                    ]}
                  >
                    <TouchableOpacity
                      className={getOptionClassNames(option)}
                      onPress={() => handleOptionSelect(option)}
                      disabled={isCorrect === true}
                    >
                      <Text className="text-lg font-semibold text-gray-700">{option}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Force landscape orientation */}
        <StatusBar hidden />
      </SafeAreaView>
    );
  };
  
  return gameState === 'learning' ? renderLearningScreen() : renderGameScreen();
};

export default LugandaLearningGame;