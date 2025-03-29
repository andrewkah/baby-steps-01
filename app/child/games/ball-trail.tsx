"use client"

import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from "react-native"

interface Ball {
  position: Animated.ValueXY
  scale: Animated.Value
  id: number
}

export default function BallTrail() {
  const [balls, setBalls] = useState<Ball[]>([])
  const touchPosition = useRef({ x: 0, y: 0 })
  const { width, height } = Dimensions.get("window")

  // Initialize with touch in the center
  useEffect(() => {
    touchPosition.current = {
      x: width / 2,
      y: height / 2,
    }

    // Create initial balls
    const initialBalls: Ball[] = []
    for (let i = 0; i < 30; i++) {
      initialBalls.push({
        position: new Animated.ValueXY({ x: width / 2, y: height / 2 }),
        scale: new Animated.Value(1),
        id: i,
      })
    }
    setBalls(initialBalls)

    // Start animation loop
    const animationLoop = () => {
      let prevX = touchPosition.current.x
      let prevY = touchPosition.current.y

      initialBalls.forEach((ball, index) => {
        // Use type assertion to access the current value
        const currentX = (ball.position.x as any)._value
        const currentY = (ball.position.y as any)._value

        // Calculate distance and new position
        const dx = prevX - currentX
        const dy = prevY - currentY
        const newX = currentX + dx * 0.8 // Significantly increased from 0.35 to 0.8
        const newY = currentY + dy * 0.8 // Significantly increased from 0.35 to 0.8

        // Calculate scale based on distance
        const distance = Math.sqrt(dx * dx + dy * dy)
        const newScale = Math.max(0.3, 1 - distance / 200) // Adjusted scale factor

        // Update values
        ball.position.setValue({ x: newX, y: newY })
        ball.scale.setValue(newScale)

        // Update previous position for next ball
        prevX = newX
        prevY = newY
      })

      requestAnimationFrame(animationLoop)
    }

    const animationId = requestAnimationFrame(animationLoop)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Set up pan responder to track touch
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        touchPosition.current = {
          x: gestureState.moveX,
          y: gestureState.moveY,
        }
      },
    }),
  ).current

  // Handle exit
  const handleExit = () => {
    // You can implement navigation or other exit behavior here
    router.push('/child/parent-gate')
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {balls.map((ball) => (
        <Animated.View
          key={ball.id}
          style={[
            styles.ball,
            {
              transform: [
                { translateX: ball.position.x },
                { translateY: ball.position.y },
                { scale: ball.scale },
                { translateX: -10 }, // Half of ball width to center
                { translateY: -10 }, // Half of ball height to center
              ],
            } as ViewStyle,
          ]}
        />
      ))}

      {/* Small exit button in the top-right corner */}
      {/* <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
        <Text style={styles.exitButtonText}>EXIT</Text>
      </TouchableOpacity> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  ball: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  exitButton: {
    position: "absolute",
    top: 25,
    left: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "black",
    zIndex: 10,
  },
  exitButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})

