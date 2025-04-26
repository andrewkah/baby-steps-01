import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  ImageSourcePropType,
} from "react-native";
import {
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "@/components/StyledText";

// Get dimensions for landscape mode
const { width, height } = Dimensions.get("window");
// Use the smaller dimension for the puzzle size to ensure it fits in landscape
const PUZZLE_CONTAINER_SIZE = Math.min(height - 120, width / 2);
const GRID_SIZE = 3; // 3x3 puzzle
const PUZZLE_PADDING = 20;
const TILE_SIZE = (PUZZLE_CONTAINER_SIZE - PUZZLE_PADDING * 2) / GRID_SIZE;
const TILE_MARGIN = 2;

// Define TypeScript interfaces
interface Position {
  row: number;
  col: number;
}

interface Tile {
  id: number;
  correctPosition: Position;
  currentPosition: Position;
  imageX: number;
  imageY: number;
}

interface PuzzleImage {
  id: number;
  name: string;
  source: ImageSourcePropType;
  description: string;
}

interface AnimatedPosition {
  left: Animated.Value;
  top: Animated.Value;
}

interface SoundEffects {
  tileMove: Audio.Sound | null;
  success: Audio.Sound | null;
}

const BugandaPuzzleGame: React.FC = () => {
  const router = useRouter();

  // Add this debug utility function
  const isMiddlePosition = (position: Position): boolean => {
    return position.row === 1 && position.col === 1;
  };

  // Different puzzle images representing Buganda cultural elements
  const puzzleImages: PuzzleImage[] = [
    {
      id: 1,
      name: "Kasubi Tombs",
      source: require("../../assets/puzzles/kasubi-tombs.png"),
      description:
        "A UNESCO World Heritage site and burial ground of Buganda kings",
    },
    {
      id: 2,
      name: "Buganda Royal Drums",
      source: require("../../assets/puzzles/buganda-drums.png"),
      description: "Traditional royal drums used in Buganda ceremonies",
    },
    {
      id: 3,
      name: "Lubiri Palace",
      source: require("../../assets/puzzles/lubiri-palace.png"),
      description: "The palace of the Kabaka (King) of Buganda",
    },
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState<number>(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<SoundEffects>({
    tileMove: null,
    success: null,
  });
  const [animatedPositions, setAnimatedPositions] = useState<
    Record<number, AnimatedPosition>
  >({});

  const previewAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load sound effects
    const loadSounds = async () => {
      const tileMoveSound = new Audio.Sound();
      const successSound = new Audio.Sound();

      try {
        await tileMoveSound.loadAsync(
          require("../../assets/audio/page-turn.mp3")
        );
        await successSound.loadAsync(
          require("../../assets/audio/complete.mp3")
        );

        setSoundEffects({
          tileMove: tileMoveSound,
          success: successSound,
        });
      } catch (error) {
        console.error("Failed to load sounds", error);
      }
    };

    loadSounds();

    // Cleanup function
    return () => {
      if (soundEffects.tileMove) soundEffects.tileMove.unloadAsync();
      if (soundEffects.success) soundEffects.success.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (showPreview) {
      // Show the full image for 3 seconds before starting the game
      setTimeout(() => {
        Animated.timing(previewAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowPreview(false);
          initializePuzzle();
        });
      }, 3000);
    }
  }, [showPreview]);

  const initializePuzzle = (): void => {
    const newTiles: Tile[] = [];
    const newAnimatedPositions: Record<number, AnimatedPosition> = {};
    let tileCount = 0;

    // Create tiles (except for the last one which will be empty)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        tileCount++;
        if (tileCount < GRID_SIZE * GRID_SIZE) {
          // Create the tile
          newTiles.push({
            id: tileCount,
            correctPosition: { row, col },
            currentPosition: { row, col },
            imageX: col * TILE_SIZE,
            imageY: row * TILE_SIZE,
          });

          // Create animated values for this tile
          newAnimatedPositions[tileCount] = {
            left: new Animated.Value(
              col * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING
            ),
            top: new Animated.Value(
              row * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING
            ),
          };
        }
      }
    }

    // Shuffle the tiles
    const shuffledTiles = shuffleTiles([...newTiles]);

    // Update animated positions for shuffled tiles
    shuffledTiles.forEach((tile) => {
      const left =
        tile.currentPosition.col * (TILE_SIZE + TILE_MARGIN * 2) +
        PUZZLE_PADDING;
      const top =
        tile.currentPosition.row * (TILE_SIZE + TILE_MARGIN * 2) +
        PUZZLE_PADDING;

      newAnimatedPositions[tile.id].left.setValue(left);
      newAnimatedPositions[tile.id].top.setValue(top);
    });

    setTiles(shuffledTiles);
    setAnimatedPositions(newAnimatedPositions);
    setGameStarted(true);
    setMoves(0);
    setIsComplete(false);
  };

  const shuffleTiles = (tilesArray: Tile[]): Tile[] => {
    // Fisher-Yates shuffle algorithm
    for (let i = tilesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesArray[i].currentPosition, tilesArray[j].currentPosition] = [
        tilesArray[j].currentPosition,
        tilesArray[i].currentPosition,
      ];
    }

    // Ensure the puzzle is solvable
    if (!isPuzzleSolvable(tilesArray)) {
      // Swap the first two tiles to make it solvable
      [tilesArray[0].currentPosition, tilesArray[1].currentPosition] = [
        tilesArray[1].currentPosition,
        tilesArray[0].currentPosition,
      ];
    }

    return tilesArray;
  };

  const isPuzzleSolvable = (tilesArray: Tile[]): boolean => {
    // This is a simplified check - in a real game you'd need a more robust algorithm
    // For a 3x3 puzzle, counting inversions works
    let inversions = 0;
    for (let i = 0; i < tilesArray.length; i++) {
      for (let j = i + 1; j < tilesArray.length; j++) {
        if (tilesArray[i].id > tilesArray[j].id) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const getEmptyPosition = (): Position => {
    // Find the position that doesn't have a tile
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let tileFound = false;
        for (let t = 0; t < tiles.length; t++) {
          if (
            tiles[t].currentPosition.row === row &&
            tiles[t].currentPosition.col === col
          ) {
            tileFound = true;
            break;
          }
        }
        if (!tileFound) {
          return { row, col };
        }
      }
    }
    return { row: 0, col: 0 }; // Fallback (should never happen in a valid puzzle)
  };

  const canMoveTile = (
    tilePosition: Position,
    emptyPosition: Position
  ): boolean => {
    // Check if the tile is adjacent to the empty position
    const rowDiff = Math.abs(tilePosition.row - emptyPosition.row);
    const colDiff = Math.abs(tilePosition.col - emptyPosition.col);

    // Add debugging for middle position
    if (isMiddlePosition(tilePosition)) {
      console.log(
        `Middle position check: rowDiff=${rowDiff}, colDiff=${colDiff}`
      );
      console.log(
        `Can middle tile move? ${
          (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
        }`
      );
    }

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const moveTile = (tileId: number): void => {
    if (isComplete) return;

    const tileIndex = tiles.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) {
      console.log(`Tile ${tileId} not found`);
      return;
    }

    const tile = tiles[tileIndex];
    const emptyPos = getEmptyPosition();

    console.log(
      `Attempting to move tile ${tileId} from (${tile.currentPosition.row}, ${tile.currentPosition.col}) to empty space at (${emptyPos.row}, ${emptyPos.col})`
    );

    if (canMoveTile(tile.currentPosition, emptyPos)) {
      console.log(`Tile ${tileId} can move and will be moved`);

      // Special debug for middle tile
      if (tileId === 5) {
        console.log("Middle tile is moving!");
      }

      // Play sound effect
      if (soundEffects.tileMove) {
        soundEffects.tileMove.replayAsync();
      }

      // Calculate new position for animation
      const newLeft =
        emptyPos.col * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      const newTop =
        emptyPos.row * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;

      // Animate the tile movement
      Animated.parallel([
        Animated.timing(animatedPositions[tileId].left, {
          toValue: newLeft,
          duration: 150,
          useNativeDriver: false, // We need to use false for layout properties
        }),
        Animated.timing(animatedPositions[tileId].top, {
          toValue: newTop,
          duration: 150,
          useNativeDriver: false, // We need to use false for layout properties
        }),
      ]).start();

      // Update tile position in state
      const newTiles = [...tiles];
      newTiles[tileIndex] = {
        ...tile,
        currentPosition: { ...emptyPos },
      };

      setTiles(newTiles);
      setMoves(moves + 1);

      // Check if puzzle is complete
      setTimeout(() => {
        checkPuzzleCompletion(newTiles);
      }, 300);
    } else {
      console.log(`Tile ${tileId} cannot move`);
    }
  };

  const checkPuzzleCompletion = (currentTiles: Tile[]): void => {
    const isCompleted = currentTiles.every(
      (tile) =>
        tile.correctPosition.row === tile.currentPosition.row &&
        tile.correctPosition.col === tile.currentPosition.col
    );

    if (isCompleted) {
      setIsComplete(true);

      // Play success sound
      if (soundEffects.success) {
        soundEffects.success.replayAsync();
      }

      // Show success animation
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Show completion message
      setTimeout(() => {
        Alert.alert(
          "Congratulations!",
          `You completed the ${puzzleImages[currentPuzzle].name} puzzle in ${moves} moves!`,
          [
            {
              text: "Next Puzzle",
              onPress: () => {
                successAnim.setValue(0);
                setCurrentPuzzle((currentPuzzle + 1) % puzzleImages.length);
                setShowPreview(true);
                previewAnim.setValue(1);
              },
            },
          ]
        );
      }, 1000);
    }
  };

  const createTilePanResponder = (tileId: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isComplete,
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Reduce the threshold for the middle position tile to make it more responsive
        const { dx, dy } = gestureState;
        const tileIndex = tiles.findIndex((t) => t.id === tileId);
        if (
          tileIndex !== -1 &&
          isMiddlePosition(tiles[tileIndex].currentPosition)
        ) {
          console.log(`Middle tile pan detected: dx=${dx}, dy=${dy}`);
          // Use a lower threshold for the middle position
          return !isComplete && (Math.abs(dx) > 5 || Math.abs(dy) > 5);
        }

        // Regular threshold for other tiles
        return !isComplete && (Math.abs(dx) > 10 || Math.abs(dy) > 10);
      },
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        const tileIndex = tiles.findIndex((t) => t.id === tileId);
        const tile = tiles[tileIndex];
        const emptyPos = getEmptyPosition();

        // Determine swipe direction (use the dominant axis)
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (
            dx > 0 &&
            tile.currentPosition.col + 1 === emptyPos.col &&
            tile.currentPosition.row === emptyPos.row
          ) {
            // Swipe right
            moveTile(tileId);
          } else if (
            dx < 0 &&
            tile.currentPosition.col - 1 === emptyPos.col &&
            tile.currentPosition.row === emptyPos.row
          ) {
            // Swipe left
            moveTile(tileId);
          }
        } else {
          // Vertical swipe
          if (
            dy > 0 &&
            tile.currentPosition.row + 1 === emptyPos.row &&
            tile.currentPosition.col === emptyPos.col
          ) {
            // Swipe down
            moveTile(tileId);
          } else if (
            dy < 0 &&
            tile.currentPosition.row - 1 === emptyPos.row &&
            tile.currentPosition.col === emptyPos.col
          ) {
            // Swipe up
            moveTile(tileId);
          }
        }
      },
    });
  };

  const renderTile = (tile: Tile) => {
    const emptyPos = getEmptyPosition();
    const canMove = canMoveTile(tile.currentPosition, emptyPos);
    const panResponder = createTilePanResponder(tile.id);
    const isInMiddle = isMiddlePosition(tile.currentPosition);
    const animatedPos = animatedPositions[tile.id];

    if (!animatedPos) {
      console.warn(`Animated position not found for tile ${tile.id}`);
      return null;
    }

    return (
      <Animated.View
        key={tile.id}
        className={`absolute rounded-md overflow-hidden justify-center items-center ${
          isInMiddle ? "border-2 border-red-500" : "border border-purple-700"
        }`}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          left: animatedPos.left,
          top: animatedPos.top,
          zIndex: isInMiddle ? 5 : 1,
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          className={`w-full h-full justify-center items-center ${
            isInMiddle ? "bg-red-50/10" : "bg-transparent"
          }`}
          hitSlop={{
            top: isInMiddle ? 15 : 5,
            bottom: isInMiddle ? 15 : 5,
            left: isInMiddle ? 15 : 5,
            right: isInMiddle ? 15 : 5,
          }}
          onPress={() => {
            if (isInMiddle) {
              console.log(
                `🔴 MIDDLE POSITION TILE (ID: ${tile.id}) PRESSED. Can move: ${canMove}`
              );
              console.log(
                `Middle tile at position (${tile.currentPosition.row}, ${tile.currentPosition.col})`
              );
              console.log(`Empty space at (${emptyPos.row}, ${emptyPos.col})`);
            } else {
              console.log(`Tile ${tile.id} pressed. Can move: ${canMove}`);
            }
            moveTile(tile.id);
          }}
          activeOpacity={0.6}
          accessible={true}
          accessibilityLabel={`Tile ${tile.id}`}
          accessibilityHint={
            canMove
              ? "Double tap to move this tile or swipe it toward an empty space"
              : "This tile cannot be moved"
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: !canMove }}
        >
          <Image
            source={puzzleImages[currentPuzzle].source}
            className="absolute"
            style={{
              width: PUZZLE_CONTAINER_SIZE - PUZZLE_PADDING * 2,
              height: PUZZLE_CONTAINER_SIZE - PUZZLE_PADDING * 2,
              top: -tile.imageY,
              left: -tile.imageX,
            }}
            accessible={false}
          />
          <View
            className={`absolute bottom-[5px] right-[5px] ${
              isInMiddle ? "bg-white/85" : "bg-white/70"
            } rounded-full w-5 h-5 justify-center items-center`}
          >
            <Text variant="bold" className="text-xs text-purple-800">
              {tile.id}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-indigo-50">
      <StatusBar style="dark" />

      {/* Back Button */}
      <TouchableOpacity
        className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-md border-2 border-primary-200 mx-6 mt-6"
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#7b5af0" />
      </TouchableOpacity>

      {/* Main container */}
      <View className="flex-1 flex-row p-2.5">
        {/* Left side - Puzzle */}
        <View className="flex-1 justify-center items-center px-2.5">
          <View
            className="bg-purple-100 rounded-lg overflow-hidden relative border-2 border-purple-400"
            style={{
              width: PUZZLE_CONTAINER_SIZE,
              height: PUZZLE_CONTAINER_SIZE,
            }}
          >
            {/* Show full image preview */}
            {showPreview && (
              <Animated.View
                className="absolute w-full h-full justify-center items-center bg-purple-50 z-10"
                style={{ opacity: previewAnim }}
              >
                <Image
                  source={puzzleImages[currentPuzzle].source}
                  className="w-4/5 h-4/5"
                  resizeMode="contain"
                />
                <Text variant="bold" className="text-lg text-purple-700 mt-2.5">
                  Memorize the image
                </Text>
              </Animated.View>
            )}

            {/* Show puzzle tiles */}
            {!showPreview && tiles.map((tile) => renderTile(tile))}

            {/* Success animation overlay */}
            <Animated.View
              className="absolute w-full h-full justify-center items-center bg-purple-400/90 z-20"
              style={{
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.2, 1],
                    }),
                  },
                ],
              }}
            >
              <Image
                source={puzzleImages[currentPuzzle].source}
                className="w-[70%] h-[60%] rounded-lg border-3 border-white"
                resizeMode="contain"
              />
              <Text
                variant="bold"
                className="text-2xl text-white mt-5 shadow-sm"
              >
                Well done!
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Right side - Info and controls */}
        <View className="flex-1 justify-center px-5">
          <View className="w-full items-center mb-5">
            <Text variant="bold" className="text-2xl text-indigo-800 mb-2.5">
              {puzzleImages[currentPuzzle].name}
            </Text>
            {gameStarted && (
              <Text className="text-xl text-indigo-500">Moves: {moves}</Text>
            )}
          </View>

          <View className="w-full items-center my-5">
            <Text className="text-lg text-center text-slate-600 mb-6">
              {puzzleImages[currentPuzzle].description}
            </Text>

            {gameStarted && !showPreview && (
              <TouchableOpacity
                className="bg-purple-700 py-3 px-6 rounded-full shadow-md"
                onPress={initializePuzzle}
                accessible={true}
                accessibilityLabel="Reset Puzzle"
                accessibilityHint="Starts a new shuffled puzzle"
                accessibilityRole="button"
              >
                <Text variant="bold" className="text-lg text-white">
                  Reset Puzzle
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BugandaPuzzleGame;
