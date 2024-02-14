// External Dependencies
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import moment from 'moment';
import DatePicker from 'react-native-modern-datepicker';
import { useRouter } from 'expo-router';

// Relative Dependencies
import Meal from '@/components/Meal';
import { MealData } from '../../../types/types';
import DropdownMenu from '@/components/Dropdown';

const Page = () => {
  const { userId, getToken } = useAuth();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const prevSelectedDateRef = useRef(selectedDate);
  const [viewExtensionsMenu, setViewExtensionsMenu] = useState(false);

  const { data, refetch } = useQuery({
    queryFn: async (): Promise<MealData[]> => {
      const supabaseAccessToken = await getToken({
        template: 'supabase',
      });

      if (userId) {
        const { data } = await axios.get(
          `http://localhost:3000/meals/all-meals/${userId}?datetime=${selectedDate.toISOString()}`,
          {
            headers: {
              Authorization: supabaseAccessToken,
            },
          }
        );
        return data;
      }
      return [];
    },
    enabled: userId !== undefined,
    queryKey: ['allMeals', userId, selectedDate.getMonth()],
  });

  useEffect(() => {
    if (prevSelectedDateRef.current.getMonth() !== selectedDate.getMonth()) {
      refetch();
    }
    prevSelectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const quickAdd = () => {
    router.push('/(modals)/quickAdd');
  };

  const displayDayInHeader = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate()
      ? 'Today'
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
      <View className="flex h-16 flex-row items-center justify-evenly bg-green-700 z-10">
        <Feather
          name="mic"
          size={24}
          style={{ marginRight: 50 }}
          onPress={quickAdd}
          color="white"
        />
        <View className="flex flex-row justify-center gap-2">
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-white"
            onPress={moveBackwardOneDay}
          >
            <Ionicons name="arrow-back-outline" color="black" size={16} />
          </Pressable>
          <Pressable
            className="flex w-28 flex-row items-center justify-center gap-1 rounded-sm bg-white"
            onPress={toggleDatePicker}
          >
            <Text className="font-semibold text-black">
              {displayDayInHeader()}
            </Text>
            <Ionicons name="caret-down-outline" color="black" />
          </Pressable>
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-white"
            onPress={moveForwardOneDay}
          >
            <Ionicons name="arrow-forward-outline" color="black" size={16} />
          </Pressable>
        </View>
        <View className="relative">
          <Entypo
            name="dots-three-horizontal"
            size={24}
            style={{ marginLeft: 50 }}
            color="white"
            onPress={() => setViewExtensionsMenu(!viewExtensionsMenu)}
          />
          {viewExtensionsMenu && (
            <View
              className="absolute right-0 mt-8 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
            >
              <View className="py-1" role="none">
                <Text
                  className="text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  id="menu-item-0"
                >
                  Connect Strava
                </Text>
              </View>
              <View className="py-1" role="none">
                <Text
                  className="text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  id="menu-item-1"
                >
                  Duplicate
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {showDatePicker && (
        <Modal transparent={true} animationType="fade" visible={showDatePicker}>
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View className="flex-1 justify-center">
              <View style={styles.calendar}>
                <DatePicker
                  options={{
                    mainColor: '#15803D',
                  }}
                  mode="calendar"
                  current={selectedDate.toISOString()}
                  selected={selectedDate.toISOString()}
                  onDateChange={(dateString: string) => {
                    const dateObj = new Date(
                      `${dateString.replaceAll('/', '-')}T12:00:00`
                    );

                    setTimeout(() => {
                      setSelectedDate(dateObj);
                      setShowDatePicker(false);
                    }, 500);
                  }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      <ScrollView className="pl-4 pr-4 pb-20">
        {data
          ?.filter(
            ({ datetime }: MealData) =>
              new Date(datetime).getDate() == selectedDate.getDate()
          )
          .sort(
            (meal1: MealData, meal2: MealData) =>
              new Date(meal1.datetime).getTime() -
              new Date(meal2.datetime).getTime()
          )
          .map((meal: MealData) => {
            return (
              <Meal
                id={meal.id.toString()}
                key={meal.datetime.toString()}
                datetime={moment(meal.datetime).toDate()}
                notes={meal?.notes}
                type={meal.type}
                imageUrls={[
                  'https://picsum.photos/200',
                  'https://picsum.photos/id/237/200/300',
                ]} // Should be meal.imageUrls ?? []
              />
            );
          })}
        <View className="h-10"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  calendar: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Page;
