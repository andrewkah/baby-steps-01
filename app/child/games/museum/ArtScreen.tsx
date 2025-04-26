import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  Platform,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

export default function ArtScreen() {
  const [selectedArtwork, setSelectedArtwork] = useState<{
    id: number;
    title: string;
    artist: string;
    image: any;
    description: string;
    videoUrl: string;
  } | null>(null);
  const [contrastLevel, setContrastLevel] = useState("normal");
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const router = useRouter();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (selectedArtwork) {
          // Close modal if open
          setSelectedArtwork(null);
          return true;
        }
        router.back();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [router, selectedArtwork]);

  const artworks = [
    {
      id: 1,
      title: "Barkcloth Paintings",
      artist: "Traditional Buganda Artists",
      image: require("@/assets/images/barkcloth_art.png"),
      description:
        "Paintings created on traditional barkcloth (lubugo) using natural pigments. These artworks often depict daily life, cultural symbols, and stories from Buganda history.",
      videoUrl: "https://www.youtube.com/watch?v=uhznFtHhkBo",
    },
    {
      id: 2,
      title: "Royal Court Scenes",
      artist: "Contemporary Ugandan Artists",
      image: require("@/assets/images/court_art.png"),
      description:
        "Modern interpretations of the Buganda royal court, showing the Kabaka and his officials. These paintings blend traditional themes with contemporary artistic styles.",
      videoUrl: "https://www.youtube.com/embed/exampleVideo2",
    },
    {
      id: 3,
      title: "Kasubi Tombs Artwork",
      artist: "Various Buganda Artists",
      image: require("@/assets/images/kasubi_art.png"),
      description:
        "Decorative art found at the Kasubi Tombs, a UNESCO World Heritage site where Buganda kings are buried. These artworks include symbolic patterns and royal emblems.",
      videoUrl: "https://www.youtube.com/watch?v=G2PDZZO6h68",
    },
    {
      id: 4,
      title: "Traditional Basketry Designs",
      artist: "Buganda Craft Artisans",
      image: require("@/assets/images/basket_art.jpg"),
      description:
        "Intricate patterns and designs used in traditional Buganda basketry, which are considered both functional crafts and artistic expressions.",
      videoUrl: "https://www.youtube.com/watch?v=ddqvWZhdOzM",
    },
    {
      id: 5,
      title: "Cultural Symbol Paintings",
      artist: "Modern Buganda Artists",
      image: require("@/assets/images/symbol_art.jpg"),
      description:
        "Modern artwork featuring traditional Buganda symbols and motifs, reimagined through contemporary artistic techniques and materials.",
      videoUrl: "https://www.youtube.com/embed/exampleVideo5",
    },
  ];

  const toggleContrast = () => {
    if (contrastLevel === "normal") {
      setContrastLevel("high");
    } else if (contrastLevel === "high") {
      setContrastLevel("low");
    } else {
      setContrastLevel("normal");
    }
  };

  const getContrastStyle = () => {
    switch (contrastLevel) {
      case "high":
        return "bg-gray-100 border-4 border-amber-800";
      case "low":
        return "bg-amber-50 border border-amber-200";
      default:
        return "bg-white border-2 border-amber-300";
    }
  };

  const handleWatchVideo = () => {
    if (selectedArtwork) {
      setVideoModalVisible(true);
    }
  };

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
          Buganda Art Gallery
        </Text>
        <Text className="text-white text-center">
          Traditional & Contemporary Buganda Artistic Expressions
        </Text>
      </View>

      <View className="flex-row justify-end px-4 py-2">
        <TouchableOpacity
          className="flex-row items-center bg-amber-700 px-3 py-1 rounded-full"
          onPress={toggleContrast}
        >
          <MaterialIcons name="contrast" size={20} color="white" />
          <Text className="text-white ml-1 font-medium">
            {contrastLevel === "normal"
              ? "Normal"
              : contrastLevel === "high"
              ? "High Contrast"
              : "Low Contrast"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-lg mb-4 text-amber-900">
          Explore beautiful art from the Buganda Kingdom! Tap on any artwork to
          learn more.
        </Text>

        <View className="flex-col justify-center">
          {artworks.map((artwork) => (
            <TouchableOpacity
              key={artwork.id}
              className={`mb-6 rounded-xl overflow-hidden shadow-lg ${getContrastStyle()}`}
              onPress={() => setSelectedArtwork(artwork)}
            >
              <Image
                source={artwork.image}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-bold text-lg text-amber-900">
                  {artwork.title}
                </Text>
                <Text className="text-amber-700">{artwork.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center p-4">
          <View className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <ScrollView>
              <Image
                source={selectedArtwork.image}
                className="w-full h-56"
                resizeMode="cover"
              />

              <View className="p-4">
                <Text className="text-xl font-bold text-amber-900">
                  {selectedArtwork.title}
                </Text>
                <Text className="text-amber-700 mb-2">
                  {selectedArtwork.artist}
                </Text>
                <Text className="text-base mb-4">
                  {selectedArtwork.description}
                </Text>

                <TouchableOpacity
                  className="bg-red-600 py-2 px-4 rounded-lg flex-row items-center justify-center mb-4"
                  onPress={handleWatchVideo}
                >
                  <Ionicons name="logo-youtube" size={24} color="white" />
                  <Text className="text-white font-bold ml-2">Watch Video</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center">
                  <TouchableOpacity
                    className="bg-amber-600 py-2 px-6 rounded-full"
                    onPress={() => setSelectedArtwork(null)}
                  >
                    <Text className="text-white font-bold">Close </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Video Modal */}
      <Modal
        visible={videoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-90 justify-center items-center p-4">
          <View
            className="bg-black w-full rounded-xl overflow-hidden"
            style={{ height: 300 }}
          >
            {selectedArtwork && (
              <WebView
                source={{ uri: selectedArtwork.videoUrl }}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            )}
            <TouchableOpacity
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
              onPress={() => setVideoModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
