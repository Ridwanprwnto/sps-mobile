// src/components/Button.js
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {
  Colors,
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
} from '../constants';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const sizeConfig = {
    sm: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      fontSize: FontSize.sm,
      iconSize: 16,
      borderRadius: BorderRadius.sm,
    },
    md: {
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.lg,
      fontSize: FontSize.md,
      iconSize: 20,
      borderRadius: BorderRadius.md,
    },
    lg: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      fontSize: FontSize.base,
      iconSize: 22,
      borderRadius: BorderRadius.lg,
    },
  };

  const variantConfig = {
    primary: {
      bg: Colors.primary,
      bgPressed: Colors.primaryLight,
      text: Colors.white,
      border: 'transparent',
    },
    secondary: {
      bg: Colors.accent,
      bgPressed: Colors.accentDark,
      text: Colors.white,
      border: 'transparent',
    },
    outline: {
      bg: 'transparent',
      bgPressed: Colors.gray100,
      text: Colors.primary,
      border: Colors.primary,
    },
    ghost: {
      bg: 'transparent',
      bgPressed: Colors.gray100,
      text: Colors.primary,
      border: 'transparent',
    },
    danger: {
      bg: Colors.error,
      bgPressed: Colors.errorLight,
      text: Colors.white,
      border: 'transparent',
    },
    success: {
      bg: Colors.success,
      bgPressed: Colors.successLight,
      text: Colors.white,
      border: 'transparent',
    },
  };

  const cfg = sizeConfig[size] || sizeConfig.md;
  const vcfg = variantConfig[variant] || variantConfig.primary;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: isDisabled ? Colors.gray200 : vcfg.bg,
          borderColor: isDisabled ? Colors.gray300 : vcfg.border,
          paddingVertical: cfg.paddingVertical,
          paddingHorizontal: cfg.paddingHorizontal,
          borderRadius: cfg.borderRadius,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? Colors.primary
              : Colors.white
          }
        />
      ) : (
        <View style={styles.row}>
          {iconLeft && (
            <Icon
              name={iconLeft}
              size={cfg.iconSize}
              color={isDisabled ? Colors.gray400 : vcfg.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: cfg.fontSize,
                color: isDisabled ? Colors.gray400 : vcfg.text,
                fontWeight: FontWeight.semiBold,
              },
              textStyle,
            ]}>
            {title}
          </Text>
          {iconRight && (
            <Icon
              name={iconRight}
              size={cfg.iconSize}
              color={isDisabled ? Colors.gray400 : vcfg.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});

export default Button;
