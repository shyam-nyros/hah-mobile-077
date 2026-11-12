import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  AppState,
  Platform,
  Linking,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {StarIcon as StarSolid} from 'react-native-heroicons/solid';
import {StarIcon as StarOutline} from 'react-native-heroicons/outline';
import {
  useRegisterAppOpenAPIMutation,
  useSubmitAppFeedbackAPIMutation,
  useDismissAppFeedbackAPIMutation,
  useMarkAppFeedbackStoreRedirectedAPIMutation,
} from '../../features/feedback/appFeedbackApiSlice';

// Counts app opens and, when the backend says so (the 11th open, see
// backend app_feedback_controller.js), shows a "rate the app" popup on Home.
//
// An "open" is a cold start, or coming back to the app after it has been in
// the background for at least RESUME_COUNTS_AFTER_MS (so switching to the
// photo picker or answering a call doesn't count as a new open).

const RESUME_COUNTS_AFTER_MS = 30 * 60 * 1000; // 30 minutes

const APP_STORE_REVIEW_URL =
  'https://apps.apple.com/us/app/heaven-at-hand/id6739997898?action=write-review';
const PLAY_STORE_MARKET_URL = 'market://details?id=com.hah';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.hah';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

// Module level so the cold-start open is only counted once per app process,
// even if the Home screen remounts (e.g. after logout/login).
let coldStartCountedForToken = null;

const AppFeedbackPrompt = () => {
  const {token, isLoggedIn} = useSelector(state => state.auth);
  const isFocused = useIsFocused();

  const [registerAppOpen] = useRegisterAppOpenAPIMutation();
  const [submitFeedback, {isLoading: isSubmitting}] =
    useSubmitAppFeedbackAPIMutation();
  const [dismissFeedback] = useDismissAppFeedbackAPIMutation();
  const [markStoreRedirected] = useMarkAppFeedbackStoreRedirectedAPIMutation();

  const [promptPending, setPromptPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState('rate'); // 'rate' | 'thanks'
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [feedbackId, setFeedbackId] = useState(null);

  const backgroundedAt = useRef(null);

  const countOpen = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const res = await registerAppOpen({
        platform: Platform.OS,
        os_version: String(Platform.Version ?? ''),
      }).unwrap();
      if (res?.show_feedback_prompt) {
        setPromptPending(true);
      }
    } catch (e) {
      // Never block the Home screen because of feedback tracking
    }
  }, [token, registerAppOpen]);

  // Cold start
  useEffect(() => {
    if (isLoggedIn && token && coldStartCountedForToken !== token) {
      coldStartCountedForToken = token;
      countOpen();
    }
  }, [isLoggedIn, token, countOpen]);

  // Returning from background after a while
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (away >= RESUME_COUNTS_AFTER_MS) {
          countOpen();
        }
      }
    });
    return () => sub.remove();
  }, [countOpen]);

  // Only show while the Home screen is actually on screen
  useEffect(() => {
    if (promptPending && isFocused && !visible) {
      setStep('rate');
      setRating(0);
      setComment('');
      setError('');
      setFeedbackId(null);
      setVisible(true);
      setPromptPending(false);
    }
  }, [promptPending, isFocused, visible]);

  const handleMaybeLater = () => {
    setVisible(false);
    dismissFeedback().catch(() => {});
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    try {
      const res = await submitFeedback({
        rating,
        feedback: comment.trim(),
        platform: Platform.OS,
        os_version: String(Platform.Version ?? ''),
      }).unwrap();
      setFeedbackId(res?.data?._id || null);
      setStep('thanks');
    } catch (e) {
      setError('Could not send your feedback. Please try again.');
    }
  };

  const openStore = async () => {
    if (feedbackId) {
      markStoreRedirected(feedbackId).catch(() => {});
    }
    setVisible(false);
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(APP_STORE_REVIEW_URL);
      } else {
        const canOpenMarket = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
        await Linking.openURL(
          canOpenMarket ? PLAY_STORE_MARKET_URL : PLAY_STORE_URL,
        );
      }
    } catch (e) {
      Linking.openURL(
        Platform.OS === 'ios' ? APP_STORE_REVIEW_URL : PLAY_STORE_URL,
      ).catch(() => {});
    }
  };

  if (!visible) {
    return null;
  }

  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={step === 'rate' ? handleMaybeLater : () => setVisible(false)}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          {step === 'rate' ? (
            <>
              <Text style={styles.title}>Enjoying Heaven at Hand?</Text>
              <Text style={styles.subtitle}>
                We'd love to hear what you think. How would you rate the app?
              </Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(value => {
                  const Icon = value <= rating ? StarSolid : StarOutline;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => {
                        setRating(value);
                        setError('');
                      }}
                      hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}
                      accessibilityLabel={`${value} star${value > 1 ? 's' : ''}`}>
                      <Icon
                        size={36}
                        color={value <= rating ? '#F5B301' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.ratingLabel}>
                {rating ? RATING_LABELS[rating] : ' '}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Tell us more (optional)"
                placeholderTextColor="#94A3B8"
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={2000}
                textAlignVertical="top"
              />

              {!!error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, !rating && styles.primaryBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMaybeLater} disabled={isSubmitting}>
                <Text style={styles.secondaryText}>Maybe later</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Thank you!</Text>
              <Text style={styles.subtitle}>
                {rating >= 4
                  ? `Glad you're enjoying it. Would you take a moment to rate us on the ${storeName}? It really helps others find the app.`
                  : 'Thanks for your feedback. We read every response and will use it to make the app better.'}
              </Text>
              {rating >= 4 ? (
                <>
                  <TouchableOpacity style={styles.primaryBtn} onPress={openStore}>
                    <Text style={styles.primaryBtnText}>
                      Rate on the {storeName}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <Text style={styles.secondaryText}>No thanks</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setVisible(false)}>
                  <Text style={styles.primaryBtnText}>Close</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    color: '#0077B6',
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 12,
  },
  input: {
    minHeight: 90,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0077B6',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryText: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 14,
  },
});

export default AppFeedbackPrompt;
