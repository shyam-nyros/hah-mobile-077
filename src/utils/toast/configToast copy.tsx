import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ToastConfig} from 'react-native-toast-message';

type ToastVisualConfig = {
  icon: string;
  accent: string;
  background: string;
  title: string;
};

const TOAST_VARIANTS: Record<string, ToastVisualConfig> = {
  success: {
    icon: '✓',
    accent: '#22c55e',
    background: '#f0fdf4',
    title: 'Success',
  },
  error: {
    icon: '⚠️',
    accent: '#f87171',
    background: '#fef2f2',
    title: 'Something went wrong',
  },
  info: {
    icon: 'ℹ️',
    accent: '#38bdf8',
    background: '#f0f9ff',
    title: 'Heads up',
  },
};

const renderToast =
  (variant: keyof typeof TOAST_VARIANTS) => (internalState: any) => {
    const {text1, text2, props} = internalState;
    const config = TOAST_VARIANTS[variant] ?? TOAST_VARIANTS.info;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: config.background,
            borderColor: `${config.accent}33`,
          },
        ]}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: `${config.accent}1a`,
              borderColor: `${config.accent}40`,
            },
          ]}>
          <Text style={[styles.icon, {color: config.accent}]}>
            {config.icon}
          </Text>
        </View>
        <View style={styles.textWrapper}>
          <Text
            style={[styles.title, {color: config.accent}]}
            numberOfLines={1}>
            {props?.title || text1 || config.title}
          </Text>
          {(text2 || props?.message) && (
            <Text style={styles.message} numberOfLines={3}>
              {text2 || props?.message}
            </Text>
          )}
        </View>
      </View>
    );
  };

const toastConfig: ToastConfig = {
  success: renderToast('success'),
  error: renderToast('error'),
  info: renderToast('info'),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 18,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 18,
  },
});

export default toastConfig;
