// src/components/ConfirmDialog.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import AppModal from './AppModal';
import {Colors, FontSize, FontWeight, Spacing} from '../constants';

const ConfirmDialog = ({
  visible,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  type = 'info', // info | warning | danger | success
  confirmVariant,
  isLoading = false,
}) => {
  const typeConfig = {
    info: {
      icon: 'information',
      color: Colors.info,
      bg: Colors.infoBg,
      variant: 'primary',
    },
    warning: {
      icon: 'alert',
      color: Colors.warning,
      bg: Colors.warningBg,
      variant: 'secondary',
    },
    danger: {
      icon: 'alert-circle',
      color: Colors.error,
      bg: Colors.errorBg,
      variant: 'danger',
    },
    success: {
      icon: 'check-circle',
      color: Colors.success,
      bg: Colors.successBg,
      variant: 'success',
    },
  };
  const cfg = typeConfig[type] || typeConfig.info;

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onClose}
      confirmVariant={confirmVariant || cfg.variant}
      isLoading={isLoading}
      scrollable={true}>
      <View style={styles.body}>
        <View style={[styles.iconWrap, {backgroundColor: cfg.bg}]}>
          <Icon name={cfg.icon} size={32} color={cfg.color} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ConfirmDialog;
