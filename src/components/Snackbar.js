// src/components/Snackbar.js
import React, {useEffect, useRef} from 'react';
import {Animated, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {
  Colors,
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
} from '../constants';

const Snackbar = ({
  visible,
  message,
  type = 'info', // info | success | warning | error
  duration = 3000,
  onDismiss,
  actionLabel,
  onAction,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const typeConfig = {
    info: {icon: 'information', bg: Colors.primary},
    success: {icon: 'check-circle', bg: Colors.success},
    warning: {icon: 'alert', bg: Colors.warning},
    error: {icon: 'alert-circle', bg: Colors.error},
  };
  const cfg = typeConfig[type] || typeConfig.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss && onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: cfg.bg, transform: [{translateY}], opacity},
      ]}>
      <Icon
        name={cfg.icon}
        size={20}
        color={Colors.white}
        style={styles.icon}
      />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {marginRight: Spacing.sm},
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
  action: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    textDecorationLine: 'underline',
  },
});

export default Snackbar;
