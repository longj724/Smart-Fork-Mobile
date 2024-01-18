// External Dependencies
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
          tabBarLabel: "Log",
          tabBarActiveTintColor: "#000",
        }}
      />
      <Tabs.Screen
        name="addMeal"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pencil-outline" color={color} size={size} />
          ),
          tabBarLabel: "Log Meal",
        }}
        listeners={() => ({
          tabPress: (e: any) => {
            e.preventDefault();
            router.push("/(modals)/addMeal");
          },
        })}
      />
      <Tabs.Screen
        name="quickAdd"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-outline" color={color} size={size} />
          ),
          tabBarLabel: "Quck Add",
          tabBarActiveTintColor: "#000",
          headerTitle: "Quick Add",
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" color={color} size={size} />
          ),
          tabBarLabel: "Insights",
          tabBarActiveTintColor: "#000",
          headerTitle: "Insights",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
