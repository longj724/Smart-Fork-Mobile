import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { interpolate } from 'react-native-reanimated';

// Interfaces
interface IAudioMeterProps {
  meterValues: number[];
  position: number;
  duration?: number;
}

const AudioMeter = ({ meterValues, position, duration }: IAudioMeterProps) => {
  const [lines, setLines] = useState<number[]>([]);
  const progress = (position as number) / (duration as number);

  const isRecording = false;

  let numLines = 50;

  useEffect(() => {
    let newLines = [];
    for (let i = 0; i < numLines && meterValues.length; i++) {
      const meteringIndex = Math.floor((i * meterValues.length) / numLines);
      const nextMeteringIndex = Math.ceil(
        ((i + 1) * meterValues.length) / numLines
      );
      const values = meterValues.slice(meteringIndex, nextMeteringIndex);
      const average = values.reduce((sum, a) => sum + a, 0) / values.length;
      newLines.push(average);
    }
    setLines(newLines);
  }, [meterValues]);

  const formatMillis = (millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const seconds = Math.floor((millis % (1000 * 60)) / 1000);

    return `${minutes}:${seconds < 10 && '0'}${seconds}`;
  };

  return (
    <View className="flex flex-col flex-1 items-center p-5">
      <View style={styles.wave} className="mt-16 pl-4 pr-4">
        {lines.map((db, index) => (
          <View
            key={index}
            style={[
              styles.waveLine,
              {
                height: interpolate(db, [-50, 0], [5, 150]),
                backgroundColor:
                  progress > index / lines.length ? 'royalblue' : 'gainsboro',
              },
            ]}
          />
        ))}
      </View>

      <Text className="mt-4">
        {formatMillis(position || 0)} / {formatMillis(duration || 0)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 75,
    height: 75,
    borderRadius: 75,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
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

export default AudioMeter;
