// SignupScreen.js
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Formik} from 'formik';
import * as yup from 'yup';
import CheckBox from '@react-native-community/checkbox';
import AppleIcon from '../../components/icons/AppleIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import LinearGradient from 'react-native-linear-gradient';
import {
  useSignupAPIMutation,
  useGoogleSignupAPIMutation,
  useAppleSignupAPIMutation,
  useGoogleLoginAPIMutation,
  useAppleLoginAPIMutation,
} from '../../features/auth/authApiSlice';
import {useDispatch, batch} from 'react-redux';
import * as Icons from 'react-native-heroicons/solid';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import LoadingSpinner from '../../components/LoadingSpinner';
import showToast from '../../utils/toast/showToast';
import {login, userIntro} from '../../features/auth/authSlice';

/* ================= VALIDATION ================= */

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .trim()
    .matches(
      /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address (e.g. user@example.com)',
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
      'Password must contain uppercase, lowercase letters, and one number',
    ),
  referral_code: yup
    .string()
    .transform(v => v.toUpperCase().trim())
    .matches(
      /^(HAH-[A-Z0-9]{6})?$/,
      'Referral code must be in format HAH-XXXXXX',
    ),
});

/* ================= SCREEN ================= */

const SignupScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);
  const [signupAPI, {isLoading}] = useSignupAPIMutation();
  const [googleSignupAPI] = useGoogleSignupAPIMutation();
  const [appleSignupAPI] = useAppleSignupAPIMutation();
  const [googleLoginAPI] = useGoogleLoginAPIMutation();
  const [appleLoginAPI] = useAppleLoginAPIMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const prefilledEmail = route?.params?.email || '';

  useEffect(() => {
    // webClientId (the Web client from google-services.json) is what makes
    // getTokens() return an idToken - the backend verifies it to prove the
    // Google account on /user/login and /user/signup.
    if (Platform.OS === 'android') {
      GoogleSignin.configure({
        webClientId:
          '255249337110-dcg6dro9iheakfhgr4lahu1soif4idgk.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      });
    } else {
      GoogleSignin.configure({
        iosClientId:
          '255249337110-895kh9cf745nba40h0sm15nl7c7nsfo0.apps.googleusercontent.com',
        webClientId:
          '255249337110-dcg6dro9iheakfhgr4lahu1soif4idgk.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      });
    }
  }, []);

  const handleSignup = async (values, {setSubmitting}) => {
    try {
      const payload = {email: values.email, password: values.password};
      if (values.referral_code?.trim()) {
        payload.referral_code = values.referral_code.trim().toUpperCase();
      }
      const response = await signupAPI(payload).unwrap();
      navigation.navigate('Otp', {
        email: values.email,
        token: response.token,
      });
    } catch (error) {
      showToast(
        'error',
        error?.data?.msg || 'Signup failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = useCallback(async () => {
    try {
      setIsGoogleLoading(true);
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      if (!userInfo?.user?.email) {
        showToast('error', 'Google account did not return an email address.');
        return;
      }

      const payload = {
        first_name: userInfo.user.givenName || 'Google',
        last_name: userInfo.user.familyName || 'User',
        email: userInfo.user.email,
        googleId: userInfo.user.id,
        idToken: tokens?.idToken,
        provider: 'google',
      };

      const response = await googleSignupAPI(payload).unwrap();

      batch(() => {
        dispatch(login({token: response.token}));
        dispatch(userIntro());
      });
      showToast('success', 'Signed in with Google!');
    } catch (error) {
      if (
        error?.status === 409 ||
        error?.data?.msg?.includes('already exists')
      ) {
        showToast('info', 'Account exists. Signing you in...');
        try {
          const userInfo = await GoogleSignin.getCurrentUser();
          const tokens = await GoogleSignin.getTokens();
          const loginPayload = {
            first_name: userInfo.user.givenName || 'Google',
            last_name: userInfo.user.familyName || 'User',
            email: userInfo.user.email,
            googleId: userInfo.user.id,
            idToken: tokens?.idToken,
            provider: 'google',
          };
          const loginResponse = await googleLoginAPI(loginPayload).unwrap();
          batch(() => {
            dispatch(login({token: loginResponse.token}));
            dispatch(userIntro());
          });
          showToast('success', 'Signed in successfully with Google!');
        } catch (loginError) {
          showToast('error', 'Failed to sign in with Google.');
        }
      } else {
        showToast(
          'error',
          error?.data?.msg || 'Failed to sign up with Google.',
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [googleSignupAPI, googleLoginAPI, dispatch]);

  const handleAppleSignup = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      showToast('error', 'Apple Sign-In is only available on iOS');
      return;
    }
    try {
      setIsAppleLoading(true);
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {
        identityToken,
        nonce,
        email,
        fullName,
        user: appleUserId,
      } = appleAuthRequestResponse;
      if (!identityToken) throw new Error('No identity token from Apple');

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );
      const firebaseUserCredential = await auth().signInWithCredential(
        appleCredential,
      );
      const firebaseUser = firebaseUserCredential.user;
      // Proves the Apple sign-in to the backend (apple_auth_service.js)
      const firebaseIdToken = await firebaseUser.getIdToken();
      const userEmail = email || firebaseUser.email;

      if (!userEmail) {
        showToast('error', 'Unable to get email from Apple Sign-In');
        return;
      }

      const payload = {
        first_name: fullName?.givenName || 'Apple',
        last_name: fullName?.familyName || 'User',
        email: userEmail,
        // Apple's own user ID - the Firebase UID is a different value and
        // fails the backend's check against the verified token.
        appleId: appleUserId,
        firebaseUid: firebaseUser.uid,
        firebase_id_token: firebaseIdToken,
        provider: 'apple',
      };

      let response;
      try {
        response = await appleSignupAPI(payload).unwrap();
      } catch (signupError) {
        const userExists =
          signupError?.status === 409 ||
          signupError?.data?.msg?.toLowerCase?.().includes('already exists');
        if (userExists) {
          const loginResponse = await appleLoginAPI(payload).unwrap();
          response = loginResponse;
        } else {
          throw signupError;
        }
      }

      batch(() => {
        dispatch(login({token: response.token}));
        dispatch(userIntro());
      });
      showToast('success', 'Signed in with Apple!');
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) return;
      showToast('error', error?.data?.msg || 'Failed to sign in with Apple.');
    } finally {
      setIsAppleLoading(false);
    }
  }, [appleSignupAPI, appleLoginAPI, dispatch]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.screenWrapper}>
      {(isLoading || isGoogleLoading || isAppleLoading) && <LoadingSpinner />}

      {/* ── GRADIENT HEADER ── */}
      <LinearGradient
        colors={['#0E86B7', '#6EC1E4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroHeader}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icons.ChevronLeftIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
        <Image
          source={require('../../assets/images/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Create Your Space</Text>
        <Text style={styles.heroSubtitle}>
          A place to grow in faith, find{'\n'}community, and walk with purpose.
        </Text>
      </LinearGradient>

      {/* ── FORM CARD ── */}
      <View style={styles.cardContainer}>
        <Formik
          initialValues={{
            email: prefilledEmail,
            password: '',
            referral_code: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSignup}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            isValid,
          }) => (
            <View>
              {/* EMAIL */}
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputbar}>
                <TextInput
                  placeholder="username@gmail.com"
                  placeholderTextColor="#9A9EAE"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.inputField}
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* PASSWORD */}
              <Text style={[styles.inputLabel, {marginTop: 16}]}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputbar}>
                <TextInput
                  placeholder="••••••••••"
                  placeholderTextColor="#9A9EAE"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={!showPassword}
                  style={styles.inputField}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                  {showPassword ? (
                    <Icons.EyeIcon size={20} color="#9A9EAE" />
                  ) : (
                    <Icons.EyeSlashIcon size={20} color="#9A9EAE" />
                  )}
                </TouchableOpacity>
              </View>

              {/* PASSWORD HINTS */}
              <View style={styles.hintsContainer}>
                <PasswordHint
                  valid={values.password.length >= 8}
                  label="Minimum of 8 characters"
                />
                <PasswordHint
                  valid={
                    /[A-Z]/.test(values.password) &&
                    /[a-z]/.test(values.password) &&
                    /[0-9]/.test(values.password)
                  }
                  label="Uppercase, lowercase letters, and one number"
                />
              </View>

              {/* REFERRAL CODE */}
              <Text style={[styles.inputLabel, {marginTop: 20}]}>
                Referral Code{' '}
                <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <View style={styles.inputbar}>
                <TextInput
                  placeholder="HAH-XXXXXX"
                  placeholderTextColor="#9A9EAE"
                  value={values.referral_code}
                  onChangeText={text =>
                    handleChange('referral_code')(text.toUpperCase())
                  }
                  onBlur={handleBlur('referral_code')}
                  autoCapitalize="characters"
                  style={styles.inputField}
                />
              </View>
              {touched.referral_code && errors.referral_code && (
                <Text style={styles.errorText}>{errors.referral_code}</Text>
              )}

              {/* TERMS */}
              <View style={styles.termsRow}>
                <View style={styles.checkboxHitbox}>
                  <CheckBox
                    value={isChecked}
                    onValueChange={setIsChecked}
                    tintColors={{true: '#1F96D9', false: '#D0D5DD'}}
                    style={styles.checkbox}
                  />
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('TermOfUse')}>
                    Terms & Conditions
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate('PrivacyPolicy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              {/* CREATE ACCOUNT BUTTON */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!isChecked || !isValid || isSubmitting) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!isChecked || !isValid || isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#0077B6" />
                ) : (
                  <Text style={styles.createButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* OR DIVIDER */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.divider} />
              </View>

              {/* SOCIAL BUTTONS */}
              <View style={styles.socialButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    isGoogleLoading && styles.disabledButton,
                  ]}
                  onPress={handleGoogleSignup}
                  disabled={isGoogleLoading}>
                  {isGoogleLoading ? (
                    <ActivityIndicator size="small" color="#0077B6" />
                  ) : (
                    <GoogleIcon size={26} color="#0077B6" />
                  )}
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[
                      styles.socialButton,
                      isAppleLoading && styles.disabledButton,
                    ]}
                    onPress={handleAppleSignup}
                    disabled={isAppleLoading}>
                    {isAppleLoading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <AppleIcon color="#0077B6" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Formik>

        {/* FOOTER */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

/* ── Password hint row ── */
const PasswordHint = ({valid, label}) => (
  <View style={styles.hintRow}>
    <Icons.CheckCircleIcon size={16} color={valid ? '#12B76A' : '#D0D5DD'} />
    <Text style={[styles.hintText, valid && styles.hintValid]}>{label}</Text>
  </View>
);

export default SignupScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screenWrapper: {
    flexGrow: 1,
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
    minHeight: 280,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 6,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ── CARD ── */
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },

  /* ── INPUTS ── */
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  required: {
    color: '#1A1A2E',
  },
  optionalLabel: {
    color: '#9A9EAE',
    fontWeight: '400',
    fontSize: 13,
  },
  inputbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 28,
    backgroundColor: '#EFEFEF',
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#040641',
  },
  errorText: {
    color: '#F04438',
    marginTop: 5,
    fontSize: 12,
  },

  /* ── PASSWORD HINTS ── */
  hintsContainer: {
    marginTop: 10,
    gap: 6,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 13,
    color: '#9A9EAE',
  },
  hintValid: {
    color: '#12B76A',
  },

  /* ── TERMS ── */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  checkboxHitbox: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    transform: [{scaleX: 0.85}, {scaleY: 0.85}],
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    color: '#475467',
    fontSize: 13,
    lineHeight: 18,
  },
  linkText: {
    color: '#0077B6',
    fontWeight: '500',
  },

  /* ── CREATE ACCOUNT BUTTON (outline) ── */
  createButton: {
    height: 54,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#0077B6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  createButtonText: {
    color: '#0077B6',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },

  /* ── DIVIDER ── */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  divider: {
    flex: 1,
    height: 0.8,
    backgroundColor: '#D0D3DC',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#9A9EAE',
    fontWeight: '500',
    fontSize: 13,
  },

  /* ── SOCIAL BUTTONS ── */
  socialButtonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    height: 58,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBEBEB',
  },

  /* ── FOOTER ── */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    color: '#4B5673',
  },
  footerLink: {
    color: '#0077B6',
    fontWeight: '600',
  },
});
