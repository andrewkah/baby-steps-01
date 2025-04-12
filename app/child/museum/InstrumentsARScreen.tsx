"use client"

import { useState, useEffect, useRef } from "react"
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Camera, CameraView } from "expo-camera"
import { GLView } from "expo-gl"
import { Renderer } from "expo-three"
import * as THREE from "three"
import type { ExpoWebGLRenderingContext } from "expo-gl"
import { Audio, AVPlaybackStatusSuccess } from "expo-av"
import { ArrowLeft, Info, X, Volume2 } from "lucide-react-native"

// Buganda musical instruments data
const bugandaInstruments = [
  {
    id: "1",
    name: "Engoma (Royal Drums)",
    type: "Percussion",
    description:
      "The Engoma are sacred royal drums in Buganda culture. They come in different sizes and are played during royal ceremonies, coronations, and important cultural events.",
    funFact:
      "Did you know? The royal drums of Buganda have names and are believed to have spirits. They are kept in special houses and cared for by designated guardians!",
    soundFile: "engoma.mp3",
    position: { x: 0, y: 0, z: -3 },
  },
  {
    id: "2",
    name: "Endere (Flute)",
    type: "Wind",
    description:
      "The Endere is a traditional flute made from reed or bamboo. It has a sweet, melodic sound and is often played during storytelling sessions and social gatherings.",
    funFact:
      "Did you know? Skilled Endere players can imitate human speech patterns and animal sounds with their flutes!",
    soundFile: "endere.mp3",
    position: { x: -1.5, y: 0.5, z: -2.5 },
  },
  {
    id: "3",
    name: "Amadinda (Xylophone)",
    type: "Percussion",
    description:
      "The Amadinda is a large xylophone with wooden keys played by multiple performers. It produces complex, interlocking melodies and is central to traditional Buganda court music.",
    funFact:
      "Did you know? The Amadinda is typically played by three musicians who create complex, interlocking patterns without seeing each other's hands!",
    soundFile: "amadinda.mp3",
    position: { x: 1.5, y: 0, z: -2.5 },
  },
  {
    id: "4",
    name: "Ensaasi (Shakers)",
    type: "Percussion",
    description:
      "Ensaasi are rattles or shakers made from gourds filled with seeds or small stones. They provide rhythm and are often used in dance performances.",
    funFact: "Did you know? Ensaasi are often worn around dancers' ankles to create rhythmic sounds as they move!",
    soundFile: "ensaasi.mp3",
    position: { x: 0, y: 1, z: -2 },
  },
  {
    id: "5",
    name: "Ennanga (Harp)",
    type: "String",
    description:
      "The Ennanga is a bowl-shaped harp with strings stretched over a resonator. It was traditionally played by court musicians to entertain the Kabaka (king) and is known for its soothing sound.",
    funFact:
      "Did you know? The Ennanga player often sings while playing, telling stories about Buganda history and culture!",
    soundFile: "ennanga.mp3",
    position: { x: -1, y: -0.5, z: -3.5 },
  },
]

