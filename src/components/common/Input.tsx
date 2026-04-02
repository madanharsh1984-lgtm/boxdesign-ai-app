import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  NativeTransitionsGuiContext,
} from 'react-native';
import { colours } from '@/theme/colours';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  prefix?: string;
  suffix?: string;
  editable?: boolean;
  hint?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required,
  multiline,
  numberOfLines,
  maxLength,
  keyboardType,
  secureTextEntry,
  prefix,
  suffix,
  editable = true,
  hint,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const getBorderColor = () => {
    if (error) return colours.error;
    if (isFocused) return colours.primary;
    return colours.border;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.asterisk}> *</Text>}
        </Text>
      </View>

      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          multiline && { height: (numberOfLines || 4) * 24 },
          !editable && styles.disabledBg,
        ]}
      >
        {prefix && (
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={[styles.input, !editable && styles.disabledText]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colours.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {suffix && (
          <View style={styles.suffixContainer}>
            <Text style={styles.suffixText}>{suffix}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hintText}>{hint}</Text>
        ) : (
          <View />
        )}

        {maxLength && (
          <Text style={styles.counter}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  labelRow: {
    marginBottom: 4,
  },
  label: {
    ...typography.label,
    color: colours.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  asterisk: {
    color: colours.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.bgCard,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: colours.border,
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colours.border,
  },
  prefixText: {
    color: colours.textSecondary,
    fontSize: 14,
  },
  input: {
    flex: 1,
    padding: 12,
    color: colours.textPrimary,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  suffixContainer: {
    paddingHorizontal: 12,
  },
  suffixText: {
    color: colours.textSecondary,
    fontSize: 14,
  },
  disabledBg: {
    backgroundColor: colours.bg,
  },
  disabledText: {
    color: colours.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 16,
  },
  errorText: {
    color: colours.error,
    fontSize: 12,
  },
  hintText: {
    color: colours.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  counter: {
    color: colours.textSecondary,
    fontSize: 10,
  },
});

export default Input;
