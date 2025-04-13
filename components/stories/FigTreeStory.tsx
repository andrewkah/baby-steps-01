import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, Animated, Modal, ScrollView } from 'react-native';
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

interface StoryQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
}

const FigTreeStory: React.FC = () => {
  const router = useRouter();
  // Story content - The Tale of Kintu (Ugandan folklore)
  const coinImage = require('@/assets/images/coin.png'); // Placeholder for coin image
  const storyPages: StoryPage[] = [
    {
      text: "In a small village in Buganda, there grew a magnificent Mutuba fig tree. Its branches stretched wide, providing shade for everyone in the village.",
      image: coinImage,
      altText: "A large fig tree providing shade to villagers"
    },
    {
      text: "The tree was not just any tree—it produced the bark cloth that was precious to the Baganda people. This cloth was used for ceremonial robes, bedding, and even burial shrouds.",
      image: coinImage,
      altText: "People making bark cloth from the fig tree"
    },
    {
      text: "A poor woman named Nakawala lived near the tree. Each day, the tree would drop a single fig at her doorstep, which she would eat to survive.",
      image: coinImage,
      altText: "A woman picking up a fig from her doorstep"
    },
    {
      text: "The village chief noticed how healthy Nakawala looked despite her poverty. He became curious and decided to watch her house to discover her secret.",
      image: coinImage,
      altText: "The chief watching the woman's house from a distance"
    },
    {
      text: "When he saw the fig tree drop its fruit for Nakawala, he became greedy. 'If one fig makes her so healthy, what would happen if I ate all the figs?' he thought.",
      image: coinImage,
      altText: "The chief looking greedily at the fig tree"
    },
    {
      text: "The chief ordered his men to collect every fig from the tree, leaving none for Nakawala or the birds and animals that depended on it. They took baskets full of figs to his home.",
      image: coinImage,
      altText: "Men collecting all the figs from the tree in baskets"
    },
    {
      text: "That night, a terrible storm came. Lightning struck the chief's house, destroying only the room where the figs were stored. The next morning, the fig tree had disappeared completely.",
      image: coinImage,
      altText: "Lightning striking the chief's house during a storm"
    },
    {
      text: "But a new sapling appeared at Nakawala's doorstep. The tree had chosen to move where it was appreciated. The Baganda learned that generosity should be met with gratitude, not greed.",
      image: coinImage,
      altText: "A small fig tree sapling growing at the woman's doorstep"
    },
  ];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [pageSound, setPageSound] = useState<Audio.Sound | null>(null);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [readingSpeed, setReadingSpeed] = useState<number>(0.8); // Default speed
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [showQuestions, setShowQuestions] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<number[]>(Array(5).fill(-1));
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const storyQuestions: StoryQuestion[] = [
    {
      question: "What was special about the Mutuba fig tree?",
      options: ["It could talk", "It produced bark cloth precious to the Baganda", "It had golden leaves", "It never lost its leaves in dry season"],
      correctAnswer: 1
    },
    {
      question: "How did the fig tree help Nakawala?",
      options: ["By telling her stories", "By dropping a single fig at her doorstep each day", "By providing shade for her house", "By healing her illnesses"],
      correctAnswer: 1
    },
    {
      question: "Why did the village chief become interested in Nakawala?",
      options: ["He wanted to marry her", "He noticed how healthy she looked despite her poverty", "He wanted her land", "He thought she was stealing from others"],
      correctAnswer: 1
    },
    {
      question: "What did the chief do when he discovered the fig tree's gift?",
      options: ["He thanked the tree", "He ordered his men to collect every fig from the tree", "He shared the figs with everyone", "He planted more fig trees"],
      correctAnswer: 1
    },
    {
      question: "What lesson does this story teach?",
      options: ["Trees are more valuable than gold", "Generosity should be met with gratitude, not greed", "Chiefs always know best", "Poor people are often the wisest"],
      correctAnswer: 1
    }
  ];

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

  const handleAnswerSelection = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    storyQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setQuizCompleted(true);
  };

  const handleRestartQuiz = () => {
    setUserAnswers(Array(storyQuestions.length).fill(-1));
    setQuizCompleted(false);
    setScore(0);
  };

  return (
    <View style={styles.container}>
      {!showQuestions ? (
        // Show original story UI
        <View style={styles.contentContainer}>
          {/* Back Button - keep existing code */}
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

          {/* Left Panel: Story Image - keep existing code */}
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <Image 
              source={storyPages[currentPage].image} 
              style={styles.storyImage}
              resizeMode="contain"
              accessibilityLabel={storyPages[currentPage].altText}
            />
          </Animated.View>
          
          {/* Right Panel: Text and Controls - keep existing code */}
          <View style={styles.rightPanel}>
            {/* Settings button - keep existing code */}
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
            
            {/* Story Text - keep existing code */}
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
              
              {currentPage === storyPages.length - 1 ? (
                <TouchableOpacity 
                  style={[styles.readButton, { backgroundColor: '#6495ED' }]}
                  onPress={() => setShowQuestions(true)}
                  accessibilityLabel="Take the quiz"
                  accessibilityRole="button"
                >
                  <Text style={styles.readButtonText}>Take Quiz</Text>
                </TouchableOpacity>
              ) : (
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
              )}
              
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
            
            {/* Page indicator - keep existing code */}
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
      ) : (
        // Updated Quiz UI with ScrollView
        <View style={styles.questionsContainer}>
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
            onPress={() => {
              setShowQuestions(false);
              if (quizCompleted) {
                setQuizCompleted(false);
                setUserAnswers(Array(storyQuestions.length).fill(-1));
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#7b5af0" />
          </TouchableOpacity>

          <View style={styles.quizContent}>
            <Text style={styles.quizTitle}>
              {quizCompleted ? `Your Score: ${score}/${storyQuestions.length}` : "The Tale of Kintu - Quiz"}
            </Text>
            
            <ScrollView 
              style={styles.questionsScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.questionsScrollContent}
            >
              {!quizCompleted ? (
                <>
                  {storyQuestions.map((question, qIndex) => (
                    <View key={qIndex} style={styles.questionContainer}>
                      <Text style={styles.questionText}>{qIndex + 1}. {question.question}</Text>
                      
                      {question.options.map((option, oIndex) => (
                        <TouchableOpacity
                          key={oIndex}
                          style={[
                            styles.optionButton,
                            userAnswers[qIndex] === oIndex && styles.selectedOption
                          ]}
                          onPress={() => handleAnswerSelection(qIndex, oIndex)}
                        >
                          <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </>
              ) : (
                // Results view
                <View style={styles.resultsContainer}>
                  {storyQuestions.map((question, qIndex) => (
                    <View key={qIndex} style={styles.resultQuestionContainer}>
                      <Text style={styles.questionText}>{qIndex + 1}. {question.question}</Text>
                      
                      {question.options.map((option, oIndex) => (
                        <View
                          key={oIndex}
                          style={[
                            styles.resultOption,
                            oIndex === question.correctAnswer && styles.correctOption,
                            userAnswers[qIndex] === oIndex && userAnswers[qIndex] !== question.correctAnswer && styles.incorrectOption
                          ]}
                        >
                          <Text style={styles.resultOptionText}>{option}</Text>
                          {oIndex === question.correctAnswer && <Text style={styles.correctMark}>✓</Text>}
                          {userAnswers[qIndex] === oIndex && userAnswers[qIndex] !== question.correctAnswer && <Text style={styles.incorrectMark}>✗</Text>}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            
            {/* Submit or Try Again button outside ScrollView */}
            {!quizCompleted ? (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  userAnswers.includes(-1) && styles.disabledButton
                ]}
                onPress={handleQuizSubmit}
                disabled={userAnswers.includes(-1)}
              >
                <Text style={styles.submitButtonText}>Submit Answers</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { marginTop: 20 }]}
                onPress={handleRestartQuiz}
              >
                <Text style={styles.submitButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Settings Modal - keep existing code */}
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
  questionsContainer: {
    flex: 1,
    backgroundColor: '#F5E9BE',
    padding: 20,
  },
  quizContent: {
    backgroundColor: 'white',
    marginTop: 50,
    padding: 20,
    borderRadius: 20,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7b5af0',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#bbd6ff',
  },
  optionText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF6B95',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultQuestionContainer: {
    marginBottom: 20,
  },
  resultOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
  },
  correctOption: {
    backgroundColor: '#d4edda',
  },
  incorrectOption: {
    backgroundColor: '#f8d7da',
  },
  resultOptionText: {
    fontSize: 16,
  },
  correctMark: {
    color: 'green',
    fontWeight: 'bold',
  },
  incorrectMark: {
    color: 'red',
    fontWeight: 'bold',
  },
  questionsScrollView: {
    flex: 1,
    marginBottom: 10,
  },
  questionsScrollContent: {
    paddingBottom: 10,
  },
});

export default FigTreeStory;