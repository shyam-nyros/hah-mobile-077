import React from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import tw from 'twrnc';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {useReportPostAPIMutation} from '../../features/feed/feedApiSlice';
import showToast from '../../utils/toast/showToast';
import LoadingSpinner from '../LoadingSpinner';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  selectedOption: Yup.string().required('Please select an option'),
  description: Yup.string().when('selectedOption', {
    is: selectedOption => selectedOption === 'Other',
    then: schema =>
      schema
        .required('Description is required')
        .max(160, 'Description must be 160 characters or less'),
    otherwise: schema => schema.notRequired(),
  }),
});

// Initial form values
const initialValues = {
  selectedOption: '',
  description: '',
};

// Checkbox options
const checkboxOptions = [
  {id: 1, label: 'Violence'},
  {id: 2, label: 'I dont like it'},
  {id: 3, label: 'Spam'},
  {id: 4, label: 'Inappropriate Content'},
  {id: 5, label: 'False Information'},
  {id: 6, label: 'Other'},
];

const ReportPostForm = ({postId, setShowReportPopup, setHidePost}) => {
  const [reportPostAPI, {isLoading, isError}] = useReportPostAPIMutation();

  const handleSubmit = async values => {
    try {
      if (values.selectedOption === 'Other') {
      }
      const payload = {
        option: values.selectedOption,
        description: values.description,
      };

      const res = await reportPostAPI({postId, payload}).unwrap();
      showToast('success', 'Report submitted successfully');
      setShowReportPopup(false);
      setHidePost(true)
    } catch (error) {
      showToast('error', 'Unable to submit the report');
      setShowReportPopup(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({values, errors, touched, handleSubmit, setFieldValue}) => (
          <View style={tw`gap-4`}>
            {/* Checkboxes */}
            {checkboxOptions.map(option => (
              <BouncyCheckbox
                key={option.id}
                text={option.label}
                isChecked={values.selectedOption === option.label}
                onPress={isChecked => {
                  setFieldValue(
                    'selectedOption',
                    isChecked ? option.label : '',
                  );
                }}
                fillColor="#00B4D8"
                textStyle={{textDecorationLine: 'none'}}
                disableBuiltInState // Ensures only one option can be selected
              />
            ))}

            {/* Validation Error Message for Options */}
            {touched.selectedOption && errors.selectedOption && (
              <Text style={styles.errorText}>{errors.selectedOption}</Text>
            )}

            {/* Text Area for "Other" Option */}
            {values.selectedOption === 'Other' && (
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                  value={values.description}
                  onChangeText={text => setFieldValue('description', text)}
                />
                {/* Validation Error Message for Description */}
                {touched.description && errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={tw`border border-[#00B4D8] border-[1.5px] bg-[#fff] py-3 rounded-10 text-white`}>
              <Text style={tw`text-center text-[#00B4D8] font-semibold`}>
                Submit
              </Text>
            </TouchableOpacity>
            {isLoading && <LoadingSpinner />}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  textAreaContainer: {
    marginTop: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    height: 100,
    color: '#000',
    textAlignVertical: 'top',
  },
});

export default ReportPostForm;
