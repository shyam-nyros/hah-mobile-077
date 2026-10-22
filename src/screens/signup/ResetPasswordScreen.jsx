import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import tw from 'twrnc';
import LoadingSpinner from '../../components/LoadingSpinner';
import showToast from '../../utils/toast/showToast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useResetPasswordAPIMutation} from '../../features/auth/authApiSlice';

// Define the validation schema
const validationSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(25, 'Password cannot be more than 25 characters')
    .matches(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character',
    ), // Ensure at least one special character
  confirm_password: yup
    .string()
    .required('Confirm password is required')
    .min(6, 'Confirm password must be at least 6 characters')
    .max(25, 'Confirm password cannot be more than 25 characters')
    .oneOf(
      [yup.ref('password'), null],
      'Password & confirm password must match',
    ),
  reset_password_otp: yup
    .string()
    .required('OTP is required')
    .min(4, 'Enter 4 digit OTP')
    .max(4, 'Enter 4 digit OTP')
    .matches(/^\d{4}$/, 'Enter only numbers'),
});

const ResetPasswordScreen = ({route, navigation}) => {
  const {email} = route.params;

  const [
    resetPasswordAPI,
    {isLoading: passwordUpdateLoading, error: passwordUpdateError},
  ] = useResetPasswordAPIMutation();

  const handleResetPassword = async (values, {setSubmitting, resetForm}) => {
    try {
      const response = await resetPasswordAPI({
        email,
        reset_password_otp: values.reset_password_otp,
        password: values.password,
        confirm_password: values.confirm_password,
      }).unwrap();

      navigation.navigate('Signin');
      resetForm();
      showToast('success', response.msg);
    } catch (error) {
      showToast('error', error?.data?.msg);
    }
  };

  return (
    <KeyboardAwareScrollView style={tw`bg-white  `}>
      <SafeAreaView>
        <View style={tw`h-full bg-white`}>
          {passwordUpdateLoading && <LoadingSpinner />}

          <View style={tw`mt-[14px] mx-4`}>
            <Text style={tw`text-[#040641] text-[22px] font-bold mt-10`}>
              Reset Password
            </Text>

            <Formik
              initialValues={{
                password: '',
                confirm_password: '',
                reset_password_otp: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleResetPassword}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={tw`mt-[6px]`}>
                  <View style={styles.inputbar}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholderTextColor="rgba(4, 6, 65, 0.7)"
                        style={tw`ml-3 flex-1 text-black`}
                        placeholder="Password"
                        value={values.firstName}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                      />
                    </View>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <View style={styles.inputbar}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholderTextColor="rgba(4, 6, 65, 0.7)"
                        style={tw`ml-3 flex-1 text-black`}
                        placeholder="Confirm password"
                        value={values.lastName}
                        onChangeText={handleChange('confirm_password')}
                        onBlur={handleBlur('confirm_password')}
                      />
                    </View>
                  </View>
                  {touched.confirm_password && errors.confirm_password && (
                    <Text style={styles.errorText}>
                      {errors.confirm_password}
                    </Text>
                  )}

                  <View style={styles.inputbar}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <TextInput
                        placeholderTextColor="rgba(4, 6, 65, 0.7)"
                        style={tw`ml-3 flex-1 text-black`}
                        placeholder="OTP"
                        value={values.reset_password_otp}
                        maxLength={4}
                        onChangeText={handleChange('reset_password_otp')}
                        onBlur={handleBlur('reset_password_otp')}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  {touched.reset_password_otp && errors.reset_password_otp && (
                    <Text style={styles.errorText}>
                      {errors.reset_password_otp}
                    </Text>
                  )}

                  <View style={tw`justify-center items-center`}>
                    <TouchableOpacity
                      style={tw`mt-10  w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center`}
                      onPress={handleSubmit}>
                      <Text
                        style={tw`text-[#0077B6] text-[16px] font-semibold`}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(4, 6, 65, 0.1)',
    borderRadius: 10,
    marginTop: 27,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },
  title1: {textAlign: 'center', fontSize: 15, color: '#fff'},
});

export default ResetPasswordScreen;
