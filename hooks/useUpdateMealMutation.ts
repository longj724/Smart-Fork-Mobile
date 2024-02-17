// External Dependencies
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

// Relative Dependencies
import { IMealUpdateData } from '@/types/types';

const updateMeal = async (
  mealData: IMealUpdateData,
  accessToken: string | null
) =>
  axios.post('http://localhost:3000/meals/update-meal', mealData, {
    headers: {
      Authorization: accessToken,
    },
  });

export const useUpdateMealMutation = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMeals'] });
      router.back();
    },
    mutationKey: ['updateMeal'],
    mutationFn: async (mealData: IMealUpdateData) => {
      const accessToken = await getToken({ template: 'supabase' });
      return updateMeal(mealData, accessToken);
    },
  });
};
