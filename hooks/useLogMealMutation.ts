// External Dependencies
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import FormData from 'form-data';
import { useRouter } from 'expo-router';

// Relative Dependencies

const logMeal = async (data: FormData, accessToken: string | null) => {
  return axios.post('http://localhost:3000/meals/add-meal', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: accessToken,
    },
  });
};

export const useLogMealMutation = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMeals'] });
      router.push('/(tabs)/log');
    },
    mutationKey: ['logMeal'],
    mutationFn: async (mealData: FormData) => {
      const accessToken = await getToken({ template: 'supabase' });
      return logMeal(mealData, accessToken);
    },
  });
};
