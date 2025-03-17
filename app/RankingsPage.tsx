import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LearnersIcon,
  FriendsIcon,
  TownsIcon,
  TeamsIcon,
  GlobalIcon,
  LocalIcon,
  EducationIcon,
  StarIcon,
  CalendarIcon,
  TimeIcon,
  CrownIcon,
  StatsIcon,
  ScopeIcon,
  CertificatesIcon,
  RankingsIcon,
  SettingsIcon,
} from '../assets/icons/RankingIcons';

// Define types
type TabType = 'Learners' | 'Friends' | 'Towns' | 'Teams';
type FilterType = 'global' | 'local' | 'education' | 'star' | 'calendar' | 'time' | 'all';
type RankingUser = {
  id: string;
  rank: number;
  name: string;
  avatar: React.ReactNode;
  location: string;
  countryFlag: React.ReactNode;
  score: number;
  isFavorite: boolean;
  level: number;
};

const RankingsPage: React.FC = () => {
  // State for active tab and filter
  const [activeTab, setActiveTab] = useState<TabType>('Learners');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [ageFilter, setAgeFilter] = useState<string>('Age 4—8');

  // Tabs data
  const tabs: { id: TabType; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: 'Learners', icon: <LearnersIcon />, label: 'Children' },

  ];

  // Filters data
  const filters: { id: FilterType; icon: React.ReactNode }[] = [
    { id: 'global', icon: <GlobalIcon /> },
    { id: 'local', icon: <LocalIcon /> },
    { id: 'education', icon: <EducationIcon /> },
    { id: 'star', icon: <StarIcon /> },
    { id: 'calendar', icon: <CalendarIcon /> },
    { id: 'time', icon: <TimeIcon /> },
    { id: 'all', icon: null }, // Text-only filter
  ];

  // Mock avatar components
  const createAvatar = (index: number) => (
    <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(index) }]}>
      <Text style={styles.avatarText}>{index}</Text>
    </View>
  );

  const getAvatarColor = (index: number) => {
    const colors = ['#FF6B6B', '#FF9F43', '#1DD1A1', '#2E94B9', '#6C5CE7', '#D63031'];
    return colors[index % colors.length];
  };

  // Mock country flag components
  const createFlag = (country: string) => (
    <View style={[styles.flagPlaceholder, { backgroundColor: getFlagColor(country) }]}>
      <Text style={styles.flagText}>{country.substring(0, 2)}</Text>
    </View>
  );

  const getFlagColor = (country: string) => {
    const colors: {[key: string]: string} = {
      'Spain': '#FF9F43',
      'Ukraine': '#6C5CE7',
      'Israel': '#1DD1A1',
    };
    return colors[country] || '#FF6B6B';
  };

  // Rankings data
  const rankings: RankingUser[] = [
    {
      id: '1',
      rank: 1,
      name: 'VMC',
      avatar: createAvatar(1),
      location: 'Bilbao',
      countryFlag: createFlag('Spain'),
      score: 213436,
      isFavorite: true,
      level: 50,
    },
    {
      id: '2',
      rank: 2,
      name: 'Maksim Vovchuk',
      avatar: createAvatar(2),
      location: 'Lviv',
      countryFlag: createFlag('Ukraine'),
      score: 210446,
      isFavorite: true,
      level: 50,
    },
    {
      id: '3',
      rank: 3,
      name: 'Ribo',
      avatar: createAvatar(3),
      location: 'Ashdod Yam',
      countryFlag: createFlag('Israel'),
      score: 204501,
      isFavorite: true,
      level: 50,
    },
    {
      id: '4',
      rank: 4,
      name: 'Nevidomij',
      avatar: createAvatar(4),
      location: 'Ternopil',
      countryFlag: createFlag('Ukraine'),
      score: 200522,
      isFavorite: true,
      level: 50,
    },
    {
      id: '5',
      rank: 5,
      name: 'Nika Sunshine',
      avatar: createAvatar(5),
      location: 'Kyiv',
      countryFlag: createFlag('Ukraine'),
      score: 200064,
      isFavorite: true,
      level: 50,
    },
    {
      id: '6',
      rank: 6,
      name: 'Ivan Zdorenko',
      avatar: createAvatar(6),
      location: 'Kyiv',
      countryFlag: createFlag('Ukraine'),
      score: 197434,
      isFavorite: true,
      level: 50,
    },
  ];

  // Navigation items
  const navigationItems = [
    { id: 'stats', name: 'Stats', icon: <StatsIcon />, active: false },
    { id: 'scope', name: 'Scope', icon: <ScopeIcon />, active: false },
    { id: 'certificates', name: 'Certificates', icon: <CertificatesIcon />, active: false },
    { id: 'rankings', name: 'Rankings', icon: <RankingsIcon />, active: true },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon />, active: false },
  ];

  // Format score with spaces
  const formatScore = (score: number): string => {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />   
      
      {/* Filters */}
      
      
      {/* Your League Section */}
      <View style={styles.leagueContainer}>
        <View style={styles.leagueIconContainer}>
          <CrownIcon />
          <View style={styles.leagueStars}>
            <Text style={styles.leagueStarText}>★★★</Text>
          </View>
        </View>
        
        <View style={styles.leagueContent}>
          <View style={styles.leagueHeader}>
            <Text style={styles.leagueTitle}>Your league</Text>
            <View style={styles.leagueStarterBadge}>
              <Text style={styles.leagueStarterText}>Starter</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
              <View style={styles.progressStar}>
                <Text style={styles.progressStarText}>★</Text>
              </View>
            </View>
            <Text style={styles.progressText}>15 / 2 250</Text>
          </View>
        </View>
      </View>
      
      {/* Rankings List */}
      <ScrollView style={styles.rankingsContainer}>
        {rankings.map((user) => (
          <View key={user.id} style={styles.rankingItem}>
            <View style={styles.rankNumberContainer}>
              <Text style={styles.rankNumber}>{user.rank}</Text>
            </View>
            
            <View style={styles.userInfoContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{user.level}</Text>
              </View>
              <View style={styles.avatarContainer}>
                {user.avatar}
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.locationContainer}>
                  <View style={styles.flagContainer}>
                    {user.countryFlag}
                  </View>
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.scoreContainer}>
              <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>★</Text>
              </TouchableOpacity>
              <Text style={styles.scoreText}>{formatScore(user.score)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.navItem}
          >
            <View style={styles.navIconContainer}>
              {item.icon}
            </View>
            <Text 
              style={[
                styles.navText,
                item.active && styles.activeNavText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#6C7EE1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#5D4A9C',
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  activeTabItem: {
    // Active tab styling
  },
  tabContent: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#5D4A9C',
    paddingHorizontal: 10,
  },
  filterItem: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeFilterItem: {
    backgroundColor: '#FFD700',
  },
  textFilterItem: {
    width: 60,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ageFilterItem: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leagueContainer: {
    backgroundColor: '#4CD964',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  leagueIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  leagueStars: {
    marginTop: 5,
  },
  leagueStarText: {
    color: 'white',
    fontSize: 16,
  },
  leagueContent: {
    flex: 1,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leagueTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  leagueStarterBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  leagueStarterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '10%', // Based on progress (15/2250)
    backgroundColor: '#FFD700',
    borderRadius: 10,
  },
  progressStar: {
    position: 'absolute',
    left: '10%', // Same as progressFill width
    top: -5,
    backgroundColor: '#FFD700',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStarText: {
    color: 'white',
    fontSize: 18,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
  },
  rankingsContainer: {
    flex: 1,
    backgroundColor: '#5D4A9C',
  },
  rankingItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  rankNumberContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfoContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    left: 0,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  flagContainer: {
    marginRight: 5,
  },
  flagPlaceholder: {
    width: 16,
    height: 12,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  favoriteButton:{
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 5,

  },
  favoriteIcon: {
    color: '#FFD700',
    fontSize: 20,
  },
  scoreText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#888',
  },
  activeNavText: {
    color: '#4CD964',
  },
});

export default RankingsPage;

