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
import {Formik} from 'formik';
import * as yup from 'yup';
import {useDispatch, batch} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AppleIcon from '../../components/icons/AppleIcon';
import GoogleIcon from '../../components/icons/GoogleIcon';
import * as Icons from 'react-native-heroicons/solid';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import {
  useLoginAPIMutation,
  useGoogleSignupAPIMutation,
  useGoogleLoginAPIMutation,
  useAppleLoginAPIMutation,
  useAppleSignupAPIMutation,
} from '../../features/auth/authApiSlice';

import {login, userIntro} from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import showToast from '../../utils/toast/showToast';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import appleAuth from '@invertase/react-native-apple-authentication';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .trim()
    .matches(
      /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address (e.g. user@example.com)',
    ),
  password: yup.string().required('Password is required'),
});

const SigninScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const [loginAPI, {isLoading: isEmailLoading}] = useLoginAPIMutation();
  const [googleLoginAPI, {isLoading: isGoogleLoading}] =
    useGoogleLoginAPIMutation();
  const [googleSignupAPI] = useGoogleSignupAPIMutation();
  const [appleLoginAPI] = useAppleLoginAPIMutation();
  const [appleSignupAPI] = useAppleSignupAPIMutation();
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleEmailSubmit = async (values, {setSubmitting}) => {
    const normalizedEmail = values.email.trim().toLowerCase();
    try {
      const response = await loginAPI({
        email: normalizedEmail,
        password: values.password,
      }).unwrap();

      if (response.otpVerified === false) {
        // Account exists but email was never verified.
        // Backend has already auto-generated and emailed a fresh OTP.
        showToast('info', 'A verification code has been sent to your email.');
        navigation.navigate('Otp', {
          email: normalizedEmail,
          token: response.token, // carry token so OTP screen can use it after verify
        });
        return;
      }

      // Fully verified user — proceed normally
      batch(() => {
        dispatch(login({token: response.token}));
        dispatch(userIntro());
      });
    } catch (error) {
      const status = error?.status;
      if (status === 404) {
        // No account at all → send to signup with email pre-filled
        navigation.navigate('Signup', {email: normalizedEmail});
      } else {
        showToast('error', error?.data?.msg || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignin = useCallback(async () => {
    try {
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

      let response;
      let isNewUser = false;
      try {
        response = await googleLoginAPI(payload).unwrap();
      } catch (error) {
        if (error?.data?.needsSignup || error?.status === 404) {
          const signupResponse = await googleSignupAPI(payload).unwrap();
          response = signupResponse;
          isNewUser = true;
        } else {
          throw error;
        }
      }

      batch(() => {
        dispatch(login({token: response.token}));
        dispatch(userIntro());
      });
      showToast('success', 'Signed in successfully with Google!');
    } catch (error) {
      showToast(
        'error',
        error?.data?.msg || error?.message || 'Google sign-in failed',
      );
    }
  }, [dispatch]);

  const handleAppleSignin = useCallback(async () => {
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

      if (!identityToken) {
        throw new Error('No identity token received from Apple');
      }

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

      const userEmail =
        email || firebaseUser.email || `${firebaseUser.uid}@apple.com`;
      const firstName =
        fullName?.givenName ||
        firebaseUser.displayName?.split(' ')[0] ||
        'Apple';
      const lastName =
        fullName?.familyName ||
        firebaseUser.displayName?.split(' ')[1] ||
        'User';

      const payload = {
        first_name: firstName,
        last_name: lastName,
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
          response = await appleLoginAPI(payload).unwrap();
        } else {
          throw signupError;
        }
      }

      batch(() => {
        dispatch(login({token: response.token}));
        dispatch(userIntro());
      });
      showToast('success', 'Signed in successfully with Apple!');
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        return;
      }
      showToast(
        'error',
        error?.data?.msg || error?.message || 'Failed to sign in with Apple',
      );
    } finally {
      setIsAppleLoading(false);
    }
  }, [appleSignupAPI, appleLoginAPI, dispatch]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.screenWrapper}>
      {(isGoogleLoading || isAppleLoading) && <LoadingSpinner />}

      {/* BLUE HEADER */}
      {/* <View style={styles.heroHeader}>
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icons.ChevronLeftIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>
        <Text style={styles.heroTitle}>Welcome Back</Text>
        <Text style={styles.heroSubtitle}>
          Continue your journey where you left off.
        </Text>
      </View> */}
      <LinearGradient
        colors={['#0E86B7', '#6EC1E4']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroHeader}>
        <SafeAreaView style={styles.safeArea} />
        <Image
          source={require('../../assets/images/logo_white.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Welcome Back</Text>
        <Text style={styles.heroSubtitle}>
          Continue your journey where you left off.
        </Text>
      </LinearGradient>

      {/* FORM CARD */}
      <View style={styles.cardContainer}>
        <Formik
          initialValues={{email: '', password: ''}}
          validationSchema={validationSchema}
          onSubmit={handleEmailSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
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
              <Text style={[styles.inputLabel, {marginTop: 18}]}>
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
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* FORGOT PASSWORD */}
              <TouchableOpacity
                style={styles.forgotContainer}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* SIGN IN BUTTON */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  (isSubmitting || isEmailLoading) && styles.disabledButton,
                ]}
                disabled={isSubmitting || isEmailLoading}
                onPress={handleSubmit}>
                {isSubmitting || isEmailLoading ? (
                  <ActivityIndicator color="#0077B6" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
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
                  style={styles.socialButton}
                  onPress={handleGoogleSignin}
                  disabled={isGoogleLoading}>
                  <GoogleIcon size={26} color="#0077B6" />
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[
                      styles.socialButton,
                      isAppleLoading && styles.disabledButton,
                    ]}
                    onPress={handleAppleSignin}
                    disabled={isAppleLoading}>
                    <AppleIcon color="#0077B6" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Formik>

        {/* FOOTER */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

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
    minHeight: 260,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 4,
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
    fontSize: 34,
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

  /* ── FORGOT ── */
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotText: {
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
  },

  /* ── SIGN IN BUTTON (outline) ── */
  signInButton: {
    height: 54,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#0077B6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  signInButtonText: {
    color: '#0077B6',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
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
    backgroundColor: '#F2F4F7',
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
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

export default SigninScreen;
