"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "@/components/StyledText"
import { TranslatedText } from "@/components/translated-text"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/lib/supabase"
import { useChild } from "@/context/ChildContext"

// Achievement imports
import { useAchievements } from "@/components/games/achievements/useAchievements"
import { AchievementDefinition } from "@/components/games/achievements/achievementTypes" 

// Define TypeScript interface for our child data
interface ChildData {
  id: string
  name: string
  gender: string
  age: string
  avatar?: string
}

// Interface for achievements prepared for display
interface DisplayableAchievement extends AchievementDefinition {
  earned_at_timestamp: string;
}

export default function ChildDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ childId: string }>()
  const childId = params.childId
  const { setActiveChild } = useChild()

  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)

  // Achievements state
  const { 
    definedAchievements, 
    earnedChildAchievements, 
    isLoadingAchievements,
    refreshAchievements 
  } = useAchievements(childId); // Pass childId to the hook

  const [childsEarnedFullAchievements, setChildsEarnedFullAchievements] = useState<DisplayableAchievement[]>([]);

  useEffect(() => {
    if (childId) {
      fetchChildData();
      // refreshAchievements(); // useAchievements will call loadInitialAchievements on mount/childId change
    }
  }, [childId]) // Removed refreshAchievements from here as hook handles it

  const fetchChildData = async () => {
    // ... (your existing fetchChildData remains the same)
    try {
      setLoading(true)
      const { data, error } = await supabase.from("children").select("id, name, gender, age").eq("id", childId).single()
      if (error) {
        console.error("Error fetching child data:", error.message)
        throw error
      }
      const childWithAvatar = {
        ...data,
        avatar: data.gender === "male" ? "👦" : data.gender === "female" ? "👧" : "👶",
      }
      setChildData(childWithAvatar)
    } catch (error) {
      console.error("Error in fetchChildData:", error)
    } finally {
      setLoading(false)
    }
  }

  // useEffect to process and combine achievement data for display
  useEffect(() => {
    if (!isLoadingAchievements && definedAchievements.length > 0 && childId) {
      const achievementDefinitionsMap = new Map(definedAchievements.map(achDef => [achDef.id, achDef]));
      
      const fullEarnedDetails = earnedChildAchievements
        // earnedChildAchievements from the hook (if modified correctly) should already be for the specific childId
        // .filter(earned => earned.child_id === childId) // This filter might be redundant if hook fetches specifically
        .map(earned => {
          const definition = achievementDefinitionsMap.get(earned.achievement_id);
          if (definition) {
            return { 
              ...definition, 
              earned_at_timestamp: earned.earned_at 
            };
          }
          return undefined;
        })
        .filter(Boolean) as DisplayableAchievement[]; // Filter out undefined and assert type

      setChildsEarnedFullAchievements(fullEarnedDetails.sort((a, b) => new Date(b.earned_at_timestamp).getTime() - new Date(a.earned_at_timestamp).getTime())); // Sort by most recent
    } else if (!isLoadingAchievements) { // If not loading and no defined achievements or childId, clear the list
        setChildsEarnedFullAchievements([]);
    }
  }, [childId, definedAchievements, earnedChildAchievements, isLoadingAchievements]);


  const handleLaunchChildMode = () => {
    // ... (your existing handleLaunchChildMode remains the same)
    if (childData) {
      setActiveChild(childData)
      router.push({
        pathname: "/child" as any,
        params: { active: childId },
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.warn("Error formatting date:", e);
      return "Unknown Date";
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}> {/* Changed bg for better contrast */}
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <TranslatedText variant="bold" className="text-xl text-gray-800">
            Child Profile
          </TranslatedText>
        </View>

        <ScrollView className="flex-1">
          {loading ? ( // Loading for child profile
            <View className="flex-1 items-center justify-center p-6">
              <TranslatedText className="text-gray-600">Loading child profile...</TranslatedText>
            </View>
          ) : childData ? (
            <>
              {/* Child profile header */}
              <View className="p-4 border-b border-gray-200 bg-white">
                <View className="flex-row items-center">
                  <View className="relative mr-4">
                    <View className="w-[80px] h-[80px] rounded-full bg-purple-100 items-center justify-center">
                      <Text className="text-4xl">{childData.avatar}</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text variant="bold" className="text-2xl text-gray-800 mr-2">
                      {childData.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{childData.age} years old</Text>
                    <TranslatedText className="text-gray-500 text-sm capitalize">Gender: {childData.gender}</TranslatedText>
                    <View className="mt-3 flex-row">
                      <TouchableOpacity
                        className="bg-[#7b5af0] py-2 px-4 rounded-lg shadow"
                        onPress={handleLaunchChildMode}
                      >
                        <TranslatedText variant="medium" className="text-white text-sm">Launch Child Mode</TranslatedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Achievements Section */}
              <View className="p-4 mt-2">
                <View className="flex-row justify-between items-center mb-3">
                    <TranslatedText variant="bold" className="text-gray-800 text-lg">
                    Achievements
                    </TranslatedText>
                </View>
                
                {isLoadingAchievements ? (
                  <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 items-center">
                    <TranslatedText className="text-gray-500">Loading achievements...</TranslatedText>
                  </View>
                ) : childsEarnedFullAchievements.length > 0 ? (
                  <View>
                    {childsEarnedFullAchievements.map((achievement, index) => (
                      <View
                          key={achievement.id}
                          className={`
                            bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-row items-start
                            ${index < childsEarnedFullAchievements.length - 1 ? "mb-3" : ""} 
                          `} // Add mb-3 (margin-bottom) to all but the last item
                        >
                        <View className="mr-4 mt-1 bg-amber-100 p-3 rounded-full shadow-sm">
                          <Ionicons
                            name={(achievement.icon_name as any) || 'star-outline'}
                            size={26}
                            color="#d97706" // Darker amber for icon
                          />
                        </View>
                        <View className="flex-1">
                          <Text variant="medium" className="text-base text-gray-700">{achievement.name}</Text>
                          <Text className="text-xs text-gray-500 mt-0.5 mb-1.5" numberOfLines={2}>{achievement.description}</Text>
                          <View className="flex-row justify-between items-center mt-1">
                            <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-full">
                                <Ionicons name="star" size={12} color="#f59e0b"/>
                                <Text className="text-xs text-amber-700 ml-1">+{achievement.points} Points</Text>
                            </View>
                            <Text className="text-xs text-gray-400">
                              {formatDate(achievement.earned_at_timestamp)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 items-center">
                    <Ionicons name="sad-outline" size={32} color="#9ca3af" className="mb-2"/>
                    <TranslatedText className="text-gray-500 text-center">
                      {childData?.name || "This child"} hasn't unlocked any achievements yet.
                    </TranslatedText>
                    <TranslatedText className="text-gray-400 text-xs text-center mt-1">
                      Keep playing games to earn them!
                    </TranslatedText>
                  </View>
                )}
              </View>

              {/* Child ID (for debugging or info) - Kept it simple */}
              <View className="p-4 mt-2">
                 <TranslatedText variant="bold" className="text-gray-800 text-lg mb-2">
                    Developer Info
                  </TranslatedText>
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Text className="text-gray-600 text-xs">Child ID: {childId}</Text>
                </View>
              </View>

            </>
          ) : ( // Child not found
            <View className="flex-1 items-center justify-center p-6">
              <TranslatedText className="text-gray-600">Child not found or an error occurred.</TranslatedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}