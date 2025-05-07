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
import { TranslatedText } from "@/components/translated-text"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  // Game progress data
  gameProgress?: {
    counting: any | null
    puzzle: any | null
    card: any | null
    learning: any | null
  }
}

// Storage keys for the game states
const COUNTING_GAME_STORAGE_KEY = "luganda_counting_game_state"
const PUZZLE_GAME_STORAGE_KEY = "buganda_puzzle_game_state"
const CARD_GAME_STORAGE_KEY = "cards_matching_game_state"
const LEARNING_GAME_STORAGE_KEY = "learning_game_state"

const ParentDashboard = () => {
  const router = useRouter()
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weeklyStats, setWeeklyStats] = useState({
    dailyMinutes: [0, 0, 0, 0, 0, 0, 0],
    totalActivities: 0,
    averageScore: 0,
  })
  const [gameActivities, setGameActivities] = useState<any[]>([])

  useEffect(() => {
    fetchChildProfiles()
  }, [])

  // Load game progress for a specific child and game
  const loadGameProgress = async (childId: string, storageKey: string) => {
    try {
      const savedState = await AsyncStorage.getItem(`${storageKey}_${childId}`)

      if (savedState) {
        const gameState = JSON.parse(savedState)

        // Check if the saved state is from within the last 30 days
        const isRecent = Date.now() - gameState.lastPlayed < 30 * 24 * 60 * 60 * 1000

        if (isRecent) {
          // Format the progress data based on the game type
          if (storageKey === COUNTING_GAME_STORAGE_KEY) {
            return {
              currentStage: gameState.currentStage,
              currentLevel: gameState.currentLevel,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
            }
          } else if (storageKey === PUZZLE_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              completedPuzzles: gameState.completedPuzzles,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
            }
          } else if (storageKey === CARD_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              matchesMade: gameState.matchesMade,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
            }
          } else if (storageKey === LEARNING_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              wordsLearned: gameState.wordsLearned,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error(`Error loading game progress for ${storageKey}:`, error)
      return null
    }
  }

  // Create a game activity entry for the dashboard
  const createGameActivity = (childName: string, gameType: string, gameProgress: any) => {
    if (!gameProgress) return null

    let activity = ""
    let icon = "gamepad"
    let color = "#7b5af0"

    switch (gameType) {
      case "counting":
        activity = `completed Stage ${gameProgress.currentStage}, Level ${gameProgress.currentLevel} in Counting Game`
        icon = "sort-numeric-up"
        color = "#6366f1"
        break
      case "puzzle":
        activity = `completed ${gameProgress.completedPuzzles} puzzles at Level ${gameProgress.level}`
        icon = "puzzle-piece"
        color = "#8b5cf6"
        break
      case "card":
        activity = `made ${gameProgress.matchesMade} matches at Level ${gameProgress.level} in Card Game`
        icon = "clone"
        color = "#ec4899"
        break
      case "learning":
        activity = `learned ${gameProgress.wordsLearned} words at Level ${gameProgress.level}`
        icon = "book"
        color = "#10b981"
        break
    }

    return {
      id: `game-${gameType}-${childName}-${Date.now()}`,
      childName,
      activity,
      time: gameProgress.lastPlayed,
      score: `Score: ${gameProgress.score}`,
      icon,
      color,
    }
  }

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
      const transformedData: ChildProfile[] =
        data?.map((child) => ({
          ...child,
          level: 1, // Default level
          progress: Math.random() * 0.7 + 0.1, // Random progress between 10-80%
          lastActive: "Today", // Default last active
          topSkill: child.reason || "Learning", // Use reason as top skill or default
          avatar: child.gender === "male" ? "👦" : child.gender === "female" ? "👧" : "👶",
          gameProgress: {
            counting: null,
            puzzle: null,
            card: null,
            learning: null,
          },
        })) || []

      // Load game progress for each child
      const gameActivitiesArray = []

      for (const child of transformedData) {
        // Load progress for all games
        const countingProgress = await loadGameProgress(child.id, COUNTING_GAME_STORAGE_KEY)
        const puzzleProgress = await loadGameProgress(child.id, PUZZLE_GAME_STORAGE_KEY)
        const cardProgress = await loadGameProgress(child.id, CARD_GAME_STORAGE_KEY)
        const learningProgress = await loadGameProgress(child.id, LEARNING_GAME_STORAGE_KEY)

        // Store progress in child object
        if (child.gameProgress) {
          child.gameProgress.counting = countingProgress
          child.gameProgress.puzzle = puzzleProgress
          child.gameProgress.card = cardProgress
          child.gameProgress.learning = learningProgress
        }

        // Calculate total score and level based on game progress
        let totalScore = 0
        let gamesPlayed = 0

        if (countingProgress) {
          totalScore += countingProgress.score
          gamesPlayed++
          // Create activity entry
          const activity = createGameActivity(child.name, "counting", countingProgress)
          if (activity) gameActivitiesArray.push(activity)
        }

        if (puzzleProgress) {
          totalScore += puzzleProgress.score
          gamesPlayed++
          // Create activity entry
          const activity = createGameActivity(child.name, "puzzle", puzzleProgress)
          if (activity) gameActivitiesArray.push(activity)
        }

        if (cardProgress) {
          totalScore += cardProgress.score
          gamesPlayed++
          // Create activity entry
          const activity = createGameActivity(child.name, "card", cardProgress)
          if (activity) gameActivitiesArray.push(activity)
        }

        if (learningProgress) {
          totalScore += learningProgress.score
          gamesPlayed++
          // Create activity entry
          const activity = createGameActivity(child.name, "learning", learningProgress)
          if (activity) gameActivitiesArray.push(activity)
        }

        // Update child level and progress based on game data
        if (gamesPlayed > 0) {
          child.level = Math.max(1, Math.floor(totalScore / 100) + 1)
          child.progress = Math.min(0.95, totalScore / (child.level * 100))
        }
      }

      // Sort game activities by date (most recent first)
      gameActivitiesArray.sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      })

      // Add game activities to the state
      setGameActivities(gameActivitiesArray)
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
        const childIds = children.map((child) => child.id)
        const promises = childIds.map((id) => getActivityStats(id))
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
            stats.dailyMinutes.forEach((minutes: number, i: number) => {
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
            const dateTimeA = `${a.date} ${a.time}`
            const dateTimeB = `${b.date} ${b.time}`
            return dateTimeB.localeCompare(dateTimeA)
          }

          // If activities have a combined time property
          // This fallback uses the existing code which might be working with a different format
          return new Date(b.time).getTime() - new Date(a.time).getTime()
        })

        // Combine database activities with game activities
        const allActivities = [...combinedActivities, ...gameActivities]
        allActivities.sort((a, b) => {
          // Simple sort by time string (most recent first)
          if (typeof a.time === "string" && typeof b.time === "string") {
            return b.time.localeCompare(a.time)
          }
          return 0
        })

        setRecentActivities(allActivities.slice(0, 5)) // Show 5 most recent
        setWeeklyStats({
          dailyMinutes: weeklyMinutes,
          totalActivities: totalActivities + gameActivities.length,
          averageScore: activitiesWithScore ? Math.round(totalScore / activitiesWithScore) : 0,
        })
      } catch (error) {
        console.error("Error fetching activities:", error)
      }
    }

    if (gameActivities.length > 0) {
      fetchActivities()
    }

    const interval = setInterval(fetchActivities, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [gameActivities])

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

                          {/* Game indicators */}
                          <View className="flex-row justify-center mt-2 space-x-1">
                            {child.gameProgress?.counting && <View className="w-2 h-2 rounded-full bg-indigo-500" />}
                            {child.gameProgress?.puzzle && <View className="w-2 h-2 rounded-full bg-purple-500" />}
                            {child.gameProgress?.card && <View className="w-2 h-2 rounded-full bg-pink-500" />}
                            {child.gameProgress?.learning && <View className="w-2 h-2 rounded-full bg-green-500" />}
                          </View>
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

            {/* Game Progress Summary */}
            <View className="mb-6">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Learning Games Progress
              </TranslatedText>

              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row flex-wrap justify-between">
                  {/* Counting Game */}
                  <View className="w-[48%] mb-4">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2">
                        <FontAwesome5 name="sort-numeric-up" size={14} color="#6366f1" />
                      </View>
                      <Text variant="medium" className="text-gray-800 text-sm">
                        Counting Game
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mb-1">
                      {childProfiles.filter((child) => child.gameProgress?.counting).length} children playing
                    </Text>
                    <TouchableOpacity
                      className="bg-indigo-100 py-1 rounded-md"
                      onPress={() => router.push("/child/games/wordgame")}
                    >
                      <Text className="text-indigo-600 text-xs text-center">Play</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Puzzle Game */}
                  <View className="w-[48%] mb-4">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                        <FontAwesome5 name="puzzle-piece" size={14} color="#8b5cf6" />
                      </View>
                      <Text variant="medium" className="text-gray-800 text-sm">
                        Puzzle Game
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mb-1">
                      {childProfiles.filter((child) => child.gameProgress?.puzzle).length} children playing
                    </Text>
                    <TouchableOpacity
                      className="bg-purple-100 py-1 rounded-md"
                      onPress={() => router.push("/child")}
                    >
                      <Text className="text-purple-600 text-xs text-center">Play</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Card Game */}
                  <View className="w-[48%]">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-pink-100 items-center justify-center mr-2">
                        <FontAwesome5 name="clone" size={14} color="#ec4899" />
                      </View>
                      <Text variant="medium" className="text-gray-800 text-sm">
                        Card Game
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mb-1">
                      {childProfiles.filter((child) => child.gameProgress?.card).length} children playing
                    </Text>
                    <TouchableOpacity className="bg-pink-100 py-1 rounded-md" onPress={() => router.push("/child")}>
                      <Text className="text-pink-600 text-xs text-center">Play</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Learning Game */}
                  <View className="w-[48%]">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                        <FontAwesome5 name="book" size={14} color="#10b981" />
                      </View>
                      <Text variant="medium" className="text-gray-800 text-sm">
                        Learning Game
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mb-1">
                      {childProfiles.filter((child) => child.gameProgress?.learning).length} children playing
                    </Text>
                    <TouchableOpacity
                      className="bg-green-100 py-1 rounded-md"
                      onPress={() => router.push("/child")}
                    >
                      <Text className="text-green-600 text-xs text-center">Play</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Recent activities section */}
            <View className="mb-6">
              <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                Recent Activities
              </TranslatedText>

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
                  {weeklyStats.dailyMinutes.map((minutes, index) => (
                    <View key={index} className="items-center flex-1">
                      <View
                        className="bg-[#7b5af0] rounded-t-lg w-[80%] max-w-6"
                        style={{
                          height: (minutes / Math.max(...weeklyStats.dailyMinutes, 1)) * 100,
                          opacity: 0.6 + (minutes / Math.max(...weeklyStats.dailyMinutes, 1)) * 0.4,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View className="flex-row justify-between">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <View key={index} className="items-center flex-1">
                      <Text className="text-gray-500 text-xs">{day}</Text>
                      <Text className="text-gray-700 text-xs mt-1">{weeklyStats.dailyMinutes[index]}m</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row items-center justify-between mt-5 pt-3 border-t border-gray-100">
                  <TranslatedText className="text-gray-800">Total this week:</TranslatedText>
                  <Text variant="bold" className="text-[#7b5af0]">
                    {weeklyStats.dailyMinutes.reduce((sum, mins) => sum + mins, 0)} minutes
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
