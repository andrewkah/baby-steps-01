import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  BackHandler,
  Pressable
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  LogicIcon,
  CoursesIcon,
  GamesIcon,
  OtherIcon,
  StatsIcon,
  ScopeIcon,
  CertificatesIcon,
  RankingsIcon,
  SettingsIcon,
} from '../../assets/icons/ActivityIcons';
import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/StyledText";


// Define types
type DayType = {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

type ActivityType = {
  id: string;
  name: string;
  icon: React.ReactNode;
  time: string;
  color?: string;
  highlight?: boolean;
};

// Define navigation item type with proper route typing
type NavigationItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
  route: string;
};

const CalendarTrackingPage: React.FC = () => {
  // State for selected date
  const [selectedDate, setSelectedDate] = useState<number>(17);
  const [currentMonth, setCurrentMonth] = useState<string>('March 2025');
  const [today] = useState<number>(16); // Hardcoded for demo purposes
  const router = useRouter();

  // Generate calendar days
  const generateCalendarDays = (): DayType[] => {
    // This is simplified - in a real app, you'd calculate this based on the actual month
    const days: DayType[] = [];
    const daysInMonth = 31; // March has 31 days
    
    // Add empty spaces for days before the 1st of the month
    // March 2025 starts on a Saturday (index 6)
    for (let i = 0; i < 6; i++) {
      days.push({ date: 0, isCurrentMonth: false, isToday: false, isSelected: false });
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: i === today,
        isSelected: i === selectedDate,
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Activities data
  const activities: ActivityType[] = [
    {
      id: 'logic',
      name: 'Logic',
      icon: <LogicIcon />,
      time: '0 minutes',
      color: '#E74C3C',
    },
    {
      id: 'courses',
      name: 'Courses',
      icon: <CoursesIcon />,
      time: '0 minutes',
      color: '#3498DB',
    },
    {
      id: 'games',
      name: 'Games',
      icon: <GamesIcon />,
      time: '9 seconds',
      color: '#9BB7D4',
      highlight: true,
    },
    {
      id: 'other',
      name: 'Other',
      icon: <OtherIcon />,
      time: '0 minutes',
      color: '#BDC3C7',
    },
  ];

   const navigationItems: NavigationItem[] = [
    { id: 'stats', name: 'Stats', icon: <StatsIcon />, route: '/stats' },
    { id: 'scope', name: 'Scope', icon: <ScopeIcon />, route: '/scope' },
    { id: 'certificates', name: 'Certificates', icon: <CertificatesIcon />, route: '/certificates' },
    { id: 'rankings', name: 'Rankings', icon: <RankingsIcon />, route: '/RankingsPage' },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon />, route: '/settings' },
  ];

  // Handle date selection
  const handleDateSelect = (date: number) => {
    if (date > 0) {
      setSelectedDate(date);
    }
  };
  
  // Fixed navigation handler with type assertion
  const handleNavigation = (route: string) => {
    // Use type assertion to tell TypeScript this is a valid route
    router.push(route as any);
  };

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    // In a real app, you would update the month and regenerate the calendar
    console.log(`Navigate ${direction}`);
  };
useEffect(() => {
    // Lock to portrait initially when screen loads
    const lockToPortrait = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    lockToPortrait();

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Lock orientation to landscape when going back
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);

      // Navigate back to the previous screen
      router.back(); // Using router.back() to go back to the previous screen
      return true; // Prevent the default back button behavior
    });

    return () => {
      backHandler.remove(); // Clean up back handler
    };
  }, [router]);
    const handleHeaderBackPress = () => {
      // Lock orientation to landscape when going back
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  
      // Navigate back to the previous screen
      router.back(); // Go back to the previous screen
    };
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={handleHeaderBackPress} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={30} color="#FF6F61" />
        </Pressable>
      <StatusBar style="dark" />
    
      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Text style={styles.monthNavButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{currentMonth}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Text style={styles.monthNavButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Weekday Headers */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.isToday && styles.todayCell,
                day.isSelected && styles.selectedCell,
              ]}
              onPress={() => handleDateSelect(day.date)}
              disabled={!day.isCurrentMonth}
            >
              {day.isCurrentMonth && (
                <>
                  <Text
                    style={[
                      styles.dayText,
                      day.isToday && styles.todayText,
                      day.isSelected && styles.selectedText,
                    ]}
                  >
                    {day.date}
                  </Text>
                  {day.isSelected && <View style={styles.selectedDot} />}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Divider with notch */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <View style={styles.notch} />
      </View>
      
      {/* Today's Activities */}
      <ScrollView style={styles.activitiesContainer}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>Today</Text>
          <Text style={styles.todaySubtitle}>Daily goal not accomplished</Text>
        </View>
        
        {/* Activities List */}
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityIconContainer, { backgroundColor: `${activity.color}20` }]}>
              {activity.icon}
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View style={[
                styles.activityTimeContainer, 
                activity.highlight && styles.highlightedTimeContainer
              ]}>
                <Text style={[
                  styles.activityTime, 
                  activity.highlight && styles.highlightedTime
                ]}>
                  {activity.time}
                </Text>
              </View>
            </View>
            {activity.id === 'games' && (
              <TouchableOpacity style={styles.activityArrow}>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {navigationItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.navItem}
            onPress={() => handleNavigation(item.route)}
          >
            <View style={styles.navIcon}>{item.icon}</View>
            <Text style={styles.navText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const daySize = width / 7 - 10;

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
  headerBackButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
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
  calendarContainer: {
    backgroundColor: '#6C7EE1',
    paddingVertical: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  monthNavButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  weekDayText: {
    width: daySize,
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  dayCell: {
    width: daySize,
    height: daySize,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayCell: {
    backgroundColor: '#FFD700',
    borderRadius: daySize / 2,
  },
  selectedCell: {
    backgroundColor: '#FFFFFF',
    borderRadius: daySize / 2,
  },
  dayText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  todayText: {
    color: '#333',
  },
  selectedText: {
    color: '#6C7EE1',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C7EE1',
    marginTop: 2,
  },
  dividerContainer: {
    alignItems: 'center',
    backgroundColor: '#6C7EE1',
  },
  divider: {
    height: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  notch: {
    width: 60,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: -12,
  },
  activitiesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  todayHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  todaySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  activityTimeContainer: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  highlightedTimeContainer: {
    backgroundColor: '#FFD70020',
  },
  activityTime: {
    fontSize: 14,
    color: '#888',
  },
  highlightedTime: {
    color: '#FFD700',
  },
  activityArrow: {
    marginLeft: 10,
  },
  arrowText: {
    fontSize: 20,
    color: '#6C7EE1',
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
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
  },
});

export default CalendarTrackingPage;