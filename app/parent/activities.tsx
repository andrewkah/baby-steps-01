import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text } from "@/components/StyledText";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getChildActivities, getFormattedActivities } from "@/lib/utils";

// Child interface
interface Child {
  id: string;
  name: string;
  avatar: string;
}

export default function ActivitiesScreen() {
  const router = useRouter();
  interface Activity {
    id: string;
    icon: string; 
    color: string;
    childId: string;
    childName: string;
    category: "stories" | "counting" | "museum" | "other";
    activity: string;
    time: string;
    date: string;
    score: string;
    details: string | undefined;
  }
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Fetch children and their activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        // Get children profiles
        const { data: childrenData } = await supabase
          .from("children")
          .select("*")
          .eq("parent_id", sessionData.session.user.id);

        if (childrenData) {
          // Transform children data
          const transformedChildren = childrenData.map(child => ({
            id: child.id,
            name: child.name,
            avatar: child.gender === "male" ? "👦" : "👧"
          }));
          setChildren(transformedChildren);

          // Fetch activities for all children
          const allActivities = [];
          for (const child of childrenData) {
            const childActivities = await getChildActivities(child.id);
            allActivities.push(...childActivities);
          }

          // Format activities for display
          const formattedActivities = await getFormattedActivities(allActivities);
          
          // Sort by date and time (most recent first)
          const sortedActivities = formattedActivities.sort((a, b) => {
            // Create comparable date-time strings for accurate chronological sorting
            // This assumes date is in a format that can be properly compared (like YYYY-MM-DD)
            const dateTimeA = `${a.date} ${a.time}`;
            const dateTimeB = `${b.date} ${b.time}`;
            
            // Sort in descending order (newest first)
            return dateTimeB.localeCompare(dateTimeA);
          });
          
          setActivities(sortedActivities);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    // Set up real-time subscription for new activities
    const subscription = supabase
      .channel('activities')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'activities' 
      }, fetchData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter activities based on selected child, search, and category
  const filteredActivities = activities.filter(activity => {
    if (selectedChild !== "all" && activity.childId !== selectedChild) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!activity.activity.toLowerCase().includes(query) &&
          !activity.childName.toLowerCase().includes(query) &&
          !activity.category?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterCategory !== "all" && activity.category !== filterCategory) return false;
    return true;
  });

  // Ensure activities remain chronologically sorted within each date group
  const sortedFilteredActivities = filteredActivities.sort((a, b) => {
    // For activities on the same date, sort by time
    if (a.date === b.date) {
      return b.time.localeCompare(a.time); // Most recent time first
    }
    // Otherwise, rely on the main date sorting
    return 0;
  });

  // Group activities by date
  const groupedActivities = sortedFilteredActivities.reduce<Record<string, Activity[]>>((groups, activity) => {
    const date = activity.date || 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  // Categories from activities
  const categories = Array.from(
    new Set(activities.map(activity => activity.category).filter(Boolean))
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
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

        {/* Child filters */}
        <View className="px-4 py-3 border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full mr-2 ${
                selectedChild === "all" ? "bg-[#7b5af0]" : "bg-gray-100"
              }`}
              onPress={() => setSelectedChild("all")}
            >
              <Text
                className={selectedChild === "all" ? "text-white" : "text-gray-800"}
              >
                All Children
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
                  className={
                    selectedChild === child.id ? "text-white" : "text-gray-800"
                  }
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category filters */}
        <View className="px-4 py-3 border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full mr-2 ${
                filterCategory === "all" ? "bg-[#7b5af0]" : "bg-gray-100"
              }`}
              onPress={() => setFilterCategory("all")}
            >
              <Text
                className={
                  filterCategory === "all" ? "text-white" : "text-gray-800"
                }
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
                onPress={() => setFilterCategory(category)}
              >
                <Text
                  className={
                    filterCategory === category ? "text-white" : "text-gray-800"
                  }
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Activity list */}
        <ScrollView className="flex-1">
          {loading ? (
            <View className="p-10 items-center justify-center">
              <Text>Loading activities...</Text>
            </View>
          ) : filteredActivities.length === 0 ? (
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
            Object.entries(groupedActivities)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Sort dates chronologically (newest first)
              .map(([date, dateActivities]) => (
                <View key={date} className="mb-4">
                  <View className="px-4 py-2 bg-gray-50">
                    <Text variant="medium" className="text-gray-500">
                      {date}
                    </Text>
                  </View>

                  {dateActivities.map((activity: any) => (
                    <TouchableOpacity
                      key={activity.id}
                      className="px-4 py-3 border-b border-gray-100"
                    >
                      <View className="flex-row">
                        <View
                          style={{ backgroundColor: `${activity.color}15` }}
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        >
                          <FontAwesome5
                            name={activity.icon}
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}