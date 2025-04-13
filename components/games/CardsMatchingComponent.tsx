import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

// Define card interface
interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
  info: string;
  imageSymbol: string;
}

// Define Buganda cultural items data
const bugandaItems = [
  { 
    value: 'Kabaka', 
    info: 'The King of Buganda, one of the most powerful traditional monarchs in Uganda.',
    imageSymbol: '👑'
  },
  { 
    value: 'Lubiri', 
    info: 'The royal palace of the Kabaka of Buganda located in Mengo, Kampala.',
    imageSymbol: '🏰'
  },
  { 
    value: 'Matoke', 
    info: 'Steamed green bananas, a staple food in Buganda cuisine.',
    imageSymbol: '🍌'
  },
  { 
    value: 'Kanzu', 
    info: 'Traditional white robe worn by Baganda men, especially during ceremonies.',
    imageSymbol: '👘'
  },
  { 
    value: 'Gomesi', 
    info: 'A colorful floor-length dress worn by Baganda women during ceremonies.',
    imageSymbol: '👗'
  },
  { 
    value: 'Engoma', 
    info: 'Traditional drums used in Kiganda music and royal ceremonies.',
    imageSymbol: '🥁'
  },
  { 
    value: 'Lukiiko', 
    info: 'The parliament or council of the Buganda Kingdom.',
    imageSymbol: '🏛️'
  },
  { 
    value: 'Olugero', 
    info: 'Traditional fables and stories that teach moral lessons in Buganda culture.',
    imageSymbol: '📚'
  },
];

const BugandaMatchingGame: React.FC = () => {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [infoModal, setInfoModal] = useState<{show: boolean, info: string, value: string}>({
    show: false,
    info: '',
    value: ''
  });


  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Create pairs of cards
    const cardPairs: Card[] = [...bugandaItems, ...bugandaItems].map((item, index) => ({
      id: index,
      value: item.value,
      flipped: false,
      matched: false,
      info: item.info,
      imageSymbol: item.imageSymbol,
    }));

    // Shuffle cards
    const shuffledCards = shuffleCards(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCount(0);
    setMoves(0);
    setGameOver(false);
    setInfoModal({show: false, info: '', value: ''});
  };

  const shuffleCards = (cards: Card[]): Card[] => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleCardPress = async (card: Card) => {
    // Prevent flipping if card is already flipped or matched, or if two cards are already flipped
    if (card.flipped || card.matched || flippedCards.length >= 2) {
      return;
    }

    // Play sound effect
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require('@/assets/audio/page-turn.mp3'));
      await soundObject.playAsync();
    } catch (error) {
      console.log('Error playing sound', error);
    }

    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, flipped: true } : c
    );
    
    setCards(updatedCards);
    
    const updatedFlippedCards = [...flippedCards, card];
    setFlippedCards(updatedFlippedCards);

    // If this is the second flipped card
    if (updatedFlippedCards.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      
      // Check for a match
      const [firstCard, secondCard] = updatedFlippedCards;
      if (firstCard.value === secondCard.value) {
        // It's a match
        setTimeout(async () => {
          const matchedCards = cards.map(c => 
            c.value === firstCard.value ? { ...c, matched: true } : c
          );
          
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedCount(prevCount => prevCount + 1);
          
          // Play match sound
          const matchSound = new Audio.Sound();
          try {
            await matchSound.loadAsync(require('@/assets/sounds/correct.mp3'));
            await matchSound.playAsync();
          } catch (error) {
            console.log('Error playing sound', error);
          }
          
          // Show info modal
          setInfoModal({
            show: true,
            info: firstCard.info,
            value: firstCard.value
          });
          
          // Check if all pairs are matched
          if (matchedCount + 1 === bugandaItems.length) {
            setTimeout(() => {
              setGameOver(true);
            }, 1000);
          }
        }, 500);
      } else {
        // Not a match, flip cards back
        setTimeout(() => {
          const resetCards = cards.map(c => 
            (c.id === firstCard.id || c.id === secondCard.id) && !c.matched
              ? { ...c, flipped: false }
              : c
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const closeInfoModal = () => {
    setInfoModal({...infoModal, show: false});
  };

  // Calculate grid size based on orientation
  const isLandscape = Dimensions.get('window').width > Dimensions.get('window').height;
  const columnCount = isLandscape ? 8 : 4;
  const cardSize = isLandscape ? 
    Math.floor(Dimensions.get('window').width / 10) : 
    Math.floor(Dimensions.get('window').width / 5);


  return (
    <View style={[styles.container, {flexDirection: isLandscape ? 'row' : 'column'}]}>
      <StatusBar style="auto" />
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
      
      {/* Game panel (info, controls) */}
      <View style={[
        styles.gamePanel, 
        isLandscape ? {width: '25%', height: '100%'} : {width: '100%', height: '20%'}
      ]}>
        <Text style={styles.title}>Buganda Cultural Cards</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Moves: {moves}</Text>
          <Text style={styles.statsText}>Matches: {matchedCount}/{bugandaItems.length}</Text>
        </View>
        
        <TouchableOpacity style={styles.resetButton} onPress={initGame}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
      
      {/* Game board */}
      <View style={[
        styles.gameBoard, 
        isLandscape ? {width: '75%', height: '100%'} : {width: '100%', height: '80%'}
      ]}>
        <ScrollView contentContainerStyle={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10
        }}>
          {cards.map(card => (
            <TouchableOpacity 
              key={card.id}
              style={[
                styles.card, 
                {
                  width: cardSize, 
                  height: cardSize * 1.4,
                  margin: cardSize * 0.1
                },
                card.flipped && styles.cardFlipped,
                card.matched && styles.cardMatched,
              ]}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.9}
            >
              {card.flipped || card.matched ? (
                <View style={styles.cardFront}>
                  <Text style={styles.cardSymbol}>{card.imageSymbol}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              ) : (
                <View style={styles.cardBack}>
                  <Text style={styles.cardBackText}>?</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Info modal when match is found */}
      {infoModal.show && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{infoModal.value}</Text>
            <Text style={styles.modalInfo}>{infoModal.info}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeInfoModal}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Game over modal */}
      {gameOver && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalInfo}>
              You've completed the Buganda Cultural Cards game in {moves} moves!
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={initGame}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e9',
  },
  gamePanel: {
    padding: 20,
    backgroundColor: '#5c2c06',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statsText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  resetButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#5c2c06',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  gameBoard: {
    backgroundColor: '#f5f1e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardMatched: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  cardFront: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardSymbol: {
    fontSize: 28,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    paddingHorizontal: 5,
  },
  cardBack: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8b4513',
  },
  cardBackText: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#ffd700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#5c2c06',
    marginBottom: 10,
  },
  modalInfo: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#5c2c06',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});

export default BugandaMatchingGame;