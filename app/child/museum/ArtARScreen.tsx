import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Camera, CameraView, useCameraPermissions } from "expo-camera"
import { GLView } from "expo-gl"
import { Renderer } from "expo-three"
import * as THREE from "three"
import type { ExpoWebGLRenderingContext } from "expo-gl"
import { ArrowLeft, Info, X } from "lucide-react-native"

// Buganda art data
const bugandaArt = [
  {
    id: "1",
    name: "Bark Cloth Art",
    artist: "Traditional",
    period: "Ancient to Present",
    description:
      "Bark cloth (Olubugo) is a traditional canvas for Buganda art. Artists create patterns and designs using natural dyes on this cloth made from the Mutuba tree bark.",
    funFact:
      "Did you know? Bark cloth making in Uganda was recognized by UNESCO as an Intangible Cultural Heritage of Humanity in 2008!",
    position: { x: 0, y: 0, z: -3 },
  },
  {
    id: "2",
    name: "Royal Portraits",
    artist: "Various Court Artists",
    period: "19th Century to Present",
    description:
      "Portraits of Buganda kings (Kabakas) are an important art form. These portraits capture the royal lineage and are displayed in palaces and important cultural sites.",
    funFact:
      "Did you know? Traditional royal portraits used specific poses and symbols to show the king's power and authority!",
    position: { x: -1.5, y: 0.5, z: -2.5 },
  },
  {
    id: "3",
    name: "Ceremonial Masks",
    artist: "Traditional Craftsmen",
    period: "Traditional",
    description:
      "While not as common as in some other African cultures, Buganda ceremonial masks were used in specific rituals and dances. They often represent spirits or ancestors.",
    funFact:
      "Did you know? The expressions on masks are carefully carved to represent specific emotions or spiritual states!",
    position: { x: 1.5, y: 0, z: -2.5 },
  },
  {
    id: "4",
    name: "Contemporary Buganda Art",
    artist: "Modern Ugandan Artists",
    period: "20th Century to Present",
    description:
      "Modern Buganda artists blend traditional themes with contemporary techniques. They often explore themes of cultural identity, history, and social change.",
    funFact:
      "Did you know? Many contemporary Ugandan artists have gained international recognition while still honoring their Buganda heritage!",
    position: { x: 0, y: 1, z: -2 },
  },
  {
    id: "5",
    name: "Decorative Gourds",
    artist: "Traditional Craftspeople",
    period: "Traditional to Present",
    description:
      "Decorated gourds serve both practical and artistic purposes in Buganda culture. They are carved and painted with geometric patterns and scenes from daily life or folklore.",
    funFact:
      "Did you know? Gourds were traditionally used as containers for milk, water, and beer, with different designs indicating their contents!",
    position: { x: -1, y: -0.5, z: -3.5 },
  },
]

