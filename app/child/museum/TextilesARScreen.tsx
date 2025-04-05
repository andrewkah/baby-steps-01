"use client";

import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera, CameraView } from "expo-camera";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import type { ExpoWebGLRenderingContext } from "expo-gl";
import { ArrowLeft, Info, X } from "lucide-react-native";

// Buganda textiles data
const bugandaTextiles = [
  {
    id: "1",
    name: "Barkcloth (Olubugo)",
    material: "Mutuba Tree Bark",
    period: "Ancient to Present",
    description:
      "Barkcloth is made from the inner bark of the Mutuba tree (Ficus natalensis). It's beaten with mallets to create a soft, cloth-like material. Traditionally, it was the main clothing material before cotton was introduced.",
    funFact:
      "Did you know? Barkcloth making in Uganda was recognized by UNESCO as an Intangible Cultural Heritage of Humanity in 2008!",
    position: { x: 0, y: 0, z: -3 },
  },
  {
    id: "2",
    name: "Royal Garments (Kanzu)",
    material: "Cotton, Silk",
    period: "19th Century to Present",
    description:
      'The Kanzu is a long white robe worn by men in Buganda, especially during formal occasions. The royal version features intricate embroidery and is often paired with a matching jacket called a "kooti."',
    funFact:
      "Did you know? The Kabaka (king) of Buganda wears a special Kanzu with unique patterns that symbolize his royal status!",
    position: { x: -1.5, y: 0.5, z: -2.5 },
  },
  {
    id: "3",
    name: "Gomesi (Traditional Dress)",
    material: "Cotton, Silk, Satin",
    period: "1900s to Present",
    description:
      "The Gomesi is a colorful floor-length dress that is the traditional attire for women in Buganda. It features a square neckline, puffed sleeves, and a sash tied around the waist.",
    funFact:
      "Did you know? The Gomesi was named after Gomes Oryema, a Goan tailor who designed the first version of this dress in the early 1900s!",
    position: { x: 1.5, y: 0, z: -2.5 },
  },
  {
    id: "4",
    name: "Embroidered Textiles",
    material: "Various Fabrics",
    period: "Traditional to Present",
    description:
      "Embroidery is an important decorative technique in Buganda textiles. Patterns often include geometric designs, royal symbols, and natural motifs that tell stories about Buganda culture and history.",
    funFact:
      "Did you know? Certain embroidery patterns were reserved exclusively for royal family members and could not be worn by common people!",
    position: { x: 0, y: 1, z: -2 },
  },
  {
    id: "5",
    name: "Beaded Textiles",
    material: "Fabric, Beads",
    period: "Traditional to Present",
    description:
      "Beadwork is used to decorate ceremonial garments and accessories in Buganda culture. Different bead colors and patterns have specific meanings and are used to indicate social status.",
    funFact:
      "Did you know? The colors of beads in traditional Buganda textiles often have symbolic meanings - red for blood/sacrifice, blue for sky/heaven, and white for purity!",
    position: { x: -1, y: -0.5, z: -3.5 },
  },
];

