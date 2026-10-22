import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  useUpdateUserAPIMutation,
  useValidateUserZipCodeMutation,
} from '../../../features/auth/authApiSlice';
import {setLocation} from '../../../features/auth/authSlice';
import {Formik} from 'formik';
import * as yup from 'yup';
import tw from 'twrnc';
import LoadingSpinner from '../../LoadingSpinner';

const EditZipcode = () => {
  const validationSchema = yup.object().shape({
    zipcode: yup
      .string()
      .required('Please enter your zipcode')
      .test(
        'is-valid-zipcode',
        'Invalid zip code. Please try again.',
        async function (value) {
          if (!value) return true; // Skip validation for empty field; required will catch this.
          try {
            const response = await validateZipCode(value);
            // Check for both valid and invalid responses
            return response.status === 'OK' && response.results.length > 0;
          } catch (error) {
            console.error('Validation API error:', error);
            return false; // Fail the validation if API call fails
          }
        },
      ),
  });

  const dispatch = useDispatch();
  const {location} = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  const [
    validateUserZipCode,
    {isLoading: validateZipcodeLoading, isError: validateZipcodeError},
  ] = useValidateUserZipCodeMutation();

  const handleLocationDetails = async (values, {setSubmitting, resetForm}) => {
  
    try {
      const response = await updateUserAPI({
        zipcode: values.zipcode,
      }).unwrap();

      dispatch(
        setLocation({
          zipcode: response?.user?.zipcode,
        }),
      );
      setIsEditing(false);
    } catch (error) {
     
    }
  };

  const validateZipCode = async zipcode => {
    try {
      const response = await validateUserZipCode(zipcode).unwrap();
      return response;
    } catch (error) {
      console.error('ZIP code validation error:', error);
    }
  };

  return (
    <>
      <View style={tw` h-12 mx-4 flex-row justify-between items-center`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>Zip Code</Text>

        <View style={tw`flex-row  w-60 justify-end gap-2 items-center`}>
          <Text style={tw`text-[15px] text-right text-[#040641] opacity-70`}>
            {location?.zipcode ? location?.zipcode : ''}
          </Text>

          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <View style={tw`py-3 pl-3`}>
              <Image
                source={require('../../../assets/images/editicon.png')}
                style={tw` w-4 h-4 `}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <Modal animationType="slide" transparent={true} visible={isEditing}>
          <View style={styles.modalOverlay}>
            <View style={styles.alertBox}>
              <Formik
                initialValues={{
                  zipcode: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleLocationDetails}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldValue,
                }) => (
                  <>
                    <View style={styles.inputbar}>
                      <View
                        style={{
                          flexDirection: 'row',
                          flex: 1,
                          alignItems: 'center',
                        }}>
                        <TextInput
                          style={[
                            tw`flex-1 px-3 text-[#040641]  w-full h-full`,
                            styles.input,
                          ]}
                          placeholder="Enter your zipcode"
                          placeholderTextColor="rgba(4, 6, 65, 0.3)"
                          value={values.zipcode}
                          onChangeText={handleChange('zipcode')}
                        />
                      </View>
                    </View>
                    {touched.zipcode && errors.zipcode && (
                      <Text style={styles.errorText}>{errors.zipcode}</Text>
                    )}

                    {userUpdateLoading && (
                      <View>
                        <LoadingSpinner size={'small'} />
                      </View>
                    )}

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => setIsEditing(!isEditing)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}>
                        <Text style={styles.okText}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default EditZipcode;

const styles = StyleSheet.create({
  alertBox: {
    width: '94%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputbar: {
    width: '100%',
    height: 48,
    color: 'black',
    backgroundColor: 'rgba(4, 6, 65, 0.04)',
    borderRadius: 10,
    marginTop: 16,
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '400',
  },
  okText: {
    color: '#0077B6',
    fontSize: 16,
    fontWeight: '400',
  },
  errorText: {
    color: 'red',
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 5,
  },
});
