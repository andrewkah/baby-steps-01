"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "@/components/StyledText"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { supabase } from "@/lib/supabase"
import { TranslatedText } from "@/components/translated-text"

type ChildProfile = {
  id: string
  name: string
  gender: string
  age: string
  reason: string
  created_at: string
  // UI display properties with default values
  level?: number
  progress?: number
  lastActive?: string
  topSkill?: string
  avatar?: string
}

const ParentDashboard = () => {
  const router = useRouter()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChildProfiles()
  }, [])

  const fetchChildProfiles = async () => {
    try {
      setLoading(true)

      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        console.log("No active session found")
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id

      // Fetch child profiles from the 'children' table
      const { data, error } = await supabase.from("children").select("*").eq("parent_id", userId)

      if (error) {
        console.error("Error fetching profiles:", error.message)
        throw error
      }

      // Transform the data to include UI display properties
      const transformedData =
        data?.map((child) => ({
          ...child,
          level: 1, // Default level
          progress: Math.random() * 0.7 + 0.1, // Random progress between 10-80%
          lastActive: "Today", // Default last active
          topSkill: child.reason || "Learning", // Use reason as top skill or default
          avatar: child.gender === "male" ? "👦" : child.gender === "female" ? "👧" : "👶",
        })) || []

      setChildProfiles(transformedData)
      setLoading(false)
    } catch (error) {
      console.error("Error in fetchChildProfiles:", error)
      setLoading(false)
    }
  }

  // Activity mock data
  const recentActivities = [
    {
      id: "1",
      childName: "Esther",
      activity: "Completed 'African Animals' game",
      time: "2 hours ago",
      score: "8/10",
      icon: "paw",
      color: "#FF9F43",
    },
    {
      id: "2",
      childName: "David",
      activity: "Practiced counting with Adinkra",
      time: "Yesterday",
      score: "12/15",
      icon: "calculator",
      color: "#1DD1A1",
    },
    {
      id: "3",
      childName: "Esther",
      activity: "Read 'Kintu' story",
      time: "Yesterday",
      score: "Completed",
      icon: "book",
      color: "#6C5CE7",
    },
  ]

  // Weekly insights data
  const weeklyInsights = [
    { day: "Mon", minutes: 25 },
    { day: "Tue", minutes: 40 },
    { day: "Wed", minutes: 30 },
    { day: "Thu", minutes: 45 },
    { day: "Fri", minutes: 20 },
    { day: "Sat", minutes: 60 },
    { day: "Sun", minutes: 35 },
  ]

  // Calculate maximum minutes for chart scaling
  const maxMinutes = Math.max(...weeklyInsights.map((day) => day.minutes))

  return (
    <>
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1 bg-white" edges={["right", "top", "left"]}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <View>
              <TranslatedText variant="bold" className="text-gray-800 text-2xl">
                Parent Dashboard
              </TranslatedText>
              <TranslatedText className="text-gray-500">Monitor your children's learning journey</TranslatedText>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3"
                onPress={() => router.push("/parent/settings")}
              >
                <Ionicons name="settings-outline" size={22} color="#7b5af0" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center"
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={22} color="#7b5af0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main content */}
          <ScrollView className="flex-1 p-4 pb-8">
            {/* Child profiles section */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <TranslatedText variant="bold" className="text-gray-800 text-lg">
                  Child Profiles
                </TranslatedText>
                <TouchableOpacity
                  className="bg-purple-100 px-3 py-1 rounded-full"
                  onPress={() => router.push("/child-list")}
                >
                  <TranslatedText variant="medium" className="text-[#7b5af0]">
                    View All
                  </TranslatedText>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View className="items-center justify-center py-4">
                  <Text>Loading profiles...</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pb-2">
                  {/* Child profile cards */}
                  {childProfiles.length > 0
                    ? childProfiles.map((child) => (
                        <TouchableOpacity
                          key={child.id}
                          className="bg-purple-50 rounded-xl p-4 w-[150px] shadow-sm"
                          onPress={() =>
                            router.push({
                              pathname: "/parent/child-detail/1" as any,
                              params: { childId: child.id },
                            })
                          }
                          activeOpacity={0.8}
                        >
                          <View className="items-center mb-2">
                            <View className="relative">
                              <View className="w-[60px] h-[60px] rounded-full bg-purple-100 items-center justify-center">
                                <Text className="text-3xl">{child.avatar}</Text>
                              </View>
                              <View className="absolute -bottom-2 -right-2 bg-[#7b5af0] rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                <Text variant="bold" className="text-xs text-white">
                                  {child.level}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text variant="bold" className="text-gray-800 text-center mb-1">
                            {child.name}
                          </Text>
                          <Text className="text-gray-500 text-xs text-center">{child.age}</Text>

                          {/* Progress bar */}
                          <View className="mt-3 bg-purple-100 h-2 rounded-full overflow-hidden">
                            <View
                              className="bg-[#7b5af0] h-full rounded-full"
                              style={{ width: `${(child.progress || 0.1) * 100}%` }}
                            />
                          </View>
                          <Text className="text-gray-500 text-xs text-right mt-1">
                            {Math.round((child.progress || 0) * 100)}%
                          </Text>
                        </TouchableOpacity>
                      ))
                    : null}

                  {/* Add child card */}
                  <TouchableOpacity
                    className="bg-purple-50 rounded-xl p-4 w-[150px] items-center justify-center border-2 border-dashed border-purple-200 shadow-sm"
                    onPress={() => router.push("/parent/add-child/gender")}
                    activeOpacity={0.8}
                  >
                    <View className="w-[60px] h-[60px] rounded-full bg-purple-100 items-center justify-center mb-3">
                      <Ionicons name="add" size={30} color="#7b5af0" />
                    </View>
                    <TranslatedText variant="medium" className="text-gray-800 text-center">
                      Add Child
                    </TranslatedText>
                    <TranslatedText className="text-gray-500 text-xs text-center mt-1">New profile</TranslatedText>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>

            {/* Recent activities section */}
            <View className="mb-6">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Recent Activities
              </TranslatedText>

              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                {recentActivities.map((activity, index) => (
                  <View
                    key={activity.id}
                    className={`${index !== recentActivities.length - 1 ? "border-b border-gray-100 pb-3 mb-3" : ""}`}
                  >
                    <View className="flex-row">
                      <View
                        style={{ backgroundColor: `${activity.color}15` }}
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      >
                        <FontAwesome5 name={activity.icon} size={16} color={activity.color} />
                      </View>
                      <View className="flex-1">
                        <Text variant="medium" className="text-gray-800 text-sm">
                          {activity.childName} {activity.activity}
                        </Text>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500 text-xs">{activity.time}</Text>
                          <Text className="text-[#7b5af0] text-xs font-medium">{activity.score}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  className="mt-3 border-t border-gray-100 pt-3"
                  onPress={() => router.push("/parent/activities" as any)}
                >
                  <TranslatedText variant="medium" className="text-[#7b5af0] text-center">
                    View All Activities
                  </TranslatedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekly insights */}
            <View className="mb-6">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Weekly Learning Time
              </TranslatedText>

              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-end h-[120px] mb-2">
                  {weeklyInsights.map((day, index) => (
                    <View key={index} className="items-center flex-1">
                      <View
                        className="bg-[#7b5af0] rounded-t-lg w-[80%] max-w-6"
                        style={{
                          height: (day.minutes / maxMinutes) * 100,
                          opacity: 0.6 + (day.minutes / maxMinutes) * 0.4,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View className="flex-row justify-between">
                  {weeklyInsights.map((day, index) => (
                    <View key={index} className="items-center flex-1">
                      <Text className="text-gray-500 text-xs">{day.day}</Text>
                      <Text className="text-gray-700 text-xs mt-1">{day.minutes}m</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between mt-5 pt-3 border-t border-gray-100">
                  <TranslatedText className="text-gray-800">Total this week:</TranslatedText>
                  <Text variant="bold" className="text-[#7b5af0]">
                    {weeklyInsights.reduce((sum, day) => sum + day.minutes, 0)} <TranslatedText>minutes</TranslatedText>
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick actions */}
            <View className="mb-6">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Parent Tools
              </TranslatedText>

              <View className="flex-row flex-wrap justify-between">
                {[
                  {
                    icon: "calendar",
                    label: "Schedule",
                    route: "/CalendarTrackingPage",
                  },
                  {
                    icon: "trophy",
                    label: "Achievements",
                    route: "/child-progress",
                  },
                  {
                    icon: "sliders-h",
                    label: "Preferences",
                    route: "/parent/preferences",
                  },
                  {
                    icon: "book-reader",
                    label: "Resources",
                    route: "/parent/resources",
                  },
                ].map((tool, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-white rounded-xl p-4 w-[48%] mb-3 items-center shadow-sm border border-gray-100"
                    onPress={() => router.push(tool.route as any)}
                    activeOpacity={0.8}
                  >
                    <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                      <FontAwesome5 name={tool.icon} size={20} color="#7b5af0" />
                    </View>
                    <TranslatedText variant="medium" className="text-gray-800">
                      {tool.label}
                    </TranslatedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Parenting tips */}
            <View className="mb-8">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Parenting Tips
              </TranslatedText>

              <TouchableOpacity
                className="bg-white rounded-xl p-4 border-l-4 border-[#7b5af0] shadow-sm border-t border-r border-b border-gray-100"
                activeOpacity={0.8}
              >
                <TranslatedText variant="medium" className="text-gray-800 mb-2">
                  Supporting your child's learning at home
                </TranslatedText>
                <TranslatedText className="text-gray-600 text-sm">
                  Create a comfortable learning environment with minimal distractions and regular routines.
                </TranslatedText>
                <TranslatedText variant="medium" className="text-[#7b5af0] mt-2">
                  Read More
                </TranslatedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  )
}

export default ParentDashboard
