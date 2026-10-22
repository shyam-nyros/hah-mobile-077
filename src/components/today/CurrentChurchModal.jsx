import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import tw from 'twrnc';
import {useDispatch, useSelector} from 'react-redux';
import {
  setSelectedChurch,
  hideCurrentChurchModal,
  setIsLeader,
  unsetIsLeader,
} from '../../features/auth/authSlice';
import {Dropdown} from 'react-native-element-dropdown';
import {
  useGetChurchesAPIQuery,
  useGetOrganizationsAPIQuery,
} from '../../features/churches/churchApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';
import {
  useUpdateCurrentChurchOfTheUserMutation,
  useRequestAddChurchAPIMutation,
} from '../../features/auth/authApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {Formik} from 'formik';
import * as yup from 'yup';
import CheckBox from '@react-native-community/checkbox';
import LeaderAlert from '../../utils/customalert/LeaderAlert';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import countries from '../../screens/signup/Countries';

const validationSchema = yup.object().shape({
  selectedChurch: yup.string().required('Please select a church'),
});

const churchSchema = yup.object().shape({
  name: yup
    .string()
    .required('Church Name is required')
    .min(3, 'Church Name must be at least 3 characters'),
  address: yup
    .string()
    .required('Address is required')
    .min(3, 'Address must be at least 3 characters'),
  country: yup.string().required('Please select a country'),
  state: yup
    .string()
    .required('State is required')
    .min(3, 'State Name must be at least 3 characters'),
  city: yup
    .string()
    .required('City is required')
    .min(3, 'City Name must be at least 3 characters'),
  zipcode: yup
    .string()
    .required('Zip Code is required')
    .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Please enter a valid Zip Code.'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  mobile: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number'),
  parent_organization: yup.string().required('Parent Organization is required'),
});

