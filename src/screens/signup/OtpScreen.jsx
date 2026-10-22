import {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Icons from 'react-native-heroicons/solid';

import showToast from '../../utils/toast/showToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  useResendOtpAPIMutation,
  useVerifyOtpAPIMutation,
  useVerifyUserAPIMutation,
} from '../../features/auth/authApiSlice';
import {useDispatch, batch} from 'react-redux';
import {login, userIntro} from '../../features/auth/authSlice';

const CELL_COUNT = 4;

const formatTime = seconds => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const OtpScreen = ({route, navigation}) => {
  const params = route?.params ?? {};
  const {email = '', token: signupToken = ''} = params;
  const dispatch = useDispatch();

  const [verifyOtpAPI, {isLoading}] = useVerifyOtpAPIMutation();
  const [verifyUserAPI, {isLoading: isVerifyingUser}] =
    useVerifyUserAPIMutation();
  const [resendOtpAPI, {isLoading: resendOTPLoading}] =
    useResendOtpAPIMutation();

  // ── state declared BEFORE hooks that depend on it ──
  const [value, setValue] = useState('');
  const [counter, setCounter] = useState(60);

  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = async () => {
    if (value.length < CELL_COUNT) {
      showToast('error', `Enter ${CELL_COUNT}-digit OTP`);
      return;
    }
    if (!email) {
      showToast('error', 'No email provided for OTP verification.');
      return;
    }
    try {
      const otpResponse = await verifyOtpAPI({email, otp: value}).unwrap();
      const tokenToUse = otpResponse.token || signupToken;
      await verifyUserAPI({email}).unwrap();
      batch(() => {
        dispatch(login({token: tokenToUse}));
        dispatch(userIntro());
      });
      showToast('success', otpResponse.msg || 'Email verified successfully!');
    } catch (error) {
      showToast('error', error?.data?.msg || 'Verification failed.');
    }
  };

  const resendOTP = async () => {
    if (!email) {
      showToast('error', 'No email provided to resend OTP.');
      return;
    }
    try {
      const response = await resendOtpAPI({email}).unwrap();
      setCounter(60);
      showToast('success', response.msg);
    } catch (error) {
      showToast('error', error?.data || error.error);
    }
  };

  const isResendEnabled = counter === 0 && !resendOTPLoading;

  return (
    <KeyboardAvoidingView
      style={styles.screenWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {(isLoading || isVerifyingUser || resendOTPLoading) && <LoadingSpinner />}

      {/* ── GRADIENT HEADER ── */}
      <LinearGradient
        colors={['#0E86B7', '#6EC1E4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroHeader}>
        {/* <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icons.ChevronLeftIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView> */}
        <Text style={styles.heroTitle}>Verify Your Email</Text>
        <Text style={styles.heroSubtitle}>
          {'Enter the code sent to your email\n'}
          <Text style={styles.heroEmail}>{email || 'your email'}</Text>
          {' to continue.'}
        </Text>
      </LinearGradient>

      {/* ── WHITE CONTENT ── */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled">
        {/* OTP CELLS */}
        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({index, symbol, isFocused}) => (
            <View
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cell, isFocused && styles.cellFocused]}>
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {/* TIMER */}
        <Text style={styles.timerText}>
          {'Code expires in: '}
          <Text style={styles.timerCount}>{formatTime(counter)}</Text>
        </Text>

        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (value.length < CELL_COUNT || isLoading || isVerifyingUser) &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={value.length < CELL_COUNT || isLoading || isVerifyingUser}>
          {isLoading || isVerifyingUser ? (
            <ActivityIndicator color="#0077B6" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* RESEND */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Haven't got the email yet? </Text>
          <TouchableOpacity onPress={resendOTP} disabled={!isResendEnabled}>
            <Text
              style={[
                styles.resendLink,
                !isResendEnabled && styles.resendLinkDisabled,
              ]}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── HEADER ── */
  heroHeader: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    minHeight: 220,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    marginTop: 10,
    marginLeft: 16,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  heroEmail: {
    fontWeight: '600',
  },

  /* ── CONTENT ── */
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
    alignItems: 'center',
  },

  /* ── OTP CELLS ── */
  codeFieldRoot: {
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  cell: {
    width: 58,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D0D3DC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellFocused: {
    borderColor: '#0077B6',
    borderWidth: 2,
  },
  cellText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    textAlign: 'center',
  },

  /* ── TIMER ── */
  timerText: {
    fontSize: 14,
    color: '#9A9EAE',
    marginBottom: 28,
  },
  timerCount: {
    fontWeight: '700',
    color: '#1A1A2E',
  },

  /* ── VERIFY BUTTON ── */
  verifyButton: {
    width: '100%',
    height: 54,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#0077B6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  verifyButtonText: {
    color: '#0077B6',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },

  /* ── RESEND ── */
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    color: '#4B5673',
    fontSize: 14,
  },
  resendLink: {
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: '#9A9EAE',
    textDecorationLine: 'none',
  },
});
