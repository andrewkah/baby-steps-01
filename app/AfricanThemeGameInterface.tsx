import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from 'expo-speech';


// Define types
type LearningCard = {
  id: string;
  title: string;
  image: any;
  description: string;
};

type NavItem = {
  id: string;
  icon: any;
  label: string;
};

const AfricanThemeGameInterface: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Basic');
  const [selectedNavItem, setSelectedNavItem] = useState<string>('home');
  const router = useRouter();
  // Learning cards data with African theme
  const learningCards: LearningCard[] = [
    {
      id: 'logic',
      title: 'Logic',
      image: require('../assets/images/african-logic.png'),
      description: 'Solve puzzles inspired by African traditions',
    },
    {
      id: 'patterns',
      title: 'Patterns',
      image: require('../assets/images/african-patterns.png'),
      description: 'Learn about beautiful Kente cloth patterns',
    },
    {
      id: 'focus',
      title: 'Focus',
      image: require('../assets/images/african-focus.png'),
      description: 'Improve concentration with Adinkra symbols',
    },
    {
      id: 'numbers',
      title: 'Numbers',
      image: require('../assets/images/numbers.png'),
      description: 'Count with traditional African number systems',
    },
    {
      id: 'stories',
      title: 'Stories',
      image: require('../assets/images/stories.png'),
      description: 'Learn through African folktales and proverbs',
    },
  ];

  // Navigation items with African theme
  const navigationItems: NavItem[] = [
    {
      id: 'games',
      icon: require('../assets/icons/game.png'),
      label: 'Games',
    },
    {
      id: 'coloring',
      icon: require('../assets/icons/coloring.png'),
      label: 'Coloring',
    },
    {
      id: 'quizz',
      icon: require('../assets/icons/quizz.png'),
      label: 'Quizz',
    },
    {
      id: 'Logic',
      icon: require('../assets/icons/logic.png'),
      label: 'Logic',
    },
    {
      id: 'Nature',
      icon: require('../assets/icons/nature.png'),
      label: 'Nature',
    },
    {
      id: 'museum',
      icon: require('../assets/icons/museum.png'),
      label: 'museum',
    },
  ];
  const handleParentalPress = () => {
    Speech.speak("For parents only", {
      language: 'en',
      pitch: 1, // Set pitch if needed
      rate: 1,  // Set rate of speech if needed
    });
    router.push("/parent-gate");

  };
  // Dropdown options
  const levelOptions = ['Basic', 'Intermediate', 'Advanced'];

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
              <View >
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
                
              </View>
              
              <TouchableOpacity style={styles.parentsButton} 
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
        
        {/* Bottom navigation */}
        <View style={styles.bottomNav}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.navItemsContainer}
            >
              {navigationItems.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={[
                    styles.navItem,
                    selectedNavItem === item.id && styles.navItemSelected
                  ]}
                  onPress={() => setSelectedNavItem(item.id)}
                >
                  <Image source={item.icon} style={styles.navIcon} />
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    marginRight:10,
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
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
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
    paddingVertical: 10,
  },
  card: {
    backgroundColor: 'white',
    resizeMode:'contain',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123, 90, 240, 0.85)',
    paddingHorizontal: 15,
    alignItems: 'center',
    // borderTopWidth: 2,
    // borderTopColor: '#FFD700',
  },
  navItemsContainer: {
    paddingHorizontal: 10,
    minWidth: '100%',
    flexGrow: 1,
    justifyContent: 'center', // Centers horizontally
    alignItems: 'center',     // Centers vertically
  },
  navItem: {
    backgroundColor: 'rgba(90, 60, 190, 0.9)',
    alignItems: 'center',
    paddingHorizontal:5,
    marginHorizontal: 5,
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
    height:40
  },
  navItemSelected: {
    backgroundColor: 'rgba(90, 60, 190, 0.9)',
    marginTop:0,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  
  navIcon: {
    width: 30,
    height: 30,
    paddingHorizontal:10
  },
  navLabel: {
    color: 'white',
    fontSize: 12,
  },
});

export default AfricanThemeGameInterface;