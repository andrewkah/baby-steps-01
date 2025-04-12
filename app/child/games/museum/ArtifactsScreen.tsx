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
export default function ArtifactsScreen() {
  const [discoveredItems, setDiscoveredItems] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState();

  const artifacts = [
    {
      id: "bark_cloth",
      name: "Bark Cloth",
      points: 50,
      description:
        "Traditional cloth made from Mutuba tree bark, used in ceremonies.",
      level: 1,
    },
    {
      id: "royal_drums",
      name: "Royal Drums (Mujaguzo)",
      points: 100,
      description: "Sacred drums of the Buganda Kingdom.",
      level: 1,
    },
    {
      id: "spears",
      name: "Ceremonial Spears",
      points: 75,
      description: "Royal spears used in Buganda ceremonies.",
      level: 2,
    },
    {
      id: "throne",
      name: "Kabaka's Throne",
      points: 150,
      description: "The royal throne of the Buganda King (Kabaka).",
      level: 2,
    },
    {
      id: "beaded_crown",
      name: "Beaded Crown",
      points: 200,
      description: "Royal crown adorned with beads and shells.",
      level: 3,
    },
  ];

  const [digSites, setDigSites] = useState(generateDigSites(6));

  function generateDigSites(count: number) {
    const sites = [];
    for (let i = 0; i < count; i++) {
      sites.push({
        id: `site-${i}`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 50 + 30,
        size: Math.random() * 10 + 20,
        artifact: artifacts.filter((a) => a.level <= currentLevel)[
          Math.floor(
            Math.random() *
              artifacts.filter((a) => a.level <= currentLevel).length
          )
        ],
        discovered: false,
      });
    }
    return sites;
  }

  useEffect(() => {
    setDigSites(generateDigSites(5 + currentLevel));

    // Load digging sound
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audio/complete.mp3")
      );
      setSound(sound as any);
    }

    loadSound();
    return () => {
      if (sound) {
        (sound as Audio.Sound).unloadAsync();
      }
    };
  }, [currentLevel]);

  const handleDig = async (site: {
    id: any;
    x?: number;
    y?: number;
    size?: number;
    artifact: any;
    discovered: any;
  }) => {
    if (!site.discovered) {
      // Play digging sound
      if (sound) {
        await (sound as Audio.Sound).replayAsync();
      }

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update the site to discovered
      const updatedSites = digSites.map((s) =>
        s.id === site.id ? { ...s, discovered: true } : s
      );
      setDigSites(updatedSites);

      // Add to discovered items and update score
      setDiscoveredItems((prevItems: any[]) => [...prevItems, site.artifact]);
      setScore(score + site.artifact.points);

      // Level up if enough artifacts discovered
      if (discoveredItems.length + 1 >= currentLevel * 3 && currentLevel < 3) {
        setCurrentLevel(currentLevel + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  return (
    <Base3DScreen
      title="Archaeological Dig"
      description="Uncover ancient Buganda artifacts by digging at the marked spots!"
      backgroundImage={require("@/assets/images/textile.jpg")}
    >
      <View className="flex-1 relative">
        {/* Dig site view */}
        <View className="flex-1 relative">
          <ImageBackground
            source={require("@/assets/images/textile.jpg")}
            className="w-full h-full"
            resizeMode="repeat"
          >
            {digSites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={{
                  position: "absolute",
                  left: `${site.x}%`,
                  top: `${site.y}%`,
                  width: site.size,
                  height: site.size,
                  borderRadius: site.size / 2,
                }}
                className={`${
                  site.discovered ? "bg-amber-800/50" : "bg-amber-600/80"
                } items-center justify-center border-2 border-amber-900`}
                onPress={() => handleDig(site)}
              >
                {site.discovered && (
                  <Text className="text-white text-xs text-center">
                    {site.artifact.name}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ImageBackground>
        </View>

        {/* Bottom panel with discovered items */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
          <Text className="text-white text-lg font-bold mb-2">
            Level: {currentLevel} | Score: {score}
          </Text>
          <View className="flex-row flex-wrap">
            {discoveredItems.map(
              (item: { name: string; description: string }, index) => (
                <View
                  key={index}
                  className="bg-amber-800/80 p-2 m-1 rounded-lg"
                >
                  <Text className="text-white font-bold">{item.name}</Text>
                  <Text className="text-white text-xs">{item.description}</Text>
                </View>
              )
            )}
          </View>
        </View>
      </View>
    </Base3DScreen>
  );
};
