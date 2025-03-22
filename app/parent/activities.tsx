import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Text } from "@/components/StyledText";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Define TypeScript interfaces
interface Child {
  id: string;
  name: string;
  avatar: string;
}

interface Activity {
  id: string;
  childId: string;
  childName: string;
  activity: string;
  time: string;
  date: string; // Full date for grouping
  score: string;
  icon: string;
  color: string;
  details?: string;
  category?: string;
}

// Mock children data
const children: Child[] = [
  { id: "1", name: "Esther", avatar: "👧" },
  { id: "2", name: "David", avatar: "👦" },
];

// Mock comprehensive activity data
const allActivities: Activity[] = [
  {
    id: "1",
    childId: "1",
    childName: "Esther",
    activity: "Completed 'African Animals' game",
    time: "2:30 PM",
    date: "Today",
    score: "8/10",
    icon: "paw",
    color: "#FF9F43",
    details:
      "Identified 8 out of 10 animals correctly. Struggled with elephant and giraffe.",
    category: "Science",
  },
  {
    id: "2",
    childId: "2",
    childName: "David",
    activity: "Practiced counting with Adinkra",
    time: "11:15 AM",
    date: "Yesterday",
    score: "12/15",
    icon: "calculator",
    color: "#1DD1A1",
    details: "Counted objects up to 15. Still working on numbers above 10.",
    category: "Math",
  },
  {
    id: "3",
    childId: "1",
    childName: "Esther",
    activity: "Read 'Kintu' story",
    time: "4:45 PM",
    date: "Yesterday",
    score: "Completed",
    icon: "book",
    color: "#6C5CE7",
    details:
      "Read the entire story and answered comprehension questions correctly.",
    category: "Reading",
  },
  {
    id: "4",
    childId: "1",
    childName: "Esther",
    activity: "Played the African Drums game",
    time: "3:20 PM",
    date: "2 days ago",
    score: "Perfect!",
    icon: "music",
    color: "#8B5CF6",
    details:
      "Matched all rhythm patterns correctly and created her own patterns.",
    category: "Music",
  },
  {
    id: "5",
    childId: "2",
    childName: "David",
    activity: "Completed shape recognition",
    time: "10:00 AM",
    date: "2 days ago",
    score: "9/10",
    icon: "shapes",
    color: "#F87171",
    details:
      "Identified most shapes correctly. Still confused between oval and circle.",
    category: "Shapes",
  },
  {
    id: "6",
    childId: "1",
    childName: "Esther",
    activity: "Practiced Luganda alphabet",
    time: "5:30 PM",
    date: "3 days ago",
    score: "Excellent",
    icon: "language",
    color: "#10B981",
    details:
      "Recognized and pronounced all letters correctly. Starting to form simple words.",
    category: "Language",
  },
  {
    id: "7",
    childId: "2",
    childName: "David",
    activity: "Explored 'Solar System' activity",
    time: "4:15 PM",
    date: "3 days ago",
    score: "Completed",
    icon: "planet",
    color: "#3B82F6",
    details:
      "Named all planets in order and identified key characteristics of each.",
    category: "Science",
  },
  {
    id: "8",
    childId: "1",
    childName: "Esther",
    activity: "Completed color mixing game",
    time: "3:00 PM",
    date: "Last week",
    score: "10/10",
    icon: "palette",
    color: "#EC4899",
    details:
      "Successfully mixed primary colors to create secondary colors. Shows strong color recognition.",
    category: "Art",
  },
  {
    id: "9",
    childId: "2",
    childName: "David",
    activity: "Practiced writing numbers 1-5",
    time: "11:30 AM",
    date: "Last week",
    score: "Good",
    icon: "pencil-alt",
    color: "#F59E0B",
    details:
      "Forming numbers more clearly. Still working on proper orientation of '3'.",
    category: "Writing",
  },
  {
    id: "10",
    childId: "1",
    childName: "Esther",
    activity: "Explored 'Ugandan Wildlife' module",
    time: "2:45 PM",
    date: "Last week",
    score: "15/15",
    icon: "leaf",
    color: "#059669",
    details:
      "Identified all native animals and plants. Shows strong interest in conservation.",
    category: "Science",
  },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>(allActivities);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Categories from activities for filtering
  const categories = Array.from(
    new Set(allActivities.map((activity) => activity.category))
  );

  // Filter activities based on selected child, search, and category
  useEffect(() => {
    let filtered = [...allActivities];

    // Filter by child
    if (selectedChild !== "all") {
      filtered = filtered.filter(
        (activity) => activity.childId === selectedChild
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.activity.toLowerCase().includes(query) ||
          activity.childName.toLowerCase().includes(query) ||
          activity.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (activity) => activity.category === filterCategory
      );
    }

    setActivities(filtered);
  }, [selectedChild, searchQuery, filterCategory]);

  // Group activities by date
  const groupedActivities: { [key: string]: Activity[] } = {};
  activities.forEach((activity) => {
    if (!groupedActivities[activity.date]) {
      groupedActivities[activity.date] = [];
    }
    groupedActivities[activity.date].push(activity);
  });

  // Format date keys for display
  const dateKeys = Object.keys(groupedActivities);

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text variant="bold" className="text-xl text-gray-800">
            All Activities
          </Text>
        </View>

        {/* Search bar */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search activities..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filters */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <Text variant="medium" className="text-gray-800">
              Filter by child:
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`px-3 py-1 rounded-full mr-2 ${
                  selectedChild === "all" ? "bg-[#7b5af0]" : "bg-gray-100"
                }`}
                onPress={() => setSelectedChild("all")}
              >
                <Text
                  className={`${
                    selectedChild === "all" ? "text-white" : "text-gray-800"
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>

              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  className={`flex-row items-center px-3 py-1 rounded-full mr-2 ${
                    selectedChild === child.id ? "bg-[#7b5af0]" : "bg-gray-100"
                  }`}
                  onPress={() => setSelectedChild(child.id)}
                >
                  <Text className="mr-1">{child.avatar}</Text>
                  <Text
                    className={`${
                      selectedChild === child.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full mr-2 ${
                filterCategory === "all" ? "bg-[#7b5af0]" : "bg-gray-100"
              }`}
              onPress={() => setFilterCategory("all")}
            >
              <Text
                className={`${
                  filterCategory === "all" ? "text-white" : "text-gray-800"
                }`}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className={`px-3 py-1 rounded-full mr-2 ${
                  filterCategory === category ? "bg-[#7b5af0]" : "bg-gray-100"
                }`}
                onPress={() => setFilterCategory(category || "all")}
              >
                <Text
                  className={`${
                    filterCategory === category ? "text-white" : "text-gray-800"
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Activity list */}
        <ScrollView className="flex-1">
          {activities.length === 0 ? (
            <View className="p-10 items-center justify-center">
              <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4">
                No activities match your filters.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-[#7b5af0] px-4 py-2 rounded-full"
                onPress={() => {
                  setSelectedChild("all");
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
              >
                <Text className="text-white">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dateKeys.map((date) => (
              <View key={date} className="mb-4">
                <View className="px-4 py-2 bg-gray-50">
                  <Text variant="medium" className="text-gray-500">
                    {date}
                  </Text>
                </View>

                {groupedActivities[date].map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    className="px-4 py-3 border-b border-gray-100"
                    onPress={() => {
                      // Navigate to activity detail if needed
                      // router.push({ pathname: "/parent/activity-detail", params: { id: activity.id } });
                    }}
                  >
                    <View className="flex-row">
                      <View
                        style={{ backgroundColor: `${activity.color}15` }}
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      >
                        <FontAwesome5
                          name={activity.icon as any}
                          size={18}
                          color={activity.color}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-sm bg-purple-100 text-[#7b5af0] px-2 py-0.5 rounded-full mr-2">
                            {activity.childName}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {activity.time}
                          </Text>
                        </View>

                        <Text variant="medium" className="text-gray-800 mt-1">
                          {activity.activity}
                        </Text>

                        <View className="flex-row justify-between items-center mt-1">
                          <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {activity.category}
                            </Text>
                          </View>
                          <Text className="text-[#7b5af0] font-medium">
                            {activity.score}
                          </Text>
                        </View>

                        {activity.details && (
                          <Text className="text-gray-600 text-sm mt-1">
                            {activity.details}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