export default function ArtARScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const [selectedItem, setSelectedItem] = useState<
    (typeof bugandaArt)[0] | null
  >(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [arReady, setArReady] = useState(false);

  // Animation values
  const rotationValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  // Start rotation animation
  const startRotationAnimation = () => {
    Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Start pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

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
      ])
    ).start();
  };

  useEffect(() => {
    if (permissionResponse?.granted) {
      setHasPermission(true);
      setLoading(false);
    } else {
      requestPermission();
    }
  }, [permissionResponse]);

  useEffect(() => {
    if (hasPermission) {
      // Start animations
      startRotationAnimation();
      startPulseAnimation();
      startBounceAnimation();
    }
  }, [hasPermission]);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f0f0f0");

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // Create a camera
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 0); // Average human height

    // Create art gallery environment
    createArtGalleryEnvironment(scene);

    // Add art pieces
    addArtPieces(scene);

    // Animation loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
    setArReady(true);
  };

  const createArtGalleryEnvironment = (scene: THREE.Scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // Walls for art gallery
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.5,
    });

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 4);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -5;
    backWall.position.y = 1.5;
    scene.add(backWall);

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(10, 4);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -10;
    leftWall.position.y = 1.5;
    leftWall.position.z = 0;
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(10, 4);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.x = 10;
    rightWall.position.y = 1.5;
    rightWall.position.z = 0;
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Art frames on walls
    bugandaArt.forEach((item, index) => {
      // Create frame
      const frameGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513, // Brown wooden frame
        roughness: 0.5,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);

      // Position frames on walls
      if (index < 2) {
        // On back wall
        frame.position.set(-2 + index * 4, 1.5, -4.95);
      } else if (index < 4) {
        // On left wall
        frame.position.set(-9.95, 1.5, -2 + (index - 2) * 4);
        frame.rotation.y = Math.PI / 2;
      } else {
        // On right wall
        frame.position.set(9.95, 1.5, -2 + (index - 4) * 4);
        frame.rotation.y = -Math.PI / 2;
      }

      scene.add(frame);

      // Create art canvas inside frame
      const canvasGeometry = new THREE.PlaneGeometry(1, 0.6);
      const canvasMaterial = new THREE.MeshStandardMaterial({
        color: getArtColor(item.id),
        roughness: 0.9,
      });
      const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);

      // Position canvas slightly in front of frame
      if (index < 2) {
        canvas.position.set(-2 + index * 4, 1.5, -4.92);
      } else if (index < 4) {
        canvas.position.set(-9.92, 1.5, -2 + (index - 2) * 4);
        canvas.rotation.y = Math.PI / 2;
      } else {
        canvas.position.set(9.92, 1.5, -2 + (index - 4) * 4);
        canvas.rotation.y = -Math.PI / 2;
      }

      canvas.name = item.id; // For selection
      scene.add(canvas);
    });
  };

  const getArtColor = (id: string) => {
    // Different colors for different art pieces
    switch (id) {
      case "1":
        return 0x8b4513; // Brown for bark cloth
      case "2":
        return 0xdaa520; // Goldenrod for royal portraits
      case "3":
        return 0x654321; // Dark brown for masks
      case "4":
        return 0x4682b4; // Steel blue for contemporary art
      case "5":
        return 0xcd853f; // Peru for gourds
      default:
        return 0xffffff;
    }
  };

  const addArtPieces = (scene: THREE.Scene) => {
    // Art pieces are already added as canvases in the createArtGalleryEnvironment function
  };

  const handleItemSelect = (itemId: string) => {
    const item = bugandaArt.find((item) => item.id === itemId);
    if (item) {
      setSelectedItem(item);
      setInfoModalVisible(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-white">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-white">
        <Text>No access to camera</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4682B4" />
        <Text className="mt-4 text-base text-gray-800 font-['System']">
          Loading Buganda Art Gallery...
        </Text>
      </View>
    );
  }

  // Calculate rotation for 3D object preview
  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Calculate scale for pulse effect
  const scale = scaleValue;

  // Calculate bounce for markers
  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <CameraView className="flex-1" facing="back">
          <GLView className="flex-1" onContextCreate={onContextCreate} />

          {!arReady && (
            <View className="absolute inset-0 justify-center items-center bg-black/70">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-4 text-base text-white font-['System'] text-center px-5">
                Setting up your Buganda art gallery...
              </Text>
            </View>
          )}

          {/* AR UI Overlay */}
          <View className="absolute inset-0 justify-between">
            <View className="flex-row justify-between items-center p-4 bg-blue-700/70">
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-white font-['System']">
                Buganda Art
              </Text>
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => setInfoModalVisible(true)}
              >
                <Info size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Item Markers */}
            <View className="flex-1 relative">
              {bugandaArt.map((item) => (
                <Animated.View
                  key={item.id}
                  className="absolute items-center justify-center w-30 h-15"
                  style={{
                    left: `${((Number.parseInt(item.id) - 1) % 5) * 20 + 10}%`,
                    top: `${
                      Math.floor((Number.parseInt(item.id) - 1) / 5) * 30 + 30
                    }%`,
                    transform: [{ translateY: bounce }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleItemSelect(item.id)}
                    className="items-center"
                  >
                    <Animated.View
                      className="w-3 h-3 rounded-full bg-blue-700 border-2 border-white"
                      style={{ transform: [{ scale }] }}
                    />
                    <Text className="mt-1 text-white text-xs font-bold text-center bg-blue-700/70 px-2 py-0.5 rounded-2.5 overflow-hidden font-['System']">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View className="p-4 bg-blue-700/70 items-center">
              <Text className="text-white text-sm font-['System']">
                Tap on artworks to learn about Buganda art
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
              <Text className="text-2xl font-bold text-blue-700 font-['System']">
                {selectedItem ? selectedItem.name : "Buganda Art"}
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
                      className="w-50 h-50 rounded-2.5 justify-center items-center mb-2.5"
                      style={{
                        backgroundColor: `#${getArtColor(
                          selectedItem.id
                        ).toString(16)}`,
                        transform: [{ rotate: spin }],
                      }}
                    >
                      <Text className="text-6xl font-bold text-white font-['System']">
                        {selectedItem.name.charAt(0)}
                      </Text>
                    </Animated.View>
                  </View>

                  <View className="px-2.5">
                    <View className="flex-row mb-2.5">
                      <Text className="text-base font-bold text-gray-800 w-25 font-['System']">
                        Artist:
                      </Text>
                      <Text className="text-base text-gray-600 flex-1 font-['System']">
                        {selectedItem.artist}
                      </Text>
                    </View>

                    <View className="flex-row mb-2.5">
                      <Text className="text-base font-bold text-gray-800 w-25 font-['System']">
                        Period:
                      </Text>
                      <Text className="text-base text-gray-600 flex-1 font-['System']">
                        {selectedItem.period}
                      </Text>
                    </View>

                    <Text className="text-base leading-6 text-gray-800 mb-5 font-['System']">
                      {selectedItem.description}
                    </Text>

                    <View className="bg-blue-50 p-4 rounded-2.5 mb-5 border-l-1 border-l-blue-700">
                      <Text className="text-lg font-bold text-blue-700 mb-2 font-['System']">
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
              className="bg-blue-700 py-3.5 rounded-2 items-center"
              onPress={() => setInfoModalVisible(false)}
            >
              <Text className="font-['System'] text-white text-base font-semibold">
                Continue Exploring
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
