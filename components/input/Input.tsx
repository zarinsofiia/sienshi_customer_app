// components/Input.tsx (React Native) - updated to match your mobile style
import { AlertCircle, CheckCircle } from "lucide-react-native";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface ValidationRules {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: string) => string | null;
}

type UISize = "sm" | "md" | "lg";

interface InputProps
  extends Omit<TextInputProps, "onChange" | "onChangeText" | "value" | "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validationRules?: ValidationRules;
  showValidation?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
  uiSize?: UISize;
  trimEnd?: boolean;


  /** Style for the outer container (View) */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the inner TextInput */
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

const BORDER = "#e5e7eb";
const MUTED = "#6b7280";
const TEXT = "#111827";
const LABEL = "#4b5563";
const BG = "#f9fafb";
const ORANGE = "#f59e0b";

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error: externalError,
      helperText,
      leftIcon,
      rightIcon,
      validationRules,
      showValidation = true,
      uiSize = "md",
      value = "",
      onChangeText,
      onValidationChange,
      containerStyle,
      inputStyle,
      labelStyle,
      onBlur,
      onFocus,
      editable = true,
      placeholderTextColor = "#9ca3af",
      trimEnd = false,
      ...rest
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [focused, setFocused] = useState(false);

    const error = externalError || internalError;
    const showError = touched && !!error && showValidation;
    const showSuccess =
      touched && !error && !!validationRules && !!value && showValidation;

    const sizeConfig: Record<
      UISize,
      { paddingVertical: number; paddingHorizontal: number; fontSize: number }
    > = {
      sm: { paddingVertical: 8, paddingHorizontal: 10, fontSize: 13 },
      md: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 13 },
      lg: { paddingVertical: 12, paddingHorizontal: 14, fontSize: 14 },
    };

    const validateValue = (inputValue: string): string | null => {
      if (!validationRules) return null;

      const {
        required,
        email,
        minLength,
        maxLength,
        pattern,
        min,
        max,
        custom,
      } = validationRules;

      const trimmed = inputValue?.trim?.() ?? "";

      if (required && (!trimmed || trimmed === "")) {
        return "This field is required";
      }
      if (!trimmed) return null;

      if (
        email &&
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)
      ) {
        return "Please enter a valid email address";
      }
      if (minLength && trimmed.length < minLength) {
        return `Must be at least ${minLength} characters long`;
      }
      if (maxLength && trimmed.length > maxLength) {
        return `Must not exceed ${maxLength} characters`;
      }
      if (pattern && !pattern.test(trimmed)) {
        return "Invalid format";
      }

      if (min !== undefined || max !== undefined) {
        const numValue = Number(trimmed);
        if (!Number.isNaN(numValue)) {
          if (min !== undefined && numValue < min) {
            return `Must be at least ${min}`;
          }
          if (max !== undefined && numValue > max) {
            return `Must not exceed ${max}`;
          }
        }
      }

      if (custom) return custom(trimmed);

      return null;
    };

    useEffect(() => {
      if (!validationRules || !touched) return;

      const validationError = validateValue(String(value ?? ""));
      setInternalError(validationError ?? null);

      const valid = !validationError;
      onValidationChange?.(valid, validationError ?? null);
    }, [value, touched, validationRules, onValidationChange]);

    const getValidationIcon = () => {
      if (!showValidation || !validationRules) return null;
      if (showError) return <AlertCircle size={18} color="#ef4444" />;
      if (showSuccess) return <CheckCircle size={18} color="#22c55e" />;
      return null;
    };

    const borderColor = useMemo(() => {
      if (showError) return "#fecaca";
      if (showSuccess) return "#bbf7d0";
      if (focused) return ORANGE;
      return BORDER;
    }, [showError, showSuccess, focused]);

    const sizeStyles = sizeConfig[uiSize];

    const handleBlur: TextInputProps["onBlur"] = (e) => {
      setTouched(true);
      setFocused(false);
      onBlur?.(e);
    };

    const handleFocus: TextInputProps["onFocus"] = (e) => {
      setFocused(true);
      onFocus?.(e);
    };

    return (
      <View style={styles.container}>
        {label ? (
          <Text style={[styles.label, labelStyle]}>
            {label}
            {validationRules?.required ? (
              <Text style={styles.requiredMark}> *</Text>
            ) : null}
          </Text>
        ) : null}

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor,
              backgroundColor: editable ? BG : "#f3f4f6",
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            },
            (showError || showSuccess) && styles.inputWrapperElevated,
            containerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={(text: string) => {
              const next = trimEnd ? text.replace(/\s+$/, "") : text;
              onChangeText?.(next);
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
            editable={editable}
            placeholderTextColor={placeholderTextColor}
            style={[
              styles.input,
              { fontSize: sizeStyles.fontSize, color: editable ? TEXT : MUTED },
              leftIcon ? styles.inputWithLeftIcon : undefined,
              (rightIcon || getValidationIcon())
                ? styles.inputWithRightIcon
                : undefined,
              inputStyle,
            ]}
            {...rest}
          />

          {(rightIcon || getValidationIcon()) ? (
            <View style={styles.iconRight}>{rightIcon || getValidationIcon()}</View>
          ) : null}
        </View>

        {showError ? (
          <View style={styles.helperRow}>
            <AlertCircle size={14} color="#dc2626" style={styles.helperIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: { width: "100%" },

  // ✅ match your page labels
  label: {
    fontSize: 11,
    fontFamily: "Karla-Bold",
    color: LABEL,
    marginBottom: 4,
  },
  requiredMark: { color: "#ef4444" },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  inputWrapperElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.08,
  },

  // ✅ match your inputs
  input: {
    flex: 1,
    fontFamily: "Karla-Regular",
    paddingVertical: 0, // wrapper controls vertical padding
  },

  inputWithLeftIcon: { marginLeft: 6 },
  inputWithRightIcon: { marginRight: 6 },

  iconLeft: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRight: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  helperIcon: { marginRight: 6 },
  errorText: {
    fontSize: 11,
    fontFamily: "Karla-Regular",
    color: "#dc2626",
  },
  helperText: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: "Karla-Regular",
    color: MUTED,
  },
});

export default Input;
