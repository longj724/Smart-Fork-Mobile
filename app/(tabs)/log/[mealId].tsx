// External Dependencies
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { useRef, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useRouter } from "expo-router";

// Relative Dependencies
import { IMealTypeSelectData } from "@/types/types";
import { mealTypeSelectData } from "@/utils/utils";

interface IMealUpdateData {
  newMealNotes: string;
  newDateTime: string;
  newType: string;
  mealId: string;
}

const Page = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const { datetime, imageUrls, mealId, notes, type } = useLocalSearchParams();
  const imageUrlsArray = (imageUrls as string).split(",");
  const datetimeAsDate = moment(datetime).toDate();

  const [newMealNotes, setNewMealNotes] = useState(notes as string);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(type as string);
  const [newDatetime, setNewDatetime] = useState(datetimeAsDate);

  const { mutate: updateMealRequest } = useMutation({
    mutationFn: async () => {
      const supabaseAccessToken = await getToken({
        template: "supabase",
      });

      const data = {
        mealId: mealId as string,
        notes: newMealNotes,
        dateTime: JSON.stringify(datetime),
        type: type as string,
      };

      console.log("here");

      return axios.post("http://localhost:3000/meals/update-meal", data, {
        headers: {
          Authorization: supabaseAccessToken,
        },
      });
    },
    mutationKey: ["updateMeal"],
    onSuccess: () => {
      router.back();
    },
  });

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const animatedvalue = useRef(new Animated.Value(0)).current;
  const slideup = () => {
    Animated.timing(animatedvalue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start(() => setShowMealTypeDropdown(false));
  };

  return (
    <View className="flex flex-col pt-4 w-screen items-center h-screen ">
      <Stack.Screen
        options={{
          headerTitle: "Edit Meal",
          headerLeft: () => (
            <Ionicons
              color="black"
              name="chevron-back-outline"
              size={24}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <View className="h-1/3 w-5/6 rounded-lg shadow-md bg-red-400 flex">
        <Image
          source={{ uri: imageUrlsArray[0] }}
          className=" flex-1 rounded-sm"
          resizeMode="cover"
        />
      </View>
      <View className="border-black-500 mt-8 rounded-md border-2 w-5/6 ">
        <TextInput
          editable
          multiline
          numberOfLines={4}
          onChangeText={(text) => setNewMealNotes(text)}
          value={newMealNotes}
          style={{ padding: 10 }}
          className="h-24"
          placeholder="Add notes about what you ate, how you felt, etc."
        />
      </View>
      <View className="border-black-500 mt-4 h-10 rounded-md border-2 w-5/6">
        <Pressable onPress={toggleDatePicker}>
          <View className="flex w-full flex-row items-center justify-between p-2">
            <Ionicons name="calendar-outline" size={20} />
            <TextInput
              className="mx-4 flex-1"
              value={`${datetimeAsDate.toDateString()} ${datetimeAsDate.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}`}
              editable={false}
              pointerEvents="none"
            />
            <Ionicons name="chevron-down-outline" size={20} />
          </View>

          <DateTimePickerModal
            className="ml-10 self-end justify-self-end"
            mode="datetime"
            display="spinner"
            isVisible={showDatePicker}
            onConfirm={(selectedDate) => {
              setShowDatePicker(false);
              setNewDatetime(selectedDate);
            }}
            onCancel={() => setShowDatePicker(false)}
          />
        </Pressable>
      </View>
      <View className="border-black-500 mt-4 rounded-md border-2 w-5/6">
        <Pressable
          onPress={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
        >
          <View className="flex w-full flex-row items-center justify-between p-2">
            <Ionicons name="fast-food-outline" size={20} />
            <Text className="justify-self-start align-self">
              {selectedMealType}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} />
          </View>
        </Pressable>
        {showMealTypeDropdown && (
          <Animated.View>
            <ScrollView nestedScrollEnabled={true}>
              {mealTypeSelectData
                .filter(
                  ({ value }: IMealTypeSelectData) => value !== selectedMealType
                )
                .map(({ key, value }: IMealTypeSelectData, index: number) => (
                  <Pressable
                    className="flex flex-row justify-center p-2"
                    key={key}
                    onPress={() => {
                      setSelectedMealType(value);
                      slideup();
                    }}
                  >
                    <Text>{value}</Text>
                  </Pressable>
                ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
      <Pressable
        className="bg-black items-center justify-center rounded-md h-12 w-5/6 mt-8"
        onPress={() => updateMealRequest()}
      >
        <Text className="text-white text-base font-semibold">Update Meal</Text>
      </Pressable>
    </View>
  );
};

export default Page;
