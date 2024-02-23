// External Dependencies
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { IStravaRefreshTokenRequest } from '@/types/types';

const getRefreshToken = async (
  data: IStravaRefreshTokenRequest,
  accessToken: string | null
) => {
  return axios.post(
    'http://localhost:3000/workouts/create-strava-access-token',
    data,
    {
      headers: {
        Authorization: accessToken,
      },
    }
  );
};

export const useStravaRefreshTokenMutation = () => {
  const { getToken } = useAuth();

  return useMutation({
    onSuccess: () => {},
    mutationKey: ['stravaRefreshToken'],
    mutationFn: async (data: IStravaRefreshTokenRequest) => {
      const accessToken = await getToken({ template: 'supabase' });
      return getRefreshToken(data, accessToken);
    },
  });
};
