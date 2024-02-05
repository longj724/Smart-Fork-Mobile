// External Dependencies
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TabsLayout = () => {
  const router = useRouter();

  return (
    <Tabs>
      <Tabs.Screen
        name="log"
        options={{
          headerShown: false,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Log',
          tabBarActiveTintColor: '#000',
        }}
      />
      <Tabs.Screen
        name="addMeal"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Log Meal',
          tabBarActiveTintColor: '#000',
          headerTitle: 'Log Meal',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Insights',
          tabBarActiveTintColor: '#000',
          headerTitle: 'Insights',
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