const CurrentChurchModal = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [listOfChurches, setListOfChurches] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isLeaderChecked, setIsLeaderChecked] = useState(false);
  const [addChurchModalVisible, setAddChurchModalVisible] = useState(false);

  const debouncedSearchKeyword = useDebounce(search, 300);

  const {selectedChurchName, selectedChurchId, currentChurchModal, isLeader} =
    useSelector(state => state.auth);

  const organizationOptions = useSelector(
    state => state.church.organizationsList.organizations,
  );

  const {
    data: churches,
    isLoading: churchListLoading,
    isFetching: churchListFetching,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const {data: organizations, isLoading: organizationsListLoading} =
    useGetOrganizationsAPIQuery();

  const [updateCurrentChurchOfTheUser, {isLoading: userUpdateLoading}] =
    useUpdateCurrentChurchOfTheUserMutation();

  const [requestAddChurch, {isLoading: addChurchLoading}] =
    useRequestAddChurchAPIMutation();

  useEffect(() => {
    if (!churchListLoading && churches && churches?.length > 0) {
      setListOfChurches(churches);
    }
  }, [churchListLoading, churches]);

  const handleCloseModal = () => {
    dispatch(hideCurrentChurchModal());
    setSearch('');
    setValue(null);
    setListOfChurches([]);
    setIsLeaderChecked(false);
    setAlertVisible(false); // Close alert if open
    dispatch(unsetIsLeader()); // Reset Redux state
    setAddChurchModalVisible(false);
  };

  const handleUpdateChurch = async (values, {resetForm}) => {
    try {
      const response = await updateCurrentChurchOfTheUser({
        church_id: values.selectedChurchId,
        is_leader: isLeaderChecked, // Send leader status with church update
      }).unwrap();

      dispatch(
        setSelectedChurch({
          id: values?.selectedChurchId,
          name: values?.selectedChurch,
          address: values?.selectedChurchAddress,
        }),
      );

      resetForm();
      handleCloseModal();
      Alert.alert('Success', 'Church updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update church. Please try again.');
    }
  };

  const handleOpenAddChurchModal = () => {
    // Just open the add church modal - don't close current modal
    setAddChurchModalVisible(true);
  };

  const handleCloseAddChurchModal = () => {
    setAddChurchModalVisible(false);
  };

  const handleSubmitChurch = async (values, {setSubmitting, resetForm}) => {
    try {
      console.log('🏛️ Submitting new church:', values);
      await requestAddChurch(values).unwrap();
      Alert.alert(
        'Success',
        'Church request submitted successfully! It will be reviewed and added soon.',
      );
      setAddChurchModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error adding church:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to add church. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaderCheckboxChange = newValue => {
    // Only show alert when checking (turning ON)
    if (newValue) {
      setIsLeaderChecked(newValue); // Set locally first for UI responsiveness
      setAlertVisible(true); // Show confirmation modal
    } else {
      // When unchecking (turning OFF), immediately unset
      setIsLeaderChecked(false);
      dispatch(unsetIsLeader());
    }
  };

  return (
    <>
      <LeaderAlert
        visible={alertVisible}
        boldText={
          value ? listOfChurches.find(c => c._id === value)?.name || '' : ''
        }
        message={'Are you sure you want to set yourself as a Leader for ? '}
        onConfirm={() => {
          dispatch(setIsLeader());
          setAlertVisible(false);
        }}
        onCancel={() => {
          dispatch(unsetIsLeader());
          setIsLeaderChecked(false);
          setAlertVisible(false);
        }}
      />

      {/* Current Church Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={currentChurchModal}
        onRequestClose={handleCloseModal}>
        <View
          style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          {!addChurchModalVisible ? (
            // Show Current Church Selection Form
            <View
              style={tw`bg-white rounded-[20px] w-[90%] max-h-[85%] shadow-lg`}>
              {/* Header */}
              <Text
                style={tw`text-[20px] font-bold text-[#040641] text-center py-6 border-b border-gray-200`}>
                Update Church
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={tw`px-6 py-4`}>
                <Formik
                  initialValues={{
                    selectedChurch: '',
                    selectedChurchId: '',
                    selectedChurchAddress: '',
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleUpdateChurch}>
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    touched,
                  }) => (
                    <>
                      {/* Church Dropdown */}
                      <Text
                        style={tw`text-[#040641] mb-2 text-[16px] font-medium`}>
                        Select Your Church
                      </Text>

                      <Dropdown
                        style={[
                          styles.dropdown,
                          isFocus && {borderColor: '#0077B6', borderWidth: 2},
                        ]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={listOfChurches || []}
                        search
                        maxHeight={250}
                        labelField="name"
                        valueField="_id"
                        placeholder="Search church"
                        searchPlaceholder="Type at least 5 characters..."
                        value={value}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChangeText={txt => {
                          if (txt.length >= 5) {
                            setSearch(txt);
                          }
                        }}
                        onChange={item => {
                          setValue(item._id);
                          setIsFocus(false);
                          setFieldValue('selectedChurch', item.name);
                          setFieldValue('selectedChurchId', item._id);
                          setFieldValue('selectedChurchAddress', item.address);
                          // Reset leader checkbox when church changes
                          setIsLeaderChecked(false);
                          dispatch(unsetIsLeader());
                          setAlertVisible(false); // Close alert if open
                        }}
                        renderItem={item => (
                          <View style={styles.dropdownItem}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemCity}>
                              {item.city ? item.city : '---'}
                            </Text>
                          </View>
                        )}
                      />

                      {touched.selectedChurch && errors.selectedChurch && (
                        <Text style={tw`text-red-500 text-xs mt-1`}>
                          {errors.selectedChurch}
                        </Text>
                      )}

                      {/* Leader Checkbox - Only show when church is selected */}
                      {values.selectedChurchId && (
                        <View style={tw`flex-row items-center mt-4`}>
                          <CheckBox
                            disabled={false}
                            value={isLeaderChecked}
                            onValueChange={handleLeaderCheckboxChange}
                            tintColors={{true: '#0077B6', false: '#9CA3AF'}}
                            style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}]}}
                          />

                          <Text style={tw`ml-2 text-[#040641] text-[14px]`}>
                            I Am a Leader
                          </Text>
                        </View>
                      )}

                      {/* Add Church Link */}
                      <View style={tw`mt-4`}>
                        <Text style={tw`text-[#040641] text-[14px]`}>
                          Church Not Listed?{' '}
                          <Text
                            style={tw`text-[#0077B6] font-bold underline`}
                            onPress={handleOpenAddChurchModal}>
                            Add Your Church
                          </Text>
                        </Text>
                      </View>

                      {/* Update Church Button */}
                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!values.selectedChurchId}
                        style={tw`mt-6 h-[44px] rounded-[30px] bg-[#0077B6] flex justify-center items-center ${
                          !values.selectedChurchId ? 'opacity-50' : ''
                        }`}>
                        <Text style={tw`text-white text-[16px] font-medium`}>
                          Update Church
                        </Text>
                      </TouchableOpacity>

                      {/* Close Button */}
                      <TouchableOpacity
                        onPress={handleCloseModal}
                        style={tw`mt-4 mb-4`}>
                        <Text
                          style={tw`text-[#9CA3AF] text-center text-[14px] font-medium`}>
                          Close
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>
              </ScrollView>
            </View>
          ) : (
            // Show Add Church Form
            <View style={tw`bg-white w-[90%] h-[80%] rounded-[10px]`}>
              <TouchableOpacity onPress={handleCloseAddChurchModal}>
                <Image
                  style={tw`h-6 w-6 mt-5 ml-5`}
                  source={require('../../assets/images/closeicon.png')}
                />
              </TouchableOpacity>
              <Text
                style={tw`text-[#040641] text-[18px] text-center mt-3 font-medium`}>
                Add Church
              </Text>
              <Formik
                initialValues={{
                  name: '',
                  address: '',
                  country: '',
                  state: '',
                  city: '',
                  zipcode: '',
                  email: '',
                  mobile: '',
                  parent_organization: '',
                }}
                validationSchema={churchSchema}
                onSubmit={handleSubmitChurch}>
                {({
                  handleChange,
                  handleBlur,
                  values,
                  errors,
                  touched,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                }) => (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={tw`py-1 flex-1 px-3 mx-2 mb-5`}>
                      {/* Church Name */}
                      <Text style={tw`text-[#040641] mb-2`}>Church Name</Text>
                      <View
                        style={tw`items-center w-[100%] flex-1  rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter Church Name"
                          placeholderTextColor="#9CA3AF"
                          value={values.name}
                          onChangeText={handleChange('name')}
                          onBlur={handleBlur('name')}
                        />
                      </View>
                      {touched.name && errors.name && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.name}
                        </Text>
                      )}

                      {/* Parent Organization */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>
                        Parent Organization
                      </Text>
                      <Dropdown
                        style={[tw`w-full`, styles.dropdownAddChurch]}
                        selectedTextStyle={[
                          tw`text-[#000] text-[16px]`,
                          styles.selectedTextStyle,
                        ]}
                        data={organizationOptions || []}
                        labelField="name"
                        valueField="_id"
                        placeholder="Select Parent Organization"
                        placeholderStyle={tw`text-gray-400 `}
                        value={values.parent_organization}
                        onChange={item => {
                          setFieldValue('parent_organization', item._id);
                        }}
                        renderItem={item => (
                          <View style={styles.itemContainer}>
                            <Text style={[tw`py-3`, styles.name]}>
                              {item.name}
                            </Text>
                            <View
                              style={tw`h-px bg-black bg-opacity-10 w-full `}
                            />
                          </View>
                        )}
                      />
                      {touched.parent_organization &&
                        errors.parent_organization && (
                          <Text style={styles.errorText}>
                            {errors.parent_organization}
                          </Text>
                        )}

                      {/* Address */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>Address</Text>
                      <View
                        style={tw`items-center w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter Address"
                          placeholderTextColor="#9CA3AF"
                          value={values.address}
                          onChangeText={handleChange('address')}
                          onBlur={handleBlur('address')}
                        />
                      </View>
                      {touched.address && errors.address && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.address}
                        </Text>
                      )}

                      {/* Country */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>Country </Text>
                      <Dropdown
                        style={[tw`w-full`, styles.dropdownAddChurch]}
                        selectedTextStyle={[
                          tw`text-[#000] text-[14px]`,
                          styles.selectedTextStyle,
                        ]}
                        data={countries}
                        labelField="label"
                        valueField="value"
                        placeholder="Select a country"
                        placeholderStyle={tw`text-gray-400 ml-3`}
                        value={values.country}
                        onChange={item => {
                          setFieldValue('country', item.value);
                        }}
                        renderItem={item => (
                          <View style={[styles.itemContainer]}>
                            <Text style={tw`text-black py-3 ml-2`}>
                              {item.value}
                            </Text>
                            <View
                              style={tw`h-px bg-black bg-opacity-10 w-full `}
                            />
                          </View>
                        )}
                      />
                      {touched.country && errors.country && (
                        <Text style={styles.errorText}>{errors.country}</Text>
                      )}

                      {/* City */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>City</Text>
                      <View
                        style={tw`items-center w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter City"
                          placeholderTextColor="#9CA3AF"
                          value={values.city}
                          onChangeText={handleChange('city')}
                          onBlur={handleBlur('city')}
                        />
                      </View>
                      {touched.city && errors.city && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.city}
                        </Text>
                      )}

                      {/* State */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>State</Text>
                      <View
                        style={tw`items-center  w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter State"
                          placeholderTextColor="#9CA3AF"
                          value={values.state}
                          onChangeText={handleChange('state')}
                          onBlur={handleBlur('state')}
                        />
                      </View>
                      {touched.state && errors.state && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.state}
                        </Text>
                      )}

                      {/* Zip Code */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>Zip Code</Text>
                      <View
                        style={tw`items-center w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter Zip Code"
                          placeholderTextColor="#9CA3AF"
                          value={values.zipcode}
                          onChangeText={handleChange('zipcode')}
                          onBlur={handleBlur('zipcode')}
                          keyboardType="numeric"
                        />
                      </View>
                      {touched.zipcode && errors.zipcode && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.zipcode}
                        </Text>
                      )}

                      {/* Email */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>Email</Text>
                      <View
                        style={tw`items-center w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter Email"
                          placeholderTextColor="#9CA3AF"
                          value={values.email}
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          keyboardType="email-address"
                        />
                      </View>
                      {touched.email && errors.email && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.email}
                        </Text>
                      )}

                      {/* Phone */}
                      <Text style={tw`text-[#040641] mt-3 mb-2`}>Phone</Text>
                      <View
                        style={tw`items-center w-[100%] rounded-[10px] flex-row border-[1px] border-[#0077B6]`}>
                        <TextInput
                          style={tw`text-[16px] h-10 w-[100%] px-4 text-[#040641]`}
                          placeholder="Enter Phone"
                          placeholderTextColor="#9CA3AF"
                          value={values.mobile}
                          onChangeText={handleChange('mobile')}
                          onBlur={handleBlur('mobile')}
                          keyboardType="phone-pad"
                        />
                      </View>
                      {touched.mobile && errors.mobile && (
                        <Text style={tw`text-red-500 text-xs mb-2`}>
                          {errors.mobile}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={tw`mt-4 h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center ${
                          isSubmitting ? 'opacity-50' : ''
                        }`}>
                        <Text style={tw`text-[#0077B6] text-center`}>
                          {isSubmitting ? 'Submitting...' : 'Add Church'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </Formik>
            </View>
          )}
        </View>
      </Modal>

      {(churchListLoading ||
        churchListFetching ||
        userUpdateLoading ||
        addChurchLoading ||
        organizationsListLoading) && <LoadingSpinner />}
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownAddChurch: {
    borderColor: '#0077B6',
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    marginBottom: 18,
    marginTop: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  itemName: {
    color: 'black',
    fontWeight: '600',
  },
  itemCity: {
    color: 'gray',
    fontSize: 13,
  },
  itemContainer: {
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#040641',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 16,
  },
});

export default CurrentChurchModal;
