import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

// Child-friendly engaging onboarding data
const onboardingData = [
  {
    id: "1",
    title: "Hello, Friend!",
    description: "Let's learn about Uganda together! 🇺🇬",
    image: "👋👶",
    backgroundColor: "bg-primary-100",
    tintColor: "text-primary-500",
  },
  {
    id: "2",
    title: "Fun Stories!",
    description: "Discover magical stories from Uganda!",
    image: "📚✨",
    backgroundColor: "bg-secondary-100",
    tintColor: "text-secondary-600",
  },
  {
    id: "3",
    title: "Play Games!",
    description: "Learn Luganda with fun activities!",
    image: "🎮🎵",
    backgroundColor: "bg-accent-100",
    tintColor: "text-accent-600",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Multiple animation values for different effects
  const bounceValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  // Create multiple animations
  React.useEffect(() => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slight rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const completeOnboarding = () => {
    onComplete();
  };

  const renderItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
    // Create the bounce transform
    const translateY = bounceValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });

    const rotate = rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["-3deg", "3deg"],
    });

    return (
      <View
        className={`${item.backgroundColor} rounded-3xl mx-3 p-6 items-center justify-center shadow-lg`}
        style={{ width: width - 48, height: height * 0.65 }}
      >
        {/* Animated image container */}
        <Animated.View
          className="w-36 h-36 bg-white rounded-full justify-center items-center mb-8 border-4 border-white shadow-xl"
          style={{
            transform: [{ translateY }, { scale: scaleValue }, { rotate }],
          }}
        >
          <Text className="text-6xl">{item.image}</Text>
        </Animated.View>

        {/* Titles and descriptions */}
        <Text
          className={`${item.tintColor} text-4xl font-bold mb-4 text-center`}
        >
          {item.title}
        </Text>

        <Text className="text-lg text-center text-neutral-700 px-6 leading-7">
          {item.description}
        </Text>
      </View>
    );
  };

  // Button that changes based on slide index
  const renderNextButton = () => {
    // Use different button styles for last slide
    if (currentIndex === onboardingData.length - 1) {
      return (
        <TouchableOpacity
          className="items-center"
          onPress={completeOnboarding}
          activeOpacity={0.8}
        >
          <View className="w-64 h-16 bg-success-500 rounded-full flex-row items-center justify-center shadow-lg">
            <Text className="text-white text-xl font-bold mr-2">
              Let's Play!
            </Text>
            <Text className="text-2xl">🎮</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="items-center"
        onPress={() => {
          if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({
              index: currentIndex + 1,
              animated: true,
            });
          }
        }}
        activeOpacity={0.8}
      >
        <View className="w-64 h-16 bg-primary-500 rounded-full flex-row items-center justify-center shadow-lg">
          <Text className="text-white text-xl font-bold mr-2">Next</Text>
          <Text className="text-2xl">👉</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Fun background decorations
  const renderBackgroundDecorations = () => {
    return (
      <>
        <View className="absolute top-20 left-5 w-12 h-12 rounded-full bg-primary-300 opacity-20" />
        <View className="absolute top-40 right-8 w-8 h-8 rounded-full bg-secondary-400 opacity-30" />
        <View className="absolute bottom-36 left-10 w-10 h-10 rounded-full bg-accent-300 opacity-20" />
      </>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Background decorations */}
      {renderBackgroundDecorations()}

      {/* Skip button */}
      <TouchableOpacity
        className="absolute top-14 right-5 bg-white/80 py-2 px-5 rounded-full z-10 shadow-md"
        onPress={completeOnboarding}
      >
        <Text className="text-primary-600 font-bold text-base">Skip</Text>
      </TouchableOpacity>

      {/* Welcome message at top */}
      <View className="w-full items-center pt-20 pb-5">
        <Text className="text-xl text-primary-700 font-bold">Baby Steps</Text>
        <Text className="text-base text-neutral-500">Learn & Play!</Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
          }
        }}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        className="flex-1"
      />

      {/* Fun, colorful pagination dots */}
      <View className="flex-row justify-center mb-6 mt-8">
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [12, 36, 12],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          // Different colors for each dot
          const dotColor =
            index === 0
              ? "bg-primary-500"
              : index === 1
              ? "bg-secondary-500"
              : "bg-accent-500";

          return (
            <Animated.View
              key={index}
              className={`h-4 rounded-full mx-2 ${dotColor}`}
              style={{
                width: dotWidth,
                opacity,
                transform: [{ scale: index === currentIndex ? scaleValue : 1 }],
              }}
            />
          );
        })}
      </View>

      {/* Navigation buttons */}
      <View className="mb-10 mt-2 items-center">{renderNextButton()}</View>
    </View>
  );
}
