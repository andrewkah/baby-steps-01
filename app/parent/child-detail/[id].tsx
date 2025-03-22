import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/StyledText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Define TypeScript interfaces for our data models
interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  progress: number;
  lastActive: string;
  topSkill: string;
  preferredLanguage: string;
  interests: string[];
  learningStyle: string;
  joinDate: string;
}

interface Skill {
  name: string;
  progress: number;
  color: string;
}

interface Activity {
  id: string;
  childId: string;
  activity: string;
  time: string;
  score: string;
  icon: string;
  color: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
}

// Mock data for children profiles (same as in dashboard)
const childProfiles: ChildProfile[] = [
  {
    id: "1",
    name: "Esther",
    age: 6,
    avatar: "👧",
    level: 3,
    progress: 0.65,
    lastActive: "Today",
    topSkill: "Reading",
    preferredLanguage: "English & Luganda",
    interests: ["Animals", "Music", "Storytelling"],
    learningStyle: "Visual",
    joinDate: "Sep 10, 2024",
  },
  {
    id: "2",
    name: "David",
    age: 5,
    avatar: "👦",
    level: 2,
    progress: 0.42,
    lastActive: "Yesterday",
    topSkill: "Numbers",
    preferredLanguage: "English",
    interests: ["Space", "Animals", "Colors"],
    learningStyle: "Hands-on",
    joinDate: "Oct 23, 2024",
  },
];

// Skill breakdown for each child
const skillsData: Record<string, Skill[]> = {
  "1": [
    { name: "Reading", progress: 0.85, color: "#8B5CF6" },
    { name: "Numbers", progress: 0.6, color: "#3B82F6" },
    { name: "Culture", progress: 0.7, color: "#EC4899" },
    { name: "Music", progress: 0.9, color: "#10B981" },
  ],
  "2": [
    { name: "Reading", progress: 0.45, color: "#8B5CF6" },
    { name: "Numbers", progress: 0.72, color: "#3B82F6" },
    { name: "Culture", progress: 0.38, color: "#EC4899" },
    { name: "Science", progress: 0.52, color: "#F59E0B" },
  ],
};

// Activity data filtered by child
const getChildActivities = (childId: string): Activity[] => {
  const activities: Activity[] = [
    {
      id: "1",
      childId: "1",
      activity: "Completed 'African Animals' game",
      time: "2 hours ago",
      score: "8/10",
      icon: "paw",
      color: "#FF9F43",
    },
    {
      id: "2",
      childId: "2",
      activity: "Practiced counting with Adinkra",
      time: "Yesterday",
      score: "12/15",
      icon: "calculator",
      color: "#1DD1A1",
    },
    {
      id: "3",
      childId: "1",
      activity: "Read 'Kintu' story",
      time: "Yesterday",
      score: "Completed",
      icon: "book",
      color: "#6C5CE7",
    },
    {
      id: "4",
      childId: "1",
      activity: "Played the African Drums game",
      time: "2 days ago",
      score: "Perfect!",
      icon: "music",
      color: "#8B5CF6",
    },
    {
      id: "5",
      childId: "2",
      activity: "Completed shape recognition",
      time: "2 days ago",
      score: "9/10",
      icon: "shapes",
      color: "#F87171",
    },
  ];

  return activities.filter((activity) => activity.childId === childId);
};

// Recommended activities based on child's progress
const recommendations: Record<string, Recommendation[]> = {
  "1": [
    {
      id: "1",
      title: "Folk Stories",
      description: "Traditional East African stories with interactive elements",
      duration: "15 min",
      icon: "book-open",
      color: "#8B5CF6",
    },
    {
      id: "2",
      title: "Counting Game",
      description: "Practice numbers 1-20 with fun animations",
      duration: "10 min",
      icon: "sort-numeric-up",
      color: "#3B82F6",
    },
  ],
  "2": [
    {
      id: "1",
      title: "Letter Sounds",
      description: "Learn phonics with animals from Uganda",
      duration: "12 min",
      icon: "volume-up",
      color: "#EC4899",
    },
    {
      id: "2",
      title: "Counting Stars",
      description: "Advanced counting game with colorful visuals",
      duration: "15 min",
      icon: "star",
      color: "#F59E0B",
    },
  ],
};

