import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Audio, AVPlaybackSource } from "expo-av";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Textile {
  id: number;
  name: string;
  image: any;
  description: string;
  closeupImage: any;
  audio: AVPlaybackSource;
}

export default function TextilesScreen() {
  const [selectedTextile, setSelectedTextile] = useState<Textile | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const windowWidth = Dimensions.get("window").width;

  const textiles = [
    {
      id: 1,
      name: "Barkcloth (Lubugo)",
      image: require("@/assets/images/barkcloth(Lubugo).png"),
      description:
        "Made from the inner bark of the Mutuba tree (Ficus natalensis), barkcloth has been used for centuries in Buganda for ceremonial wear, burial shrouds, and as a canvas for art. The UNESCO-recognized process involves beating the bark to create a soft, textured cloth with a reddish-brown color.",
      closeupImage: require("@/assets/images/barkcloth(Lubugo)_closeup.png"),
      audio: require("@/assets/sounds/touch-1.mp3"),
    },
    {
      id: 2,
      name: "Royal Backcloth (Lubugo Olukoba)",
      image: require("@/assets/images/royal_cloth.png"),
      description:
        "Special barkcloth reserved for royalty, often decorated with patterns significant to the Buganda monarchy. These cloths feature more detailed processing and sometimes incorporate dyes or decorative elements to signify their importance.",
      closeupImage: require("@/assets/images/royal_cloth_closeup.png"),
      audio: require("@/assets/sounds/touch-1.mp3"),
    },
    {
      id: 5,
      name: "Buganda Baskets",
      image: require("@/assets/images/textile_baskets.png"),
      description:
        "Woven from plant fibers like raffia and palm leaves, these colorful baskets display intricate patterns that tell stories and represent cultural symbols. Each design carries meaning and showcases the weaver's skill and artistry.",
      closeupImage: require("@/assets/images/textile_baskets_closeup.png"),
      audio: require("@/assets/sounds/touch-1.mp3"),
    },
  ];

  async function playSound(audioFile: AVPlaybackSource) {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
    setSound(newSound);
    await newSound.playAsync();
  }

  const TextileCard = ({ item }: { item: Textile }) => {
    const scale = useSharedValue(1);

    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value =
          event.scale > 0.5 ? (event.scale < 3 ? event.scale : 3) : 0.5;
      })
      .onEnd(() => {
        scale.value = withTiming(1);
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <TouchableOpacity
        className="mb-6 bg-white rounded-xl overflow-hidden shadow-lg"
        onPress={() => setSelectedTextile(item)}
      >
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={animatedStyle}>
            <Image
              source={item.image}
              style={{ width: windowWidth - 32, height: 200 }}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>

        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-amber-900">
              {item.name}
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className="bg-amber-200 p-2 rounded-full mr-2"
                onPress={() => setSelectedTextile(item)}
              >
                <Feather name="zoom-in" size={20} color="#78350f" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-amber-200 p-2 rounded-full"
                onPress={() => playSound(item.audio)}
              >
                <MaterialIcons name="volume-up" size={20} color="#78350f" />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-base text-amber-700" numberOfLines={3}>
            {item.description.substring(0, 120)}...
          </Text>

          <Text className="text-amber-500 mt-2 italic">
            Pinch to zoom or tap for more details
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-amber-50">
        <View className="py-4 px-6 bg-amber-800">
          <Text className="text-2xl font-bold text-white text-center">
            Buganda Textiles
          </Text>
          <Text className="text-white text-center">
            Explore the rich tradition of Buganda fabric arts
          </Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-lg mb-4 text-amber-900">
            Discover the beautiful textiles and fabric arts of the Buganda
            Kingdom. Pinch to zoom on images or tap for more details!
          </Text>

          {textiles.map((textile) => (
            <TextileCard key={textile.id} item={textile} />
          ))}
        </ScrollView>

        {selectedTextile && (
          <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center p-4">
            <View className="bg-white w-full max-w-md rounded-xl overflow-hidden">
              <ScrollView>
                <Image
                  source={selectedTextile.closeupImage}
                  className="w-full h-64"
                  resizeMode="cover"
                />

                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-bold text-amber-900">
                      {selectedTextile.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => playSound(selectedTextile.audio)}
                    >
                      <MaterialIcons
                        name="volume-up"
                        size={28}
                        color="#78350f"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-base mb-4">
                    {selectedTextile.description}
                  </Text>

                  <Text className="text-sm italic text-amber-700 mb-4">
                    This closeup image shows the texture and detail of the{" "}
                    {selectedTextile.name.toLowerCase()}.
                  </Text>

                  <View className="flex-row justify-center">
                    <TouchableOpacity
                      className="bg-amber-600 py-2 px-6 rounded-full"
                      onPress={() => setSelectedTextile(null)}
                    >
                      <Text className="text-white font-bold">Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
