// ChurchScreen.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Pressable,
  Button,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import {Dropdown} from 'react-native-element-dropdown';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  setChurchList,
  setOrganizationsList,
} from '../../features/churches/churchSlice';
import countries from './Countries';

import {useDispatch, useSelector} from 'react-redux';
import {
  useGetChurchesAPIQuery,
  useGetOrganizationsAPIQuery,
} from '../../features/churches/churchApiSlice';
import {useRequestAddChurchAPIMutation} from '../../features/auth/authApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';

import {
  setIsLeader,
  setSelectedChurch,
  removeSelectedChurch,
  setShowAddChurch,
  unsetIsLeader,
  userIntro,
} from '../../features/auth/authSlice';
import {useUpdateUserAPIMutation} from '../../features/auth/authApiSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CheckBox from '@react-native-community/checkbox';
import CustomAlert from '../../utils/customalert/CustomAlert';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LeaderAlert from '../../utils/customalert/LeaderAlert';

// Define the validation schema using yup
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
    // .matches(
    //   /^(\\+?\\d{1,4})?(\\d{7,15})$/,
    //   'Please enter a valid phone number',
    // ),
    .matches(/^\+?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number'),
  parent_organization: yup.string().required('Parent Organization is required'),
});

const ChurchScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [alertVisible, setAlertVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  const [churchAlertVisible, setChurchAlertVisible] = useState(false);

  const debouncedSearchKeyword = useDebounce(search, 300);

  const {location} = useSelector(state => state.auth);
  const organizationOptions = useSelector(
    state => state.church.organizationsList.organizations,
  );
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const [listOfChurches, setListOfChurches] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [requestAddChurch, {isLoading, err}] = useRequestAddChurchAPIMutation();

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmitChurch = async (values, {setSubmitting, resetForm}) => {
    try {
      await requestAddChurch(values).unwrap();
      setModalVisible(false);
    } catch (err) {}
  };

  const {
    selectedChurch,
    selectedChurchId,
    selectedChurchAddress,
    isLeader,
    showAddChurch,
  } = useSelector(state => state.auth);

  const {
    data: churches,
    isLoading: churchListLoading,
    isFetching: churchListFetching,
    isError: churchListError,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const {data: organizations, isLoading: organizationsListLoading} =
    useGetOrganizationsAPIQuery();

  const [isLeaderLocal, setIsLeaderLocal] = useState(isLeader);

  const [
    updateUserAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useUpdateUserAPIMutation();

  // const handleNext = async () => {
  //   if (!selectedChurch) {
  //     Alert.alert('Information', 'Please select your church');
  //     return;
  //   }

  //   try {
  //     const response = await updateUserAPI({
  //       church_id: selectedChurchId,
  //       is_leader: isLeader,
  //     }).unwrap();

  //     navigation.navigate('FollowChurch');
  //   } catch (error) {}
  // };

  const handleNext = async () => {
    if (!selectedChurch) {
      Alert.alert('Information', 'Please select your church');
      return;
    }

    try {
      const response = await updateUserAPI({
        church_id: selectedChurchId,
        is_leader: isLeader,
      }).unwrap();

      // Skip FollowChurch and Interests screens, go directly to main app
      dispatch(userIntro());
      console.log('Church selected, navigating to Today screen');
    } catch (error) {}
  };

  useEffect(() => {
    setIsLeaderLocal(isLeader);
  }, [isLeader]);

  const addChurch = async (values, {setSubmitting, resetForm}) => {
    if (values.selectedChurch) {
      dispatch(
        setSelectedChurch({
          name: values.selectedChurch,
          id: values.selectedChurchId,
          address: values.selectedChurchAddress,
        }),
      );
      dispatch(setShowAddChurch());
      resetForm();
      setSearch('');
      setValue(null);
      setListOfChurches([]);
    }
  };

  useEffect(() => {
    if (search?.length >= 4) {
      setSearch(search);
    }
  }, [search]);

  useEffect(() => {
    if (!churchListLoading && churches && churches?.length > 0) {
      setListOfChurches(churches);
    }
  }, [churchListLoading, churches]);

  // useEffect(() => {
  //   if (!churchListLoading) {
  //     if (data?.churches.length > 0) {
  //       dispatch(setChurchList(data.churches));
  //     }
  //   }
  // }, [churchListLoading]);

  useEffect(() => {
    if (organizations) {
      dispatch(setOrganizationsList(organizations));
    }
  }, [organizations, dispatch]);

  const showAlert = toggle => {
    setIsLeaderLocal(toggle);
    if (toggle) {
      setAlertVisible(true);
    }
    if (isLeaderLocal) {
      dispatch(unsetIsLeader());
    }
  };

  const showChurchRemoveAlert = church => {
    setChurchAlertVisible(true);
  };

  const handleRemoveChurch = async => {
    dispatch(setShowAddChurch());
    dispatch(removeSelectedChurch());
    dispatch(unsetIsLeader());
    setIsLeaderLocal(false);
  };

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <LinearGradient
        colors={['#0077B6', '#90E0EF']}
        style={tw`h-[120px] bg-white`}></LinearGradient>
      <View
        style={[tw` rounded-[40px] h-full bg-white px-4`, {marginTop: -30}]}>
        {userUpdateLoading && <LoadingSpinner />}
        {/* <TouchableOpacity onPress={() => navigation.navigate('Location')}>
          <Image
            source={require('../../assets/images/backnav.png')}
            style={tw`mt-[14px] `}
          />
        </TouchableOpacity> */}

        <LeaderAlert
          visible={alertVisible}
          boldText={selectedChurch ? selectedChurch : ''}
          message={'Are you sure you want to set yourself as a Leader for ? '}
          // message={'Are you sure you want to set yourself as a Leader ? '}
          onConfirm={() => {
            dispatch(setIsLeader());
            setAlertVisible(false);
          }}
          onCancel={() => {
            dispatch(unsetIsLeader());
            setIsLeaderLocal(false);
            setAlertVisible(false);
          }}
        />

        <View>
          <Text
            style={tw`text-[#040641] text-[22px] md:text-2xl lg:text-2xl font-bold mt-8 mx-4 text-left`}>
            Select Your Church
          </Text>

          {/* <Text>{JSON.stringify(location)}</Text> */}
          {(churchListLoading || churchListFetching) && (
            <LoadingSpinner size={'small'} />
          )}
          <Formik
            initialValues={{
              selectedChurch: '',
              selectedChurchId: '',
              selectedChurchAddress: '',
            }}
            // validationSchema={validationSchema}
            onSubmit={addChurch}>
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
                <Dropdown
                  disable={!showAddChurch}
                  style={[styles.dropdown, isFocus && {borderColor: '#0077B6'}]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={listOfChurches?.length > 0 ? listOfChurches : []}
                  search
                  maxHeight={300}
                  labelField="name"
                  valueField="_id"
                  placeholder={!isFocus ? 'Select church' : 'Select church'}
                  searchPlaceholder="Search for a church"
                  placeholderTextStyle={tw`text-black`}
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
                    setFieldValue('selectedChurch', item?.name);
                    setFieldValue('selectedChurchId', item?._id);
                    setFieldValue('selectedChurchAddress', item?.address);
                    // trigger submit as soon as the item is selected
                    handleSubmit();
                  }}
                  renderItem={item => (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {/* <Text style={styles.itemCity}>{item.city}</Text> */}
                      <Text style={styles.itemCity}>
                        {item.city ? item.city : ' --- '}
                      </Text>
                      <Text style={styles.itemCity}>
                        {item.zipcode ? item.zipcode : ' --- '}
                      </Text>
                    </View>
                  )}
                />
                {touched.selectedChurch && errors.selectedChurch && (
                  <Text style={tw`text-red-500 mb-4`}>
                    {errors.selectedChurch}
                  </Text>
                )}
                {selectedChurch && (
                  <View style={tw`flex flex-row items-center`}>
                    <View
                      style={tw`w-[22px] h-[22px] mr-2 justify-center overflow-hidden items-center rounded-full border border-[#0077B6] border-2 `}>
                      <CheckBox
                        disabled={false}
                        value={isLeaderLocal}
                        onValueChange={showAlert}
                        // onValueChange={() => setAlertVisible(true)}
                      />
                    </View>
                    <Text style={tw`text-[14px]   text-[#040641]`}>
                      I am a leader of this church
                    </Text>
                  </View>
                )}

                {/* {showAddChurch && (
                  <View style={tw`w-full items-center`}>
                    <TouchableOpacity
                      style={tw`mt-6 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}
                      onPress={handleSubmit}>
                      <Image
                        source={require('../../assets/images/plusicon.png')}
                      />
                      <Text
                        style={tw`text-[#0077B6] text-[16px] font-medium ml-2`}>
                        Add Chruch
                      </Text>
                    </TouchableOpacity>
                  </View>
                )} */}

                <View style={tw`mt-8`}>
                  <View style={tw`flex flex-row`}>
                    <Image
                      source={require('../../assets/images/churchicon.png')}
                    />
                    <Text style={tw`text-[18px] text-[#040641] font-bold ml-2`}>
                      Your Church
                    </Text>
                  </View>
                  {!selectedChurch && (
                    <View style={{height: 160, padding: 3}}>
                      <View
                        style={tw`w-full h-[58px] bg-[#040641] bg-opacity-6 rounded-[16px] flex justify-center items-start mt-3`}>
                        <Text
                          style={tw`text-[#040641] text-base md:text-lg lg:text-lg ml-4`}>
                          No Data yet
                        </Text>
                      </View>
                    </View>
                  )}

                  {!churchListLoading && selectedChurch && (
                    <View style={{height: 160, padding: 3}}>
                      <View
                        style={tw`w-full py-[10px] bg-[#040641] bg-opacity-6 rounded-[16px] flex flex-row justify-between items-center mt-3 px-4`}>
                        {/* Text Content */}
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-[#040641] text-base md:text-lg lg:text-lg`}>
                            {selectedChurch}
                          </Text>
                          <Text
                            style={tw`text-[#040641] text-[12px] md:text-[14px]`}>
                            {selectedChurchAddress}
                          </Text>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                          onPress={() => showChurchRemoveAlert()}
                          style={tw``}>
                          <Image
                            source={require('../../assets/images/closeicon.png')}
                            style={tw`w-6 h-6`}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                <CustomAlert
                  visible={churchAlertVisible}
                  boldText={selectedChurch}
                  message={'Are you sure to remove the selected church ?'}
                  onConfirm={() => {
                    setChurchAlertVisible(false);
                    handleRemoveChurch();
                  }}
                  onCancel={() => {
                    setChurchAlertVisible(false);
                  }}
                />

                <View style={tw`flex flex-row justify-center mt-4`}>
                  <Text
                    style={tw`text-[#040641] text-[15px] md:text-lg lg:text-lg font-medium`}>
                    Didn't find your church? Please add
                  </Text>
                  <TouchableOpacity onPress={handleOpenModal}>
                    <Text
                      style={[
                        tw`text-[#0077B6] text-[15px] md:text-lg lg:text-lg font-medium ml-1`,
                        {
                          textDecorationLine: 'underline',
                          textDecorationColor: '#0077B6',
                        },
                      ]}>
                      here
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <View style={tw`items-center`}>
                    <TouchableOpacity
                      style={tw`mt-4  w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}
                      onPress={handleNext}>
                      <Text
                        style={tw`text-[#0077B6] text-[16px] font-medium ml-2`}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('FollowChurch');
                    }}>
                    <Text
                      style={tw`text-[#040641] text-[16px] font-semibold mt-6 text-center`}>
                      Skip for now
                    </Text>
                  </TouchableOpacity> */}
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>

      {/* Modal for showing the input form */}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View
          style={tw`flex-1 justify-center items-center bg-gray-900 bg-opacity-40`}>
          <View style={tw`bg-white w-[90%] h-[70%] rounded-[10px]`}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
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
              }) => (
                <ScrollView>
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
                      style={[tw`w-full`, styles.dropdown]}
                      selectedTextStyle={[
                        tw`text-[#000] text-[16px]`,
                        styles.selectedTextStyle,
                      ]}
                      data={organizationOptions}
                      labelField="name"
                      valueField="_id"
                      placeholder="Select Parent Organization"
                      placeholderStyle={tw`text-gray-400 `}
                      placeholderTextColor="black"
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
                    {/* country input */}
                    <Text style={tw`text-[#040641] mt-3 mb-2`}>Country </Text>
                    <Dropdown
                      style={[tw`w-full`, styles.dropdown]}
                      selectedTextStyle={[
                        tw`text-[#000] text-[14px]`,
                        styles.selectedTextStyle,
                      ]}
                      data={countries}
                      labelField="label"
                      valueField="value"
                      placeholder="Select a country"
                      placeholderStyle={tw`text-gray-400 ml-3`}
                      placeholderTextColor="black"
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
                    <KeyboardAwareScrollView>
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
                    </KeyboardAwareScrollView>

                    <TouchableOpacity
                      onPress={handleSubmit}
                      style={tw`mt-4   h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}>
                      <Text style={tw`text-[#0077B6] text-center`}>
                        Add Church
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </Formik>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    width: '100%',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  itemContainer: {
    paddingHorizontal: 10,
    color: 'black',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#040641',
  },
  address: {
    fontSize: 14,
    color: '#0077B6',
    color: 'black',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 16,
  },
  inputbar: {
    width: '90%',
    height: 48,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    marginBottom: 1,
  },
  dropdownItem: {
    color: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  itemName: {
    color: 'black',
  },
  itemCity: {
    color: 'gray',
    fontSize: 13,
  },
});
export default ChurchScreen;
