// External Dependencies
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { IMessage } from '@/types/types';

const sendMessage = async (
  userId: string | null | undefined,
  message: string,
  accessToken: string | null
) => {
  const data = {
    message,
    userId,
  };

  return axios.post('http://localhost:3000/insights/send-message', data, {
    headers: {
      Authorization: accessToken,
    },
  });
};

export const useSendMessagesMutation = (userId: string | null | undefined) => {
  const { getToken } = useAuth();

  return useMutation({
    mutationKey: ['sendMessage'],
    mutationFn: async (message: string) => {
      const accessToken = await getToken({ template: 'supabase' });
      return sendMessage(userId, message, accessToken);
    },
  });
};
