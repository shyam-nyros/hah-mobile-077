import React from 'react';
import {useDispatch} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import tw from 'twrnc';
import {Formik, FormikHelpers} from 'formik';
import * as yup from 'yup';
import {useForgotPasswordAPIMutation} from '../../features/auth/authApiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import showToast from '../../utils/toast/showToast';
import {SafeAreaView} from 'react-native-safe-area-context';

// Define the validation schema using yup
const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [forgotPasswordAPI, {isLoading, isError}] =
    useForgotPasswordAPIMutation();

  const handleForgotPassword = async (values, {setSubmitting, resetForm}) => {
    try {
      const response = await forgotPasswordAPI({
        email: values.email,
      }).unwrap();
      showToast('success', response?.msg);
      resetForm();
      navigation.replace('ResetPassword', {email: values.email});
    } catch (error) {
   
      showToast('error', error?.data?.msg);
    }
  };

  return (
    <ScrollView style={tw`bg-white flex-1`}>
      <SafeAreaView>
        {/* Header */}
        <View style={tw`mx-2 py-4`}>
          <TouchableOpacity
            style={tw`flex-row items-center`}
            onPress={() => navigation.navigate('Signin')}>
            <Image
              source={require('../../assets/images/backnav.png')}
              style={tw`w-8 h-8 mr-1`}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {/* Body */}
      <View style={tw`mx-4`}>
        <Text
          style={tw`text-[#040641] text-[17px] font-medium mt-30 text-center`}>
          Forgot Password
        </Text>
        <Formik
          initialValues={{email: ''}}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={styles.inputbar}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/images/emailicon.png')}
                    style={tw`ml-3`}
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="rgba(4, 6, 65, 0.7)"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={tw`ml-3 text-black w-full h-full`}
                  />
                </View>
              </View>
              {isLoading && <LoadingSpinner />}
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              <Text
                style={tw`text-[#040641] text-[14px] font-medium opacity-50 mt-4 text-center`}>
                Enter your email address to receive a verification code
              </Text>

              <View style={tw`justify-center items-center`}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={tw`mt-6 w-[322px] h-[44px] rounded-[30px] border-[1px] border-[#0077B6] flex justify-center items-center`}>
                  <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(4, 6, 65, 0.07)',
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default ForgotPasswordScreen;
