// External Dependencies
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSession } from "@clerk/clerk-expo";
import axios from "axios";

// Relative Dependencies
import MealImage from "../../components/MealImage";

const Page = () => {
  const { session } = useSession();

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

  return (
    <View className="container p-4">
      <Pressable onPress={pickImageAsync}>
        <View className="flex w-full items-center justify-center border-2 border-dashed border-gray-400 p-6">
          <View className="flex-column flex items-center">
            <Ionicons name="image-outline" className="mx-auto mb-2" size={50} />
            <Text>Add Photos</Text>
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
          className="mt-2 h-24"
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
        <Pressable onPress={() => toggleDatePicker()}>
          <View className="flex w-full flex-row items-center justify-between p-2">
            <Ionicons name="calendar-outline" size={20} />
            <TextInput
              className="mx-4 flex-1"
              value={`${date.toDateString()} ${date.toLocaleTimeString()}`}
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
    </View>
  );
};

export default Page;
