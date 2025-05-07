"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "@/components/StyledText"
import { TranslatedText } from "@/components/translated-text"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"
import { supabase } from "@/lib/supabase"
import { useChild } from "@/context/ChildContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Define TypeScript interface for our child data
interface ChildData {
  id: string
  name: string
  gender: string
  age: string
  avatar?: string
}

// Game state interfaces for persistence
interface CountingGameState {
  currentStage: number
  currentLevel: number
  score: number
  gameLevels: number[]
  lastPlayed: number
}

interface PuzzleGameState {
  level: number
  completedPuzzles: number
  score: number
  lastPlayed: number
}

interface CardGameState {
  level: number
  matchesMade: number
  score: number
  lastPlayed: number
}

interface LearningGameState {
  level: number
  wordsLearned: number
  score: number
  lastPlayed: number
}

// Storage keys for the game states
const COUNTING_GAME_STORAGE_KEY = "luganda_counting_game_state"
const PUZZLE_GAME_STORAGE_KEY = "buganda_puzzle_game_state"
const CARD_GAME_STORAGE_KEY = "cards_matching_game_state"
const LEARNING_GAME_STORAGE_KEY = "learning_game_state"

export default function ChildDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ childId: string }>()
  const childId = params.childId
  const { setActiveChild } = useChild()

  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameProgress, setGameProgress] = useState<{
    counting: any | null
    puzzle: any | null
    card: any | null
    learning: any | null
  }>({
    counting: null,
    puzzle: null,
    card: null,
    learning: null,
  })

  useEffect(() => {
    if (childId) {
      fetchChildData()
      fetchAllGameProgress()
    }
  }, [childId])

  const fetchChildData = async () => {
    try {
      setLoading(true)

      // Fetch child data from the 'children' table
      const { data, error } = await supabase.from("children").select("id, name, gender, age").eq("id", childId).single()

      if (error) {
        console.error("Error fetching child data:", error.message)
        throw error
      }

      // Add avatar based on gender
      const childWithAvatar = {
        ...data,
        avatar: data.gender === "male" ? "👦" : data.gender === "female" ? "👧" : "👶",
      }

      setChildData(childWithAvatar)
      setLoading(false)
    } catch (error) {
      console.error("Error in fetchChildData:", error)
      setLoading(false)
    }
  }

  const fetchAllGameProgress = async () => {
    try {
      // Fetch progress for all games
      const countingProgress = await loadGameProgress(COUNTING_GAME_STORAGE_KEY)
      const puzzleProgress = await loadGameProgress(PUZZLE_GAME_STORAGE_KEY)
      const cardProgress = await loadGameProgress(CARD_GAME_STORAGE_KEY)
      const learningProgress = await loadGameProgress(LEARNING_GAME_STORAGE_KEY)

      setGameProgress({
        counting: countingProgress,
        puzzle: puzzleProgress,
        card: cardProgress,
        learning: learningProgress,
      })
    } catch (error) {
      console.error("Error fetching game progress:", error)
    }
  }

  // Generic function to load game progress from AsyncStorage
  const loadGameProgress = async (storageKey: string) => {
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
              stagesCompleted: Math.max(0, gameState.currentStage - 1),
              levelProgress: (gameState.currentLevel / 5) * 100, // Assuming 5 levels per stage
              daysSinceLastPlayed: Math.floor((Date.now() - gameState.lastPlayed) / (1000 * 60 * 60 * 24)),
            }
          } else if (storageKey === PUZZLE_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              completedPuzzles: gameState.completedPuzzles,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
              daysSinceLastPlayed: Math.floor((Date.now() - gameState.lastPlayed) / (1000 * 60 * 60 * 24)),
            }
          } else if (storageKey === CARD_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              matchesMade: gameState.matchesMade,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
              daysSinceLastPlayed: Math.floor((Date.now() - gameState.lastPlayed) / (1000 * 60 * 60 * 24)),
            }
          } else if (storageKey === LEARNING_GAME_STORAGE_KEY) {
            return {
              level: gameState.level,
              wordsLearned: gameState.wordsLearned,
              score: gameState.score,
              lastPlayed: new Date(gameState.lastPlayed).toLocaleDateString(),
              daysSinceLastPlayed: Math.floor((Date.now() - gameState.lastPlayed) / (1000 * 60 * 60 * 24)),
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

  const handleLaunchChildMode = () => {
    if (childData) {
      setActiveChild(childData)
      router.push({
        pathname: "/child" as any,
        params: { active: childId },
      })
    }
  }

  // Calculate total score across all games
  const calculateTotalScore = () => {
    let total = 0
    if (gameProgress.counting) total += gameProgress.counting.score
    if (gameProgress.puzzle) total += gameProgress.puzzle.score
    if (gameProgress.card) total += gameProgress.card.score
    if (gameProgress.learning) total += gameProgress.learning.score
    return total
  }

  // Calculate overall level based on game progress
  const calculateOverallLevel = () => {
    let level = 1
    let gamesPlayed = 0

    if (gameProgress.counting) {
      level += gameProgress.counting.currentStage
      gamesPlayed++
    }
    if (gameProgress.puzzle) {
      level += gameProgress.puzzle.level
      gamesPlayed++
    }
    if (gameProgress.card) {
      level += gameProgress.card.level
      gamesPlayed++
    }
    if (gameProgress.learning) {
      level += gameProgress.learning.level
      gamesPlayed++
    }

    return gamesPlayed > 0 ? Math.ceil(level / gamesPlayed) : 1
  }

  // Get the most recently played game
  const getMostRecentGame = () => {
    const games = [
      { name: "Counting Game", data: gameProgress.counting, route: "/child/games/wordgame" },
      { name: "Puzzle Game", data: gameProgress.puzzle, route: "/puzzle-game" },
      { name: "Card Matching", data: gameProgress.card, route: "/card-game" },
      { name: "Learning Game", data: gameProgress.learning, route: "/learning-game" },
    ]

    // Filter out games with no data
    const playedGames = games.filter((game) => game.data !== null)

    if (playedGames.length === 0) return null

    // Sort by last played date (most recent first)
    playedGames.sort((a, b) => {
      const dateA = new Date(a.data.lastPlayed).getTime()
      const dateB = new Date(b.data.lastPlayed).getTime()
      return dateB - dateA
    })

    return playedGames[0]
  }

  const renderGameProgressCard = (
    title: string,
    icon: string,
    color: string,
    progress: any,
    route: string,
    progressLabel: string,
    progressValue: number,
  ) => {
    if (!progress) return null

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4"
        onPress={() => router.push(route as any)}
        activeOpacity={0.8}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View
              style={{ backgroundColor: `${color}15` }}
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
            >
              <FontAwesome5 name={icon} size={16} color={color} />
            </View>
            <Text variant="medium" className="text-gray-800">
              {title}
            </Text>
          </View>
          <Text variant="bold" style={{ color }}>
            Score: {String(progress.score)}
          </Text>
        </View>

        <View className="bg-gray-100 p-3 rounded-lg mb-3">
          {Object.entries(progress)
            .filter(([key]) => !["score", "lastPlayed", "daysSinceLastPlayed", "levelProgress"].includes(key))
            .map(([key, value]) => (
              <View key={key} className="flex-row justify-between mb-1">
                <Text className="text-gray-700">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Text>
                <Text variant="medium" style={{ color }}>
                  {String(value)}
                </Text>
              </View>
            ))}
        </View>

        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-700">{progressLabel}</Text>
            <Text className="text-gray-700">{Math.round(progressValue)}%</Text>
          </View>
          <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <View className="h-full rounded-full" style={{ width: `${progressValue}%`, backgroundColor: color }} />
          </View>
        </View>

        <Text className="text-gray-500 text-xs text-right">Last played: {progress.lastPlayed}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
        {/* Header with back button */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <TranslatedText variant="bold" className="text-xl text-gray-800">
            Child Profile
          </TranslatedText>
        </View>

        <ScrollView className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center p-4">
              <TranslatedText>Loading child profile...</TranslatedText>
            </View>
          ) : childData ? (
            <>
              {/* Child profile header */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="relative mr-4">
                    <View className="w-[80px] h-[80px] rounded-full bg-purple-100 items-center justify-center">
                      <Text className="text-4xl">{childData.avatar}</Text>
                    </View>
                    <View className="absolute -bottom-2 -right-2 bg-[#7b5af0] rounded-full w-7 h-7 items-center justify-center shadow-sm">
                      <Text variant="bold" className="text-xs text-white">
                        {calculateOverallLevel()}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text variant="bold" className="text-2xl text-gray-800 mr-2">
                        {childData.name}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-sm">{childData.age} years old</Text>
                    <TranslatedText className="text-gray-500 text-sm">Gender: {childData.gender}</TranslatedText>

                    <View className="mt-2 flex-row">
                      <TouchableOpacity
                        className="bg-[#7b5af0] py-1 px-3 rounded-full mr-2"
                        onPress={handleLaunchChildMode}
                      >
                        <TranslatedText className="text-white text-sm">Launch Child Mode</TranslatedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Learning Summary */}
              <View className="p-4 border-b border-gray-100">
                <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                  Learning Summary
                </TranslatedText>

                <View className="flex-row flex-wrap justify-between">
                  <View className="bg-white rounded-xl p-3 w-[48%] mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-2">
                        <FontAwesome5 name="star" size={14} color="#6366f1" />
                      </View>
                      <Text className="text-gray-500 text-xs">Total Score</Text>
                    </View>
                    <Text variant="bold" className="text-gray-800 text-lg">
                      {calculateTotalScore()}
                    </Text>
                  </View>

                  <View className="bg-white rounded-xl p-3 w-[48%] mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-2">
                      <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                        <FontAwesome5 name="gamepad" size={14} color="#7b5af0" />
                      </View>
                      <Text className="text-gray-500 text-xs">Games Played</Text>
                    </View>
                    <Text variant="bold" className="text-gray-800 text-lg">
                      {Object.values(gameProgress).filter(Boolean).length}
                    </Text>
                  </View>

                  {getMostRecentGame() && (
                    <TouchableOpacity
                      className="bg-white rounded-xl p-3 w-full shadow-sm border border-gray-100"
                      onPress={() => router.push(getMostRecentGame()?.route as any)}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                            <FontAwesome5 name="play" size={14} color="#10b981" />
                          </View>
                          <Text className="text-gray-500">Continue Learning</Text>
                        </View>
                        <Text variant="medium" className="text-green-600">
                          {getMostRecentGame()?.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Game Progress */}
              <View className="p-4">
                <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                  Game Progress
                </TranslatedText>

                {/* Counting Game Progress */}
                {renderGameProgressCard(
                  "Luganda Counting Game",
                  "sort-numeric-up",
                  "#6366f1",
                  gameProgress.counting,
                  "/child/games/wordgame",
                  "Level Progress",
                  gameProgress.counting?.levelProgress || 0,
                )}

                {/* Puzzle Game Progress */}
                {renderGameProgressCard(
                  "Buganda Puzzle Game",
                  "puzzle-piece",
                  "#8b5cf6",
                  gameProgress.puzzle,
                  "/puzzle-game",
                  "Completion",
                  gameProgress.puzzle
                    ? (gameProgress.puzzle.completedPuzzles / (gameProgress.puzzle.level * 3)) * 100
                    : 0,
                )}

                {/* Card Game Progress */}
                {renderGameProgressCard(
                  "Card Matching Game",
                  "clone",
                  "#ec4899",
                  gameProgress.card,
                  "/card-game",
                  "Matches Progress",
                  gameProgress.card ? (gameProgress.card.matchesMade / (gameProgress.card.level * 5)) * 100 : 0,
                )}

                {/* Learning Game Progress */}
                {renderGameProgressCard(
                  "Word Learning Game",
                  "book",
                  "#10b981",
                  gameProgress.learning,
                  "/learning-game",
                  "Words Progress",
                  gameProgress.learning
                    ? (gameProgress.learning.wordsLearned / (gameProgress.learning.level * 10)) * 100
                    : 0,
                )}

                {/* No games played yet */}
                {Object.values(gameProgress).every((game) => game === null) && (
                  <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center">
                    <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                      <FontAwesome5 name="gamepad" size={24} color="#9ca3af" />
                    </View>
                    <Text className="text-gray-500 text-center mb-3">No game progress found for this child</Text>
                    <TouchableOpacity
                      className="bg-[#7b5af0] py-3 px-6 rounded-lg"
                      onPress={() => router.push("/child" as any)}
                    >
                      <Text variant="medium" className="text-white">
                        Start Learning
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center p-4">
              <TranslatedText>Child not found</TranslatedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
