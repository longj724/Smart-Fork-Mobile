// External Dependencies
import { Button, Pressable, Text, View } from 'react-native';
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session';
import { useAuth } from '@clerk/clerk-expo';

// Relative Dependencies
import { useStravaActivitiesQuery } from '@/hooks/useStravaActivitiesQuery';
import { useStravaRefreshTokenMutation } from '@/hooks/useStravaRefreshTokenMutation';
import { IStravaRefreshTokenRequest } from '@/types/types';

interface IConnectWorkoutProps {
  selectedDate: Date;
}

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

const ConnectWorkout = ({ selectedDate }: IConnectWorkoutProps) => {
  const [authCode, setAuthCode] = useState<string | null>(null);
  const { userId } = useAuth();

  const { data: stravaData } = useStravaActivitiesQuery(userId);

  const stravaRefreshTokenMutation = useStravaRefreshTokenMutation();

  const [_request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID as string,
      scopes: ['activity:read_all'],
      redirectUri: 'smartfork://oauthredirect',
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      getNewTokens(code);
      setAuthCode(code);
    }
  }, [response]);

  const getNewTokens = async (newAuthCode: string) => {
    const refreshTokenRequest: IStravaRefreshTokenRequest = {
      code: newAuthCode as string,
      clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID as string,
      clientSecret: process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET as string,
      grantType: 'authorization_code',
      userId: userId as string,
    };
    stravaRefreshTokenMutation.mutate(refreshTokenRequest);
  };

  const displayWorkouts = () => {
    const filteredWorkouts =
      stravaData &&
      stravaData.activityData.filter(({ startDateLocal }) => {
        const asDate = new Date(startDateLocal);
        return (
          asDate.getDate() === selectedDate.getDate() &&
          asDate.getMonth() === selectedDate.getMonth()
        );
      });

    if (filteredWorkouts && filteredWorkouts.length > 0) {
      return filteredWorkouts.map((activity) => (
        <View key={`${activity.name}+${activity.startDateLocal}`}>
          <Text className="text-md font-semibold">{activity.name}</Text>
          <View className="flex flex-row justify-evenly w-full mt-4">
            <View className="flex flex-col items-center">
              <FontAwesome6 name="route" size={20} color="#15803D" />
              <Text className="my-1">Distance</Text>
              <Text>{(activity.distance / 1609.34).toFixed(2)} mi</Text>
            </View>
            <View className="flex flex-col items-center">
              <FontAwesome6 name="clock" size={20} color="#15803D" />
              <Text className="my-1">Time</Text>
              <Text>
                {new Date(activity.movingTime * 1000)
                  .toISOString()
                  .slice(11, 19)}
              </Text>
            </View>
            <View className="flex flex-col items-center">
              <FontAwesome6 name="mountain-sun" size={20} color="#15803D" />
              <Text className="my-1">Elevation</Text>
              <Text>
                {(activity.totalElevationGain * 3.28084).toFixed(2)} ft
              </Text>
            </View>
          </View>
        </View>
      ));
    }
    return <Text>No workouts from today found</Text>;
  };

  return (
    <>
      {stravaData && stravaData?.userConnected ? (
        <View className="bg-white p-3 rounded-lg shadow-md flex flex-col justify-evenly">
          {displayWorkouts()}
        </View>
      ) : (
        <View className="bg-white p-2 rounded-lg shadow-md flex flex-row items-center">
          <Text className="text-md mr-auto ml-2">
            Link Strava to view your activities
          </Text>
          <Pressable
            className="flex flex-row rounded-full bg-gray-200 items-center mr-2 bg px-3 py-1"
            onPress={() => promptAsync()}
          >
            <Feather name="plus" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-500 font-semibold">Add</Text>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default ConnectWorkout;
