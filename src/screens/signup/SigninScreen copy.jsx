// SigninScreen.js
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import {
  useLoginAPIMutation,
  useGoogleLoginAPIMutation,
} from '../../features/auth/authApiSlice';
import {
  login,
  signup,
  userIntro,
  verifyOtp,
} from '../../features/auth/authSlice';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch, useSelector} from 'react-redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import showToast from '../../utils/toast/showToast';

// Define the validation schema using yup
const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(25, 'Password cannot be more than 25 characters'),
});

const SigninScreen = ({navigation}) => {
  const {firstName} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(true);
  const [loginAPI, {isLoading}] = useLoginAPIMutation();
  const [googleLoginAPI, {isLoading: isGoogleLoading}] =
    useGoogleLoginAPIMutation();
  const [googleInitError, setGoogleInitError] = useState(null);

  const handleSignin = async (values, {setSubmitting, resetForm}) => {
    try {
      setSubmitting(true);
      console.log('🔐 Login attempt with email:', values.email);

      const response = await loginAPI({
        email: values.email,
        password: values.password,
      }).unwrap();

      console.log('📥 Login API Response:', {
        otpVerified: response?.otpVerified,
        // registration_completed: response?.registration_completed,
        hasToken: !!response?.token,
        firstName: response?.first_name,
        email: response?.email,
      });

      // if otp not verified then redirect to otp screen
      if (response?.otpVerified === false) {
        console.log('⚠️ OTP not verified - redirecting to OTP screen');
        dispatch(
          signup({
            firstName: response.first_name,
            lastName: response.last_name,
            email: response.email,
            token: response.token,
          }),
        );
        setSubmitting(false);
        navigation.replace('Otp', {email: values.email});
        return;
      }

      // if otp verified and other steps not completed then redirect to zipcode
      if (
        response?.otpVerified === true
        // response?.registration_completed === false
      ) {
        console.log(
          '⚠️ OTP verified but registration incomplete - redirecting to Location screen',
        );
        dispatch(
          signup({
            firstName: response.first_name,
            lastName: response.last_name,
            email: response.email,
            token: response.token,
          }),
        );
        dispatch(verifyOtp());
        setSubmitting(false);
        navigation.replace('Location', {email: response.email || values.email});
        return;
      }

      // User is fully verified and registered - proceed to main app
      console.log('✅ Login successful - user fully verified and registered');
      dispatch(userIntro());
      dispatch(login({token: response.token}));
      showToast('success', 'Signed in successfully!');
      resetForm();
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      console.error('❌ Login error:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
      });
      const errorMessage =
        error?.data?.msg ||
        error?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';
      showToast('error', errorMessage);
    }
  };

  useEffect(() => {
    const configureGoogleSignin = async () => {
      try {
        GoogleSignin.configure({
          scopes: ['email', 'profile'],
        });
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      } catch (error) {
        setGoogleInitError(
          error?.message || 'Unable to initialise Google sign-in',
        );
      }
    };

    configureGoogleSignin();
  }, []);

  // const handleGoogleSignin = useCallback(async () => {
  //   if (googleInitError) {
  //     showToast('error', googleInitError);
  //     return;
  //   }

  //   try {
  //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  //     const userInfo = await GoogleSignin.signIn();
  //     const tokens = await GoogleSignin.getTokens();

  //     if (!userInfo?.user?.email) {
  //       showToast('error', 'Google account did not return an email address.');
  //       return;
  //     }

  //     const payload = {
  //       first_name:
  //         userInfo.user.givenName ||
  //         userInfo.user.name?.split(' ')?.[0] ||
  //         'Google',
  //       last_name:
  //         userInfo.user.familyName ||
  //         userInfo.user.name?.split(' ')?.slice(1)?.join(' ') ||
  //         'User',
  //       email: userInfo.user.email,
  //       googleId: userInfo.user.id,
  //       googleAccessToken: tokens?.accessToken,
  //       googleRefreshToken: tokens?.refreshToken,
  //       profile_image: userInfo.user.photo,
  //       platform: Platform.OS,
  //       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //     };

  //     const response = await googleLoginAPI({
  //       ...payload,
  //       provider: 'google',
  //     }).unwrap();

  //     if (!response?.token) {
  //       showToast('error', 'Unable to sign in with Google.');
  //       return;
  //     }

  //     const normalized = {
  //       firstName: response.first_name || payload.first_name,
  //       lastName: response.last_name || payload.last_name,
  //       email: response.email || payload.email,
  //       token: response.token,
  //     };

  //     // Google signin users go directly to Today screen
  //     dispatch(userIntro());
  //     dispatch(login({ token: response.token }));
  //     showToast('success', 'Signed in successfully with Google!');
  //   } catch (error) {
  //     if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
  //       return;
  //     }
  //     if (error?.code === statusCodes.IN_PROGRESS) {
  //       showToast('info', 'Google sign-in already in progress.');
  //       return;
  //     }
  //     if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       showToast('error', 'Google Play Services not available or outdated.');
  //       return;
  //     }

  //     showToast(
  //       'error',
  //       error?.data?.msg || error?.message || 'Google sign-in failed',
  //     );
  //   }
  // }, [dispatch, googleInitError, googleLoginAPI, navigation]);

  const handleGoogleSignin = useCallback(async () => {
    if (googleInitError) {
      showToast('error', googleInitError);
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // 🔴 FORCE ACCOUNT SELECTION EVERY TIME
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
        googleAccessToken: tokens?.accessToken,
        googleRefreshToken: tokens?.refreshToken,
        provider: 'google',
      };

      const response = await googleLoginAPI(payload).unwrap();

      dispatch(userIntro());
      dispatch(login({token: response.token}));
      showToast('success', 'Signed in successfully with Google!');
    } catch (error) {
      showToast(
        'error',
        error?.data?.msg || error?.message || 'Google sign-in failed',
      );
    }
  }, [googleInitError, googleLoginAPI, dispatch]);

  return (
    <KeyboardAwareScrollView style={tw`bg-white  `}>
      <LinearGradient colors={['#0077B6', '#90E0EF']}>
        <SafeAreaView>
          {isLoading && <LoadingSpinner />}
          <View style={tw`items-center`}>
            <View style={tw`w-100 items-center justify-center h-50`}>
              <Image
                source={require('../../assets/images/logo_white1.png')}
                style={{width: '56%', height: '77%', resizeMode: 'contain'}}
              />
            </View>
          </View>
          <View style={tw`bg-white rounded-t-[40px] flex-1`}>
            <Text
              style={tw`text-[#040641] text-[22px] font-bold mt-7 text-center`}>
              Join Heaven At Hand (HaH)
            </Text>
            <Text
              style={tw`text-[#040641] text-[16px] font-medium text-opacity-75  mt-2 mb-4 text-center`}>
              Start your journey now
            </Text>

            <Formik
              initialValues={{email: '', password: ''}}
              validationSchema={validationSchema}
              onSubmit={handleSignin}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={{marginHorizontal: 16}}>
                  <View style={styles.inputbar}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <Image
                        source={require('../../assets/images/emailicon.png')}
                        style={tw`ml-3 `}
                      />
                      <TextInput
                        placeholder="Email"
                        placeholderTextColor="rgba(4, 6, 65, 0.7)"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={tw`ml-3 text-black  w-full h-full`}
                      />
                    </View>
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <View style={styles.inputbar}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <Image
                        source={require('../../assets/images/passwordicon.png')}
                        style={tw`ml-3 text-black`}
                      />
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="rgba(4, 6, 65, 0.7)"
                        color="black"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        style={tw`flex-1 ml-3  w-full h-full`}
                        secureTextEntry={showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}>
                        <Image
                          source={require('../../assets/images/eyeicon.png')}
                          style={tw`mr-3`}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    style={tw`justify-end items-end`}>
                    <Text
                      style={tw`text-[#0077B6] text-[12px] font-semibold  mt-2  text-right`}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

                  <View style={tw`justify-center items-center`}>
                    <TouchableOpacity
                      style={tw`mt-10 w-[322px] h-[44px] mb-5 rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                      onPress={handleSubmit}
                      disabled={isLoading}>
                      <Text
                        style={tw`text-[#0077B6] text-[16px] font-semibold`}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* OR CONTINUE WITH */}
                  <View style={tw`flex-row items-center my-2 mx-4`}>
                    <View style={tw`flex-1 h-[1px] bg-gray-300`} />
                    <Text
                      style={tw`mx-3 text-[#040641] text-[13px] font-medium`}>
                      Or continue with
                    </Text>
                    <View style={tw`flex-1 h-[1px] bg-gray-300`} />
                  </View>

                  <TouchableOpacity
                    style={tw`w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex-row justify-center items-center mt-6 mx-auto ${
                      isGoogleLoading ? 'opacity-50' : ''
                    }`}
                    onPress={handleGoogleSignin}
                    disabled={isGoogleLoading}>
                    {isGoogleLoading ? (
                      <ActivityIndicator color="#0077B6" style={tw`mr-2`} />
                    ) : (
                      <Image
                        source={require('../../assets/images/google-icon.png')}
                        style={tw`w-5 h-5 mr-2`}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={tw`text-[#0077B6] text-[16px] font-semibold`}>
                      Google
                    </Text>
                  </TouchableOpacity>

                  <View style={{flex: 1}}>
                    <View style={{flexGrow: 1}} />

                    <Text
                      style={tw`text-[#040641] text-[14px] mt-5 font-medium text-opacity-75 text-center`}>
                      Don't have an account?{' '}
                      <Text
                        style={tw`text-[#0077B6] text-[14px] font-bold`}
                        onPress={() => navigation.navigate('Signup')}>
                        Sign up
                      </Text>
                    </Text>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(4, 6, 65, 0.1)',
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },
});

export default SigninScreen;