export default function InstrumentsARScreen() {
  const navigation = useNavigation()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [selectedItem, setSelectedItem] = useState<(typeof bugandaInstruments)[0] | null>(null)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [arReady, setArReady] = useState(false)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Animation values
  const rotationValue = useRef(new Animated.Value(0)).current
  const pulseValue = useRef(new Animated.Value(1)).current
  const bounceValue = useRef(new Animated.Value(0)).current

  // Start rotation animation
  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start()
  }

  // Start pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  // Start bounce animation for markers
  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")

      // Initialize audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })

      // Start animations
      startRotationAnimation()
      startPulseAnimation()
      startBounceAnimation()

      setLoading(false)
    })()

    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  const playSound = async (instrumentId: string) => {
    // Stop current sound if playing
    if (sound) {
      await sound.stopAsync()
      await sound.unloadAsync()
      setSound(null)
      setIsPlaying(false)
    }

    try {
      // In a real app, you would load actual sound files
      // For this example, we'll just simulate playing sounds
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sounds/drum-sample.mp3"), // Replace with actual sound file
        { shouldPlay: true },
      )

      setSound(newSound)
      setIsPlaying(true)

      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if ((status as AVPlaybackStatusSuccess).didJustFinish) {
          setIsPlaying(false)
        }
      })
    } catch (error) {
      console.log("Error playing sound:", error)
    }
  }

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({ gl })
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f0f0f0")

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 10, 0)
    scene.add(directionalLight)

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000)
    camera.position.set(0, 1.6, 0) // Average human height

    // Create music room environment
    createMusicRoomEnvironment(scene)

    // Add instruments
    addInstruments(scene)

    // Animation loop
    const render = () => {
      requestAnimationFrame(render)
      renderer.render(scene, camera)
      gl.endFrameEXP()
    }

    render()
    setArReady(true)
  }

  const createMusicRoomEnvironment = (scene: THREE.Scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    scene.add(floor)

    // Walls for music room
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.5,
    })

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 4)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.z = -5
    backWall.position.y = 1.5
    scene.add(backWall)

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(10, 4)
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
    leftWall.position.x = -10
    leftWall.position.y = 1.5
    leftWall.position.z = 0
    leftWall.rotation.y = Math.PI / 2
    scene.add(leftWall)

    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(10, 4)
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial)
    rightWall.position.x = 10
    rightWall.position.y = 1.5
    rightWall.position.z = 0
    rightWall.rotation.y = -Math.PI / 2
    scene.add(rightWall)

    // Display stands for instruments
    bugandaInstruments.forEach((item) => {
      const standGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 16)
      const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321, // Dark brown
        roughness: 0.5,
      })
      const stand = new THREE.Mesh(standGeometry, standMaterial)
      stand.position.set(item.position.x, item.position.y - 0.5, item.position.z)
      scene.add(stand)
    })
  }

  const addInstruments = (scene: THREE.Scene) => {
    // Create Buganda instruments
    bugandaInstruments.forEach((item) => {
      let geometry
      let material

      // Create different geometries based on the instrument
      switch (item.id) {
        case "1": // Engoma (Royal Drums)
          geometry = new THREE.CylinderGeometry(0.3, 0.25, 0.5, 32)
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown
            roughness: 0.7,
          })
          break
        case "2": // Endere (Flute)
          geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12)
          material = new THREE.MeshStandardMaterial({
            color: 0xcd853f, // Peru brown
            roughness: 0.5,
          })
          break
        case "3": // Amadinda (Xylophone)
          geometry = new THREE.BoxGeometry(0.6, 0.1, 0.3)
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown
            roughness: 0.8,
          })
          break
        case "4": // Ensaasi (Shakers)
          geometry = new THREE.SphereGeometry(0.15, 32, 32)
          material = new THREE.MeshStandardMaterial({
            color: 0xdeb887, // Burlywood
            roughness: 0.9,
          })
          break
        case "5": // Ennanga (Harp)
          geometry = new THREE.TorusGeometry(0.2, 0.02, 16, 100, Math.PI)
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown
            roughness: 0.6,
          })
          break
        default:
          geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
          material = new THREE.MeshStandardMaterial({ color: 0xffffff })
      }

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(item.position.x, item.position.y, item.position.z)

      // Add a name to the mesh for raycasting/selection
      mesh.name = item.id

      scene.add(mesh)
    })
  }

  const handleItemSelect = (itemId: string) => {
    const item = bugandaInstruments.find((item) => item.id === itemId)
    if (item) {
      setSelectedItem(item)
      setInfoModalVisible(true)
    }
  }

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-white">
        <Text>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-white">
        <Text>No access to camera</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6B8E23" />
        <Text className="mt-4 text-base text-gray-800 font-['System']">
          Loading Buganda Musical Instruments...
        </Text>
      </View>
    )
  }

  // Calculate rotation for 3D object preview
  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Calculate scale for pulse effect
  const pulse = pulseValue

  // Calculate bounce for markers
  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  })

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <CameraView className="flex-1" facing="back">
          <GLView className="flex-1" onContextCreate={onContextCreate} />

          {!arReady && (
            <View className="absolute inset-0 justify-center items-center bg-black/70">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-4 text-base text-white font-['System'] text-center px-5">
                Setting up your Buganda musical experience...
              </Text>
            </View>
          )}

          {/* AR UI Overlay */}
          <View className="absolute inset-0 justify-between">
            <View className="flex-row justify-between items-center p-4 bg-green-800/70">
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-white font-['System']">Buganda Instruments</Text>
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => setInfoModalVisible(true)}
              >
                <Info size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Item Markers */}
            <View className="flex-1 relative">
              {bugandaInstruments.map((item) => (
                <Animated.View
                  key={item.id}
                  className="absolute items-center justify-center w-30 h-15"
                  style={{
                    left: `${((item.position.x + 2) / 4) * 100}%`,
                    top: `${((item.position.z + 4) / 8) * 100}%`,
                    transform: [{ translateY: bounce }],
                  }}
                >
                  <TouchableOpacity onPress={() => handleItemSelect(item.id)} className="items-center">
                    <Animated.View
                      className="w-3 h-3 rounded-full bg-green-800 border-2 border-white"
                      style={{ transform: [{ scale: pulse }] }}
                    />
                    <Text className="mt-1 text-white text-xs font-bold text-center bg-green-800/70 px-2 py-0.5 rounded-2.5 overflow-hidden font-['System']">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View className="p-4 bg-green-800/70 items-center">
              <Text className="text-white text-sm font-['System']">
                Tap on instruments to learn and hear their sounds
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Item Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-5xl h-[70%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-green-800 font-['System']">
                {selectedItem ? selectedItem.name : "Buganda Instrument"}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full"
                onPress={() => setInfoModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
              {selectedItem && (
                <>
                  <View className="items-center mb-5">
                    <Animated.View
                      className="w-50 h-50 rounded-2.5 justify-center items-center mb-2.5 bg-gray-100"
                      style={{ transform: [{ rotate: spin }] }}
                    >
                      <Text className="text-6xl font-bold text-green-800 font-['System']">
                        {selectedItem.name.charAt(0)}
                      </Text>
                    </Animated.View>

                    <TouchableOpacity
                      className="flex-row items-center bg-green-800 py-2.5 px-4 rounded-lg mt-2.5"
                      onPress={() => playSound(selectedItem.id)}
                    >
                      <Volume2 size={24} color="#fff" />
                      <Text className="ml-2 text-white text-base font-semibold font-['System']">
                        {isPlaying ? "Playing..." : "Play Sound"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="px-2.5">
                    <View className="flex-row mb-2.5">
                      <Text className="text-base font-bold text-gray-800 w-25 font-['System']">
                        Type:
                      </Text>
                      <Text className="text-base text-gray-600 flex-1 font-['System']">
                        {selectedItem.type}
                      </Text>
                    </View>

                    <Text className="text-base leading-6 text-gray-800 mb-5 font-['System']">
                      {selectedItem.description}
                    </Text>

                    <View className="bg-green-50 p-4 rounded-2.5 mb-5 border-l-1 border-l-green-800">
                      <Text className="text-lg font-bold text-green-800 mb-2 font-['System']">
                        Fun Fact
                      </Text>
                      <Text className="text-base text-gray-800 font-['System']">
                        {selectedItem.funFact}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              className="bg-green-800 py-3.5 rounded-2 items-center"
              onPress={() => setInfoModalVisible(false)}
            >
              <Text className="font-['System'] text-white text-base font-semibold">Continue Exploring</Text>
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
  </SafeAreaView>
)
}

