// External Dependencies
import { View, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface MealImageProps {
  imageInfo: ImagePicker.ImagePickerAsset;
  deleteImage: (uri: string) => void;
}

const MealImage = ({ imageInfo, deleteImage }: MealImageProps) => {
  return (
    <View className="relative p-2">
      <Image
        source={{ uri: imageInfo.uri }}
        resizeMode="cover"
        className="h-20 w-20"
      />
      <Pressable
        className="absolute top-0 right-0 flex items-center justify-center rounded-3xl bg-gray-400"
        onPress={() => deleteImage(imageInfo.uri)}
      >
        <Ionicons name="remove-outline" size={20} color="black" />
      </Pressable>
    </View>
  );
};

export default MealImage;
