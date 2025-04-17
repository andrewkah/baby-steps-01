import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Audio, AVPlaybackSource } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ArtifactsScreen() {
  const [selectedArtifact, setSelectedArtifact] = useState<{
    id: number;
    name: string;
    image: any;
    description: string;
    audio: AVPlaybackSource;
  } | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const router = useRouter();

  const artifacts = [
    {
      id: 1,
      name: "Royal Drums (Mujaguzo)",
      image: require("@/assets/images/engoma.png"),
      description:
        "These sacred royal drums symbolize the authority of the Kabaka (king). Each drum has a specific name and purpose in royal ceremonies.",
      audio: require("@/assets/sounds/drums.mp3"),
    },
    {
      id: 2,
      name: "Traditional Spears",
      image: require("@/assets/images/spears.png"),
      description:
        "Used both for hunting and warfare, these spears represent the strength and bravery of Buganda warriors throughout history.",
      audio: require("@/assets/sounds/spears_hit.mp3"),
    },
    {
      id: 3,
      name: "Royal Stool (Entebe)",
      image: require("@/assets/images/royal_stool.png"),
      description:
        "Special wooden stools used by the Kabaka and other royal officials during important ceremonies and meetings.",
      audio: require("@/assets/sounds/bar-stool.mp3"),
    },
    {
      id: 4,
      name: "Drinking Vessels",
      image: require("@/assets/images/vessels.png"),
      description:
        "Beautifully crafted cups and containers for traditional drinks made from gourds, clay, or wood.",
      audio: require("@/assets/sounds/vessels.mp3"),
    },
    {
      id: 5,
      name: "Royal Regalia",
      image: require("@/assets/images/regalia.jpg"),
      description:
        "Special items used by the Kabaka including crowns, staffs, and emblems that represent royal authority.",
      audio: require("@/assets/sounds/touch-1.mp3"),
    },
  ];

  async function playSound(audioFile: AVPlaybackSource) {
    // Stop any currently playing sound
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
    setSound(newSound);
    await newSound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleArtifactPress = (artifact: {
    id: number;
    name: string;
    image: any;
    description: string;
    audio: AVPlaybackSource;
  }) => {
      setSelectedArtifact(artifact);
  };

  const closeModal = () => {
    setSelectedArtifact(null);
    if (sound) {
      sound.stopAsync();
    }
  };

  return (
    <View className="flex-1 bg-amber-50">
      <View className="py-4 px-6 bg-amber-800">
        <Text className="text-2xl font-bold text-white text-center">
          Buganda Artifacts
        </Text>
        <Text className="text-white text-center">
          Discover treasures from the Buganda Kingdom
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-lg mb-4 text-amber-900">
          Tap on any artifact to learn more about its history and importance in
          Buganda culture!
        </Text>

        <View className="flex-row flex-wrap justify-center">
          {artifacts.map((artifact) => (
            <TouchableOpacity
              key={artifact.id}
              className="w-40 h-40 m-2 bg-white rounded-lg shadow-md overflow-hidden"
              onPress={() => handleArtifactPress(artifact)}
            >
              <Image
                source={artifact.image}
                className="w-full h-28"
                resizeMode="cover"
              />
              <View className="p-2 bg-amber-100">
                <Text className="font-bold text-amber-900">
                  {artifact.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Detailed artifact modal */}
      {selectedArtifact && (
        <View className="absolute inset-0 bg-black bg-opacity-70 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <Image
              source={selectedArtifact.image}
              className="w-full h-64"
              resizeMode="contain"
            />

            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-amber-900">
                  {selectedArtifact.name}
                </Text>
                <TouchableOpacity
                  onPress={() => playSound(selectedArtifact.audio)}
                >
                  <MaterialIcons name="volume-up" size={28} color="#78350f" />
                </TouchableOpacity>
              </View>

              <Text className="text-base mb-4">
                {selectedArtifact.description}
              </Text>

              <View className="flex-row justify-center">
                <TouchableOpacity
                  className="bg-amber-600 py-2 px-6 rounded-full"
                  onPress={closeModal}
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
