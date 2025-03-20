import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from 'expo-speech';
import { Text } from "@/components/StyledText";

// Define types
type LearningCard = {
  id: string;
  title: string;
  image: any;
  description: string;
  targetPage: string; // Add this property to specify which page to navigate to
};

type NavItem = {
  id: string;
  icon: any;
  label: string;
};

const AfricanThemeGameInterface: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Basic');
  const [selectedNavItem, setSelectedNavItem] = useState<string>('home');
  const [learningCards, setLearningCards] = useState<LearningCard[]>([]);
  const router = useRouter();
  
  // Get the current path to determine which tab we're on
  const pathname = usePathname();
  const tabId = pathname.split('/').pop() || 'profile'; // Extract tab ID from path
  
  // Set the title based on the tab
  const [screenTitle, setScreenTitle] = useState("Games");
  
  useEffect(() => {
    // Set cards based on the selected tab
    switch(tabId) {
      case 'profile': // Games
        setScreenTitle("Games");
        setLearningCards([
          {
            id: 'logic',
            title: 'Logic',
            image: require('../assets/images/african-logic.png'),
            description: 'Solve puzzles inspired by African traditions',
            targetPage: 'tester', // For now, all point to tester, but you can change this later
          },
          {
            id: 'patterns',
            title: 'Patterns',
            image: require('../assets/images/african-patterns.png'),
            description: 'Learn about beautiful Kente cloth patterns',
            targetPage: 'tester',
          },
          {
            id: 'focus',
            title: 'Focus',
            image: require('../assets/images/african-focus.png'),
            description: 'Improve concentration with Adinkra symbols',
            targetPage: 'tester',
          },
          {
            id: 'numbers',
            title: 'Numbers',
            image: require('../assets/images/numbers.png'),
            description: 'Count with traditional African number systems',
            targetPage: 'tester',
          },
          {
            id: 'words',
            title: 'Words',
            image: require('../assets/images/stories.png'),
            description: 'Learn through African folktales and proverbs',
            targetPage: 'tester',
          },
        ]);
        break;
        
      case 'coloring':
        setScreenTitle("Coloring");
        setLearningCards([
          {
            id: 'animals',
            title: 'Animals',
            image: require('../assets/images/animals.jpg'),
            description: 'Color African wildlife animals',
            targetPage: 'tester',
          },
          {
            id: 'shapes',
            title: 'Shapes',
            image: require('../assets/images/shapes.jpg'),
            description: 'Color different shapes',
            targetPage: 'tester',
          },
          {
            id: 'masks',
            title: 'Masks',
            image: require('../assets/images/mask.jpg'),
            description: 'Color traditional African masks',
            targetPage: 'tester',
          },
          {
            id: 'landscapes',
            title: 'Landscapes',
            image: require('../assets/images/landscape.jpg'),
            description: 'Color beautiful African landscapes',
            targetPage: 'tester',
          },
          {
            id: 'clothing',
            title: 'Clothing',
            image: require('../assets/images/clothing.jpg'),
            description: 'Color traditional African clothing',
            targetPage: 'tester',
          },
        ]);
        break;
        
      case 'Stories':
        setScreenTitle("Stories");
        setLearningCards([
          {
            id: 'kintu',
            title: 'Kintu',
            image: require('../assets/images/kintu.jpg'),
            description: 'Learn about Kintu, the first person on Earth according to Buganda mythology',
            targetPage: 'tester',
          },
          {
            id: 'mwanga',
            title: 'Kabaka Mwanga',
            image: require('../assets/images/mwanga.jpg'),
            description: 'Discover the story of Kabaka Mwanga II of Buganda',
            targetPage: 'tester',
          },
          {
            id: 'kasubi',
            title: 'Kasubi Tombs',
            image: require('../assets/images/kasubi.jpg'),
            description: 'Explore the UNESCO World Heritage Site of Kasubi Tombs',
            targetPage: 'tester',
          },
          {
            id: 'buganda-kingdom',
            title: 'Buganda Kingdom',
            image: require('../assets/images/buganda-kingdom.jpg'),
            description: 'Learn about the history of the Buganda Kingdom',
            targetPage: 'tester',
          },
          {
            id: 'kabaka-trail',
            title: 'Kabaka Trail',
            image: require('../assets/images/kabaka-trail.jpg'),
            description: 'Follow the historical trail of the Kabakas of Buganda',
            targetPage: 'tester',
          },
          {
            id: 'buganda-culture',
            title: 'Buganda Culture',
            image: require('../assets/images/culture.jpg'),
            description: 'Discover the rich cultural heritage of Buganda',
            targetPage: 'tester',
          },
        ]);
        break;
        
      case 'quizz':
        setScreenTitle("Quizz");
        setLearningCards([
          {
            id: 'history',
            title: 'History',
            image: require('../assets/images/history.jpg'), // Replace with appropriate image
            description: 'Test your knowledge of African history',
            targetPage: 'tester',
          },
          {
            id: 'geography',
            title: 'Geography',
            image: require('../assets/images/geography.jpg'), // Replace with appropriate image
            description: 'Quiz about African countries and landmarks',
            targetPage: 'tester',
          },
          {
            id: 'culture',
            title: 'Culture',
            image: require('../assets/images/culture.jpg'), // Replace with appropriate image
            description: 'Learn about diverse African cultures',
            targetPage: 'tester',
          },
          {
            id: 'wildlife',
            title: 'Wildlife',
            image: require('../assets/images/wildlife.jpg'), // Replace with appropriate image
            description: 'Test your knowledge of African animals',
            targetPage: 'tester',
          },
          {
            id: 'languages',
            title: 'Languages',
            image: require('../assets/images/language.jpg'), // Replace with appropriate image
            description: 'Learn words from different African languages',
            targetPage: 'tester',
          },
        ]);
        break;
        
      case 'nature':
        setScreenTitle("Nature");
        setLearningCards([
          {
            id: 'savanna',
            title: 'Savanna',
            image: require('../assets/images/savannah.jpg'), // Replace with appropriate image
            description: 'Explore the African savanna ecosystem',
            targetPage: 'tester',
          },
          {
            id: 'rainforest',
            title: 'Rainforest',
            image: require('../assets/images/rainforest.jpg'), // Replace with appropriate image
            description: 'Discover the Congo rainforest',
            targetPage: 'tester',
          },
          {
            id: 'desert',
            title: 'Desert',
            image: require('../assets/images/desert.jpg'), // Replace with appropriate image
            description: 'Learn about the Sahara and Kalahari deserts',
            targetPage: 'tester',
          },
          {
            id: 'mountains',
            title: 'Mountains',
            image: require('../assets/images/mountain.jpg'), // Replace with appropriate image
            description: 'Explore African mountains like Kilimanjaro',
            targetPage: 'tester',
          },
          {
            id: 'rivers',
            title: 'Rivers',
            image: require('../assets/images/river.jpg'), // Replace with appropriate image
            description: 'Learn about the Nile, Congo, and other major rivers',
            targetPage: 'tester',
          },
        ]);
        break;
        
      case 'museum':
        setScreenTitle("Museum");
        setLearningCards([
          {
            id: 'artifacts',
            title: 'Artifacts',
            image: require('../assets/images/artifacts.jpg'), // Replace with appropriate image
            description: 'Explore ancient African artifacts',
            targetPage: 'tester',
          },
          {
            id: 'art',
            title: 'Art',
            image: require('../assets/images/art.jpg'), // Replace with appropriate image
            description: 'Discover traditional and contemporary African art',
            targetPage: 'tester',
          },
          {
            id: 'instruments',
            title: 'Instruments',
            image: require('../assets/images/drum.jpg'), // Replace with appropriate image
            description: 'Learn about traditional African musical instruments',
            targetPage: 'tester',
          },
          {
            id: 'textiles',
            title: 'Textiles',
            image: require('../assets/images/textile.jpg'), // Replace with appropriate image
            description: 'Explore the rich tradition of African textiles',
            targetPage: 'tester',
          },
          {
            id: 'sculptures',
            title: 'Sculptures',
            image: require('../assets/images/sculpture.jpg'), // Replace with appropriate image
            description: 'View famous African sculptures and carvings',
            targetPage: 'tester',
          },
        ]);
        break;
        default:
          // Default to games if no tab is specified
          setScreenTitle("Games");
          setLearningCards([
            {
              id: 'logic',
              title: 'Logic',
              image: require('../assets/images/african-logic.png'),
              description: 'Solve puzzles inspired by African traditions',
              targetPage: 'tester',
            },
            {
              id: 'patterns',
              title: 'Patterns',
              image: require('../assets/images/african-patterns.png'),
              description: 'Learn about beautiful Kente cloth patterns',
              targetPage: 'tester',
            },
            {
              id: 'focus',
              title: 'Focus',
              image: require('../assets/images/african-focus.png'),
              description: 'Improve concentration with Adinkra symbols',
              targetPage: 'tester',
            },
            {
              id: 'numbers',
              title: 'Numbers',
              image: require('../assets/images/numbers.png'),
              description: 'Count with traditional African number systems',
              targetPage: 'tester',
            },
            {
              id: 'stories',
              title: 'Stories',
              image: require('../assets/images/stories.png'),
              description: 'Learn through African folktales and proverbs',
              targetPage: 'tester',
            },
          ]);
      }
    }, [tabId]);
  

  const handleParentalPress = () => {
    Speech.speak("For parents only", {
      language: 'en',
      pitch: 1,
      rate: 1,
    });
    router.push("/parent-gate");
  };
  
  // Updated function to navigate to the card's target page with type assertion
  const handleCardPress = (card: LearningCard) => {
    // Use type assertion to tell TypeScript this is a valid route
    router.push(`/${card.targetPage}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../assets/images/gameBackground.png')} 
        style={styles.backgroundImage}
      >
        {/* Main content area */}
        <View style={styles.mainContent}>
          {/* Left sidebar */}
          <View style={styles.profileContainer}>
            <Image 
              source={require('../assets/images/african-avatar.png')} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.profileName}>Learner</Text>
              <Text style={styles.profileAge}>Age 9+</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>1</Text>
              </View>
            </View>
          </View>
 
          {/* Right content area */}
          <View style={styles.contentArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>{screenTitle}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.parentsButton} 
                onPress={handleParentalPress}
              >
                <Ionicons name="people-sharp" size={30} color="#FF6F61" />
                <Text style={styles.parentsButtonText}>For parents</Text>
              </TouchableOpacity>
            </View>
            
            {/* Cards section */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              <View style={styles.startContainer}>
                <Text style={styles.startTitle}>Start</Text>
                <Text style={styles.startSubtitle}>of learning </Text>
                <Text style={styles.startSubtitle}>journey </Text>
              </View>
              {learningCards.map((card) => (
                <TouchableOpacity 
                  key={card.id} 
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => handleCardPress(card)}
                >
                  <Image source={card.image} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardDescription}>{card.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 90, 240, 0.85)',
  },
  sidebar: {
    width: width * 0.2,
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(90, 60, 190, 0.8)',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  profileAge: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: 60,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    color: '#5A3CBE',
    fontWeight: 'bold',
    fontSize: 14,
  },
  startContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginRight: 10,
    width: 200,
    height: 150,
  },
  startTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  startSubtitle: {
    color: 'white',
    fontSize: 16,
  },
  adinkraSymbol: {
    width: 40,
    height: 40,
    marginTop: 10,
  },
  contentArea: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    marginLeft:width *0.45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    width:width*0.45,
    color: 'white',
    fontSize: 30,
    marginRight: 10,
  },
  levelSelector: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  levelText: {
    color: '#5A3CBE',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  dropdownIcon: {
    color: '#5A3CBE',
    fontSize: 12,
  },
  parentsButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginTop: 3,
  },
  parentIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  parentsButtonText: {
    color: '#5A3CBE',
    fontSize: 16,
    fontWeight: '500',
  },
  cardsContainer: {
    paddingVertical: 15,
  },
  card: {
    backgroundColor: 'white',
    resizeMode: 'contain',
    borderRadius: 20,
    width: 250,
    height: 200,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  cardImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: '30%',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5A3CBE',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default AfricanThemeGameInterface;