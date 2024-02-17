// External Dependencies
import { Stack } from 'expo-router';

const LogLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          headerTitle: 'Log',
        }}
      />
    </Stack>
  );
};

export default LogLayout;
