import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  StatusBar, // Added StatusBar import
} from "react-native";
import { Text } from "@/components/StyledText";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the child profile type
type ChildProfile = {
  id: string;
  name: string;
  age?: string;
  avatar: string;
  level?: number;
  lastActivity?: string;
};

export default function ChildListScreen() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Animation values
  const bounceValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fetch child profiles
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);

      // Replace this with your actual data fetching logic from Supabase
      const dummyProfiles: ChildProfile[] = [
        // Uncomment these to test with profiles
        {
          id: "1",
          name: "Esther",
          age: "6 years",
          avatar: "👧",
          level: 3,
          lastActivity: "2 hours ago",
        },
        {
          id: "2",
          name: "David",
          age: "5 years",
          avatar: "👦",
          level: 2,
          lastActivity: "Today",
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setProfiles(dummyProfiles);
        setLoading(false);
      }, 1000);

      // Uncomment this when you have the actual Supabase query
      /*
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', yourParentId);
        
      if (error) throw error;
      setProfiles(data || []);
      */
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation transformations
  const translateY = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const navigateToAddChild = () => {
    router.push("/add-child");
  };

  const navigateToProfile = (childId: string) => {
    // Navigate to profile and pass the child ID
    router.push({
      pathname: "/(tabs)/profile",
      params: { childId },
    });
  };

  // Render a single child profile card
  const renderProfileCard = ({ item }: { item: ChildProfile }) => (
    <Animated.View
      className="mb-4 rounded-2xl bg-white shadow-md overflow-hidden"
      style={{ transform: [{ scale: scaleValue }] }}
    >
      <TouchableOpacity
        className="flex-row p-4 items-center"
        onPress={() => navigateToProfile(item.id)}
        activeOpacity={0.8}
      >
        {/* Avatar with level badge */}
        <View className="relative w-[70px] h-[70px] rounded-full bg-primary-50 justify-center items-center mr-4">
          <Text className="text-[36px]">{item.avatar}</Text>
          <View className="absolute -bottom-1 -right-1 bg-primary-500 rounded-xl w-6 h-6 justify-center items-center border-2 border-white">
            <Text variant="bold" className="text-[10px] text-white">
              Lv{item.level}
            </Text>
          </View>
        </View>

        {/* Profile details */}
        <View className="flex-1">
          <Text variant="bold" className="text-lg text-neutral-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-neutral-500 mb-2">{item.age}</Text>

          {/* Last activity indicator */}
          <View className="flex-row items-center">
            <FontAwesome5 name="clock" size={12} color="#6366f1" />
            <Text className="text-xs text-neutral-500 ml-1">
              {item.lastActivity}
            </Text>
          </View>
        </View>

        {/* Arrow indicator */}
        <View className="p-2">
          <FontAwesome5 name="chevron-right" size={18} color="#ccc" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render empty state with call to action
  const renderEmptyState = () => (
    <Animated.View
      className="flex-1 justify-center items-center p-5"
      style={{ transform: [{ scale: scaleValue }] }}
    >
      {/* Decorative floating elements */}
      <Animated.View
        className="absolute w-[120px] h-[120px] rounded-full bg-primary-100/30 top-[10%] left-[10%]"
        style={{ transform: [{ translateY }] }}
      />
      <Animated.View
        className="absolute w-[80px] h-[80px] rounded-full bg-secondary-100/30 bottom-[15%] right-[10%]"
        style={{
          transform: [{ translateY: Animated.multiply(translateY, 1.2) }],
        }}
      />
      <Animated.View
        className="absolute w-[60px] h-[60px] rounded-full bg-accent-100/30 top-[30%] right-[20%]"
        style={{
          transform: [{ translateY: Animated.multiply(translateY, 0.8) }],
        }}
      />

      {/* Empty state content */}
      <View className="w-full items-center bg-white p-6 rounded-3xl shadow-md">
        <Text variant="bold" className="text-[80px] mb-4">
          👶
        </Text>
        <Text
          variant="bold"
          className="text-2xl text-neutral-800 mb-3 text-center"
        >
          No Child Profiles Yet
        </Text>
        <Text className="text-base text-neutral-500 text-center mb-6 leading-6">
          Add your child's profile to start their personalized learning
          adventure!
        </Text>

        <TouchableOpacity
          className="flex-row bg-primary-500 py-4 px-6 rounded-full items-center justify-center w-full shadow-lg"
          onPress={navigateToAddChild}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="plus" size={18} color="#fff" />
          <Text variant="bold" className="text-white text-base ml-2">
            Add Child Profile
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <>
      {/* Status Bar - Added for visibility */}
      <StatusBar
        translucent
        backgroundColor="white"
        barStyle="dark-content"
      />

      <SafeAreaView className="flex-1 bg-primary-50" edges={["top"]}>
        {/* Header */}
        <View className="px-5 py-4 bg-white border-b border-gray-200">
          <Text variant="bold" className="text-2xl text-primary-800">
            Child Profiles
          </Text>
          <Text className="text-sm text-neutral-400 mt-1">
            Personalized learning journeys
          </Text>
        </View>

        {/* Main content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <FontAwesome5 name="child" size={150} color="#6366f1" />
            <Text variant="medium" className="mt-5 text-base text-neutral-500">
              Loading profiles...
            </Text>
          </View>
        ) : (
          <>
            {profiles.length > 0 ? (
              <>
                <FlatList
                  data={profiles}
                  renderItem={renderProfileCard}
                  keyExtractor={(item) => item.id}
                  contentContainerClassName="p-4"
                  showsVerticalScrollIndicator={false}
                />

                {/* Add another child button */}
                <View className="p-4 items-center">
                  <TouchableOpacity
                    className="flex-row bg-secondary-500 py-4 px-6 rounded-full items-center justify-center shadow-md"
                    onPress={navigateToAddChild}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="plus" size={18} color="#fff" />
                    <Text variant="bold" className="text-white text-base ml-2">
                      Add Another Child
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              renderEmptyState()
            )}
          </>
        )}
      </SafeAreaView>
    </>
  );
}
