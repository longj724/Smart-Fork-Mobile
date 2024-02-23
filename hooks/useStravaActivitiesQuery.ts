// External Dependencies
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { IStravaData } from '@/types/types';

const fetchStravaActivities = async (
  userId: string | null | undefined,
  accessToken: string | null
) => {
  const { data } = await axios.get(
    `http://localhost:3000/workouts/strava-activities/${userId}`,
    {
      headers: {
        Authorization: accessToken,
      },
    }
  );

  return data as IStravaData;
};

export const useStravaActivitiesQuery = (userId: string | null | undefined) => {
  const { getToken } = useAuth();

  return useQuery({
    retry: false,
    enabled: userId !== null && userId !== undefined,
    queryKey: ['stravaActivities', userId],
    queryFn: async () => {
      const accessToken = await getToken({ template: 'supabase' });
      return fetchStravaActivities(userId, accessToken);
    },
  });
};
