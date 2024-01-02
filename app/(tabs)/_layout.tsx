// External Dependencies
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabsLayout = () => {
  const router = useRouter();

  return (
    <Tabs>
      <Tabs.Screen
        name="diary"
        options={{
          headerShown: false,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
          tabBarLabel: "Diary",
        }}
      />
      <Tabs.Screen
        name="addMeal"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" color={color} size={size} />
          ),
          tabBarLabel: "Add Meal",
        }}
        listeners={() => ({
          tabPress: (e: any) => {
            e.preventDefault();
            router.push("/(modals)/addMeal");
          },
        })}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size} />
          ),
          tabBarLabel: "Insights",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
