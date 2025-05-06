import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
// import { Canvas, useFrame, useLoader } from "@react-three/fiber/native";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { TextureLoader } from "expo-three";
// import { Gyroscope } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";

// Base 3D Screen Component with Common Functionality
const Base3DScreen = ({
  children,
  backgroundImage,
  title,
  description,
  onClose,
}: {
  children: React.ReactNode;
  backgroundImage: any; // ImageSourcePropType would be better but requires import
  title: string;
  description: string;
  onClose?: () => void;
}) => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 relative">
      <ImageBackground source={backgroundImage} className="w-full h-full">
        <View className="absolute top-0 left-0 right-0 bg-black/50 p-4">
          <TouchableOpacity
            onPress={onClose || (() => navigation.goBack())}
            className="absolute top-4 right-4 z-10"
          >
            <Text className="text-white text-xl font-bold">✕</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
          <Text className="text-white text-base">{description}</Text>
        </View>
        {children}
      </ImageBackground>
    </View>
  );
};
export default function InstrumentsScreen() {
  const [currentInstrument, setCurrentInstrument] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rhythm, setRhythm] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [sounds, setSounds] = useState<Record<string, Audio.Sound>>({});

  const instruments = [
    {
      id: "drums",
      name: "Engalabi (Long Drum)",
      description:
        "A long, wooden drum with a deep sound, used to keep rhythm in Buganda music.",
      image: require("@/assets/images/drum.jpg"),
      soundFile: require("@/assets/audio/complete.mp3"),
    },
    {
      id: "amadinda",
      name: "Amadinda (Xylophone)",
      description:
        "A wooden xylophone with 12 keys, played by multiple performers simultaneously.",
      image: require("@/assets/images/drum.jpg"),
      soundFile: require("@/assets/audio/complete.mp3"),
    },
    {
      id: "endere",
      name: "Endere (Flute)",
      description: "A traditional Buganda flute made from reed.",
      image: require("@/assets/images/drum.jpg"),
      soundFile: require("@/assets/audio/complete.mp3"),
    },
    {
      id: "endigidi",
      name: "Endigidi (Tube Fiddle)",
      description:
        "A one-stringed fiddle made from a wooden tube covered with reptile skin.",
      image: require("@/assets/images/drum.jpg"),
      soundFile: require("@/assets/audio/complete.mp3"),
    },
  ];

  useEffect(() => {
    // Load instrument sounds
    async function loadSounds() {
      const loadedSounds: Record<string, Audio.Sound> = {};

      for (const instrument of instruments) {
        const { sound } = await Audio.Sound.createAsync(instrument.soundFile);
        loadedSounds[instrument.id] = sound;
      }

      setSounds(loadedSounds);
    }

    loadSounds();
    generateRhythm();

    return () => {
      // Unload all sounds
      Object.values(sounds).forEach((sound) => {
        (sound as Audio.Sound).unloadAsync();
      });
    };
  }, [level]);

  const generateRhythm = () => {
    const newRhythm = [];
    const length = 3 + level;

    for (let i = 0; i < length; i++) {
      newRhythm.push(Math.floor(Math.random() * instruments.length));
    }

    setRhythm(newRhythm);
    setPlayerInput([]);
  };

  const playInstrument = async (index: number) => {
    const instrument = instruments[index];
    setCurrentInstrument(index);

    if (sounds[instrument.id]) {
      await sounds[instrument.id].replayAsync();
    }

    // Add to player input if we're in play mode
    if (isPlaying) {
      const newInput = [...playerInput, index];
      setPlayerInput(newInput);

      // Check if player input matches the rhythm so far
      if (newInput.length === rhythm.length) {
        const correct = rhythm.every((note, i) => note === newInput[i]);

        if (correct) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setScore(score + 100 * level);
          setLevel(Math.min(5, level + 1));

          // Generate new rhythm after delay
          setTimeout(() => {
            generateRhythm();
          }, 1000);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setScore(Math.max(0, score - 50));

          // Replay correct rhythm
          setTimeout(() => {
            playRhythm();
          }, 1000);
        }

        setIsPlaying(false);
      }
    }
  };

  const playRhythm = async () => {
    // Play the rhythm sequence
    for (let i = 0; i < rhythm.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await playInstrument(rhythm[i]);
    }

    setIsPlaying(true);
  };

  const startGame = () => {
    playRhythm();
  };

  return (
    <Base3DScreen
      title="Buganda Rhythm Master"
      description="Learn about traditional Buganda instruments and match their rhythms!"
      backgroundImage={require("@/assets/images/mountain.jpg")}
    >
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-white text-xl font-bold mb-4">
          Level: {level} | Score: {score}
        </Text>

        {/* Instruments Circle */}
        <View className="flex-1 justify-center items-center">
          <View className="w-64 h-64 rounded-full bg-black/30 p-4 justify-center items-center">
            <Text className="text-white text-xl font-bold mb-4">
              {instruments[currentInstrument].name}
            </Text>

            <View className="rounded-lg overflow-hidden">
              <ImageBackground
                source={instruments[currentInstrument].image}
                className="w-40 h-40 justify-center items-center"
              >
                {isPlaying && (
                  <Text className="text-white bg-black/70 px-4 py-2 rounded-full">
                    Your turn!
                  </Text>
                )}
              </ImageBackground>
            </View>
          </View>

          {/* Instrument Selection Buttons */}
          <View className="flex-row justify-center items-center mt-8">
            {instruments.map((instrument, index) => (
              <TouchableOpacity
                key={instrument.id}
                className={`mx-2 rounded-full w-16 h-16 items-center justify-center ${
                  currentInstrument === index ? "bg-amber-500" : "bg-gray-700"
                }`}
                onPress={() => playInstrument(index)}
              >
                <Text className="text-white text-lg">{index + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Game Controls */}
        <View className="w-full bg-black/50 p-4 rounded-lg">
          <Text className="text-white text-center mb-2">
            {instruments[currentInstrument].description}
          </Text>

          {!isPlaying && rhythm.length > 0 && (
            <View className="flex-row justify-center">
              <TouchableOpacity
                className="bg-amber-600 px-6 py-3 rounded-lg"
                onPress={startGame}
              >
                <Text className="text-white font-bold">
                  {playerInput.length === 0
                    ? "Listen to rhythm"
                    : "Listen again"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Progress indicators */}
          {rhythm.length > 0 && (
            <View className="flex-row justify-center mt-4">
              {rhythm.map((_, index) => (
                <View
                  key={index}
                  className={`w-6 h-6 mx-1 rounded-full ${
                    index < playerInput.length ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </Base3DScreen>
  );
};
