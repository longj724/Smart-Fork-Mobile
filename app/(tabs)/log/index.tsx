// External Dependencies
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { DateTime } from 'luxon';
import DatePicker from 'react-native-modern-datepicker';
import { useRouter } from 'expo-router';

// Relative Dependencies
import Meal from '@/components/Meal';
import { IMealData } from '../../../types/types';
import { useAllMealsQuery } from '@/hooks/useAllMealsQuery';
import ConnectWorkout from '@/components/ConnectWorkout';

const Page = () => {
  const { userId } = useAuth();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const prevSelectedDateRef = useRef(selectedDate);

  const { data, refetch } = useAllMealsQuery(userId, selectedDate);

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
    return selectedDate.toDateString() === today.toDateString()
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

  const displayMeals = () => {
    const filteredData = data
      ?.filter(
        ({ datetime }: IMealData) =>
          new Date(datetime).getDate() == selectedDate.getDate()
      )
      .sort(
        (meal1: IMealData, meal2: IMealData) =>
          new Date(meal1.datetime).getTime() -
          new Date(meal2.datetime).getTime()
      );

    if (filteredData && filteredData?.length > 0) {
      return filteredData.map((meal: IMealData) => (
        <Meal
          id={meal.id.toString()}
          key={meal.datetime.toString()}
          datetime={DateTime.fromISO(meal.datetime)}
          notes={meal?.notes}
          type={meal.type}
          imageUrls={meal?.imageUrls ?? []}
        />
      ));
    }
    return (
      <View className="p-3 mb-2 flex flex-row rounded-lg bg-white shadow-md">
        <Text>No meals from today added</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex h-16 flex-row items-center justify-between bg-white">
        <Feather
          name="mic"
          size={24}
          style={{ marginLeft: 20 }}
          onPress={quickAdd}
          color="#15803D"
        />
        <View className="flex flex-row justify-center gap-2">
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-green-700"
            onPress={moveBackwardOneDay}
          >
            <Ionicons name="arrow-back-outline" color="white" size={16} />
          </Pressable>
          <Pressable
            className="flex w-28 flex-row items-center justify-center gap-1 rounded-sm bg-green-700"
            onPress={toggleDatePicker}
          >
            <Text className="font-semibold text-white">
              {displayDayInHeader()}
            </Text>
            <Ionicons name="caret-down-outline" color="white" />
          </Pressable>
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-sm bg-green-700"
            onPress={moveForwardOneDay}
          >
            <Ionicons name="arrow-forward-outline" color="white" size={16} />
          </Pressable>
        </View>
        {/* Empty View to balance the layout */}
        <View style={{ width: 24, marginLeft: 20, opacity: 0 }}></View>
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
      <ScrollView className="pl-4 pr-4 pb-20 bg-gray-200">
        <Text className="text-lg font-bold my-2">Meals</Text>
        {displayMeals()}
        <Text className="text-lg font-bold mb-2">Workouts</Text>
        <ConnectWorkout selectedDate={selectedDate} />
        <View className="h-10 bg-gray-200"></View>
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
