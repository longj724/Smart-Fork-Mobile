// External Dependencies
import {
  Animated,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@clerk/clerk-expo';
import FormData from 'form-data';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import MealImage from '@/components/MealImage';
import { IMealTypeSelectData } from '@/types/types';
import { mealTypeSelectData } from '@/utils/utils';
import { useLogMealMutation } from '@/hooks/useLogMealMutation';
import LoadingIndicator from '@/components/LoadingIndicator';
import Rating from '@/components/Rating';

const Page = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logMealMutation = useLogMealMutation();

  const [mealNotes, setMealNotes] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[] | null
  >(null);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [selectedRating, setSelectedRating] = useState(5);

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
      alert('You did not select any image.');
    }
  };

  const deleteImage = (uri: string) => {
    setSelectedImages((images) => {
      if (images !== null) {
        return images?.filter((img) => img.uri != uri);
      }
      return images;
    });
  };

  const addMeal = async () => {
    const formData = new FormData();

    if (selectedImages) {
      selectedImages.forEach((image: ImagePicker.ImagePickerAsset) => {
        formData.append('images', {
          uri: image.uri,
          name: image.fileName,
          type: image.type,
        });
      });
    }

    formData.append('notes', mealNotes);
    formData.append('date', date.toISOString());
    formData.append('type', selectedMealType);
    formData.append('rating', selectedRating);
    formData.append('userId', userId);

    logMealMutation.mutate(formData, {
      onSuccess: () => {
        setMealNotes('');
        setDate(new Date());
        setSelectedImages(null);
        setSelectedMealType('Breakfast');
        queryClient.invalidateQueries({ queryKey: ['allMeals'] });
        router.back();
      },
    });
  };

  const animatedvalue = useRef(new Animated.Value(0)).current;
  const slideup = () => {
    Animated.timing(animatedvalue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start(() => setShowMealTypeDropdown(false));
  };

  const onRatingSelected = (rating: number) => {
    setSelectedRating(rating);
  };

  if (logMealMutation.isPending) {
    return <LoadingIndicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="p-4 flex flex-col">
        <Pressable
          className="bg-white"
          disabled={selectedImages?.length === 3}
          onPress={pickImageAsync}
        >
          <View className="flex w-full items-center justify-center border-2 border-dashed border-gray-400 p-6">
            <View className="flex-column flex items-center">
              <Ionicons
                name="image-outline"
                className="mx-auto mb-2"
                size={50}
              />
              <Text>
                {selectedImages?.length === 3
                  ? 'Maximum number of photos selected'
                  : 'Add Photos'}
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
        <View className="border-black-500 mt-8 rounded-md border-2 bg-white">
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
        <View className="border-black-500 mt-8 h-10 rounded-md border-2 bg-white">
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              toggleDatePicker();
            }}
          >
            <View className="flex w-full flex-row items-center justify-between p-2">
              <Ionicons name="calendar-outline" size={20} />
              <TextInput
                className="mx-4 flex-1"
                value={`${date.toDateString()} ${date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
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
        <View className="border-black-500 mt-8 rounded-md border-2 bg-white">
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowMealTypeDropdown(!showMealTypeDropdown);
            }}
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
                    ({ value }: IMealTypeSelectData) =>
                      value !== selectedMealType
                  )
                  .map(({ key, value }: IMealTypeSelectData) => (
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
        <View className="items-center justify-center h-24 w-full bg-white rounded-lg mt-8 shadow-md">
          <Text className="mb-2">How did the meal make you feel?</Text>
          <Rating
            defaultRating={selectedRating}
            onRatingSelected={onRatingSelected}
          />
        </View>
        <View className="mt-10">
          <Pressable
            className="items-center justify-center rounded-md h-14 bg-green-700"
            onPress={addMeal}
          >
            <Text className="text-white text-base font-semibold ">
              Add Meal
            </Text>
          </Pressable>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Page;
