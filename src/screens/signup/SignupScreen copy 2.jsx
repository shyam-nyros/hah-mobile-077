// SignupScreen.js
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
import {
  useSignupAPIMutation,
  useGoogleSignupAPIMutation,
  useAppleSignupAPIMutation,
  useGoogleLoginAPIMutation,
  useAppleLoginAPIMutation,
} from '../../features/auth/authApiSlice';
import {useDispatch} from 'react-redux';
import * as Icons from 'react-native-heroicons/solid';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import LoadingSpinner from '../../components/LoadingSpinner';
import showToast from '../../utils/toast/showToast';
import {login, userIntro} from '../../features/auth/authSlice';

/* ================= VALIDATION (UNCHANGED) ================= */

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const prefilledEmail = route?.params?.email || '';

  useEffect(() => {
    if (Platform.OS === 'android') {
      GoogleSignin.configure({scopes: ['email', 'profile']});
    } else {
      GoogleSignin.configure({
        iosClientId:
          '255249337110-895kh9cf745nba40h0sm15nl7c7nsfo0.apps.googleusercontent.com',
        scopes: ['email', 'profile'],
      });
    }
  }, []);

  const handleSignup = async (values, {setSubmitting}) => {
    try {
      const response = await signupAPI({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
      }).unwrap();
      navigation.navigate('Otp', {
        email: values.email,
        token: response.token,
      });
    } catch (error) {
      showToast('error', error?.data?.msg || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = useCallback(async () => {
    console.log('[SignupScreen] ===== handleGoogleSignup START =====');
    try {
      setIsGoogleLoading(true);
      if (Platform.OS === 'android') {
        console.log('[SignupScreen] Checking Google Play Services...');
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      console.log('[SignupScreen] Signing out any existing Google session...');
      await GoogleSignin.signOut();

      console.log('[SignupScreen] Initiating Google Sign-in...');
      const userInfo = await GoogleSignin.signIn();
      console.log(
        '[SignupScreen] Google Sign-in successful, email:',
        userInfo?.user?.email,
      );

      console.log('[SignupScreen] Getting Google tokens...');
      const tokens = await GoogleSignin.getTokens();

      if (!userInfo?.user?.email) {
        console.log('[SignupScreen] ERROR: No email from Google');
        showToast('error', 'Google account did not return an email address.');
        return;
      }

      const payload = {
        first_name: userInfo.user.givenName || 'Google',
        last_name: userInfo.user.familyName || 'User',
        email: userInfo.user.email,
        googleId: userInfo.user.id,
        googleAccessToken: tokens?.accessToken,
        googleRefreshToken: tokens?.refreshToken,
        provider: 'google',
      };

      console.log('[SignupScreen] Calling googleSignupAPI...');
      const response = await googleSignupAPI(payload).unwrap();
      console.log('[SignupScreen] Google signup API response received');

      if (
        response?.registration_completed === true ||
        response?.provider === 'google'
      ) {
        console.log(
          '[SignupScreen] User registration complete - dispatching userIntro()',
        );
        dispatch(userIntro());
      }
      dispatch(login({token: response.token}));

      showToast('success', 'Signed up successfully with Google!');
      console.log('[SignupScreen] ===== handleGoogleSignup END SUCCESS =====');
    } catch (error) {
      console.error('[SignupScreen] Google signup error:', error);
      if (
        error?.status === 409 ||
        error?.data?.msg?.includes('already exists')
      ) {
        console.log('[SignupScreen] User exists, trying login instead...');
        showToast('info', 'Account exists. Signing you in...');
        try {
          const userInfo = await GoogleSignin.getCurrentUser();
          const tokens = await GoogleSignin.getTokens();
          const loginPayload = {
            first_name: userInfo.user.givenName || 'Google',
            last_name: userInfo.user.familyName || 'User',
            email: userInfo.user.email,
            googleId: userInfo.user.id,
            googleAccessToken: tokens?.accessToken,
            googleRefreshToken: tokens?.refreshToken,
            provider: 'google',
          };
          const loginResponse = await googleLoginAPI(loginPayload).unwrap();
          dispatch(login({token: loginResponse.token}));
          showToast('success', 'Signed in successfully with Google!');
        } catch (loginError) {
          console.error(
            '[SignupScreen] Google login fallback failed:',
            loginError,
          );
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
    console.log('[SignupScreen] ===== handleAppleSignup START =====');
    if (Platform.OS !== 'ios') {
      showToast('error', 'Apple Sign-In is only available on iOS');
      return;
    }

    try {
      setIsAppleLoading(true);
      console.log('[SignupScreen] Initiating Apple Sign-in...');
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {identityToken, nonce, email, fullName} = appleAuthRequestResponse;
      if (!identityToken) throw new Error('No identity token from Apple');

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );
      const firebaseUserCredential = await auth().signInWithCredential(
        appleCredential,
      );
      const firebaseUser = firebaseUserCredential.user;
      const userEmail = email || firebaseUser.email;

      if (!userEmail) {
        showToast('error', 'Unable to get email from Apple Sign-In');
        return;
      }

      const payload = {
        first_name: fullName?.givenName || 'Apple',
        last_name: fullName?.familyName || 'User',
        email: userEmail,
        appleId: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        provider: 'apple',
      };

      let response;

      try {
        console.log('[SignupScreen] Calling appleSignupAPI...');
        response = await appleSignupAPI(payload).unwrap();
      } catch (signupError) {
        const userExists =
          signupError?.status === 409 ||
          signupError?.data?.msg?.toLowerCase?.().includes('already exists');

        if (userExists) {
          console.log('[SignupScreen] User exists, logging in directly...');
          const loginResponse = await appleLoginAPI(payload).unwrap();
          response = loginResponse;
        } else {
          throw signupError;
        }
      }

      if (response?.registration_completed === true) {
        dispatch(userIntro());
      }
      dispatch(login({token: response.token}));
      showToast('success', 'Signed in successfully with Apple!');
      console.log('[SignupScreen] ===== handleAppleSignup END SUCCESS =====');
    } catch (error) {
      console.error('[SignupScreen] Apple signup error:', error);
      if (error.code === appleAuth.Error.CANCELED) {
        return;
      }
      showToast('error', error?.data?.msg || 'Failed to sign in with Apple.');
    } finally {
      setIsAppleLoading(false);
    }
  }, [appleSignupAPI, appleLoginAPI, dispatch]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.screenWrapper}>
      {isLoading && <LoadingSpinner />}

      {/* ================= HERO HEADER (Signin style) ================= */}
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}>
          <ImageBackground
            source={require('../../assets/images/Signinbgimage.png')}
            resizeMode="cover"
            style={styles.heroHeader}
            imageStyle={styles.heroHeaderImage}>
            <SafeAreaView style={styles.heroInner}>
              <TouchableOpacity
                style={[
                  styles.fakeGlass,
                  {position: 'absolute', top: 50, left: 20, zIndex: 10},
                ]}
                onPress={() => navigation.goBack()}>
                <Icons.ChevronLeftIcon size={22} color="#1F2937" />
              </TouchableOpacity>
              <View style={styles.heroContent}>
                <Image
                  source={require('../../assets/images/logosmall1.png')}
                  style={styles.heroLogo}
                />

                <Text style={styles.heroTitle}>Welcome to</Text>
                <Text style={styles.heroTitle}>Heaven at Hand</Text>

                <Text style={styles.heroSubtitle}>
                  Sign up to continue your journey
                </Text>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </KeyboardAwareScrollView>
      </View>

      {/* ================= CARD ================= */}
      <View style={styles.cardContainer}>
        {/* SOCIAL (VISUAL ONLY – unchanged logic) */}
        <View style={styles.socialButtonGroup}>
          <TouchableOpacity
            style={[
              styles.socialButton,
              isGoogleLoading && styles.disabledButton,
            ]}
            onPress={handleGoogleSignup}
            disabled={isGoogleLoading}>
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <Image
                  source={require('../../assets/images/google-icon.png')}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialLabel}>Continue with Google</Text>
              </>
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
                <>
                  <AppleIcon size={20} color="#000" style={styles.socialIcon} />
                  <Text style={styles.socialLabel}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.divider} />
        </View>

        {/* ================= FORM ================= */}
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: prefilledEmail,
            password: '',
            confirmPassword: '',
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
            <View style={{gap: 10}}>
              {/* FIRST NAME */}
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputbar}>
                <Image
                  source={require('../../assets/images/personoutlineicon.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter first name"
                  placeholderTextColor="#9A9EAE"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  style={styles.inputField}
                />
              </View>
              {touched.firstName && errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}

              {/* LAST NAME */}
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputbar}>
                <Image
                  source={require('../../assets/images/personoutlineicon.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter last name"
                  placeholderTextColor="#9A9EAE"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  style={styles.inputField}
                />
              </View>
              {touched.lastName && errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}

              {/* EMAIL */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputbar}>
                <Image
                  source={require('../../assets/images/emailicon.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter email"
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
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputbar}>
                <Icons.LockClosedIcon size={20} color="#9A9EAE" />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#9A9EAE"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={!showPassword}
                  style={[styles.inputField, {marginLeft: 8}]}
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

              {/* CONFIRM PASSWORD */}
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputbar}>
                <Icons.LockClosedIcon size={20} color="#9A9EAE" />
                <TextInput
                  placeholder="Re-enter password"
                  placeholderTextColor="#9A9EAE"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.inputField, {marginLeft: 8}]}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(p => !p)}>
                  {showConfirmPassword ? (
                    <Icons.EyeIcon size={20} color="#9A9EAE" />
                  ) : (
                    <Icons.EyeSlashIcon size={20} color="#9A9EAE" />
                  )}
                </TouchableOpacity>
              </View>
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
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

                <View style={styles.termsTextWrapper}>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </View>
              </View>

              {/* CTA */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!isChecked || !isValid || isSubmitting) &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!isChecked || !isValid || isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* FOOTER (UNCHANGED NAV) */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
            <Text style={styles.footerLink}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

    </KeyboardAwareScrollView>
  );
};

