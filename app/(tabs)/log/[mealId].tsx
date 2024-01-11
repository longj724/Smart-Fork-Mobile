// External Dependencies
import { View, Text } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

const Page = () => {
  const { mealId } = useLocalSearchParams();

  return (
    <View>
      <Stack.Screen options={{ headerTitle: "Edit Meal" }} />
      <Text>Meal Id is: {mealId}</Text>
    </View>
  );
};

export default Page;
