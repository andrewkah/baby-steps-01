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
import { useChild } from '@/context/ChildContext';
import { saveNewActivity } from '@/lib/utils';

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

export default function ArtScreen() {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [viewedArt, setViewedArt] = useState<string[]>([]);
  const animationRef = useRef(null);
  const { activeChild } = useChild();
  const gameStartTime = useRef(Date.now());
  const [isGameComplete, setIsGameComplete] = useState(false);

  const artworks = [
    {
      id: "bark_cloth_art",
      name: "Bark Cloth Paintings",
      description:
        "Traditional Buganda paintings on bark cloth depicting daily life.",
      position: 500,
    },
    {
      id: "royal_portraits",
      name: "Royal Portraits",
      description: "Portraits of Buganda kings (Kabakas) through history.",
      position: 1200,
    },
    {
      id: "village_scenes",
      name: "Village Life",
      description:
        "Paintings showing traditional village activities in Buganda.",
      position: 2000,
    },
    {
      id: "contemporary",
      name: "Contemporary Buganda Art",
      description:
        "Modern interpretations of traditional themes by Buganda artists.",
      position: 2800,
    },
    {
      id: "ceremonial_art",
      name: "Ceremonial Art",
      description: "Art pieces depicting important Buganda ceremonies.",
      position: 3500,
    },
  ];

  const [obstacles, setObstacles] = useState(generateObstacles());

  function generateObstacles() {
    return Array(10)
      .fill(undefined)
      .map((_, i) => ({
        id: `obs-${i}`,
        position: 800 + i * 600 + Math.random() * 300,
        width: 50 + Math.random() * 50,
      }));
  }

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setVelocity(20);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const character = {
    y: isJumping ? 50 + velocity : 50,
    height: 100,
    width: 50,
  };

  useEffect(() => {
    let jumpTimer: NodeJS.Timeout;

    if (isJumping) {
      jumpTimer = setInterval(() => {
        setVelocity((v) => {
          const newV = v - 2;
          if (v <= -20) {
            setIsJumping(false);
            clearInterval(jumpTimer);
            return 0;
          }
          return newV;
        });
      }, 50);
    }

    return () => {
      if (jumpTimer) clearInterval(jumpTimer);
    };
  }, [isJumping]);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setPosition((pos) => {
        const newPos = pos + 5;

        // Check for art pieces
        artworks.forEach((art) => {
          if (
            !viewedArt.includes(art.id) &&
            Math.abs(newPos - art.position) < 50
          ) {
            setViewedArt((prev) => [...prev, art.id]);
            setScore((prev) => prev + 100);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        });

        // Check for obstacles
        obstacles.forEach((obs) => {
          if (Math.abs(newPos - obs.position) < character.width && !isJumping) {
            // Collision penalty
            setScore((prev) => Math.max(0, prev - 50));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        });

        return newPos;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isJumping, viewedArt]);

  // Reset when reaching the end
  useEffect(() => {
    if (position > 4000) {
      setPosition(0);
      setObstacles(generateObstacles());
    }
  }, [position]);

  const getCurrentArtwork = () => {
    const lastViewed =
      viewedArt.length > 0
        ? artworks.find((a) => a.id === viewedArt[viewedArt.length - 1])
        : null;
    return lastViewed;
  };

  const currentArtwork = getCurrentArtwork();

  // Track activity completion
  const trackActivity = async () => {
    if (!activeChild) return;
    
    const duration = Math.round((Date.now() - gameStartTime.current) / 1000);
    const completedArtworks = viewedArt.length;
    const accuracy = (score / (score + obstacles.length * 50)) * 100; // Calculate accuracy based on score and obstacles hit
    
    await saveNewActivity({
      child_id: activeChild.id,
      activity_type: 'museum',
      activity_name: 'Explored African Art Gallery',
      score: score.toString(),
      duration,
      completed_at: new Date().toISOString(),
      details: `Discovered ${completedArtworks} artworks with ${accuracy.toFixed(1)}% accuracy`
    });
  };

  // Add completion check
  useEffect(() => {
    if (!isGameComplete && viewedArt.length >= artworks.length) {
      setIsGameComplete(true);
      trackActivity();
    }
  }, [viewedArt, isGameComplete]);

  return (
    <Base3DScreen
      title="Art Gallery Runner"
      description="Run through the gallery and collect Buganda artwork! Tap to jump over obstacles."
      backgroundImage={require("@/assets/images/culture.jpg")}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={0.8}
        onPress={handleJump}
      >
        <View className="flex-1 relative">
          {/* Background elements */}
          <View className="absolute left-0 right-0 bottom-1/3 h-2 bg-black/30" />

          {/* Character */}
          <View
            className="absolute bg-indigo-600 rounded-lg overflow-hidden"
            style={{
              left: 50,
              bottom: character.y,
              width: character.width,
              height: character.height,
            }}
          >
            <Text className="text-white text-center">🧒</Text>
          </View>

          {/* Art pieces */}
          {artworks.map((art) => (
            <View
              key={art.id}
              className={`absolute bg-amber-100 border-4 ${
                viewedArt.includes(art.id)
                  ? "border-green-500"
                  : "border-amber-800"
              } rounded-lg overflow-hidden`}
              style={{
                left: art.position - position,
                bottom: 150,
                width: 120,
                height: 150,
              }}
            >
              <Text className="text-center text-black font-bold m-2">
                {art.name}
              </Text>
            </View>
          ))}

          {/* Obstacles */}
          {obstacles.map((obs) => (
            <View
              key={obs.id}
              className="absolute bg-red-600 rounded-lg"
              style={{
                left: obs.position - position,
                bottom: 50,
                width: obs.width,
                height: 70,
              }}
            />
          ))}
        </View>

        {/* Info panel */}
        <View className="absolute top-20 left-0 right-0 bg-black/60 p-4">
          <Text className="text-white text-lg font-bold">Score: {score}</Text>
          {currentArtwork && (
            <View className="mt-2">
              <Text className="text-white font-bold">
                {currentArtwork.name}
              </Text>
              <Text className="text-white text-sm">
                {currentArtwork.description}
              </Text>
            </View>
          )}
        </View>

        {/* Instruction overlay */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-white bg-black/60 px-6 py-2 rounded-full">
            Tap to jump over obstacles!
          </Text>
        </View>
      </TouchableOpacity>
    </Base3DScreen>
  );
};
