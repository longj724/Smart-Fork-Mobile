// External Dependencies
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import FormData from 'form-data';

// Relative Dependencies

const quickAdd = async (data: FormData, accessToken: string | null) =>
  axios.post('http://localhost:3000/meals/quick-add', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: accessToken,
    },
  });

export const useQuickAddMutation = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMeals'] });
      router.back();
    },
    mutationKey: ['quickAdd'],
    mutationFn: async (data: FormData) => {
      const accessToken = await getToken({ template: 'supabase' });
      return quickAdd(data, accessToken);
    },
  });
};
