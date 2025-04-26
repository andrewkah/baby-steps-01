import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { Audio, AVPlaybackSource } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function InstrumentsScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<{
    id: number;
    name: string;
    image: any;
    description: string;
    sound: any;
    howToPlay: string;
  } | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const pulseAnim = new Animated.Value(1);
  const router = useRouter();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedInstrument) {
          // Close modal if open
          setSelectedInstrument(null);
          if (sound) {
            sound.stopAsync();
          }
          return true;
        }
        router.back();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [router, selectedInstrument, sound]);

  const instruments = [
    {
      id: 1,
      name: "Engoma (Drums)",
      image: require("@/assets/images/engoma.png"),
      description:
        "The most important musical instruments in Buganda culture. Different types include the large Mujaguzo royal drums and the smaller Nankasa drums used in various ceremonies.",
      sound: require("@/assets/sounds/drums.mp3"),
      howToPlay:
        "Drums are played with hands or sticks, creating complex rhythms and patterns that communicate specific cultural meanings.",
    },
    {
      id: 2,
      name: "Endingidi (Tube Fiddle)",
      image: require("@/assets/images/endingidi.png"),
      description:
        "A one-stringed fiddle made from wood, with a membrane of lizard skin. It produces a unique sound that often accompanies storytelling and traditional songs.",
      sound: require("@/assets/sounds/fiddle.mp3"),
      howToPlay:
        "The player holds the instrument vertically, pressing the string with fingers of one hand while drawing a bow across it with the other hand.",
    },
    {
      id: 3,
      name: "Amadinda (Xylophone)",
      image: require("@/assets/images/amadinda.png"),
      description:
        "A large wooden xylophone with 12 logs laid across banana-stem supports. It's often played by multiple performers simultaneously.",
      sound: require("@/assets/sounds/xylophone.mp3"),
      howToPlay:
        "Players sit on opposite sides, striking the wooden keys with sticks to create interlocking melodies.",
    },
    {
      id: 4,
      name: "Ensasi (Shakers)",
      image: require("@/assets/images/ensasi.png"),
      description:
        "Rattles and shakers made from gourds filled with seeds or small stones, often attached to nets or strings for easy handling.",
      sound: require("@/assets/sounds/shakers.mp3"),
      howToPlay:
        "Shakers are held in the hands and shaken rhythmically to accompany other instruments or dance.",
    },
    {
      id: 5,
      name: "Entenga (Royal Drums)",
      image: require("@/assets/images/entenga.png"),
      description:
        "A set of 15 drums of different sizes arranged in a semicircle. Historically played only for the king of Buganda during special ceremonies.",
      sound: require("@/assets/sounds/drums.mp3"),
      howToPlay:
        "Multiple drummers play simultaneously, each responsible for specific drums in the set, creating complex polyrhythms.",
    },
  ];

  // Start pulsing animation when an instrument is playing
  useEffect(() => {
    if (playingId !== null) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [playingId]);

  async function playSound(
    audioFile: AVPlaybackSource,
    instrumentId: number | null
  ) {
    // Stop previous sound if playing
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
    setSound(newSound);
    setPlayingId(instrumentId);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
      }
    });

    await newSound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <SafeAreaView className="flex-1 bg-amber-50">
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: 8,
          borderRadius: 20,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#7b5af0" />
      </TouchableOpacity>
      <View className="py-4 px-6 bg-amber-800">
        <Text className="text-2xl font-bold text-white text-center">
          Buganda Musical Instruments
        </Text>
        <Text className="text-white text-center">
          Experience the sounds of traditional Buganda music
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-lg mb-4 text-amber-900">
          Tap on an instrument to learn more, and press the play button to hear
          how it sounds!
        </Text>

        {instruments.map((instrument) => (
          <Animated.View
            key={instrument.id}
            style={{
              transform: [
                {
                  scale: playingId === instrument.id ? pulseAnim : 1,
                },
              ],
            }}
            className="mb-6 bg-white rounded-xl overflow-hidden shadow-md"
          >
            <TouchableOpacity
              onPress={() => setSelectedInstrument(instrument)}
              activeOpacity={0.9}
            >
              <Image
                source={instrument.image}
                className="w-full h-48"
                resizeMode="cover"
              />

              <View className="p-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-amber-900">
                    {instrument.name}
                  </Text>
                  <TouchableOpacity
                    className={`p-2 rounded-full ${
                      playingId === instrument.id
                        ? "bg-amber-600"
                        : "bg-amber-800"
                    }`}
                    onPress={() => {
                      if (playingId === instrument.id) {
                        // Stop playing
                        if (sound) {
                          sound.stopAsync();
                          setPlayingId(null);
                        }
                      } else {
                        // Start playing
                        playSound(instrument.sound, instrument.id);
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name={playingId === instrument.id ? "stop" : "play"}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-amber-700 mt-2" numberOfLines={2}>
                  {instrument.description.substring(0, 80)}...
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Instrument Detail Modal */}
      {selectedInstrument && (
        <View className="absolute inset-0 bg-black bg-opacity-70 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <Image
              source={selectedInstrument.image}
              className="w-full h-64"
              resizeMode="cover"
            />

            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-amber-900">
                  {selectedInstrument.name}
                </Text>
                <TouchableOpacity
                  className="p-2 bg-amber-800 rounded-full"
                  onPress={() =>
                    playSound(selectedInstrument.sound, selectedInstrument.id)
                  }
                >
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-base mb-4">
                {selectedInstrument.description}
              </Text>

              <View className="bg-amber-100 p-3 rounded-lg mb-4">
                <Text className="font-bold text-amber-900 mb-1">
                  How to Play:
                </Text>
                <Text>{selectedInstrument.howToPlay}</Text>
              </View>

              <View className="flex-row justify-center">
                <TouchableOpacity
                  className="bg-amber-600 py-2 px-6 rounded-full"
                  onPress={() => setSelectedInstrument(null)}
                >
                  <Text className="text-white font-bold">Close </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
