import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import {useContactHahAPIMutation} from '../../../features/auth/authApiSlice';
import {Formik} from 'formik';
import * as yup from 'yup';

const contactValidationSchema = yup.object().shape({
  title: yup
    .string()
    .max(20, 'Title must be at most 20 characters')
    .required('Title is required'),
  description: yup
    .string()
    .max(100, 'Description must be at most 100 characters')
    .required('Description is required'),
});

const ContactScreen = ({navigation}) => {
  // Hook for posting data to the API
  const [contactHah, {isLoading, isError}] = useContactHahAPIMutation();

  const handleSubmit = async (values, {resetForm}) => {
    try {
      // Trigger the mutation to post data to the API
      await contactHah({
        title: values.title,
        description: values.description,
      }).unwrap();

      Alert.alert('Success', 'Contact request submitted successfully');
      resetForm(); // Reset form after successful submission
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
      console.error('Error submitting data:', error);
    }
  };

  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity
          style={tw`mx-2 flex-row py-4 items-center`}
          onPress={() => navigation.goBack()}>
          <View>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
          </View>
          <Text style={tw`text-xl text-[#fff] font-medium`}>Contact HAH</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      <ScrollView style={tw`bg-white p-4`}>
        <Formik
          initialValues={{title: '', description: ''}}
          validationSchema={contactValidationSchema}
          onSubmit={handleSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <Text style={tw`text-[16px] text-[#040641] font-medium mb-2`}>
                Title
              </Text>
              <TextInput
                style={[
                  tw`text-black rounded-[10px] px-4 py-2 mb-1`,
                  styles.inputbar,
                ]}
                placeholder="Enter the title"
                placeholderTextColor="rgba(4, 6, 65, 0.4)"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
              />
              {touched.title && errors.title && (
                <Text style={tw`text-red-500 mb-2`}>{errors.title}</Text>
              )}

              <Text
                style={tw`text-[16px] mt-2 text-[#040641] font-medium mb-2`}>
                Description
              </Text>
              <TextInput
                style={[
                  tw`h-20 rounded-[10px] px-4 mb-1 text-black justify-start items-start flex`,
                  styles.inputbar,
                ]}
                placeholder="Enter the description"
                placeholderTextColor="rgba(4, 6, 65, 0.4)"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                numberOfLines={5}
                multiline
              />
              {touched.description && errors.description && (
                <Text style={tw`text-red-500 mb-2`}>{errors.description}</Text>
              )}

              {/* Submit Button */}
              <View style={tw`justify-center mb-20 items-center`}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={tw`mt-8 w-[322px] h-[44px] rounded-[30px] border-[1.5px] border-[#0077B6] flex justify-center items-center`}
                  disabled={isLoading} // Disable button while loading
                >
                  <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </Text>
                </TouchableOpacity>

                {isError && (
                  <Text style={tw`text-red-500 mt-2`}>
                    Submission failed. Try again.
                  </Text>
                )}
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    backgroundColor: 'rgba(4, 6, 65, 0.1)',
  },
});

export default ContactScreen;
