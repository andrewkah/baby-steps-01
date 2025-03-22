import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from "@expo/vector-icons";

// Get screen dimensions
const { width, height } = Dimensions.get('window');

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

const WordGame: React.FC = () => {
  // State variables
  const [currentWord, setCurrentWord] = useState<string>('KANZU');
  const [displayWord, setDisplayWord] = useState<string>('K____');
  const [currentQuestion, setCurrentQuestion] = useState<string>('Traditional attire in Buganda culture');
  const [letters, setLetters] = useState<string[]>(['A', 'N', 'Z', 'U', 'B', 'L', 'R', 'T', 'S', 'M']);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [correctSound, setCorrectSound] = useState<Audio.Sound | undefined>();
  const [wrongSound, setWrongSound] = useState<Audio.Sound | undefined>();
  const [animatingLetter, setAnimatingLetter] = useState<LetterPosition | null>(null);
  
  // Animation values
  const letterScale = useState(new Animated.Value(1))[0];
  const bounceValue = useState(new Animated.Value(0))[0];
  
  // For letter flying animation
  const flyingLetterPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyingLetterOpacity = useRef(new Animated.Value(0)).current;
  const flyingLetterScale = useRef(new Animated.Value(1)).current;
  
  // References to measure positions
  const letterRefs = useRef<{ [key: number]: View | null }>({});
  const wordSlotRefs = useRef<{ [key: number]: View | null }>({});
  const containerRef = useRef<View | null>(null);
  
  const router = useRouter();
  
  // Updated useEffect to lock screen orientation
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    
    // Load sounds
    async function loadSounds() {
      const correctSoundObject = new Audio.Sound();
      const wrongSoundObject = new Audio.Sound();
      
      try {
        await correctSoundObject.loadAsync(require('@/assets/sounds/correct.mp3'));
        await wrongSoundObject.loadAsync(require('@/assets/sounds/wrong.mp3'));
        
        setCorrectSound(correctSoundObject);
        setWrongSound(wrongSoundObject);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    }
    
    setLandscapeOrientation();
    loadSounds();
    
    wordSlotRefs.current[0] = wordSlotRefs.current[0] || null;
    
    return () => {
      // Reset orientation when component unmounts
      ScreenOrientation.unlockAsync();
      
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, []);
  
  // Animation logic
  const animateLetterToWord = (letter: string, letterIndex: number, destinationIndex: number) => {
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
              destHeight: wordHeight
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
              ])
            ]).start(() => {
              flyingLetterOpacity.setValue(0);
              setAnimatingLetter(null);
              
              updateDisplayWord(letter);
            });
          },
          () => console.error('Failed to measure word slot')
        );
      },
      () => console.error('Failed to measure letter')
    );
  };
  
  const updateDisplayWord = (letter: string) => {
    let newDisplay = '';
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] === letter || displayWord[i] !== '_') {
        newDisplay += currentWord[i];
      } else {
        newDisplay += '_';
      }
    }
    
    setDisplayWord(newDisplay);
    
    if (!newDisplay.includes('_')) {
      Animated.spring(bounceValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          bounceValue.setValue(0);
        }, 1500);
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
      })
    ]).start();
    
    if (currentWord.includes(letter) && !selectedLetters.includes(letter)) {
      if (correctSound) {
        correctSound.replayAsync();
      }
      
      const newSelectedLetters = [...selectedLetters, letter];
      setSelectedLetters(newSelectedLetters);
      
      const positions = [];
      for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] === letter && displayWord[i] === '_') {
          positions.push(i);
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
  };
  
  // Modified layout for landscape orientation with NativeWind styling
  return (
    <View ref={containerRef} className="flex-1 bg-[#9DE7A9] p-2.5">
      <StatusBar style="auto" />
      
      <TouchableOpacity 
        className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-full"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#7b5af0" />
      </TouchableOpacity>

      {/* Top bar with coin and question */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-1">
        {/* Question text */}
        <View className="bg-white/80 px-5 py-2 rounded-full max-w-[70%] shadow-sm">
          <Text className="text-lg font-semibold text-[#5D3A00] text-center">{currentQuestion}</Text>
        </View>
        
        {/* Coin */}
        <View className="ml-auto">
          <Image 
            source={require('@/assets/images/wildlife.jpg')} 
            className="w-10 h-10"
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Main content area */}
      <View className="flex-1 flex-row justify-between items-center px-2.5">
        {/* Left character */}
        <View className="w-[15%] items-center justify-center">
          <Image 
            source={require('@/assets/images/textile.jpg')} 
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
        
        {/* Center game area */}
        <View className="w-[70%] items-center justify-center">
          {/* Word to guess */}
          <Animated.View 
            className="flex-row items-center justify-center mb-5"
            style={{ 
              transform: [
                { 
                  scale: bounceValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1]
                  })
                }
              ] 
            }}
          >
            {/* First letter */}
            <View 
              className="w-12 h-12 justify-center items-center mx-1"
              ref={ref => wordSlotRefs.current[0] = ref}
            >
              <Text className="text-4xl font-bold text-[#5D3A00]">{displayWord[0]}</Text>
            </View>
            
            {/* Remaining letters */}
            {displayWord.slice(1).split('').map((char, index) => (
              <View 
                key={index} 
                ref={ref => wordSlotRefs.current[index + 1] = ref}
                className="w-12 h-12 justify-center items-center mx-1 relative"
              >
                <Text className="text-4xl font-bold text-[#5D3A00]">{char !== '_' ? char : ''}</Text>
                {char === '_' && <View className="absolute bottom-0 w-10 h-1 bg-[#5D3A00] rounded-sm" />}
              </View>
            ))}
          </Animated.View>
          
          {/* Letter choices */}
          <View className="flex-row flex-wrap justify-center w-full mt-5">
            {letters.map((letter, index) => (
              <TouchableOpacity 
                key={index}
                ref={ref => letterRefs.current[index] = ref}
                className={`w-14 h-14 rounded-full bg-[#FF6B95] m-2 justify-center items-center shadow ${
                  selectedLetters.includes(letter) ? 'opacity-70 bg-gray-400' : ''
                }`}
                onPress={() => handleLetterPress(letter, index)}
                disabled={selectedLetters.includes(letter)}
              >
                <Animated.Text 
                  className="text-3xl font-bold text-white"
                  style={{ transform: [{ scale: letterScale }] }}
                >
                  {letter}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Right hint button */}
        <View className="w-[15%] items-center justify-center">
          <TouchableOpacity className="w-16 h-16 bg-white rounded-full justify-center items-center shadow">
            <Image 
              source={require('@/assets/images/river.jpg')} 
              className="w-12 h-12"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Flying letter animation */}
      {animatingLetter && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
              left: animatingLetter.startX,
              top: animatingLetter.startY,
              width: animatingLetter.width,
              height: animatingLetter.height,
              transform: [
                { translateX: flyingLetterPosition.x },
                { translateY: flyingLetterPosition.y },
                { scale: flyingLetterScale }
              ],
              opacity: flyingLetterOpacity,
            }
          ]}
        >
          <Text className="text-3xl font-bold text-[#FF6B95] shadow">
            {animatingLetter.letter}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default WordGame;