export default function ChildDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const childId = params.id || "1"; // Default to first child if no ID provided
  const [activeTab, setActiveTab] = useState("overview");

  // Find the child based on the ID from the URL
  const child = childProfiles.find((c) => c.id === childId) || childProfiles[0];

  // Get data specific to this child
  const childSkills = skillsData[childId] || skillsData["1"];
  const childActivities = getChildActivities(childId);
  const childRecommendations = recommendations[childId] || recommendations["1"];

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text variant="bold" className="text-xl text-gray-800">
            Child Profile
          </Text>

          
        </View>

        <ScrollView className="flex-1">
          {/* Child profile header */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="relative mr-4">
                <View className="w-[80px] h-[80px] rounded-full bg-purple-100 items-center justify-center">
                  <Text className="text-4xl">{child.avatar}</Text>
                </View>
                <View className="absolute -bottom-2 -right-2 bg-[#7b5af0] rounded-full w-7 h-7 items-center justify-center shadow-sm px-3">
                  <Text variant="bold" className="text-xs text-white">
                    {child.level}
                  </Text>
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text variant="bold" className="text-2xl text-gray-800 mr-2">
                    {child.name}
                  </Text>
                  
                </View>
                <Text className="text-gray-500 text-sm">
                  {child.age} years old
                </Text>
                <Text className="text-gray-500 text-sm">
                  Last active: {child.lastActive}
                </Text>

                <View className="mt-2 flex-row">
                  <TouchableOpacity
                    className="bg-[#7b5af0] py-1 px-3 rounded-full mr-2"
                    onPress={() =>
                      router.push({
                        pathname: "/child" as any,
                        params: { active: childId },
                      })
                    }
                  >
                    <Text className="text-white text-sm">
                      Launch Child Mode
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

           
          </View>

        

          {/* Child Information */}
          <View className="p-4">
            {/* Child Bio */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                About {child.name}
              </Text>

              <View className="flex-row mb-2">
                <View className="w-32">
                  <Text className="text-gray-500">Top Skill</Text>
                </View>
                <Text className="text-gray-800 flex-1">{child.topSkill}</Text>
              </View>

              <View className="flex-row mb-2">
                <View className="w-32">
                  <Text className="text-gray-500">Languages</Text>
                </View>
                <Text className="text-gray-800 flex-1">
                  {child.preferredLanguage}
                </Text>
              </View>

              <View className="flex-row mb-2">
                <View className="w-32">
                  <Text className="text-gray-500">Interests</Text>
                </View>
                <View className="flex-1 flex-row flex-wrap">
                  {child.interests.map((interest, index) => (
                    <View
                      key={index}
                      className="bg-purple-50 px-2 py-1 rounded-full mr-1 mb-1"
                    >
                      <Text className="text-[#7b5af0] text-xs">{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row mb-2">
                <View className="w-32">
                  <Text className="text-gray-500">Learning Style</Text>
                </View>
                <Text className="text-gray-800 flex-1">
                  {child.learningStyle}
                </Text>
              </View>

              <View className="flex-row">
                <View className="w-32">
                  <Text className="text-gray-500">Joined</Text>
                </View>
                <Text className="text-gray-800 flex-1">{child.joinDate}</Text>
              </View>
            </View>

            {/* Skill Breakdown */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text variant="bold" className="text-gray-800 text-lg">
                  Skill Breakdown
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/parent/child-progress",
                      params: { childId },
                    })
                  }
                >
                  <Text variant="medium" className="text-[#7b5af0]">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>

              {childSkills.map((skill, index) => (
                <View key={index} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-700">{skill.name}</Text>
                    <Text className="text-gray-700">
                      {Math.round(skill.progress * 100)}%
                    </Text>
                  </View>
                  <View className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${skill.progress * 100}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Activities */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text variant="bold" className="text-gray-800 text-lg">
                  Recent Activities
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/parent/child-activities" as any,
                      params: { childId },
                    })
                  }
                >
                  <Text variant="medium" className="text-[#7b5af0]">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {childActivities.length === 0 ? (
                <Text className="text-gray-500 italic">
                  No recent activities
                </Text>
              ) : (
                childActivities.map((activity, index) => (
                  <View
                    key={activity.id}
                    className={`${
                      index !== childActivities.length - 1
                        ? "border-b border-gray-100 pb-3 mb-3"
                        : ""
                    }`}
                  >
                    <View className="flex-row">
                      <View
                        style={{ backgroundColor: `${activity.color}15` }}
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      >
                        <FontAwesome5
                          name={activity.icon as any}
                          size={16}
                          color={activity.color}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          variant="medium"
                          className="text-gray-800 text-sm"
                        >
                          {activity.activity}
                        </Text>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-xs">
                            {activity.time}
                          </Text>
                          <Text className="text-[#7b5af0] text-xs font-medium">
                            {activity.score}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Recommended Activities */}
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                Recommended Activities
              </Text>

              {childRecommendations.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center ${
                    index !== childRecommendations.length - 1
                      ? "border-b border-gray-100 pb-3 mb-3"
                      : ""
                  }`}
                  onPress={() => {}}
                >
                  <View
                    style={{ backgroundColor: `${item.color}15` }}
                    className="w-12 h-12 rounded-lg items-center justify-center mr-3"
                  >
                    <FontAwesome5
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <Text variant="medium" className="text-gray-800">
                        {item.title}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {item.duration}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm mt-0.5">
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-3 pt-3 border-t border-gray-100"
                onPress={() => {}}
              >
                <Text variant="medium" className="text-[#7b5af0] text-center">
                  View More Recommendations
                </Text>
              </TouchableOpacity>
            </View>

            
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