export default function TextilesARScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedItem, setSelectedItem] = useState<
    (typeof bugandaTextiles)[0] | null
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
        Animated.timing(scaleValue, {
          toValue: 1,
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
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Start animations
      startRotationAnimation();
      startPulseAnimation();
      startBounceAnimation();

      setLoading(false);
    })();
  }, []);

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

    // Create textile display environment
    createTextileDisplayEnvironment(scene);

    // Add textile items
    addTextileItems(scene);

    // Animation loop
    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
    setArReady(true);
  };

  const createTextileDisplayEnvironment = (scene: THREE.Scene) => {
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

    // Walls for textile display
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

    // Display stands for textiles
    bugandaTextiles.forEach((item) => {
      // Create display stands or mannequins for textiles
      if (item.id === "1" || item.id === "4" || item.id === "5") {
        // Flat display for barkcloth, embroidery, and beaded textiles
        const standGeometry = new THREE.BoxGeometry(1, 0.1, 1);
        const standMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Brown
          roughness: 0.5,
        });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(
          item.position.x,
          item.position.y - 0.5,
          item.position.z
        );
        scene.add(stand);
      } else {
        // Mannequin-like display for garments
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Brown
          roughness: 0.5,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(
          item.position.x,
          item.position.y - 0.95,
          item.position.z
        );
        scene.add(base);

        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Brown
          roughness: 0.5,
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(item.position.x, item.position.y, item.position.z);
        scene.add(pole);
      }
    });
  };

  const addTextileItems = (scene: THREE.Scene) => {
    // Create Buganda textile items
    bugandaTextiles.forEach((item) => {
      let geometry;
      let material;

      // Create different geometries based on the textile
      switch (item.id) {
        case "1": // Barkcloth
          geometry = new THREE.PlaneGeometry(0.8, 0.8);
          material = new THREE.MeshStandardMaterial({
            color: 0x8b4513, // Brown
            roughness: 0.9,
            side: THREE.DoubleSide,
          });
          break;
        case "2": // Royal Garments (Kanzu)
          geometry = new THREE.CylinderGeometry(0.25, 0.4, 1.2, 16, 1, true);
          material = new THREE.MeshStandardMaterial({
            color: 0xfffafa, // Snow white
            roughness: 0.5,
            side: THREE.DoubleSide,
          });
          break;
        case "3": // Gomesi
          geometry = new THREE.CylinderGeometry(0.3, 0.6, 1.2, 16, 1, true);
          material = new THREE.MeshStandardMaterial({
            color: 0xe6e6fa, // Lavender
            roughness: 0.5,
            side: THREE.DoubleSide,
          });
          break;
        case "4": // Embroidered Textiles
          geometry = new THREE.PlaneGeometry(0.7, 0.7);
          material = new THREE.MeshStandardMaterial({
            color: 0xf5deb3, // Wheat
            roughness: 0.7,
            side: THREE.DoubleSide,
          });
          break;
        case "5": // Beaded Textiles
          geometry = new THREE.PlaneGeometry(0.6, 0.6);
          material = new THREE.MeshStandardMaterial({
            color: 0xffb6c1, // Light pink
            roughness: 0.6,
            side: THREE.DoubleSide,
          });
          break;
        default:
          geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
          material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      }

      const mesh = new THREE.Mesh(geometry, material);

      // Position the textile items
      if (item.id === "1" || item.id === "4" || item.id === "5") {
        // Flat textiles on display
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(
          item.position.x,
          item.position.y - 0.4,
          item.position.z
        );
      } else {
        // Garments on mannequins
        mesh.position.set(item.position.x, item.position.y, item.position.z);
      }

      // Add a name to the mesh for raycasting/selection
      mesh.name = item.id;

      scene.add(mesh);
    });
  };

  const handleItemSelect = (itemId: string) => {
    const item = bugandaTextiles.find((item) => item.id === itemId);
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
        <ActivityIndicator size="large" color="#9932CC" />
        <Text className="mt-4 text-base text-gray-800 font-['System']">
          Loading Buganda Textiles...
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

  const getTextileColor = (id: string) => {
    switch (id) {
      case "1":
        return "#8B4513"; // Brown for barkcloth
      case "2":
        return "#FFFAFA"; // Snow white for Kanzu
      case "3":
        return "#E6E6FA"; // Lavender for Gomesi
      case "4":
        return "#F5DEB3"; // Wheat for embroidered textiles
      case "5":
        return "#FFB6C1"; // Light pink for beaded textiles
      default:
        return "#FFFFFF";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <CameraView className="flex-1" facing="back">
          <GLView className="flex-1" onContextCreate={onContextCreate} />

          {!arReady && (
            <View className="absolute inset-0 justify-center items-center bg-black/70">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="mt-4 text-base text-white font-['System'] text-center px-5">
                Setting up your Buganda textiles experience...
              </Text>
            </View>
          )}

          {/* AR UI Overlay */}
          <View className="absolute inset-0 justify-between">
            <View className="flex-row justify-between items-center p-4 bg-purple-700/70">
              <TouchableOpacity
                className="w-10 h-10 justify-center items-center rounded-full bg-black/50"
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-white font-['System']">
                Buganda Textiles
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
              {bugandaTextiles.map((item) => (
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
                      className="w-3 h-3 rounded-full bg-purple-700 border-2 border-white"
                      style={{ transform: [{ scale }] }}
                    />
                    <Text className="mt-1 text-white text-xs font-bold text-center bg-purple-700/70 px-2 py-0.5 rounded-2.5 overflow-hidden font-['System']">
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View className="p-4 bg-purple-700/70 items-center">
              <Text className="text-white text-sm font-['System']">
                Tap on textiles to learn about Buganda clothing and fabrics
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
              <Text className="text-2xl font-bold text-purple-700 font-['System']">
                {selectedItem ? selectedItem.name : "Buganda Textile"}
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
                        backgroundColor: getTextileColor(selectedItem.id),
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
                        Material:
                      </Text>
                      <Text className="text-base text-gray-600 flex-1 font-['System']">
                        {selectedItem.material}
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

                    <View className="bg-purple-50 p-4 rounded-2.5 mb-5 border-l-1 border-l-purple-700">
                      <Text className="text-lg font-bold text-purple-700 mb-2 font-['System']">
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
              className="bg-purple-700 py-3.5 rounded-2 items-center"
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
