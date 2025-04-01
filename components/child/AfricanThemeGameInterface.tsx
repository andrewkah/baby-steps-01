import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  Animated,
  Easing,
  BackHandler, // Add this import
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, usePathname, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Text } from "@/components/StyledText";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';

// Define types
type LearningCard = {
  id: string;
  title: string;
  image: any;
  description: string;
  targetPage: string; // Add this property to specify which page to navigate to
};

type NavItem = {
  id: string;
  icon: any;
  label: string;
};

const AfricanThemeGameInterface: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("Basic");
  const [selectedNavItem, setSelectedNavItem] = useState<string>("home");
  const [learningCards, setLearningCards] = useState<LearningCard[]>([]);
  const router = useRouter();

  // Animation values for avatar
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Lock to landscape orientation
    async function lockOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    
    lockOrientation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("AfricanThemeGameInterface focused - locking to landscape");
      const lockToLandscape = async () => {
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
        } catch (error) {
          console.error("Failed to lock orientation:", error);
        }
      };

      lockToLandscape();

      return () => {
        // No cleanup needed here as we want to keep landscape 
        // when navigating to games
      };
    }, [])
  );

  // Set up animation
  useEffect(() => {
    // Create combined animation sequence
    const pulseSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const bounceSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations
    pulseSequence.start();
    bounceSequence.start();

    return () => {
      // Clean up animations
      pulseSequence.stop();
      bounceSequence.stop();
    };
  }, []);

  // Add this effect to handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate to parent gate instead of default back behavior
      router.push('/child/parent-gate');
      return true; // Prevents default back behavior
    });

    return () => backHandler.remove(); // Clean up on unmount
  }, [router]);

  // Get the current path to determine which tab we're on
  const pathname = usePathname();
  const tabId = pathname.split("/").pop() || "profile"; // Extract tab ID from path

  // Set the title based on the tab
  const [screenTitle, setScreenTitle] = useState("Games");

  useEffect(() => {
    // Set cards based on the selected tab
    switch (tabId) {
      case "profile": // Games
        setScreenTitle("Games");
        setLearningCards([
          {
            id: "logic",
            title: "Logic",
            image: require("@/assets/images/african-logic.png"),
            description: "Solve puzzles inspired by popular Buganda heritage sites",
            targetPage: "tester",
          },
          {
            id: "ball-train",
            title: "Ball Train",
            image: require("@/assets/images/ball-train.jpg"),
            description: "Learn about light that makes us see things",
            targetPage: "child/games/ball-trail",
          },
          {
            id: "patterns",
            title: "Patterns",
            image: require("@/assets/images/african-patterns.png"),
            description: "Learn about beautiful Kente cloth patterns",
            targetPage: "tester",
          },
          {
            id: "words",
            title: "Words",
            image: require("@/assets/images/african-focus.png"),
            description: "Fill in the missing letters to complete the word",
            targetPage: "child/games/wordgame",
          },
          {
            id: "numbers",
            title: "Numbers",
            image: require("@/assets/images/numbers.png"),
            description: "Count with traditional African number systems",
            targetPage: "tester",
          },
          {
            id: "words",
            title: "Words",
            image: require("@/assets/images/stories.png"),
            description: "Learn through African folktales and proverbs",
            targetPage: "tester",
          },
        ]);
        break;

      case "coloring":
        setScreenTitle("Coloring");
        setLearningCards([
          {
            id: "emblem",
            title: "Buganda Emblem",
            image: require("@/assets/images/emblem.png"),
            description: "Buganda's emblem",
            targetPage: "child/games/coloring/emblem",
          },
          {
            id: "king",
            title: "kings",
            image: require("@/assets/images/king.jpg"),
            description: "King's image",
            targetPage: "child/games/coloring/king",
          },
          {
            id: "animals",
            title: "Animals",
            image: require("@/assets/images/animals.jpg"),
            description: "Color African wildlife animals",
            targetPage: "child/games/coloring/animals",
          },
          {
            id: "shapes",
            title: "Shapes",
            image: require("@/assets/images/shapes.jpg"),
            description: "Color different shapes",
            targetPage: "child/games/coloring/shapes",
          },
          {
            id: "masks",
            title: "Masks",
            image: require("@/assets/images/mask.jpg"),
            description: "Color traditional African masks",
            targetPage: "child/games/coloring/mask",
          },

        ]);
        break;

      case "Stories":
        setScreenTitle("Stories");
        setLearningCards([
          {
            id: "kintu",
            title: "Kintu",
            image: require("@/assets/images/kintu.jpg"),
            description:
              "Learn about Kintu, the first person on Earth according to Buganda mythology",
            targetPage: "tester",
          },
          {
            id: "mwanga",
            title: "Kabaka Mwanga",
            image: require("@/assets/images/mwanga.jpg"),
            description: "Discover the story of Kabaka Mwanga II of Buganda",
            targetPage: "tester",
          },
          {
            id: "kasubi",
            title: "Kasubi Tombs",
            image: require("@/assets/images/kasubi.jpg"),
            description:
              "Explore the UNESCO World Heritage Site of Kasubi Tombs",
            targetPage: "tester",
          },
          {
            id: "buganda-kingdom",
            title: "Buganda Kingdom",
            image: require("@/assets/images/buganda-kingdom.jpg"),
            description: "Learn about the history of the Buganda Kingdom",
            targetPage: "tester",
          },
          {
            id: "kabaka-trail",
            title: "Kabaka Trail",
            image: require("@/assets/images/kabaka-trail.jpg"),
            description:
              "Follow the historical trail of the Kabakas of Buganda",
            targetPage: "tester",
          },
          {
            id: "buganda-culture",
            title: "Buganda Culture",
            image: require("@/assets/images/culture.jpg"),
            description: "Discover the rich cultural heritage of Buganda",
            targetPage: "tester",
          },
        ]);
        break;

      case "quizz":
        setScreenTitle("Quizz");
        setLearningCards([
          {
            id: "history",
            title: "History",
            image: require("@/assets/images/history.jpg"), // Replace with appropriate image
            description: "Test your knowledge of African history",
            targetPage: "tester",
          },
          {
            id: "geography",
            title: "Geography",
            image: require("@/assets/images/geography.jpg"), // Replace with appropriate image
            description: "Quiz about African countries and landmarks",
            targetPage: "tester",
          },
          {
            id: "culture",
            title: "Culture",
            image: require("@/assets/images/culture.jpg"), // Replace with appropriate image
            description: "Learn about diverse African cultures",
            targetPage: "tester",
          },
          {
            id: "wildlife",
            title: "Wildlife",
            image: require("@/assets/images/wildlife.jpg"), // Replace with appropriate image
            description: "Test your knowledge of African animals",
            targetPage: "tester",
          },
          {
            id: "languages",
            title: "Languages",
            image: require("@/assets/images/language.jpg"), // Replace with appropriate image
            description: "Learn words from different African languages",
            targetPage: "tester",
          },
        ]);
        break;

      case "nature":
        setScreenTitle("Nature");
        setLearningCards([
          {
            id: "savanna",
            title: "Savanna",
            image: require("@/assets/images/savannah.jpg"), // Replace with appropriate image
            description: "Explore the African savanna ecosystem",
            targetPage: "tester",
          },
          {
            id: "rainforest",
            title: "Rainforest",
            image: require("@/assets/images/rainforest.jpg"), // Replace with appropriate image
            description: "Discover the Congo rainforest",
            targetPage: "tester",
          },
          {
            id: "desert",
            title: "Desert",
            image: require("@/assets/images/desert.jpg"), // Replace with appropriate image
            description: "Learn about the Sahara and Kalahari deserts",
            targetPage: "tester",
          },
          {
            id: "mountains",
            title: "Mountains",
            image: require("@/assets/images/mountain.jpg"), // Replace with appropriate image
            description: "Explore African mountains like Kilimanjaro",
            targetPage: "tester",
          },
          {
            id: "rivers",
            title: "Rivers",
            image: require("@/assets/images/river.jpg"), // Replace with appropriate image
            description: "Learn about the Nile, Congo, and other major rivers",
            targetPage: "tester",
          },
        ]);
        break;

      case "museum":
        setScreenTitle("Museum");
        setLearningCards([
          {
            id: "artifacts",
            title: "Artifacts",
            image: require("@/assets/images/artifacts.jpg"), // Replace with appropriate image
            description: "Explore ancient African artifacts",
            targetPage: "tester",
          },
          {
            id: "art",
            title: "Art",
            image: require("@/assets/images/art.jpg"), // Replace with appropriate image
            description: "Discover traditional and contemporary African art",
            targetPage: "tester",
          },
          {
            id: "instruments",
            title: "Instruments",
            image: require("@/assets/images/drum.jpg"), // Replace with appropriate image
            description: "Learn about traditional African musical instruments",
            targetPage: "tester",
          },
          {
            id: "textiles",
            title: "Textiles",
            image: require("@/assets/images/textile.jpg"), // Replace with appropriate image
            description: "Explore the rich tradition of African textiles",
            targetPage: "tester",
          },
          {
            id: "sculptures",
            title: "Sculptures",
            image: require("@/assets/images/sculpture.jpg"), // Replace with appropriate image
            description: "View famous African sculptures and carvings",
            targetPage: "tester",
          },
        ]);
        break;
      default:
        // Default to games if no tab is specified
        setScreenTitle("Games");
        setLearningCards([
          {
            id: "logic",
            title: "Logic",
            image: require("@/assets/images/african-logic.png"),
            description: "Solve puzzles inspired by African traditions",
            targetPage: "tester",
          },
          {
            id: "patterns",
            title: "Patterns",
            image: require("@/assets/images/african-patterns.png"),
            description: "Learn about beautiful Kente cloth patterns",
            targetPage: "tester",
          },
          {
            id: "focus",
            title: "Focus",
            image: require("@/assets/images/african-focus.png"),
            description: "Improve concentration with Adinkra symbols",
            targetPage: "tester",
          },
          {
            id: "numbers",
            title: "Numbers",
            image: require("@/assets/images/numbers.png"),
            description: "Count with traditional African number systems",
            targetPage: "tester",
          },
          {
            id: "stories",
            title: "Stories",
            image: require("@/assets/images/stories.png"),
            description: "Learn through African folktales and proverbs",
            targetPage: "tester",
          },
        ]);
    }
  }, [tabId]);

  const handleParentalPress = () => {
    Speech.speak("For parents only", {
      language: "en",
      pitch: 1,
      rate: 1,
    });
    router.push("/child/parent-gate");
  };

  // Updated function to navigate to the card's target page with type assertion
  const handleCardPress = (card: LearningCard) => {
    // Use type assertion to tell TypeScript this is a valid route
    router.push(`/${card.targetPage}` as any);
  };

  const { width } = Dimensions.get("window");

  return (
    <>
      {/* Make StatusBar transparent to show background behind it */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ImageBackground now covers the entire screen including status bar */}
      <ImageBackground
        source={require("@/assets/images/gameBackground.png")}
        className="flex-1 bg-cover"
      >
        {/* SafeAreaView moved inside ImageBackground */}
        <SafeAreaView className="flex-1" edges={["right", "bottom", "left"]}>
          {/* Main content area */}
          <View className="flex-1 flex-row bg-[#7b5af0d9]">
            {/* Left sidebar - Profile */}
            <View className="flex-row items-center gap-2.5 absolute pt-8 left-5">
              {/* animated avatar */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }, { translateY: bounceAnim }],
                }}
              >
                <Image
                  source={require("@/assets/images/african-avatar.png")}
                  className="w-[70px] h-[70px] rounded-full border-3 border-[#FFD700]"
                />
              </Animated.View>
              <View className="pl-3">
                <Text variant="bold" className="text-white text-lg mt-2">
                  Learner
                </Text>
                <Text className="text-white/80 text-sm">Age 9+</Text>
                <View className="absolute -top-1.5 right-[60px] bg-[#FFD700] w-6 h-6 rounded-full justify-center items-center">
                  <Text variant="bold" className="text-[#5A3CBE] text-sm">
                    1
                  </Text>
                </View>
              </View>
            </View>

            {/* Right content area */}
            <View className="flex-1 px-4 pt-8">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5 ml-[45%]">
                <View className="flex-row items-center">
                  <Text
                    variant="bold"
                    className="text-white text-3xl mr-2.5 pt-3"
                  >
                    {screenTitle}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-white rounded-3xl px-4 py-1.5 flex-row items-center border-2 border-[#FFD700] mt-0.5"
                  onPress={handleParentalPress}
                >
                  <Ionicons name="people-sharp" size={30} color="#FF6F61" />
                  <Text
                    variant="medium"
                    className="text-[#5A3CBE] text-base ml-1"
                  >
                    For parents
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cards section */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-4"
                contentContainerClassName="py-4 pb-8"
              >
                {/* Start card */}
                <View className="bg-white/15 rounded-2xl p-4 mt-5 mr-2.5 w-[200px] mb-6">
                  <Text variant="bold" className="text-white text-2xl">
                    Start
                  </Text>
                  <Text className="text-white text-base">of learning</Text>
                  <Text className="text-white text-base">journey</Text>

                  {/* Optional Adinkra symbol */}
                  <View className="mt-2.5">
                    <Text className="text-white text-3xl">✨</Text>
                  </View>
                </View>

                {/* Learning cards */}
                {learningCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    className="bg-white rounded-2xl w-[250px]  mr-4 overflow-hidden shadow-md border-2 border-[#FFD700] mb-4"
                    activeOpacity={0.7}
                    onPress={() => handleCardPress(card)}
                  >
                    <Image
                      source={card.image}
                      className="w-full h-[60%] object-cover"
                      resizeMode="cover"
                    />
                    <View className="p-3 bg-white h-[40%] justify-center">
                      <Text
                        variant="bold"
                        className="text-base text-[#5A3CBE] mb-1"
                        numberOfLines={1}
                      >
                        {card.title}
                      </Text>
                      <Text
                        className="text-xs text-neutral-600 leading-4"
                        numberOfLines={2}
                      >
                        {card.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

export default AfricanThemeGameInterface;
