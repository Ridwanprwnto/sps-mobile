// src/components/Header.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/material-design-icons';
import {Colors, FontSize, FontWeight, Spacing} from '../constants';

const Header = ({
  title,
  subtitle,
  onBack,
  rightActions,
  backgroundColor = Colors.primary,
  textColor = Colors.white,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent ? 'transparent' : backgroundColor,
          paddingTop: insets.top + (StatusBar.currentHeight || 0),
        },
      ]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        translucent={transparent}
      />
      <View style={styles.inner}>
        {/* Left - Back Button */}
        <View style={styles.side}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Icon name="arrow-left" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.center}>
          <Text style={[styles.title, {color: textColor}]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, {color: textColor + 'CC'}]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right - Actions */}
        <View style={[styles.side, styles.rightSide]}>
          {rightActions &&
            rightActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={action.onPress}
                style={styles.actionBtn}>
                <Icon name={action.icon} size={22} color={textColor} />
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  side: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    width: 'auto',
    minWidth: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  backBtn: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
  actionBtn: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
});

export default Header;
