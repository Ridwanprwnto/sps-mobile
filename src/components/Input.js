// src/components/Input.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {
  Colors,
  FontSize,
  FontWeight,
  BorderRadius,
  Spacing,
} from '../constants';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  iconLeft,
  iconRight,
  onIconRightPress,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  style,
  inputStyle,
  required,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const borderColor = error
    ? Colors.error
    : focused
    ? Colors.accent
    : Colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}> *</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: editable ? Colors.white : Colors.gray50,
          },
          focused && styles.inputWrapperFocused,
        ]}>
        {iconLeft && (
          <Icon
            name={iconLeft}
            size={20}
            color={focused ? Colors.accent : Colors.gray400}
            style={styles.iconLeft}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              paddingLeft: iconLeft ? 0 : Spacing.base,
              paddingRight: iconRight || isPassword ? 0 : Spacing.base,
              color: editable ? Colors.textPrimary : Colors.gray400,
              minHeight: multiline ? numberOfLines * 40 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray300}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur && onBlur();
          }}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.gray400}
            />
          </TouchableOpacity>
        )}

        {!isPassword && iconRight && (
          <TouchableOpacity
            onPress={onIconRightPress}
            style={styles.iconRight}
            disabled={!onIconRightPress}>
            <Icon
              name={iconRight}
              size={20}
              color={focused ? Colors.accent : Colors.gray400}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={13} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
  },
  required: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    shadowColor: Colors.accent,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
  },
  iconLeft: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.xs,
  },
  iconRight: {
    paddingRight: Spacing.base,
    paddingLeft: Spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 4,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default Input;
