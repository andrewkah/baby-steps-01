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
import { Gyroscope } from "expo-sensors";
import * as Haptics from "expo-haptics";
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
export default function TextilesScreen() {
  const [rotation, setRotation] = useState(0);
  const [patterns, setPatterns] = useState<
    {
      id: string;
      name: string;
      description: string;
      rotations: number[];
    }[]
  >([]);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [score, setScore] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [subscription, setSubscription] = useState<{
    remove: () => void;
  } | null>(null);

  const textilePatterns = [
    {
      id: "bark_cloth",
      name: "Bark Cloth",
      description:
        "Traditional fabric made from the Mutuba tree bark, with natural brown color and unique texture.",
      rotations: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    },
    {
      id: "barkcloth_print",
      name: "Barkcloth Prints",
      description:
        "Modern printed patterns on traditional bark cloth, combining tradition with contemporary designs.",
      rotations: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    },
    {
      id: "royal_cloth",
      name: "Royal Buganda Cloth",
      description:
        "Special textiles reserved for the Kabaka (king) and royal family, featuring distinctive patterns.",
      rotations: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    },
    {
      id: "ceremonial",
      name: "Ceremonial Textiles",
      description:
        "Special textiles used in important Buganda ceremonies and rituals.",
      rotations: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    },
    {
      id: "basket_weave",
      name: "Basket Weaving Patterns",
      description:
        "Intricate patterns inspired by traditional Buganda basket weaving techniques.",
      rotations: [0, 90, 180, 270][Math.floor(Math.random() * 4)],
    },
  ];

  type PatternId =
    | "bark_cloth"
    | "barkcloth_print"
    | "royal_cloth"
    | "ceremonial"
    | "basket_weave";
  const patternImages: Record<PatternId, any> = {
    bark_cloth: require("@/assets/images/kasubi.jpg"),
    barkcloth_print: require("@/assets/images/kabaka-trail.jpg"),
    royal_cloth: require("@/assets/images/clothing.jpg"),
    ceremonial: require("@/assets/images/culture.jpg"),
    basket_weave: require("@/assets/images/drum.jpg"),
  };

  useEffect(() => {
    // Generate random patterns
    setPatterns(
      textilePatterns
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((pattern) => ({
          ...pattern,
          rotations: [pattern.rotations], // Wrap the single rotation in an array
        }))
    );
    setCurrentPattern(0);
  }, []);

  const toggleGyro = () => {
    if (gyroEnabled) {
      // Turn off gyroscope
      if (subscription) {
        subscription.remove();
        setSubscription(null);
      }
      setGyroEnabled(false);
    } else {
      // Turn on gyroscope
      const sub = Gyroscope.addListener((gyroscopeData: { z: number }) => {
        setRotation((r) => {
          // Use the z-axis rotation for turning the pattern
          const newRotation = r + gyroscopeData.z * 5;
          return newRotation;
        });
      });

      setSubscription(sub);
      setGyroEnabled(true);
    }
  };

  const rotatePattern = (direction: string) => {
    setRotation((r) => {
      const delta = direction === "left" ? -10 : 10;
      return r + delta;
    });
  };

  const checkMatch = () => {
    const targetRotation = patterns[currentPattern].rotations;
    const currentRotation = rotation % 360;
    // Allow some tolerance for matching
    const diff = Math.abs(currentRotation - targetRotation[0]); // Access first rotation from array
    const isMatch = diff < 15 || diff > 345;

    if (isMatch) {
      // Success!
      setMatchFound(true);
      setScore(score + 100);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Move to next pattern after delay
      setTimeout(() => {
        if (currentPattern < patterns.length - 1) {
          setCurrentPattern(currentPattern + 1);
          setMatchFound(false);
          setRotation(0);
        } else {
          // Game completed, reset
          setPatterns(
            textilePatterns
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((pattern) => ({
                ...pattern,
                rotations: [pattern.rotations],
              }))
          );
          setCurrentPattern(0);
          setMatchFound(false);
          setRotation(0);
        }
      }, 1500);
    } else {
      // Not a match
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setScore(Math.max(0, score - 20));
    }
  };

  return (
    <Base3DScreen
      title="Buganda Textile Patterns"
      description="Rotate the patterns to match their traditional orientation!"
      backgroundImage={require("@/assets/images/textile.jpg")}
    >
      <View className="flex-1 items-center justify-center">
        {patterns.length > 0 && (
          <>
            {/* Pattern display */}
            <View className="w-64 h-64 bg-white/20 rounded-lg p-2">
              <View
                className={`w-full h-full border-4 ${
                  matchFound ? "border-green-500" : "border-amber-500"
                }`}
                style={{ transform: [{ rotate: `${rotation}deg` }] }}
              >
                <ImageBackground
                  source={
                    patternImages[patterns[currentPattern].id as PatternId]
                  }
                  className="w-full h-full"
                />
              </View>
            </View>

            {/* Pattern info */}
            <View className="bg-black/70 p-4 mt-6 rounded-lg w-4/5">
              <Text className="text-white text-xl font-bold">
                {patterns[currentPattern].name}
              </Text>
              <Text className="text-white">
                {patterns[currentPattern].description}
              </Text>
            </View>

            {/* Controls */}
            <View className="flex-row justify-center items-center mt-8">
              <TouchableOpacity
                className="bg-amber-700 w-16 h-16 rounded-full items-center justify-center mr-4"
                onPress={() => rotatePattern("left")}
              >
                <Text className="text-white text-3xl">↺</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-green-700 w-20 h-20 rounded-full items-center justify-center"
                onPress={checkMatch}
              >
                <Text className="text-white font-bold">CHECK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-amber-700 w-16 h-16 rounded-full items-center justify-center ml-4"
                onPress={() => rotatePattern("right")}
              >
                <Text className="text-white text-3xl">↻</Text>
              </TouchableOpacity>
            </View>

            {/* Gyro control */}
            <TouchableOpacity
              className={`mt-4 p-2 rounded-lg ${
                gyroEnabled ? "bg-blue-600" : "bg-gray-600"
              }`}
              onPress={toggleGyro}
            >
              <Text className="text-white">
                {gyroEnabled ? "Disable Gyro Control" : "Enable Gyro Control"}
              </Text>
            </TouchableOpacity>

            {/* Score */}
            <View className="absolute top-20 right-4 bg-black/70 px-4 py-2 rounded-lg">
              <Text className="text-white text-lg">Score: {score}</Text>
            </View>
          </>
        )}
      </View>
    </Base3DScreen>
  );
};
