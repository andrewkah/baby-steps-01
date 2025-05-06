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
const TILE_MARGIN = 2; // This margin seems to be applied visually by spacing animated views

// Define TypeScript interfaces
interface Position {
  row: number;
  col: number;
}

// Stores static data for each tile (ID, correct pos, image crop)
interface TileStaticData {
  id: number;
  correctPosition: Position; // The solved position for this tile ID
  imageX: number; // Crop X for the full image
  imageY: number; // Crop Y for the full image
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

// Helper to generate tile static data
const generateTileStaticData = (): Record<number, TileStaticData> => {
  const data: Record<number, TileStaticData> = {};
  for (let i = 0; i < GRID_SIZE * GRID_SIZE - 1; i++) {
    const id = i + 1;
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    data[id] = {
      id,
      correctPosition: { row, col },
      imageX: col * TILE_SIZE,
      imageY: row * TILE_SIZE,
    };
  }
  return data;
};

const BugandaPuzzleGame: React.FC = () => {
  const router = useRouter();

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
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [emptySlotPosition, setEmptySlotPosition] = useState<Position>({ row: GRID_SIZE -1, col: GRID_SIZE -1 });
  const [tileStaticData, _setTileStaticData] = useState<Record<number, TileStaticData>>(generateTileStaticData());
  
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
    const loadSounds = async () => {
      const tileMoveSound = new Audio.Sound();
      const successSound = new Audio.Sound();
      try {
        await tileMoveSound.loadAsync(require("../../assets/audio/page-turn.mp3"));
        await successSound.loadAsync(require("../../assets/audio/complete.mp3"));
        setSoundEffects({ tileMove: tileMoveSound, success: successSound });
      } catch (error) {
        console.error("Failed to load sounds", error);
      }
    };
    loadSounds();
    return () => {
      soundEffects.tileMove?.unloadAsync();
      soundEffects.success?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (showPreview) {
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
  }, [showPreview, currentPuzzle]); // Added currentPuzzle to re-init on puzzle change

  const initializePuzzle = (): void => {
    // 1. Create solved grid
    const solvedGrid: (number | null)[][] = [];
    let tileCounter = 1;
    for (let r = 0; r < GRID_SIZE; r++) {
      solvedGrid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (r === GRID_SIZE - 1 && c === GRID_SIZE - 1) {
          solvedGrid[r][c] = null; // Last slot is empty
        } else {
          solvedGrid[r][c] = tileCounter++;
        }
      }
    }
    
    let currentShuffledGrid = solvedGrid.map(row => [...row]);
    let currentEmptySlot = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

    // 2. Shuffle by making random valid moves
    const shuffleMoveCount = 100 + Math.floor(Math.random() * 50); // Ensure enough shuffles
    for (let i = 0; i < shuffleMoveCount; i++) {
      const movableTilesPositions: Position[] = [];
      const { row: er, col: ec } = currentEmptySlot;

      if (er > 0) movableTilesPositions.push({ row: er - 1, col: ec }); // Tile above empty
      if (er < GRID_SIZE - 1) movableTilesPositions.push({ row: er + 1, col: ec }); // Tile below empty
      if (ec > 0) movableTilesPositions.push({ row: er, col: ec - 1 }); // Tile left of empty
      if (ec < GRID_SIZE - 1) movableTilesPositions.push({ row: er, col: ec + 1 }); // Tile right of empty
      
      if (movableTilesPositions.length > 0) {
        const randomMoveIndex = Math.floor(Math.random() * movableTilesPositions.length);
        const tileToMoveOriginalPos = movableTilesPositions[randomMoveIndex];
        
        // Swap tile with empty slot in currentShuffledGrid
        currentShuffledGrid[currentEmptySlot.row][currentEmptySlot.col] = currentShuffledGrid[tileToMoveOriginalPos.row][tileToMoveOriginalPos.col];
        currentShuffledGrid[tileToMoveOriginalPos.row][tileToMoveOriginalPos.col] = null;
        
        // Update currentEmptySlot to the position where the tile was
        currentEmptySlot = { ...tileToMoveOriginalPos };
      }
    }

    setGrid(currentShuffledGrid);
    setEmptySlotPosition(currentEmptySlot);

    // 3. Initialize animated positions for tiles based on the shuffled grid
    const newAnimatedPositions: Record<number, AnimatedPosition> = {};
    currentShuffledGrid.forEach((rowItems, r) => {
      rowItems.forEach((tileId, c) => {
        if (tileId !== null) {
          newAnimatedPositions[tileId] = {
            left: new Animated.Value(c * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING),
            top: new Animated.Value(r * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING),
          };
        }
      });
    });
    setAnimatedPositions(newAnimatedPositions);

    setGameStarted(true);
    setMoves(0);
    setIsComplete(false);
    successAnim.setValue(0); // Reset success animation
  };
  
