"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "@/components/StyledText"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { supabase } from "@/lib/supabase"
import { getActivityStats } from "@/lib/utils"

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
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weeklyStats, setWeeklyStats] = useState({
    dailyMinutes: [0, 0, 0, 0, 0, 0, 0],
    totalActivities: 0,
    averageScore: 0
  })

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get the current user session
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) return

        // Get all child profiles for this parent
        const { data: children } = await supabase
          .from("children")
          .select("id")
          .eq("parent_id", sessionData.session.user.id)

        if (!children?.length) return

        // Fetch activities for all children
        const childIds = children.map(child => child.id)
        const promises = childIds.map(id => getActivityStats(id))
        const allStats = await Promise.all(promises)

        // Combine all activities and stats
        const combinedActivities: any[] = []
        const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0]
        let totalActivities = 0
        let totalScore = 0
        let activitiesWithScore = 0

        for (const stats of allStats) {
          if (stats) {
            const activities = await stats.recentActivities
            combinedActivities.push(...activities)
            stats.dailyMinutes.forEach((minutes, i) => {
              weeklyMinutes[i] += minutes
            })
            totalActivities += stats.totalActivities
            if (stats.averageScore) {
              totalScore += stats.averageScore
              activitiesWithScore++
            }
          }
        }

        // Improved sorting for chronological order
        // Sort activities by date AND time (most recent first)
        combinedActivities.sort((a, b) => {
          // If activities have date and time properties already formatted
          if (a.date && a.time && b.date && b.time) {
            const dateTimeA = `${a.date} ${a.time}`;
            const dateTimeB = `${b.date} ${b.time}`;
            return dateTimeB.localeCompare(dateTimeA);
          }
          
          // If activities have a combined time property
          // This fallback uses the existing code which might be working with a different format
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        setRecentActivities(combinedActivities.slice(0, 3)) // Show 3 most recent
        setWeeklyStats({
          dailyMinutes: weeklyMinutes,
          totalActivities,
          averageScore: activitiesWithScore ? Math.round(totalScore / activitiesWithScore) : 0
        })
      } catch (error) {
        console.error("Error fetching activities:", error)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1 bg-white" edges={["right", "top", "left"]}>
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <View>
              <Text variant="bold" className="text-gray-800 text-2xl">
                Parent Dashboard
              </Text>
              <Text className="text-gray-500">Monitor your children's learning journey</Text>
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
                <Text variant="bold" className="text-gray-800 text-lg">
                  Child Profiles
                </Text>
                <TouchableOpacity
                  className="bg-purple-100 px-3 py-1 rounded-full"
                  onPress={() => router.push("/child-list")}
                >
                  <Text variant="medium" className="text-[#7b5af0]">
                    View All
                  </Text>
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
                    <Text variant="medium" className="text-gray-800 text-center">
                      Add Child
                    </Text>
                    <Text className="text-gray-500 text-xs text-center mt-1">New profile</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>

            {/* Recent activities section */}
            <View className="mb-6">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                Recent Activities
              </Text>

              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
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
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-2">No recent activities</Text>
                )}

                <TouchableOpacity
                  className="mt-3 border-t border-gray-100 pt-3"
                  onPress={() => router.push("/parent/activities")}
                >
                  <Text variant="medium" className="text-[#7b5af0] text-center">
                    View All Activities
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekly insights */}
            <View className="mb-6">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                Weekly Learning Time
              </Text>

              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-end h-[120px] mb-2">
                  {weeklyStats.dailyMinutes.map((minutes, index) => (
                    <View key={index} className="items-center flex-1">
                      <View
                        className="bg-[#7b5af0] rounded-t-lg w-[80%] max-w-6"
                        style={{
                          height: (minutes / Math.max(...weeklyStats.dailyMinutes)) * 100,
                          opacity: 0.6 + (minutes / Math.max(...weeklyStats.dailyMinutes)) * 0.4,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View className="flex-row justify-between">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <View key={index} className="items-center flex-1">
                      <Text className="text-gray-500 text-xs">{day}</Text>
                      <Text className="text-gray-700 text-xs mt-1">{weeklyStats.dailyMinutes[index]}m</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between mt-5 pt-3 border-t border-gray-100">
                  <Text className="text-gray-800">Total this week:</Text>
                  <Text variant="bold" className="text-[#7b5af0]">
                    {weeklyStats.dailyMinutes.reduce((sum, mins) => sum + mins, 0)} minutes
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick actions */}
            <View className="mb-6">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                Parent Tools
              </Text>

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
                    <Text variant="medium" className="text-gray-800">
                      {tool.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Parenting tips */}
            <View className="mb-8">
              <Text variant="bold" className="text-gray-800 text-lg mb-3">
                Parenting Tips
              </Text>

              <TouchableOpacity
                className="bg-white rounded-xl p-4 border-l-4 border-[#7b5af0] shadow-sm border-t border-r border-b border-gray-100"
                activeOpacity={0.8}
              >
                <Text variant="medium" className="text-gray-800 mb-2">
                  Supporting your child's learning at home
                </Text>
                <Text className="text-gray-600 text-sm">
                  Create a comfortable learning environment with minimal distractions and regular routines.
                </Text>
                <Text variant="medium" className="text-[#7b5af0] mt-2">
                  Read More
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  )
}

export default ParentDashboard