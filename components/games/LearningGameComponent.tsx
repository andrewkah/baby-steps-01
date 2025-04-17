import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our new data structure
import { 
  LUGANDA_STAGES, 
  Stage, 
  Level, 
  WordItem, 
  getWordsForLevel,
  unlockNextLevel,
  unlockNextStage,
  isStageCompleted
} from './utils/lugandawords';

// Game state types
type GameState = 'menu' | 'stageSelect' | 'levelSelect' | 'learning' | 'playing';

const LugandaLearningGame: React.FC = () => {
  const router = useRouter();
  
  // Get dimensions for responsive layout
  const { width, height } = Dimensions.get('window');
  
  // Game state management
  const [gameState, setGameState] = useState<GameState>('stageSelect');
  const [stages, setStages] = useState<Stage[]>(LUGANDA_STAGES);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentLearningIndex, setCurrentLearningIndex] = useState<number>(0);
  const [currentWords, setCurrentWords] = useState<WordItem[]>([]);
  
  // Game progress state
  const [totalScore, setTotalScore] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  
  // Playing state
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [correctSound, setCorrectSound] = useState<Audio.Sound | undefined>();
  const [wrongSound, setWrongSound] = useState<Audio.Sound | undefined>();
  const [progressWidth] = useState<Animated.Value>(new Animated.Value(0));
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const shakeAnimation = useState<Animated.Value>(new Animated.Value(0))[0];

  // Load game progress on mount
  useEffect(() => {
    loadGameProgress();
    return () => {
      if (sound) sound.unloadAsync();
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, []);
  
  // Load sounds
  useEffect(() => {
    loadSounds();
  }, []);
  
  // Setup when selecting a level
  useEffect(() => {
    if (selectedLevel) {
      const words = getWordsForLevel(selectedStage?.id || 0, selectedLevel.id);
      setCurrentWords(words);
      
      if (gameState === 'playing') {
        setCurrentWordIndex(0);
        setLevelScore(0);
        setCurrentWord(words[0]);
        generateOptions(words[0], words);
      }
    }
  }, [selectedLevel, gameState]);
  
  // Update progress bar
  useEffect(() => {
    if (gameState === 'playing' && currentWords.length > 0) {
      Animated.timing(progressWidth, {
        toValue: (currentWordIndex / currentWords.length) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentWordIndex, gameState, currentWords]);
  
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
  
  // Load game progress from AsyncStorage
  const loadGameProgress = async () => {
    try {
      const scoreData = await AsyncStorage.getItem('luganda_total_score');
      const completedLevelsData = await AsyncStorage.getItem('luganda_completed_levels');
      const stagesData = await AsyncStorage.getItem('luganda_stages');
      
      if (scoreData) {
        setTotalScore(parseInt(scoreData));
      }
      
      if (completedLevelsData) {
        setCompletedLevels(JSON.parse(completedLevelsData));
      }
      
      if (stagesData) {
        setStages(JSON.parse(stagesData));
      }
    } catch (error) {
      console.error('Error loading game progress', error);
    }
  };
  
  // Save game progress to AsyncStorage
  const saveGameProgress = async () => {
    try {
      await AsyncStorage.setItem('luganda_total_score', totalScore.toString());
      await AsyncStorage.setItem('luganda_completed_levels', JSON.stringify(completedLevels));
      await AsyncStorage.setItem('luganda_stages', JSON.stringify(stages));
    } catch (error) {
      console.error('Error saving game progress', error);
    }
  };
  
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
  
  const playWordSound = async (word: WordItem = currentWord!): Promise<void> => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/wrong.mp3') // Replace with actual sound file
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  // Stage selection
  const selectStage = (stage: Stage) => {
    if (!stage.isLocked) {
      setSelectedStage(stage);
      setGameState('levelSelect');
    }
  };
  
  // Level selection
  const selectLevel = (level: Level) => {
    if (!level.isLocked) {
      setSelectedLevel(level);
      setGameState('learning');
      setCurrentLearningIndex(0);
    }
  };
  
  // Learning navigation
  const nextLearningWord = (): void => {
    if (currentLearningIndex < currentWords.length - 1) {
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
    setLevelScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    if (currentWords.length > 0) {
      setCurrentWord(currentWords[0]);
      generateOptions(currentWords[0], currentWords);
    }
  };
  
  // Generate options for the game
  const generateOptions = (word: WordItem, wordList: WordItem[]): void => {
    const correctAnswer = word.english;
    let optionsArray: string[] = [correctAnswer];
    
    // Add 3 random incorrect options
    while (optionsArray.length < 4) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      const randomOption = wordList[randomIndex].english;
      
      if (!optionsArray.includes(randomOption)) {
        optionsArray.push(randomOption);
      }
    }
    
    // Shuffle options
    optionsArray = optionsArray.sort(() => Math.random() - 0.5);
    setOptions(optionsArray);
  };
  
  const handleOptionSelect = (option: string): void => {
    if (!currentWord) return;
    
    setSelectedOption(option);
    
    if (option === currentWord.english) {
      // Correct answer
      setIsCorrect(true);
      setLevelScore(levelScore + 10);
      
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
    
    if (nextIndex < currentWords.length) {
      setCurrentWordIndex(nextIndex);
      setCurrentWord(currentWords[nextIndex]);
      setSelectedOption(null);
      setIsCorrect(null);
      
      setTimeout(() => {
        generateOptions(currentWords[nextIndex], currentWords);
      }, 300);
    } else {
      // Level completed
      completeLevelAndUpdateProgress();
    }
  };
  
  const completeLevelAndUpdateProgress = () => {
    const newTotalScore = totalScore + levelScore;
    setTotalScore(newTotalScore);
    
    // Add this level to completed levels if not already there
    if (!completedLevels.includes(selectedLevel?.id || 0)) {
      const newCompletedLevels = [...completedLevels, selectedLevel?.id || 0];
      setCompletedLevels(newCompletedLevels);
      
      // Check if all levels in stage are completed
      if (selectedStage && isStageCompleted(selectedStage.id, newCompletedLevels)) {
        // Unlock next stage if available and total score meets requirement
        const nextStage = stages.find(s => s.id === selectedStage.id + 1);
        if (nextStage && newTotalScore >= nextStage.requiredScore) {
          const updatedStages = unlockNextStage(selectedStage.id, stages);
          setStages(updatedStages);
        }
      } else if (selectedStage && selectedLevel) {
        // Unlock next level in current stage
        const updatedStages = unlockNextLevel(selectedStage.id, selectedLevel.id, stages);
        setStages(updatedStages);
      }
    }
    
    // Save progress
    saveGameProgress();
    
    // Show completion screen or return to level select
    showLevelCompletionScreen();
  };
  
  const showLevelCompletionScreen = () => {
    // In a real app, you might show a modal or a different screen
    // For this example, we'll just go back to level select
    setTimeout(() => {
      setGameState('levelSelect');
    }, 2000);
  };
  
  const resetGame = (): void => {
    setGameState('stageSelect');
    setSelectedStage(null);
    setSelectedLevel(null);
  };
  
  const getOptionClassNames = (option: string): string => {
    if (!currentWord) return "bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 items-center shadow";
    
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
  
  // Render the Stage Selection Screen
  const renderStageSelectScreen = () => {
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
          <View className="mb-6 pt-4">
            <Text className="text-3xl font-bold text-blue-800 text-center">Luganda Learning Journey</Text>
            <Text className="text-lg text-gray-600 text-center mt-2">Select a Stage to Begin</Text>
            
            <View className="flex-row justify-between items-center mt-4 bg-white p-3 rounded-lg shadow">
              <Text className="text-lg font-semibold text-blue-700">Total Score:</Text>
              <View className="flex-row items-center">
                <Image 
                  source={require('../../assets/images/coin.png')} 
                  className="w-6 h-6 mr-1" 
                  resizeMode="contain"
                />
                <Text className="text-xl font-bold text-yellow-500">{totalScore}</Text>
              </View>
            </View>
          </View>
          
          <FlatList
            data={stages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: stage }) => (
              <TouchableOpacity 
                className={`mb-4 rounded-xl overflow-hidden shadow-lg ${stage.isLocked ? 'opacity-50' : ''}`}
                onPress={() => selectStage(stage)}
                disabled={stage.isLocked}
              >
                <LinearGradient
                  colors={[stage.color, stage.color + '99']}
                  className="p-5"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-white mb-2">Stage {stage.id}: {stage.title}</Text>
                      <Text className="text-white mb-3">{stage.description}</Text>
                      <Text className="text-white mb-3">{stage.description}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-white font-medium mr-3">
                          {stage.levels.filter(level => completedLevels.includes(level.id)).length} / {stage.levels.length} Levels
                        </Text>
                        {stage.isLocked && (
                          <View className="flex-row items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                            <Ionicons name="lock-closed" size={14} color="white" />
                            <Text className="text-white text-xs ml-1">
                              {stage.requiredScore} points to unlock
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="justify-center items-center ml-4">
                      <Image 
                        source={stage.image} 
                        className="w-16 h-16" 
                        resizeMode="contain"
                      />
                      {!stage.isLocked && (
                        <TouchableOpacity 
                          className="bg-white rounded-full p-1 mt-2"
                          onPress={() => selectStage(stage)}
                        >
                          <Ionicons name="arrow-forward" size={18} color={stage.color} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  };
  
  // Render the Level Selection Screen
  const renderLevelSelectScreen = () => {
    if (!selectedStage) return null;
    
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
          onPress={() => setGameState('stageSelect')}
        >
          <Ionicons name="arrow-back" size={24} color="#7b5af0" />
        </TouchableOpacity>
        
        <View className="flex-1 p-4">
          <View className="mb-6 pt-4">
            <LinearGradient
              colors={[selectedStage.color, selectedStage.color + '99']}
              className="p-4 rounded-xl mb-4"
            >
              <Text className="text-2xl font-bold text-white">Stage {selectedStage.id}: {selectedStage.title}</Text>
              <Text className="text-white mb-2">{selectedStage.description}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-white">
                  {selectedStage.levels.filter(level => completedLevels.includes(level.id)).length} / {selectedStage.levels.length} Completed
                </Text>
                <View className="flex-row items-center">
                  <Image 
                    source={require('../../assets/images/coin.png')} 
                    className="w-5 h-5 mr-1" 
                    resizeMode="contain"
                  />
                  <Text className="text-white font-bold">{totalScore}</Text>
                </View>
              </View>
            </LinearGradient>
            
            <Text className="text-xl font-bold text-blue-800 mb-3">Select a Level</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {selectedStage.levels.map((level) => (
              <TouchableOpacity 
                key={level.id}
                className={`w-[48%] mb-4 p-4 rounded-xl shadow-md ${
                  level.isLocked ? 'bg-gray-200' : completedLevels.includes(level.id) ? 'bg-green-100' : 'bg-white'
                }`}
                onPress={() => selectLevel(level)}
                disabled={level.isLocked}
              >
                <View className="items-center">
                  <Text className="text-lg font-bold text-center mb-2">{level.title}</Text>
                  {level.isLocked ? (
                    <Ionicons name="lock-closed" size={24} color="gray" />
                  ) : completedLevels.includes(level.id) ? (
                    <Ionicons name="checkmark-circle" size={24} color="green" />
                  ) : (
                    <Ionicons name="play-circle" size={24} color={selectedStage.color} />
                  )}
                  <Text className="text-sm text-gray-600 mt-2">
                    {level.words.length} Words
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  // Render the Learning Screen - Adapted for landscape orientation
  const renderLearningScreen = () => {
    if (!selectedLevel || currentWords.length === 0) return null;
    
    const currentLearnWord = currentWords[currentLearningIndex];
    
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
          onPress={() => setGameState('levelSelect')}
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
                  <View>
                    <Text className="text-base text-blue-500">
                      Stage {selectedStage?.id}: {selectedStage?.title}
                    </Text>
                    <Text className="text-2xl font-bold text-blue-800">
                      Level {selectedLevel.id}: {selectedLevel.title}
                    </Text>
                  </View>
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
                  <Text className={`font-semibold ${currentLearningIndex === 0 ? 'text-blue-500' : 'text-white'}`}>Previous</Text>
                </TouchableOpacity>
                
                <Text className="text-base font-semibold text-gray-600">
                  {currentLearningIndex + 1} / {currentWords.length}
                </Text>
                
                {currentLearningIndex < currentWords.length - 1 ? (
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
    if (!currentWord) return null;
    
    return (
      <SafeAreaView className="flex-1 bg-blue-50">
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
          onPress={() => setGameState('learning')}
        >
          <Ionicons name="arrow-back" size={24} color="#7b5af0" />
        </TouchableOpacity>
        
        <View className="flex-1 p-4">
          <View className="flex-row h-full">
            {/* Left panel - Question */}
            <View className="w-1/2 justify-center items-center p-4">
              <View className="w-full">
                {/* Level info */}
                <View className="flex-row justify-between mb-2">
                  <Text className="text-base text-blue-500">
                    Stage {selectedStage?.id}: {selectedStage?.title}
                  </Text>
                  <Text className="text-base text-blue-500">
                    Level {selectedLevel?.id}: {selectedLevel?.title}
                  </Text>
                </View>
                
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
                    <Text className="text-lg font-bold text-yellow-500">{levelScore}</Text>
                  </View>
                  <Text className="text-gray-500">
                    {currentWordIndex + 1} / {currentWords.length}
                  </Text>
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
  
  // Level completion screen
  const renderLevelCompletionScreen = () => {
    return (
      <SafeAreaView className="flex-1 bg-blue-50 justify-center items-center">
        <LinearGradient
          colors={[selectedStage?.color || '#4F85E6', (selectedStage?.color || '#4F85E6') + '99']}
          className="p-8 rounded-2xl w-2/3 items-center"
        >
          <Text className="text-3xl font-bold text-white mb-4">Level Complete!</Text>
          <Image 
            source={require('../../assets/images/coin.png')} 
            className="w-20 h-20 mb-6" 
            resizeMode="contain"
          />
          <Text className="text-xl text-white mb-2">Score: {levelScore}</Text>
          <Text className="text-white mb-6">You've learned {currentWords.length} new Luganda words!</Text>
          <TouchableOpacity 
            className="bg-white py-3 px-6 rounded-xl mt-2"
            onPress={() => setGameState('levelSelect')}
          >
            <Text className="text-blue-500 font-bold">Continue</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  };
  
  // Main render function that switches between game states
  switch (gameState) {
    case 'stageSelect':
      return renderStageSelectScreen();
    case 'levelSelect':
      return renderLevelSelectScreen();
    case 'learning':
      return renderLearningScreen();
    case 'playing':
      return renderGameScreen();
    default:
      return renderStageSelectScreen();
  }
};

export default LugandaLearningGame;