  const moveTile = (tileId: number): void => {
    if (isComplete || !grid.length) return;

    let tilePos: Position | null = null;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === tileId) {
          tilePos = { row: r, col: c };
          break;
        }
      }
      if (tilePos) break;
    }

    if (!tilePos) {
      console.error(`Tile ${tileId} not found in grid.`);
      return;
    }

    const { row: tr, col: tc } = tilePos;
    const { row: er, col: ec } = emptySlotPosition;

    // Check if the tile is adjacent to the empty slot
    const isAdjacent = Math.abs(tr - er) + Math.abs(tc - ec) === 1;

    if (isAdjacent) {
      soundEffects.tileMove?.replayAsync();

      const newLeft = ec * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      const newTop = er * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;

      const newGrid = grid.map(r_ => [...r_]); // Deep copy grid
      newGrid[er][ec] = tileId;       // Move tile to empty slot's old position
      newGrid[tr][tc] = null;         // Tile's old position becomes empty

      Animated.parallel([
        Animated.timing(animatedPositions[tileId].left, {
          toValue: newLeft,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(animatedPositions[tileId].top, {
          toValue: newTop,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setGrid(newGrid); // Update grid state after animation
          setEmptySlotPosition({ row: tr, col: tc }); // Update empty slot to tile's old position
          checkPuzzleCompletion(newGrid); // Pass the new grid for completion check
        }
      });
      setMoves(m => m + 1);
    }
  };

  const checkPuzzleCompletion = (currentGridToCheck: (number | null)[][]): void => {
    let completed = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tileIdInGrid = currentGridToCheck[r][c];
        if (r === GRID_SIZE - 1 && c === GRID_SIZE - 1) { // Last slot should be empty
          if (tileIdInGrid !== null) {
            completed = false;
            break;
          }
        } else {
          const expectedTileId = r * GRID_SIZE + c + 1;
          if (tileIdInGrid !== expectedTileId) {
            completed = false;
            break;
          }
        }
      }
      if (!completed) break;
    }

    if (completed) {
      setIsComplete(true);
      soundEffects.success?.replayAsync();
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Alert.alert(
          "Congratulations!",
          `You completed the ${puzzleImages[currentPuzzle].name} puzzle in ${moves + 1} moves!`, // moves+1 because setMoves is async
          [
            {
              text: "Next Puzzle",
              onPress: () => {
                setCurrentPuzzle((prev) => (prev + 1) % puzzleImages.length);
                setShowPreview(true);
                previewAnim.setValue(1);
              },
            },
          ]
        );
      }, 1000);
    }
  };

  const createTilePanResponder = (tileId: number, tileRow: number, tileCol: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isComplete,
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        return !isComplete && (Math.abs(dx) > 10 || Math.abs(dy) > 10);
      },
      onPanResponderRelease: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        const { row: emptyRow, col: emptyCol } = emptySlotPosition;

        let canSwipeMove = false;
        if (Math.abs(dx) > Math.abs(dy)) { // Horizontal swipe
          if (dx > 0 && tileRow === emptyRow && tileCol + 1 === emptyCol) { // Swipe Right towards empty
            canSwipeMove = true;
          } else if (dx < 0 && tileRow === emptyRow && tileCol - 1 === emptyCol) { // Swipe Left towards empty
            canSwipeMove = true;
          }
        } else { // Vertical swipe
          if (dy > 0 && tileCol === emptyCol && tileRow + 1 === emptyRow) { // Swipe Down towards empty
            canSwipeMove = true;
          } else if (dy < 0 && tileCol === emptyCol && tileRow - 1 === emptyRow) { // Swipe Up towards empty
            canSwipeMove = true;
          }
        }

        if (canSwipeMove) {
          moveTile(tileId);
        }
      },
    });
  };

  const renderPuzzleTiles = () => {
    if (showPreview || !grid.length || Object.keys(animatedPositions).length === 0) {
        return null;
    }

    return grid.flatMap((rowItems, r) =>
      rowItems.map((tileId, c) => {
        if (tileId === null) return null; // Don't render for the empty slot

        const staticInfo = tileStaticData[tileId];
        if (!staticInfo) {
          console.warn(`Static data not found for tile ${tileId}`);
          return null;
        }

        const animPos = animatedPositions[tileId];
        if (!animPos) {
          // console.warn(`Animated position not found for tile ${tileId}`);
          return null; // Can happen briefly during init
        }

        const panResponder = createTilePanResponder(tileId, r, c);
        const isTileAdjacentToEmpty = Math.abs(r - emptySlotPosition.row) + Math.abs(c - emptySlotPosition.col) === 1;

        return (
          <Animated.View
            key={tileId}
            className={`absolute rounded-md overflow-hidden justify-center items-center border border-purple-700`}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: animPos.left,
              top: animPos.top,
              zIndex: 1,
            }}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity
              className="w-full h-full justify-center items-center"
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              onPress={() => {
                moveTile(tileId);
              }}
              activeOpacity={0.6}
              accessible={true}
              accessibilityLabel={`Tile ${tileId}`}
              accessibilityHint={
                isTileAdjacentToEmpty
                  ? "Double tap to move this tile or swipe it toward the empty space"
                  : "This tile cannot be moved"
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: !isTileAdjacentToEmpty }}
            >
              <Image
                source={puzzleImages[currentPuzzle].source}
                className="absolute"
                style={{
                  width: PUZZLE_CONTAINER_SIZE - PUZZLE_PADDING * 2,
                  height: PUZZLE_CONTAINER_SIZE - PUZZLE_PADDING * 2,
                  top: -staticInfo.imageY,
                  left: -staticInfo.imageX,
                }}
                accessible={false}
              />
              <View
                className={`absolute bottom-[5px] right-[5px] bg-white/70 rounded-full w-5 h-5 justify-center items-center`}
              >
                <Text variant="bold" className="text-xs text-purple-800">
                  {tileId}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })
    );
  };

  return (
    <View className="flex-1 bg-indigo-50">
      <StatusBar style="dark" />

      <TouchableOpacity
        className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-md border-2 border-primary-200 mx-6 mt-6"
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#7b5af0" />
      </TouchableOpacity>

      <View className="flex-1 flex-row p-2.5">
        <View className="flex-1 justify-center items-center px-2.5">
          <View
            className="bg-purple-100 rounded-lg overflow-hidden relative border-2 border-purple-400"
            style={{
              width: PUZZLE_CONTAINER_SIZE,
              height: PUZZLE_CONTAINER_SIZE,
            }}
          >
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

            {renderPuzzleTiles()}

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
              pointerEvents={isComplete ? "auto" : "none"}
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
                onPress={initializePuzzle} // Reset calls initializePuzzle
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