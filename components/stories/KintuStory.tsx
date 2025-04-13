import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface StoryPage {
  text: string;
  image: any;
  altText: string;
}

const KintuStory: React.FC = () => {
  const router = useRouter();
  // Story content - The Tale of Kintu (Ugandan folklore)
  const storyPages: StoryPage[] = [
    {
      text: "Long ago, Kintu was the first person on Earth. He lived alone with his cow, which was his only friend and source of food.",
      image: require('@/assets/story/kintu/kintu-cow.png'),
      altText: "Kintu standing beside his cow in a grassy field"
    },
    {
      text: "Gulu, the god of the sky, had many children. His daughter, Nambi, saw Kintu and fell in love with him.",
      image: require('@/assets/story/kintu/nambi.png'),
      altText: "Nambi looking at Kintu from the sky"
    },
    {
      text: "Nambi decided to marry Kintu and take him to live with her in the sky. But her father, Gulu, set difficult tests for Kintu to prove his worth.",
      image: require('@/assets/story/kintu/gulu-tests.png'),
      altText: "Gulu setting tests for Kintu"
    },
    {
      text: "First, Kintu had to eat enormous amounts of food. With help from termites who secretly ate the food, Kintu passed the test.",
      image: require('@/assets/story/kintu/kintu-food.png'),
      altText: "Kintu eating food with termites helping"
    },
    {
      text: "Then, Kintu had to find his special cow among thousands of identical cows. A bee helped him by landing on his cow's horn.",
      image: require('@/assets/story/kintu/kintu-cow-search.png'),
      altText: "Kintu finding his cow with the help of a bee"
    },
    {
      text: "After passing all tests, Gulu allowed Kintu to marry Nambi. But he warned them to leave quickly and not come back, or Death would follow them.",
      image: require('@/assets/story/kintu/kintu-nambi.png'),
      altText: "Kintu and Nambi getting married"
    },
    {
      text: "Nambi remembered she forgot to bring chicken feed. Despite Kintu's warning, she went back to get it. Death secretly followed them to Earth.",
      image: require('@/assets/story/kintu/death-follows.png'),
      altText: "Death following Kintu and Nambi to Earth"
    },
    {
      text: "Kintu and Nambi started a family on Earth. They became the ancestors of the Baganda people. But because Death followed them, people don't live forever.",
      image: require('@/assets/story/kintu/kintu-family.png'),
      altText: "Kintu and Nambi with their family"
    },
  ];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [pageSound, setPageSound] = useState<Audio.Sound | null>(null);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [readingSpeed, setReadingSpeed] = useState<number>(0.8); // Default speed
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load sounds
  useEffect(() => {
    async function loadSounds() {
      const pageTurnSound = new Audio.Sound();
      try {
        await pageTurnSound.loadAsync(require('@/assets/audio/page-turn.mp3'));
        setPageSound(pageTurnSound);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    }
    
    loadSounds();
    
    // Cleanup on unmount
    return () => {
      if (pageSound) pageSound.unloadAsync();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      Speech.stop();
    };
  }, []);

  // Split current page text into words
  const words = storyPages[currentPage].text.split(' ');

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (isReading) {
      // Stop reading if in progress
      Speech.stop();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      setIsReading(false);
      setHighlightedIndex(-1);
    }

    // Play page turn sound
    if (pageSound) {
      pageSound.replayAsync();
    }

    // Page transition animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Set new page after fade out
    setTimeout(() => {
      if (direction === 'next' && currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }, 300);
  };

  const readStory = () => {
    if (isReading) {
      // Stop reading
      Speech.stop();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      setIsReading(false);
      setHighlightedIndex(-1);
      return;
    }

    setIsReading(true);
    
    // Start reading word by word
    const readNextWord = (index: number) => {
      if (index < words.length) {
        setHighlightedIndex(index);
        
        // Read current word
        Speech.speak(words[index], {
          rate: readingSpeed,
          onDone: () => {
            // Schedule next word after a short delay
            readTimeoutRef.current = setTimeout(() => {
              readNextWord(index + 1);
            }, 200);
          }
        });
      } else {
        // Finished reading this page
        setIsReading(false);
        setHighlightedIndex(-1);
      }
    };
    
    readNextWord(0);
  };

  const getTextSize = (): number => {
    switch(textSize) {
      case 'small': return 16;
      case 'large': return 22;
      default: return 18;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Add Back Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: 8,
          borderRadius: 20,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#7b5af0" />
      </TouchableOpacity>

        {/* Left Panel: Story Image */}
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          <Image 
            source={storyPages[currentPage].image} 
            style={styles.storyImage}
            resizeMode="contain"
            accessibilityLabel={storyPages[currentPage].altText}
          />
        </Animated.View>
        
        {/* Right Panel: Text and Controls */}
        <View style={styles.rightPanel}>
          {/* Settings button */}
          <View style={styles.settingsButtonContainer}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>
          
          {/* Story Text */}
          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.storyText}>
              {words.map((word, index) => (
                <Text 
                  key={index}
                  style={[
                    styles.word,
                    { fontSize: getTextSize() },
                    index === highlightedIndex && styles.highlightedWord
                  ]}
                >
                  {word}{' '}
                </Text>
              ))}
            </Text>
          </Animated.View>
          
          {/* Navigation and Controls */}
          <View style={styles.navRow}>
            <TouchableOpacity 
              style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
              onPress={() => handlePageTurn('prev')}
              disabled={currentPage === 0}
              accessibilityLabel="Previous page"
              accessibilityRole="button"
              accessibilityState={{ disabled: currentPage === 0 }}
              accessibilityHint="Navigate to previous story page"
            >
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.readButton}
              onPress={readStory}
              accessibilityLabel={isReading ? "Stop reading" : "Read to Me"}
              accessibilityRole="button"
              accessibilityHint={isReading ? "Stop the story narration" : "Start reading the story aloud"}
            >
              <Text style={styles.readButtonText}>
                {isReading ? "Stop" : "Read to Me"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, currentPage === storyPages.length - 1 && styles.disabledButton]}
              onPress={() => handlePageTurn('next')}
              disabled={currentPage === storyPages.length - 1}
              accessibilityLabel="Next page"
              accessibilityRole="button"
              accessibilityState={{ disabled: currentPage === storyPages.length - 1 }}
              accessibilityHint="Navigate to next story page"
            >
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          
          {/* Page indicator */}
          <View style={styles.pageIndicator}>
            {storyPages.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.pageIndicatorDot,
                  index === currentPage && styles.currentPageDot
                ]} 
              />
            ))}
          </View>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Story Settings</Text>
            
            {/* Text Size Controls */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Text Size:</Text>
              <View style={styles.settingsButtonGroup}>
                <TouchableOpacity 
                  onPress={() => setTextSize('small')}
                  accessibilityLabel="Small text size"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSizeButton, textSize === 'small' && styles.activeSizeButton]}>Small</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTextSize('medium')}
                  accessibilityLabel="Medium text size"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSizeButton, textSize === 'medium' && styles.activeSizeButton]}>Medium</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTextSize('large')}
                  accessibilityLabel="Large text size"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSizeButton, textSize === 'large' && styles.activeSizeButton]}>Large</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Reading Speed Controls */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Reading Speed:</Text>
              <View style={styles.settingsButtonGroup}>
                <TouchableOpacity 
                  onPress={() => setReadingSpeed(0.5)}
                  accessibilityLabel="Slow reading speed"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSpeedButton, readingSpeed === 0.5 && styles.activeSpeedButton]}>Slow</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setReadingSpeed(0.8)}
                  accessibilityLabel="Normal reading speed"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSpeedButton, readingSpeed === 0.8 && styles.activeSpeedButton]}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setReadingSpeed(1.5)}
                  accessibilityLabel="Fast reading speed"
                  accessibilityRole="button"
                  style={styles.modalButton}
                >
                  <Text style={[styles.modalSpeedButton, readingSpeed === 1.5 && styles.activeSpeedButton]}>Fast</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSettingsVisible(false)}
              accessibilityLabel="Close settings"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9BE', // Light beige background
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row', // For landscape orientation
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButtonGroup: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  controlButton: {
    marginHorizontal: 2,
  },
  accessibilityLabel: {
    fontSize: 16,
  },
  sizeButton: {
    fontSize: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minWidth: 30,
    textAlign: 'center',
  },
  activeSizeButton: {
    backgroundColor: '#FF6B95', // Pink
    color: 'white',
  },
  speedButton: {
    fontSize: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minWidth: 50,
    textAlign: 'center',
  },
  activeSpeedButton: {
    backgroundColor: '#FF6B95', // Pink
    color: 'white',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    marginBottom: 10,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  word: {
    fontSize: 18,
    color: '#333',
  },
  highlightedWord: {
    backgroundColor: '#FFEB3B', // Yellow highlight
    fontWeight: 'bold',
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B95', // Pink
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  readButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4CAF50', // Green
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  readButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  currentPageDot: {
    backgroundColor: '#FF6B95', // Pink
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Settings button styles
  settingsButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  settingsButton: {
    backgroundColor: '#6495ED', // Cornflower blue
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  settingSection: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#444',
  },
  settingsButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalSizeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
  },
  modalSpeedButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF6B95', // Pink
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default KintuStory;