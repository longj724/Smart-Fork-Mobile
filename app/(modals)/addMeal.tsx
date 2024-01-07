// External Dependencies
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import FormData from "form-data";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";

// Relative Dependencies
import MealImage from "@/components/MealImage";

const Page = () => {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: addMealRequest } = useMutation({
    mutationFn: async (data: FormData) => {
      const supabaseAccessToken = await getToken({
        template: "supabase",
      });

      return axios.post("http://localhost:3000/meals/add-meal", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: supabaseAccessToken,
        },
      });
    },
    onSuccess: () => {},
    onError: () => {},
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allMeals"] });
    },
    mutationKey: ["addMeal"],
  });

  const [mealNotes, setMealNotes] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[] | null
  >(null);

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets ?? null);
    } else {
      alert("You did not select any image.");
    }
  };

  const deleteImage = (uri: string) => {
    setSelectedImages((images) => {
      if (images !== null) {
        const newImages = images?.filter((img) => img.uri != uri);
        return newImages;
      }
      return images;
    });
  };

  const addMeal = async () => {
    try {
      const formData = new FormData();

      if (selectedImages) {
        selectedImages.forEach(
          (image: ImagePicker.ImagePickerAsset, index: number) => {
            formData.append("images", {
              uri: image.uri,
              name: image.fileName,
              type: image.type,
            });
          }
        );
      }

      formData.append("notes", mealNotes);
      formData.append("date", JSON.stringify(moment(date).format()));
      formData.append("type", "Breakfast");
      formData.append("userId", userId);

      addMealRequest(formData);
    } catch (error: any) {
      return;
    }
    router.back();
  };

  return (
    <View className="p-4 flex flex-col">
      <Pressable
        onPress={pickImageAsync}
        disabled={selectedImages?.length === 3}
      >
        <View className="flex w-full items-center justify-center border-2 border-dashed border-gray-400 p-6">
          <View className="flex-column flex items-center">
            <Ionicons name="image-outline" className="mx-auto mb-2" size={50} />
            <Text>
              {selectedImages?.length === 3
                ? "Maximum number of photos selected"
                : "Add Photos"}
            </Text>
          </View>
        </View>
      </Pressable>
      {selectedImages && selectedImages.length > 0 && (
        <FlatList
          horizontal
          data={selectedImages}
          renderItem={({ item }) => (
            <MealImage imageInfo={item} deleteImage={deleteImage} />
          )}
          keyExtractor={(item) => item.uri}
          className="mt-2"
        />
      )}
      <View className="border-black-500 mt-8 rounded-md border-2">
        <TextInput
          editable
          multiline
          numberOfLines={4}
          onChangeText={(text) => setMealNotes(text)}
          value={mealNotes}
          style={{ padding: 10 }}
          className="h-24"
          placeholder="Add notes about what you ate, how you felt, etc."
        />
      </View>
      <View className="border-black-500 mt-8 h-10 rounded-md border-2">
        <Pressable onPress={toggleDatePicker}>
          <View className="flex w-full flex-row items-center justify-between p-2">
            <Ionicons name="calendar-outline" size={20} />
            <TextInput
              className="mx-4 flex-1"
              value={`${date.toDateString()} ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
              editable={false}
              pointerEvents="none"
            />
            <Ionicons name="chevron-down-outline" size={20} />
          </View>

          <DateTimePickerModal
            className="ml-10 self-end justify-self-end"
            mode="datetime"
            display="spinner"
            isVisible={showPicker}
            onConfirm={(selectedDate) => {
              setShowPicker(false);
              setDate(selectedDate);
            }}
            onCancel={() => setShowPicker(false)}
          />
        </Pressable>
      </View>
      <View className="mt-10">
        <Pressable
          className="bg-black items-center justify-center rounded-md h-14"
          onPress={addMeal}
        >
          <Text className="text-white text-base font-semibold">Add Meal</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Page;