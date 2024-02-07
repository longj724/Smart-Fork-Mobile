// Extenral Dependencies
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Feather, EvilIcons, Entypo } from '@expo/vector-icons';
import { AVPlaybackStatus, Audio } from 'expo-av';
import { interpolate, useSharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import FormData from 'form-data';
// import Animated, { useAnimatedStyle } from "react-native-reanimated";

// Relative Dependencies
import LoadingIndicator from '@/components/LoadingIndicator';

// Interfaces
interface Memo {
  uri: string;
  metering: number[];
}

const Page = () => {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [audioMetering, setAudioMetering] = useState<number[]>([]);
  const [memo, setMemo] = useState<Memo>({ uri: '', metering: [] });
  const [lines, setLines] = useState<number[]>([]);

  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;
  const progress = (position as number) / (duration as number);

  const metering = useSharedValue(-100);
  let numLines = 50;

  const { mutateAsync: quickAddMutation, isPending: quickAddPending } =
    useMutation({
      mutationFn: async (data: FormData) => {
        const supabaseAccessToken = await getToken({
          template: 'supabase',
        });

        return axios.post('http://localhost:3000/meals/quick-add', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: supabaseAccessToken,
          },
        });
      },
      onSuccess: () => {
        router.back();
      },
      onError: () => {},
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['allMeals'] });
      },
      mutationKey: ['quickAdd'],
    });

  const quickAddMealHandler = async () => {
    if (recordedUri) {
      const formData = new FormData();
      formData.append('audio-meal-note', {
        uri: recordedUri,
        name: 'meal-voice-note',
      });
      formData.append('userId', userId);
      formData.append('datetime', JSON.stringify(new Date()));
      quickAddMutation(formData);
    }
  };

  useEffect(() => {
    let newLines = [];
    for (let i = 0; i < numLines && memo.metering.length; i++) {
      const meteringIndex = Math.floor((i * memo.metering.length) / numLines);
      const nextMeteringIndex = Math.ceil(
        ((i + 1) * memo.metering.length) / numLines
      );
      const values = memo.metering.slice(meteringIndex, nextMeteringIndex);
      const average = values.reduce((sum, a) => sum + a, 0) / values.length;
      newLines.push(average);
    }
    setLines(newLines);
  }, [memo]);

  const formatMillis = (millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const seconds = Math.floor((millis % (1000 * 60)) / 1000);

    return `${minutes}:${seconds < 10 && '0'}${seconds}`;
  };

  // const animatedIndicatorStyle = useAnimatedStyle(() => ({
  //   left: `${progress * 100}%`,
  // }));

  // const animatedRedCircle = useAnimatedStyle(() => ({
  //   width: withTiming(recording ? "60%" : "100%"),
  //   borderRadius: withTiming(recording ? 5 : 35),
  // }));

  // const animatedRecordWave = useAnimatedStyle(() => {
  //   const size = withTiming(
  //     interpolate(metering.value, [-160, -60, 0], [0, 0, -100]),
  //     { duration: 100 }
  //   );
  //   return {
  //     top: size,
  //     bottom: size,
  //     left: size,
  //     right: size,
  //   };
  // });

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
    })();
  }, []);

  const startRecording = async () => {
    try {
      setAudioMetering([]);

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100
      );
      setRecording(recording);
      setIsRecording(true);

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          metering.value = status.metering || -100;
          setAudioMetering((curVal) => [...curVal, status.metering || -100]);
        }
      });
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);
    setRecordedUri(uri);

    if (uri) {
      setMemo({ uri, metering: audioMetering });
    }
  };

  const loadRecording = async () => {
    if (recordedUri) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { progressUpdateIntervalMillis: 1000 / 60 },
        onPlaybackStatusUpdate
      );
      setSound(sound);
    }
  };

  const playRecording = async () => {
    if (!sound) {
      return;
    }

    if (status?.isLoaded && status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.replayAsync();
    }
  };

  const deleteRecording = async () => {
    setIsRecording(false);
    setRecording(null);
    setRecordedUri(null);
    setSound(null);
    setAudioMetering([]);
    setMemo({ uri: '', metering: [] });
    setLines([]);
  };

  const onPlaybackStatusUpdate = async (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      await sound?.setPositionAsync(0);
    }
  };

  useEffect(() => {
    loadRecording();
  }, [recordedUri]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  if (quickAddPending) {
    return <LoadingIndicator />;
  }

  return (
    <View className="flex-1 flex  items-center">
      <View style={styles.dot} className="mt-16">
        <Feather name="mic" size={72} color="#fff" />
      </View>

      {/* <View>
        <Animated.View style={[styles.recordWaves, animatedRecordWave]} />
        <Pressable style={styles.recordButton} onPress={() => {}}>
          <Animated.View
            style={[styles.redCircle, animatedRedCircle]}
            className="flex items-center justify-center"
          >
            <Ionicons name="mic-outline" size={40} />
          </Animated.View>
        </Pressable>
      </View> */}

      {recordedUri && (
        <View style={styles.wave} className="mt-16 pl-4 pr-4">
          {lines.map((db, index) => (
            <View
              key={index}
              style={[
                styles.waveLine,
                {
                  height: interpolate(db, [-60, 0], [5, 50]),
                  backgroundColor:
                    progress > index / lines.length ? 'royalblue' : 'gainsboro',
                },
              ]}
            />
          ))}
        </View>
      )}

      <Text className="mt-4">
        {formatMillis(position || 0)} / {formatMillis(duration || 0)}
      </Text>

      <View className="flex flex-col absolute items-center bottom-28">
        <View className="flex flex-row gap-4">
          <View style={styles.playButton}>
            <Pressable
              onPress={
                isRecording
                  ? stopRecording
                  : recordedUri
                  ? playRecording
                  : startRecording
              }
            >
              <Entypo
                style={[{ marginLeft: !isRecording ? 6 : 0 }]}
                name={isRecording ? 'controller-stop' : 'controller-play'}
                size={36}
                color="white"
              />
            </Pressable>
          </View>
          {recordedUri && (
            <View style={styles.playButton}>
              <Pressable onPress={deleteRecording}>
                <EvilIcons name="undo" size={36} color="white" />
              </Pressable>
            </View>
          )}
        </View>

        <Text className="mt-4 text-lg text-center">
          Record a voice note of your meal
        </Text>
      </View>

      {recordedUri && (
        <View className="absolute bottom-8 w-1/2">
          <Pressable
            className="bg-green-700 items-center justify-center rounded-md h-12"
            onPress={quickAddMealHandler}
          >
            <Text className="text-white text-base font-semibold">Add Meal</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dot: {
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 75,
    height: 75,
    borderRadius: 75,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackContainer: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  playbackBackground: {
    height: 3,
    backgroundColor: 'gainsboro',
    borderRadius: 5,
  },
  playbackIndicator: {
    width: 10,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'royalblue',
    position: 'absolute',
  },
  pulse: {
    position: 'absolute',
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    borderRadius: 50, // Half of width/height to make it circular
    backgroundColor: 'rgba(0,0,0,0.2)', // Example color
  },
  // redCircle: {
  //   backgroundColor: "orangered",
  //   aspectRatio: 1,
  //   borderRadius: 30,
  // },
  // recordWaves: {
  //   backgroundColor: "#FF000055",
  //   ...StyleSheet.absoluteFillObject,
  //   width: "25%",
  //   aspectRatio: 1,
  //   top: -20,
  //   bottom: -20,
  //   left: -20,
  //   right: -20,
  //   borderRadius: 1000,
  // },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  waveLine: {
    flex: 1,
    height: 30,
    backgroundColor: 'gainsboro',
    borderRadius: 20,
  },
});

export default Page;
