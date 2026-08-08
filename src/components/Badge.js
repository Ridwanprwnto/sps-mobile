// src/components/Badge.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Colors,
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
} from '../constants';

const Badge = ({label, color, bg, size = 'sm', style}) => {
  const sizeConfig = {
    xs: {fontSize: 9, px: 5, py: 2},
    sm: {fontSize: 11, px: 8, py: 3},
    md: {fontSize: 13, px: 10, py: 4},
  };
  const cfg = sizeConfig[size] || sizeConfig.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg || Colors.gray100,
          paddingHorizontal: cfg.px,
          paddingVertical: cfg.py,
        },
        style,
      ]}>
      <Text
        style={[
          styles.label,
          {
            fontSize: cfg.fontSize,
            color: color || Colors.gray600,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.3,
  },
});

export default Badge;
