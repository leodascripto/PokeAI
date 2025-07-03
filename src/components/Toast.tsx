import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
  actionText?: string;
  onAction?: () => void;
}

const { width } = Dimensions.get('window');

const toastIcons: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  warning: 'warning',
  info: 'information-circle'
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
  actionText,
  onAction
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      showToast();
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration]);

  const showToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide();
    });
  };

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745'];
      case 'error':
        return isDark ? ['#FF453A', '#DC3545'] : ['#FF3B30', '#DC3545'];
      case 'warning':
        return isDark ? ['#FF9F0A', '#F39C12'] : ['#FF9500', '#F39C12'];
      case 'info':
        return isDark ? ['#64D2FF', '#007AFF'] : ['#007AFF', '#0056B3'];
      default:
        return [colors.primary, colors.secondary];
    }
  };

  const getIconColor = () => {
    return '#FFFFFF';
  };

  if (!visible) return null;

  const topOffset = insets.top + (Platform.OS === 'ios' ? 10 : 20);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topOffset,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <LinearGradient
        colors={getToastColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.toast, { backgroundColor: colors.surface }]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={toastIcons[type] as any}
              size={24}
              color={getIconColor()}
            />
          </View>
          
          <Text style={[styles.message, { color: '#FFFFFF' }]} numberOfLines={2}>
            {message}
          </Text>

          {actionText && onAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAction}
            >
              <Text style={styles.actionText}>{actionText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideToast}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 10,
  },
  toast: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

// Hook para usar o Toast
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    actionText?: string;
    onAction?: () => void;
  }>({
    visible: false,
    message: '',
    type: 'info'
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    actionText?: string,
    onAction?: () => void
  ) => {
    setToast({
      visible: true,
      message,
      type,
      actionText,
      onAction
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = () => (
    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      onHide={hideToast}
      actionText={toast.actionText}
      onAction={toast.onAction}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent
  };
};