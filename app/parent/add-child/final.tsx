import React, { useState, useEffect } from "react";
import {
  View,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/components/StyledText";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinalScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simulate loading process with progress, but don't redirect automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 0.1;
        return newProgress > 1 ? 1 : newProgress;
      });
    }, 300);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      // Removed automatic navigation
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleContinue = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <SafeAreaView className="flex-1 bg-primary-50">
        {/* Decorative elements */}
        <View className="absolute w-[100px] h-[100px] rounded-full bg-primary-100/30 top-[10%] left-[5%] -z-10" />
        <View className="absolute w-[80px] h-[80px] rounded-full bg-secondary-100/30 bottom-[20%] right-[8%] -z-10" />
        <View className="absolute w-[60px] h-[60px] rounded-full bg-accent-100/30 top-[40%] right-[15%] -z-10" />

        {/* Main content */}
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl shadow-md items-center w-full max-w-[340px]">
            {/* Animated icon */}
            <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-6">
              {isLoading ? (
                <FontAwesome5 name="magic" size={32} color="#3e4685" />
              ) : (
                <FontAwesome5 name="check-circle" size={32} color="#4ade80" />
              )}
            </View>

            <Text
              variant="bold"
              className="text-2xl text-center text-primary-800 mb-4"
            >
              {isLoading
                ? "Creating Your Personalized Learning Path"
                : "Your Personalized Plan is Ready!"}
            </Text>

            <Text className="text-base text-center text-neutral-600 mb-8">
              {isLoading
                ? "Please wait while we generate a custom path for your child based on their needs..."
                : "We've created custom activities tailored to your child's development stage."}
            </Text>

            {/* Custom progress indicator */}
            {isLoading ? (
              <View className="w-full mb-6">
                {/* Custom progress bar */}
                <View className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </View>

                {/* Loading steps */}
                <View className="mt-4 w-full">
                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-4 h-4 rounded-full mr-2 ${
                        progress > 0.25 ? "bg-primary-500" : "bg-primary-200"
                      }`}
                    >
                      {progress > 0.25 && (
                        <FontAwesome5
                          name="check"
                          size={8}
                          color="white"
                          style={{ alignSelf: "center" }}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-xs ${
                        progress > 0.25
                          ? "text-primary-700"
                          : "text-neutral-500"
                      }`}
                    >
                      Analyzing preferences
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-4 h-4 rounded-full mr-2 ${
                        progress > 0.5 ? "bg-primary-500" : "bg-primary-200"
                      }`}
                    >
                      {progress > 0.5 && (
                        <FontAwesome5
                          name="check"
                          size={8}
                          color="white"
                          style={{ alignSelf: "center" }}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-xs ${
                        progress > 0.5 ? "text-primary-700" : "text-neutral-500"
                      }`}
                    >
                      Creating activity plan
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View
                      className={`w-4 h-4 rounded-full mr-2 ${
                        progress > 0.8 ? "bg-primary-500" : "bg-primary-200"
                      }`}
                    >
                      {progress > 0.8 && (
                        <FontAwesome5
                          name="check"
                          size={8}
                          color="white"
                          style={{ alignSelf: "center" }}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-xs ${
                        progress > 0.8 ? "text-primary-700" : "text-neutral-500"
                      }`}
                    >
                      Finalizing personalization
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-neutral-500 text-right mt-2">
                  {Math.round(progress * 100)}% complete
                </Text>
              </View>
            ) : (
              <View className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 w-full">
                <Text variant="medium" className="text-green-700 text-center">
                  All set! Ready to begin the journey.
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View className="w-full space-y-3">
              {!isLoading && (
                <TouchableOpacity
                  className="py-3 rounded-xl bg-secondary-500 items-center mb-3"
                  onPress={handleContinue}
                >
                  <Text variant="bold" className="text-white">
                    Continue to Dashboard
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className="py-3 rounded-xl bg-gray-100 items-center"
                onPress={() => router.push("/child-list")}
              >
                <Text variant="medium" className="text-primary-700">
                  {isLoading ? "Skip" : "Maybe Later"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tip at bottom */}
        <View className="p-6 items-center">
          <Text className="text-sm text-center text-neutral-500">
            We're creating activities tailored to your child's development stage
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}
