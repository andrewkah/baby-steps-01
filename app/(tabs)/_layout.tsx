import { Tabs } from 'expo-router';
import { Image } from 'react-native';

type NavItem = {
    id: string;
    icon: any; // Could be `ImageSourcePropType` if you want to be more specific
    label: string;
  };
  
// Your navigation items
const navigationItems: NavItem[] = [
  {
    id: 'profile',
    icon: require('../../assets/icons/game.png'),
    label: 'Games',
  },
  {
    id: 'coloring',
    icon: require('../../assets/icons/coloring.png'),
    label: 'Coloring',
  },
  {
    id: 'quizz',
    icon: require('../../assets/icons/quizz.png'),
    label: 'Quizz',
  },
  {
    id: 'logic',
    icon: require('../../assets/icons/logic.png'),
    label: 'Logic',
  },
  {
    id: 'nature',
    icon: require('../../assets/icons/nature.png'),
    label: 'Nature',
  },
  {
    id: 'museum',
    icon: require('../../assets/icons/museum.png'),
    label: 'Museum',
  },
];

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
            backgroundColor: 'rgba(123, 90, 240, 0.85)', 
            borderTopWidth: 0, 
            gap:10,
            paddingHorizontal:120
          },
        tabBarItemStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        
        },      
        tabBarActiveTintColor: 'rgba(90, 60, 190, 0.9)',
        tabBarInactiveTintColor:  '#fff',
    
        }}>
      {navigationItems.map((item) => (
        <Tabs.Screen
          key={item.id}
          name={item.id}
          options={{
            tabBarLabel: item.label,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={item.icon}
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  resizeMode: 'contain',
                }}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
