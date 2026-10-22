import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import tw from 'twrnc';
import * as yup from 'yup';
import showToast from '../../../utils/toast/showToast';
import {Formik} from 'formik';
import {useChangePasswordFromProfileAPIMutation} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';

// Define the validation schema using yup
const validationSchema = yup.object().shape({
  currentpassword: yup
    .string()
    .required('Current password is required')
    .min(6, 'Current password must be at least 6 characters')
    .max(25, 'Current password cannot be more than 25 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(25, 'Password cannot be more than 25 characters')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    ),
  confirmpassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const ChangePasswordScreen = ({navigation}) => {
  const [changePasswordFromProfileAPI, {isLoading, isError}] =
    useChangePasswordFromProfileAPIMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  const handleChangePassword = async (values, {setSubmitting, resetForm}) => {
    try {
      const response = await changePasswordFromProfileAPI({
        current_password: values.currentpassword,
        new_password: values.password,
      }).unwrap();

      resetForm();
      showToast('success', response?.msg);
      navigation.replace('Dashboard');
    } catch (error) {
      showToast('error', error?.data?.msg);
    }
  };

  const navigateToPreviousScreen = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <View style={tw`bg-white flex-1`}>
      {isLoading && <LoadingSpinner />}
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity
          style={tw`mx-2 flex-row  py-4 items-center`}
          onPress={navigateToPreviousScreen}>
          <View>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
          </View>
          <Text style={tw`text-xl text-[#fff] font-medium`}>
            Change Password
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      <Formik
        initialValues={{
          currentpassword: '',
          password: '',
          confirmpassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleChangePassword}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={tw`mx-4 mt-4`}>
            <Text style={tw`text-[16px] text-[#040641] font-medium`}>
              Current Password
            </Text>
            {/* current password block */}
            <View style={styles.inputbar}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <TextInput
                  placeholderTextColor="rgba(4, 6, 65, 0.7)"
                  style={tw`ml-3 text-black  flex-1 h-full`}
                  placeholder="Current Password"
                  value={values.currentpassword}
                  onChangeText={handleChange('currentpassword')}
                  onBlur={handleBlur('currentpassword')}
                  secureTextEntry={showCurrentPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Image
                    source={require('../../../assets/images/eyeicon.png')}
                    style={tw`mr-3`}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {touched.currentpassword && errors.currentpassword && (
              <Text style={styles.errorText}>{errors.currentpassword}</Text>
            )}

            {/*password block */}
            <Text style={tw`text-[16px] mt-4 text-[#040641] font-medium`}>
              Password
            </Text>
            <View style={styles.inputbar}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <TextInput
                  placeholderTextColor="rgba(4, 6, 65, 0.7)"
                  style={tw`ml-3 text-black  flex-1 h-full`}
                  placeholder="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={showPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Image
                    source={require('../../../assets/images/eyeicon.png')}
                    style={tw`mr-3`}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/*confirm password block */}
            <Text style={tw`text-[16px] mt-4 text-[#040641] font-medium`}>
              Confirm Password
            </Text>
            <View style={styles.inputbar}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <TextInput
                  placeholderTextColor="rgba(4, 6, 65, 0.7)"
                  style={tw`ml-3 text-black  flex-1 h-full`}
                  placeholder="Confirm Password"
                  value={values.confirmpassword}
                  onChangeText={handleChange('confirmpassword')}
                  onBlur={handleBlur('confirmpassword')}
                  secureTextEntry={showConfirmPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Image
                    source={require('../../../assets/images/eyeicon.png')}
                    style={tw`mr-3`}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {touched.confirmpassword && errors.confirmpassword && (
              <Text style={styles.errorText}>{errors.confirmpassword}</Text>
            )}

            <View style={tw`justify-center mb-20 items-center`}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={tw`mt-8 w-[322px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex justify-center items-center`}>
                <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                  Update Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
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

export default ChangePasswordScreen;
