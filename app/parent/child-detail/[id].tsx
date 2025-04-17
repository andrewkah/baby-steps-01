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

// Define TypeScript interface for our child data
interface ChildData {
  id: string
  name: string
  gender: string
  age: string
  avatar?: string
}

export default function ChildDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ childId: string }>()
  const childId = params.childId
  const { setActiveChild } = useChild()

  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (childId) {
      fetchChildData()
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

  const handleLaunchChildMode = () => {
    if (childData) {
      setActiveChild(childData)
      router.push({
        pathname: "/child" as any,
        params: { active: childId },
      })
    }
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
                    <View className="absolute -bottom-2 -right-2 bg-[#7b5af0] rounded-full w-7 h-7 items-center justify-center shadow-sm px-3">
                      <Text variant="bold" className="text-xs text-white">
                        1
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

              {/* Child Information */}
              <View className="p-4">
                {/* Child ID (for debugging) */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                  <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                    Child ID
                  </TranslatedText>
                  <Text className="text-gray-500">{childId}</Text>
                </View>

                {/* Placeholder for future content */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                  <TranslatedText variant="bold" className="text-gray-800 text-lg mb-3">
                    Coming Soon
                  </TranslatedText>
                  <TranslatedText className="text-gray-500">
                    Additional child information and progress tracking will be available here in future updates.
                  </TranslatedText>
                </View>
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