export default SignupScreen;

/* ================= STYLES (MATCH SIGNIN) ================= */

const styles = StyleSheet.create({
  screenWrapper: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },

  heroHeader: {
    height: 265,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroHeaderImage: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  heroInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 0,
  },

  backButton: {
    width: 40,
    paddingVertical: 8,
  },

  backIcon: {
    width: 30,
    height: 30,
  },

  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },

  heroLogo: {
    width: 210,
    height: 85,
    resizeMode: 'contain',
    marginBottom: 0,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F4868',
  },

  heroSubtitle: {
    fontSize: 15,
    color: '#747C96',
    marginTop: 8,
    textAlign: 'center',
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },

  socialButtonGroup: {
    rowGap: 20,
  },
  socialButton: {
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2A2A2A',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#ADB0BB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#ADB0BB',
    fontWeight: '600',
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3F4868',
  },
  inputbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#F5F5F5',
    borderColor: '#DBDBDB',
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: '#9A9EAE',
  },
  inputField: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#040641',
  },
  errorText: {
    color: '#F04438',
    marginTop: 4,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center', // TRUE visual centering
    marginTop: 12,
  },

  checkboxHitbox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkbox: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },

  termsTextWrapper: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },

  termsText: {
    color: '#475467',
    fontSize: 13,
    lineHeight: 18,
  },

  linkText: {
    color: '#0077B6',
    fontWeight: '500',
  },

  primaryButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1F96D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#4B5673',
  },
  footerLink: {
    color: '#0077B6',
    fontWeight: '600',
  },
  fakeGlass: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.53)',
  },
});
