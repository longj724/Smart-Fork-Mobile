// External Dependencies
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

// Relative Dependencies
import Meal from "@/components/Meal";

const sampleData = {
  date: new Date(),
  notes:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
  type: "Breakfast",
};

const Page = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthInView, setMonthInView] = useState(new Date().getMonth());

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const displayDayInHeader = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate()
      ? "Today"
      : selectedDate.toLocaleDateString();
  };

  const moveForwardOneDay = () => {
    setSelectedDate((prevDate) => {
      const tomorrow = new Date(prevDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    });
  };

  const moveBackwardOneDay = () => {
    setSelectedDate((prevDate) => {
      const yesterday = new Date(prevDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    });
  };

  return (
    <SafeAreaView>
      <View className="flex h-16 flex-row items-center justify-center bg-green-400">
        <View className="flex w-full flex-row justify-center gap-2">
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-blue-400"
            onPress={moveBackwardOneDay}
          >
            <Ionicons name="arrow-back-outline" color="white" size={16} />
          </Pressable>
          <Pressable
            className="flex w-28 flex-row items-center justify-center gap-1 rounded-sm bg-red-500"
            onPress={toggleDatePicker}
          >
            <Text className="font-semibold text-white">
              {displayDayInHeader()}
            </Text>
            <Ionicons name="caret-down-outline" color="white" />
          </Pressable>
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-blue-400"
            onPress={moveForwardOneDay}
          >
            <Ionicons name="arrow-forward-outline" color="white" size={16} />
          </Pressable>
        </View>
      </View>

      {showDatePicker && (
        // TODO: This currently doesn't work with the arrows on the calendar
        <DateTimePicker
          mode="date"
          display="inline"
          value={selectedDate}
          onChange={(event, newDate) => {
            if (event.type === "set" && monthInView !== newDate?.getMonth()) {
              setMonthInView(newDate?.getMonth() as number);
            } else if (event.type === "set") {
              setShowDatePicker(false);
              setSelectedDate(newDate as Date);
            }
          }}
        />
      )}
      <View className="container p-4">
        <Meal
          date={sampleData.date}
          notes={sampleData.notes}
          type={sampleData.type}
          imageLink="https://picsum.photos/200/300"
        />
      </View>
    </SafeAreaView>
  );
};

export default Page;
