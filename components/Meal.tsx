// External Dependencies
import {
  View,
  Text,
  TextLayoutEventData,
  NativeSyntheticEvent,
  Pressable,
  Image,
  LayoutChangeEvent,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

interface MealProps {
  datetime: Date;
  id: string;
  imageUrls: string[];
  notes: string | null;
  type: string | null;
}

interface ImageSize {
  width: number;
  height: number;
}

const Meal = ({ datetime, id, imageUrls, notes, type }: MealProps) => {
  const router = useRouter();

  const [showReadMore, setShowReadMore] = useState<boolean | undefined>(
    undefined
  );
  const [showReadLess, setShowReadLess] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const getMealTime = () => {
    let hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    return formattedTime;
  };

  const onNotesTextLayout = (
    event: NativeSyntheticEvent<TextLayoutEventData>
  ) => {
    if (showReadMore === undefined && event.nativeEvent.lines.length > 2) {
      setNumberOfLines(2);
      setShowReadMore(true);
    } else {
      setNumberOfLines(event.nativeEvent.lines.length);
    }
  };

  const onShowReadMore = () => {
    setShowReadMore(false);
    setNumberOfLines(null);
    setShowReadLess(true);
  };

  const onShowReadLess = () => {
    setShowReadLess(false);
    setNumberOfLines(2);
    setShowReadMore(true);
  };

  const onImageLayout = (event: LayoutChangeEvent) => {
    if (!imageSize && showReadMore !== undefined) {
      const { width, height } = event.nativeEvent.layout;
      setImageSize({ width, height });
    }
  };

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: `/log/${id}`,
          params: {
            datetime: datetime.toISOString(),
            id,
            imageUrls,
            notes: notes ?? "",
            type: type ?? "",
          },
        })
      }
    >
      <View className="mt-4 flex flex-row rounded-lg bg-white shadow-md">
        <View className="w-4/6 flex-col p-2">
          <View className="flex flex-row items-center pl-3">
            <Text className="flex-shrink text-lg font-semibold">
              {getMealTime()} - {type}
            </Text>
          </View>
          <View className="ml-3 mt-2 flex flex-col">
            <Text
              numberOfLines={numberOfLines !== null ? numberOfLines : undefined}
              ellipsizeMode="tail"
              onTextLayout={onNotesTextLayout}
            >
              {notes}
            </Text>
            {showReadMore && (
              <Pressable onPress={onShowReadMore} className="mt-2">
                <Text className="font-semibold">Read more</Text>
              </Pressable>
            )}
            {showReadLess && (
              <Pressable onPress={onShowReadLess} className="mt-2">
                <Text className="font-semibold">Read less</Text>
              </Pressable>
            )}
          </View>
        </View>
        {imageUrls?.length && (
          <View className="flex flex-1 items-center p-4">
            <Image
              source={{ uri: imageUrls[0] }}
              className="h-20 w-20 rounded-sm"
              resizeMode="cover"
              onLayout={onImageLayout}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default Meal;
