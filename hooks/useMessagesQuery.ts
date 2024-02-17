// External Dependencies
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { IMessage } from '@/types/types';

const fetchMessages = async (
  userId: string | null | undefined,
  accessToken: string | null
) => {
  const { data } = await axios.get(
    `http://localhost:3000/insights/messages/${userId}`,
    {
      headers: {
        Authorization: accessToken,
      },
    }
  );

  const messageResponse: IMessage[] = JSON.parse(data.messages);

  return messageResponse;
};

export const useMessagesQuery = (userId: string | null | undefined) => {
  const { getToken } = useAuth();

  return useQuery({
    enabled: userId !== null,
    queryKey: ['messages', userId],
    queryFn: async () => {
      const accessToken = await getToken({ template: 'supabase' });
      return fetchMessages(userId, accessToken);
    },
  });
};
