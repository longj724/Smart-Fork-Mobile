// External Dependencies
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface IRatingProps {
  defaultRating: number;
  onRatingSelected: (rating: number) => void;
}

const Rating = ({ defaultRating, onRatingSelected }: IRatingProps) => {
  const [rating, setRating] = useState<number>(defaultRating);

  const handleRating = (rate: number) => {
    setRating(rate);
    onRatingSelected(rate);
  };

  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((index) => (
        <Pressable
          key={index}
          onPress={() => handleRating(index)}
          className="flex flex-col items-center"
        >
          <MaterialCommunityIcons
            name={index <= rating ? 'food-apple' : 'food-apple-outline'}
            type="material"
            color="#15803D"
            className="mx-2 mb-1"
            size={35}
          />
          {index === 1 && <Text>Terrible</Text>}
          {index === 5 && <Text>Great</Text>}
        </Pressable>
      ))}
    </View>
  );
};

export default Rating;
