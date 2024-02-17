// External Dependencies
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { IMealData } from '@/types/types';

const fetchMeals = async (
  userId: string | null | undefined,
  selectedDate: Date,
  accessToken: string | null
): Promise<IMealData[]> => {
  const { data } = await axios.get(
    `http://localhost:3000/meals/all-meals/${userId}?datetime=${selectedDate.toISOString()}`,
    {
      headers: {
        Authorization: accessToken,
      },
    }
  );
  return data;
};

export const useAllMealsQuery = (
  userId: string | null | undefined,
  selectedDate: Date
) => {
  const { getToken } = useAuth();

  return useQuery({
    enabled: userId !== undefined,
    queryKey: ['allMeals', userId, selectedDate.getMonth()],
    queryFn: async (): Promise<IMealData[]> => {
      const accessToken = await getToken({ template: 'supabase' });
      return fetchMeals(userId, selectedDate, accessToken);
    },
  });
};
