import { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import type { ExpoWebGLRenderingContext } from "expo-gl";
import { ArrowLeft, Info, X, RotateCcw } from "lucide-react-native";

// Buganda artifacts data
const bugandaArtifacts = [
  {
    id: "1",
    name: "Royal Drums (Mujaguzo)",
    period: "Traditional",
    description:
      "The Mujaguzo are the royal drums of Buganda, symbolizing the kingdom's authority. They are only played during important royal ceremonies and are considered sacred objects.",
    funFact:
      "Did you know? The Mujaguzo drums are believed to have spirits and are given names like people!",
    position: { x: 0, y: 0, z: -3 },
  },
  {
    id: "2",
    name: "Kabaka's Spears",
    period: "Traditional",
    description:
      "These ceremonial spears represent the Kabaka's (king's) authority and military power. They are carried during royal processions and important ceremonies.",
    funFact:
      "Did you know? The spears are made with specific woods and metals that symbolize strength and longevity!",
    position: { x: -1.5, y: 0.5, z: -2.5 },
  },
  {
    id: "3",
    name: "Royal Stool (Entebe)",
    period: "Traditional",
    description:
      "The royal stool is a symbol of the Kabaka's authority. It is carved from a special tree and decorated with symbols of the kingdom.",
    funFact:
      "Did you know? When a new Kabaka is crowned, he sits on this special stool as part of the ceremony!",
    position: { x: 1.5, y: 0, z: -2.5 },
  },
  {
    id: "4",
    name: "Barkcloth (Olubugo)",
    period: "Traditional to Present",
    description:
      "Barkcloth is made from the inner bark of the Mutuba tree. It was the traditional cloth of the Baganda people before cotton was introduced. It's still used for ceremonial purposes.",
    funFact:
      "Did you know? Making barkcloth is so important that UNESCO recognized it as an Intangible Cultural Heritage!",
    position: { x: 0, y: 1, z: -2 },
  },
  {
    id: "5",
    name: "Royal Regalia",
    period: "Traditional to Present",
    description:
      "The royal regalia includes the crown, scepter, and other symbols of the Kabaka's authority. These items are carefully preserved and only displayed during important ceremonies.",
    funFact:
      "Did you know? Some of the royal regalia items are hundreds of years old and have been passed down through generations of kings!",
    position: { x: -1, y: -0.5, z: -3.5 },
  },
];

export default function ArtifactsARScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionResponse, requestPermission] = useCameraPermissions();
  const [selectedItem, setSelectedItem] = useState<
    (typeof bugandaArtifacts)[0] | null
  >(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [arReady, setArReady] = useState(false);

  // Animation values
  const rotationValue = useRef(new Animated.Value(0)).current;
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

    // Create museum environment
    createMuseumEnvironment(scene);

    // Add cultural items
    addCulturalItems(scene);

    // Animation loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
    setArReady(true);
  };

  const createMuseumEnvironment = (scene: THREE.Scene) => {
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

    // Walls with Buganda patterns
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

    // Display pedestals with Buganda-inspired designs
    bugandaArtifacts.forEach((item) => {
      const pedestalGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
      const pedestalMaterial = new THREE.MeshStandardMaterial({
        color: 0xa0522d, // Brown color for wooden pedestals
        roughness: 0.2,
      });
      const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
      pedestal.position.set(
        item.position.x,
        item.position.y - 0.5,
        item.position.z
      );
      scene.add(pedestal);
    });
  };

  const addCulturalItems = (scene: THREE.Scene) => {
    // Create Buganda artifacts
    bugandaArtifacts.forEach((item) => {
      let geometry;
      let material;

      // Create different geometries based on the item
      switch (item.id) {
        case "1": // Royal Drums
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown
            roughness: 0.7,
          });
          break;
        case "2": // Kabaka's Spears
          geometry = new THREE.CylinderGeometry(0.03, 0.01, 0.8, 12);
          material = new THREE.MeshStandardMaterial({
            color: 0xcd853f, // Peru brown
            roughness: 0.5,
            metalness: 0.5,
          });
          break;
        case "3": // Royal Stool
          geometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 16);
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown
            roughness: 0.8,
          });
          break;
        case "4": // Barkcloth
          geometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Saddle brown with reddish tint
            roughness: 0.9,
          });
          break;
        case "5": // Royal Regalia
          geometry = new THREE.SphereGeometry(0.2, 32, 32);
          material = new THREE.MeshStandardMaterial({
            color: 0xffd700, // Gold
            roughness: 0.1,
            metalness: 0.9,
          });
          break;
        default:
          geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
          material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(item.position.x, item.position.y, item.position.z);

      // Add a name to the mesh for raycasting/selection
      mesh.name = item.id;

      scene.add(mesh);
    });
  };

  const handleItemSelect = (itemId: string) => {
    const item = bugandaArtifacts.find((item) => item.id === itemId);
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
        <ActivityIndicator size="large" color="#8B4513" />
        <Text className="mt-4 text-base text-gray-800 font-['System']">
          Loading Buganda Artifacts...
        </Text>
      </View>
    );
  }

  // Calculate rotation for 3D object preview
  const spin = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Calculate bounce for markers
  const bounce = bounceValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <CameraView className="flex-1" facing="back">
          <GLView className="flex-1" onContextCreate={onContextCreate} />

          {!arReady && (
            <View className="absolute inset-0 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-4 text-base text-white font-['System'] text-center px-5">
                Setting up your Buganda artifacts experience...
              </Text>
            </View>
          )}

          {/* AR UI Overlay */}
          <View className="absolute inset-0 justify-between">
            <View className="flex-row justify-between items-center p-4 bg-amber-800/70">
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-white font-['System']">
                Buganda Artifacts
              </Text>
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => setInfoModalVisible(true)}
              >
                <Info size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Item Markers - In a real app, these would be positioned based on AR tracking */}
            <View className="flex-1 relative">
              {bugandaArtifacts.map((item) => (
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
                    <View className="w-3 h-3 rounded-full bg-amber-800 border-2 border-white" />
                    <Text className="mt-1 text-white text-xs font-bold text-center bg-amber-800/70 px-2 py-0.5 rounded-2.5 overflow-hidden font-['System']">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View className="p-4 bg-amber-800/70 items-center">
              <Text className="text-white text-sm font-['System']">
                Tap on artifacts to learn about Buganda culture
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
              <Text className="text-2xl font-bold text-amber-800 font-['System']">
                {selectedItem ? selectedItem.name : "Buganda Artifact"}
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
                      <Text className="text-6xl font-bold text-amber-800 font-['System']">
                        {selectedItem.name.charAt(0)}
                      </Text>
                    </Animated.View>
                    <TouchableOpacity className="flex-row items-center p-2">
                      <RotateCcw size={20} color="#8B4513" />
                      <Text className="ml-1 text-amber-800 text-sm font-['System']">
                        Rotate
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="px-2.5">
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

                    <View className="bg-amber-50 p-4 rounded-2.5 mb-5 border-l-1 border-l-amber-800">
                      <Text className="text-lg font-bold text-amber-800 mb-2 font-['System']">
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
              className="bg-amber-800 py-3.5 rounded-2 items-center"
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

// const { width, height } = Dimensions.get("window");

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#333",
//     fontFamily: "System",
//   },
//   arContainer: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   glView: {
//     flex: 1,
//   },
//   arLoadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.7)",
//   },
//   arLoadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#fff",
//     fontFamily: "System",
//     textAlign: "center",
//     paddingHorizontal: 20,
//   },
//   arOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "space-between",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     backgroundColor: "rgba(139, 69, 19, 0.7)", // Brown with opacity
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     fontFamily: "System",
//   },
//   infoButton: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   markersContainer: {
//     flex: 1,
//     position: "relative",
//   },
//   marker: {
//     position: "absolute",
//     alignItems: "center",
//     justifyContent: "center",
//     width: 120,
//     height: 60,
//   },
//   markerTouchable: {
//     alignItems: "center",
//   },
//   markerDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#8B4513",
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   markerLabel: {
//     marginTop: 4,
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//     textAlign: "center",
//     backgroundColor: "rgba(139, 69, 19, 0.7)",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//     overflow: "hidden",
//     fontFamily: "System",
//   },
//   footer: {
//     padding: 16,
//     backgroundColor: "rgba(139, 69, 19, 0.7)",
//     alignItems: "center",
//   },
//   footerText: {
//     color: "#fff",
//     fontSize: 14,
//     fontFamily: "System",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: height * 0.7,
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#8B4513",
//     fontFamily: "System",
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//   },
//   modalScrollView: {
//     flex: 1,
//   },
//   itemImageContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   itemImagePlaceholder: {
//     width: 200,
//     height: 200,
//     borderRadius: 10,
//     backgroundColor: "#f0f0f0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   itemImagePlaceholderText: {
//     fontSize: 72,
//     fontWeight: "bold",
//     color: "#8B4513",
//     fontFamily: "System",
//   },
//   rotateButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 8,
//   },
//   rotateText: {
//     marginLeft: 5,
//     color: "#8B4513",
//     fontSize: 14,
//     fontFamily: "System",
//   },
//   itemDetails: {
//     paddingHorizontal: 10,
//   },
//   itemDetail: {
//     flexDirection: "row",
//     marginBottom: 10,
//   },
//   itemDetailLabel: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     width: 100,
//     fontFamily: "System",
//   },
//   itemDetailValue: {
//     fontSize: 16,
//     color: "#666",
//     flex: 1,
//     fontFamily: "System",
//   },
//   itemDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: "#333",
//     marginBottom: 20,
//     fontFamily: "System",
//   },
//   funFactContainer: {
//     backgroundColor: "#FFF8DC", // Cornsilk color
//     padding: 16,
//     borderRadius: 10,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: "#8B4513",
//   },
//   funFactTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#8B4513",
//     marginBottom: 8,
//     fontFamily: "System",
//   },
//   funFactText: {
//     fontSize: 16,
//     color: "#333",
//     fontFamily: "System",
//   },
//   closeModalButton: {
//     backgroundColor: "#8B4513",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   closeModalButtonText: {
//     fontFamily: "System",
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
