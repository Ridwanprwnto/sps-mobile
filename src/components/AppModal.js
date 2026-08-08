// src/components/AppModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import Button from './Button';
import {
  Colors,
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
  Shadow,
} from '../constants';

const AppModal = ({
  visible,
  onClose,
  title,
  children,
  footer,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  isLoading = false,
  size = 'md', // sm | md | lg | full
  scrollable = false,
}) => {
  const sizeStyle = {
    sm: {maxHeight: '60%'},
    md: {maxHeight: '65%'},
    lg: {maxHeight: '85%'},
    full: {maxHeight: '95%'},
  };

  const Content = scrollable ? ScrollView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, sizeStyle[size] || sizeStyle.md]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Icon name="close" size={22} color={Colors.gray500} />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Body */}
              <Content
                style={styles.body}
                contentContainerStyle={
                  scrollable ? styles.scrollContent : undefined
                }
                showsVerticalScrollIndicator={false}>
                {children}
              </Content>

              {/* Footer */}
              {(footer || confirmLabel || cancelLabel) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.footer}>
                    {footer || (
                      <>
                        {cancelLabel && (
                          <Button
                            title={cancelLabel}
                            onPress={onCancel || onClose}
                            variant="outline"
                            size="md"
                            style={styles.footerBtn}
                          />
                        )}
                        {confirmLabel && (
                          <Button
                            title={confirmLabel}
                            onPress={onConfirm}
                            variant={confirmVariant}
                            size="md"
                            loading={isLoading}
                            style={styles.footerBtn}
                          />
                        )}
                      </>
                    )}
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    width: '100%',
    ...Shadow.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  body: {
    padding: Spacing.lg,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  footerBtn: {
    flex: 1,
  },
});

export default AppModal;
