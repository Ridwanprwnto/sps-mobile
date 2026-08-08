// src/components/Card.js
import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, BorderRadius, Spacing, Shadow} from '../constants';

const Card = ({
  children,
  onPress,
  style,
  padding = 'md',
  shadow = 'sm',
  radius = 'lg',
}) => {
  const paddings = {
    none: 0,
    sm: Spacing.sm,
    md: Spacing.base,
    lg: Spacing.xl,
  };

  const containerStyle = [
    styles.card,
    {
      padding: paddings[padding] ?? paddings.md,
      borderRadius: BorderRadius[radius] ?? BorderRadius.lg,
      ...Shadow[shadow],
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
  },
});

export default Card;
