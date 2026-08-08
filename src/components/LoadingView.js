// src/components/LoadingView.js
import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {Colors, FontSize, Spacing} from '../constants';

const LoadingView = ({message = 'Memuat data...', fullScreen = true}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={Colors.primary} />
      <Text style={styles.inlineText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  message: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  inlineText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

export default LoadingView;
