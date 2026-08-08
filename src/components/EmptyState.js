// src/components/EmptyState.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import Button from './Button';
import {Colors, FontSize, FontWeight, Spacing} from '../constants';

const EmptyState = ({
  icon = 'inbox-outline',
  title = 'Data Tidak Ditemukan',
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={56} color={Colors.gray300} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.sm,
  },
});

export default EmptyState;
