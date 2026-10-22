import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {Dropdown} from 'react-native-element-dropdown';
import {useSelector, useDispatch} from 'react-redux';
import {launchImageLibrary} from 'react-native-image-picker';
import {useUserRequestAPIMutation} from '../../features/auth/authApiSlice';
import {hideAddRequestForm} from '../../features/auth/authSlice';

const ActivityModal = () => {
  const dispatch = useDispatch();
  const [isFirstModalVisible, setIsFirstModalVisible] = useState(true);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const navigation = useNavigation();
  const selectedChurchName = useSelector(
    state => state.auth.selectedChurchName,
  );

  const [userRequestAPI, {isLoading}] = useUserRequestAPIMutation();

  const validationSchema = Yup.object().shape({
    activityType: Yup.string().required('Activity type is required'),
    content: Yup.string()
      .required('Content is required')
      .max(50, 'Content should not exceed 30 characters'),
  });

  const handleCloseButton = () => {
    dispatch(hideAddRequestForm());
  };

  // State for dropdown
  const [activityType, setActivityType] = useState('');
  const activityTypeItems = [
    {label: 'Event', value: 'event'},
    {label: 'Live Church', value: 'live_church'},
    {label: 'Library', value: 'library'},
  ];

  // Function to handle image and PDF selection
  const selectAttachment = () => {
    launchImageLibrary({mediaType: 'mixed', includeBase64: false}, response => {
      if (response.assets && response.assets.length > 0) {
        setAttachment(response.assets[0]);
      }
    });
  };

  // Submit function to send data to the API
  const openConfirmationModal = async (values, {resetForm}) => {
    try {
      const formData = new FormData();
      formData.append('church_id', selectedChurchName);
      formData.append('activity_type', activityType);
      formData.append('content', values.content);
      formData.append('isEligible', isEligible);

      if (attachment) {
        formData.append('attachment', {
          uri: attachment.uri,
          type: attachment.type,
          name:
            attachment.fileName ||
            `attachment.${attachment.type.split('/')[1]}`,
        });
      }

      await userRequestAPI(formData).unwrap();

      // Reset the form and attachment
      resetForm();
      setAttachment(null);

      // Hide the first modal and show the confirmation modal
      setIsFirstModalVisible(false);
      setSecondModalVisible(true);
    } catch (error) {
      console.error('Failed to submit request:', error);
      Alert.alert(
        'Submission Error',
        'Failed to submit request. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView>
      {/* First Modal */}
      <Modal animationType="slide" transparent visible={isFirstModalVisible}>
        <TouchableWithoutFeedback>
          <View
            style={tw`flex-1 justify-center p-4 items-center bg-gray-900 bg-opacity-40`}>
            <TouchableWithoutFeedback>
              <View style={tw`bg-white   w-[100%] rounded-[10px] px-4 pb-4`}>
                <Formik
                  initialValues={{activityType: '', content: ''}}
                  validationSchema={validationSchema}
                  onSubmit={openConfirmationModal}>
                  {({handleChange, handleSubmit, values, errors, touched}) => (
                    <>
                      <TouchableOpacity
                        style={tw`justify-end items-end`}
                        onPress={handleCloseButton}>
                        <Text
                          style={tw`text-black  font-semibold p-2 text-[18px] `}>
                          X
                        </Text>
                      </TouchableOpacity>
                      <KeyboardAvoidingView>
                        <Text
                          style={tw`text-[#040641] text-[18px] text-center  font-medium`}>
                          Share details you know with HaH
                        </Text>

                        {/* Church */}
                        <View
                          style={tw`h-12 w-full mt-3 rounded-[10px] border border-[#0077B6] justify-center pl-4`}>
                          <Text style={tw`text-[16px] text-gray-500`}>
                            {selectedChurchName}
                          </Text>
                        </View>

                        {/* Activity Type Dropdown */}
                        <Dropdown
                          style={tw`h-12 w-full mt-3 border border-[#0077B6] rounded-[10px] pl-4`}
                          placeholderStyle={tw`text-black`}
                          placeholderTextColor="#000000"
                          selectedTextStyle={[tw`text-[#000] text-[14px]`]}
                          data={activityTypeItems}
                          labelField="label"
                          valueField="value"
                          placeholder="Select Activity Type"
                          value={activityType}
                          onChange={item => {
                            setActivityType(item.value);
                            handleChange('activityType')(item.value);
                          }}
                          dropdownContainerStyle={tw`border border-[#0077B6] rounded-[10px]`}
                          renderRightIcon={() => (
                            <Image
                              source={require('../../assets/images/dropdownicon.png')}
                              style={tw`w-5 h-5`}
                            />
                          )}
                          renderItem={item => (
                            <View style={styles.itemContainer}>
                              <Text style={[tw`py-3`, styles.name]}>
                                {item.label}
                              </Text>
                              <View
                                style={tw`h-px bg-black bg-opacity-10 w-full`}
                              />
                            </View>
                          )}
                        />
                        {touched.activityType && errors.activityType && (
                          <Text style={tw`text-red-500 text-xs`}>
                            {errors.activityType}
                          </Text>
                        )}

                        {/* Content Input Field */}
                        <TextInput
                          style={tw`h-12 w-full mt-3 rounded-[10px] border border-[#0077B6] pl-4 text-[15px] text-[#040641]`}
                          placeholder="Enter content"
                          placeholderTextColor="gray"
                          value={values.content}
                          maxLength={50}
                          onChangeText={handleChange('content')}
                        />
                        {touched.content && errors.content && (
                          <Text style={tw`text-red-500 text-xs`}>
                            {errors.content}
                          </Text>
                        )}

                        {/* Upload Files Button */}
                        <TouchableOpacity
                          onPress={selectAttachment}
                          style={tw`w-[50%] mt-3 h-10 flex-row rounded-[6px] border border-[#0077B6] justify-center items-center`}>
                          <Text style={tw`text-[#0077B6] text-[15px]`}>
                            Upload Files
                          </Text>
                          <Image
                            source={require('../../assets/images/filesicon.png')}
                            style={tw`w-5 h-5 ml-2`}
                          />
                        </TouchableOpacity>
                        {attachment && (
                          <Text style={tw`text-green-500 mt-2`}>
                            File attached: {attachment.fileName}
                          </Text>
                        )}

                        {/* Checkbox for Eligibility */}
                        <View style={tw`flex-row mt-4`}>
                          <BouncyCheckbox
                            size={18}
                            fillColor="#0077b6"
                            unFillColor="#FFFFFF"
                            innerIconStyle={{borderWidth: 2}}
                            isChecked={isEligible}
                            onPress={() => setIsEligible(!isEligible)}
                          />
                          <Text
                            numberOfLines={2}
                            style={tw`text-[#040641] w-[90%] text-[12px]`}>
                            I am eligible & interested to become an active
                            content provider for HaH
                          </Text>
                        </View>

                        {/* Submit Button */}
                        <View style={tw`  mt-6 justify-center items-center`}>
                          <TouchableOpacity
                            style={tw` w-[60%] h-[44px] rounded-[30px] border-2 border-[#0077B6] justify-center items-center`}
                            onPress={handleSubmit}
                            disabled={isLoading}>
                            <Text
                              style={tw`text-[#0077B6] text-[16px] font-medium`}>
                              {isLoading ? 'Submitting...' : 'Submit'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </KeyboardAvoidingView>
                    </>
                  )}
                </Formik>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={secondModalVisible}
        onRequestClose={() => setSecondModalVisible(false)}>
        <KeyboardAvoidingView style={tw`flex-1`}>
          <TouchableWithoutFeedback
            onPress={() => setSecondModalVisible(false)}>
            <View
              style={tw`flex-1 justify-center items-center bg-gray-900 bg-opacity-40`}>
              <View
                style={tw`bg-white  w-[90%]  rounded-[10px] p-4 items-center`}>
                <Image
                  source={require('../../assets/images/confirmicon.png')}
                  style={tw`mt-8`}
                />
                <Text
                  style={tw`text-[#040641] text-[14px] text-center opacity-40 mt-5 font-medium`}>
                  Thanks for supporting your Church and going the extra mile to
                  keep the community active. Our team will verify & approve
                  soon.
                </Text>
                {/* Continue Button */}
                <TouchableOpacity
                  style={tw`mt-6 w-[60%] h-[44px] rounded-[30px] mb-10 border-2 border-[#0077B6] justify-center items-center`}
                  onPress={handleCloseButton}>
                  <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(4, 6, 65, 0.1)',
    borderRadius: 100,
    marginTop: 27,
    justifyContent: 'center',
  },
  dropdown: {
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    marginBottom: 18,
    marginTop: 8,
    color: 'black',
  },
  itemContainer: {
    paddingHorizontal: 10,
    color: 'black',
    display: 'flex',
  },
  name: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#040641',
  },
  address: {
    fontSize: 14,
    color: '#0077B6',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 16,
  },
});

export default ActivityModal;
