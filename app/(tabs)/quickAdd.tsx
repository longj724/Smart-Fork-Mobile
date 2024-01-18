// Extenral Dependencies
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { AVPlaybackStatus, Audio } from "expo-av";
import {
  Extrapolate,
  interpolate,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

// Relative Dependencies

// Interfaces
interface Memo {
  uri: string;
  metering: number[];
}

const Page = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [audioMetering, setAudioMetering] = useState<number[]>([]);
  const [memo, setMemo] = useState<Memo>({ uri: "", metering: [] });
  const [lines, setLines] = useState<number[]>([]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;
  const progress = (position as number) / (duration as number);

  const metering = useSharedValue(-100);
  let numLines = 50;

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

    return `${minutes}:${seconds < 10 && "0"}${seconds}`;
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`,
  }));

  const animatedRecordWave = useAnimatedStyle(() => {
    const size = withTiming(
      interpolate(metering.value, [-160, -60, 0], [0, 0, -100]),
      { duration: 100 }
    );
    return {
      top: size,
      bottom: size,
      left: size,
      right: size,
    };
  });

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
      console.error("Failed to start recording", error);
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

  return (
    <View className="flex-1 justify-center items-center ">
      <Pressable
        className="flex flex-col items-center"
        onPress={isRecording ? stopRecording : startRecording}
      >
        {/* <Animated.View style={[styles.recordWaves, animatedRecordWave]} /> */}

        <Feather
          name="mic"
          size={72}
          color={isRecording ? "red" : "blue"}
          className="z-10"
        />
        <Text className="mt-4 text-lg">Record</Text>
      </Pressable>

      <View style={styles.wave}>
        {lines.map((db, index) => (
          <View
            style={[
              styles.waveLine,
              {
                height: interpolate(db, [-60, 0], [5, 50], Extrapolate.CLAMP),
                backgroundColor:
                  progress > index / lines.length ? "royalblue" : "gainsboro",
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.container}>
        <FontAwesome5
          name={isPlaying ? "pause" : "play"}
          size={20}
          color="gray"
          onPress={playRecording}
        />
        <View style={styles.playbackContainer}>
          <View style={styles.playbackBackground} />

          <Animated.View
            style={[styles.playbackIndicator, animatedIndicatorStyle]}
          />

          <Text style={{ position: "absolute", right: 0, bottom: 0 }}>
            {formatMillis(position || 0)} / {formatMillis(duration || 0)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  playbackContainer: {
    flex: 1,
    height: 50,
    justifyContent: "center",
  },
  playbackBackground: {
    height: 3,
    backgroundColor: "gainsboro",
    borderRadius: 5,
  },
  playbackIndicator: {
    width: 10,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "royalblue",
    position: "absolute",
  },
  pulse: {
    position: "absolute",
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    borderRadius: 50, // Half of width/height to make it circular
    backgroundColor: "rgba(0,0,0,0.2)", // Example color
  },
  recordWaves: {
    backgroundColor: "#FF000055",
    ...StyleSheet.absoluteFillObject,
    width: "150%",
    aspectRatio: 1,
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    zIndex: -1000,
  },
  wave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  waveLine: {
    flex: 1,
    height: 30,
    backgroundColor: "gainsboro",
    borderRadius: 20,
  },
});

export default Page;
