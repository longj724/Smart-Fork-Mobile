import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';

const LoadingIndicator = () => {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#15803D" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: 'F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingIndicator;
