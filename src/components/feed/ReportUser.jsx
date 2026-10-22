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
import {useReportUserAPIMutation} from '../../features/feed/feedApiSlice';
import showToast from '../../utils/toast/showToast';
import LoadingSpinner from '../LoadingSpinner';
import {setReloadOnBlockingUser} from '../../features/feed/feedSlice';
import {useDispatch} from 'react-redux';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  selectedOption: Yup.string().required('Please select an option'),
  description: Yup.string().when('selectedOption', {
    is: selectedOption => selectedOption === 'other',
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
  {id: 1, label: 'I dont like it', code: 'i_dont_like_it'},
  {id: 2, label: 'Hate speech or symbols', code: 'hate_speech'},
  {id: 3, label: 'Scam or fraud', code: 'scam_or_fraud'},
  {id: 4, label: 'Block User', code: 'block_user'},
  {id: 5, label: 'Other', code: 'other'},
];

const ReportUserForm = ({postId, setShowReportUserPopup, setHidePost}) => {
  const dispatch = useDispatch();
  const [reportUserAPI, {isLoading, isError}] = useReportUserAPIMutation();

  const handleSubmit = async values => {
    try {
      if (values.selectedOption === 'Other') {
      }
      const payload = {
        option: values.selectedOption,
        description: values.description,
      };

      const res = await reportUserAPI({postId, payload}).unwrap();
      

      showToast('success', res?.message || 'Report submitted successfully');
      setShowReportUserPopup(false);
      setHidePost(true);
      if (res?.isBlocked) {
        dispatch(setReloadOnBlockingUser());
      }
    } catch (error) {
      

      showToast('error', 'Unable to submit the report');
      setShowReportUserPopup(false);
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
                isChecked={values.selectedOption === option.code}
                onPress={isChecked => {
                  setFieldValue('selectedOption', isChecked ? option.code : '');
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
            {values.selectedOption === 'other' && (
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

export default ReportUserForm;
