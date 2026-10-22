import React, {useEffect, useState} from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {Formik} from 'formik';
import {useGetChurchesAPIQuery} from '../../features/churches/churchApiSlice';

import tw from 'twrnc';

import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import useDebounce from '../../utils/customhooks/useDebounce';
import {
  useUserFollowedChurchesAPIQuery,
  useAddAnotherChurchAPIMutation,
  useDeleteAnotherChurchAPIMutation,
} from '../../features/auth/authApiSlice';
import {
  removeItemFromFollowedChurchList,
  setFollowedChurches,
} from '../../features/auth/authSlice';
import * as yup from 'yup';
import LoadingSpinner from '../LoadingSpinner';
import {hideAddMoreChurchesModal} from '../../features/livechurches/liveChurchSlice';

const validationSchema = yup.object().shape({
  selectedChurch: yup.string().required('Please select a church'),
});

const OtherLiveChurchModal = ({showSearchOverlay, setShowSearchOverlay}) => {
  const dispatch = useDispatch();

  const {followedChurchList} = useSelector(state => state.auth);
  const [search, setSearch] = useState('');
  const debouncedSearchKeyword = useDebounce(search, 300);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [listOfChurches, setListOfChurches] = useState([]);

  const {liveModalForm} = useSelector(state => state.auth);
  const {addMoreChurchesModal} = useSelector(state => state.livechurch);
  const {
    data: churches,
    isLoading: churchListLoading,
    isError: churchListError,
    isFetching: churchListFetching,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const [
    addAnotherChurchAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useAddAnotherChurchAPIMutation();

  const [
    deleteAnotherChurchAPI,
    {isLoading: deleteChurchLoading, error: deleteChurchError},
  ] = useDeleteAnotherChurchAPIMutation();

  const handleSubmit = async () => {
    if (!followedChurchList.length > 0) {
      Alert.alert('Error', 'Please add at least one church');
      return;
    }
    setShowSearchOverlay(false);
  };

  const handleCloseButton = () => {
    dispatch(hideAddMoreChurchesModal());
  };

  const addChurch = async (values, {setSubmitting, resetForm}) => {
    // Check if the church is already followed
    const isAlreadyFollowed = followedChurchList.some(
      church => church._id === values.selectedChurchId,
    );

    if (isAlreadyFollowed) {
      Alert.alert('Error', 'This church is already followed.');
      resetForm();
      return;
    }

    if (values.selectedChurch) {
      try {
        const response = await addAnotherChurchAPI({
          church: values.selectedChurchId,
        }).unwrap();

        dispatch(setFollowedChurches(response.following_churches));
        Alert.alert('Success', 'Church added successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to add church. Please try again.');
        console.error('Error adding church:', error);
      }
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

  const handleRemoveChurch = async id => {
    try {
      const response = await deleteAnotherChurchAPI({
        church: id,
      }).unwrap();

      dispatch(removeItemFromFollowedChurchList({id}));
      Alert.alert('Success', 'Church removed successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove church. Please try again.');
      console.error('Error removing church:', error);
    }
  };
  {
    userUpdateLoading && <LoadingSpinner />;
  }
  {
    deleteChurchLoading && <LoadingSpinner />;
  }

  const followedChurches = ({item}) => (
    <View
      style={tw`w-full h-auto bg-[#040641] bg-opacity-6 rounded-[16px] flex flex-row justify-between items-center mt-3 px-4 py-2`}>
      <View style={tw`flex-1`}>
        <Text style={tw`text-[#040641] text-base md:text-lg lg:text-lg`}>
          {item.name}
        </Text>
        <Text style={tw`text-[#040641] text-[12px] md:text-[14px]`}>
          {item.address}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveChurch(item._id)}
        style={tw`p-2`}>
        <Image
          source={require('../../assets/images/closeicon.png')}
          style={tw`w-4 h-4`}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView>
      <Modal
        style={{zIndex: 1000}}
        animationType="none"
        transparent
        visible={addMoreChurchesModal}
        onRequestClose={handleCloseButton}>
        <View
          style={tw`w-full justify-center items-center bg-gray-900  bg-opacity-20 px-4`}>
          {(userUpdateLoading || deleteChurchLoading) && <LoadingSpinner />}
          {(churchListLoading || churchListFetching) && (
            <LoadingSpinner size={'small'} />
          )}

          <View>
            <View style={[tw` `, styles.modalOverlay]}>
              <ScrollView contentContainerStyle={tw`mt-16`}>
                <View style={[tw` `, styles.alertBox]}>
                  <View
                    style={tw` w-[100%] flex-row justify-between items-center`}>
                    <Text style={[tw`font-semibold`, styles.message]}>
                      Add More churches
                    </Text>
                    <TouchableOpacity onPress={handleCloseButton}>
                      <Image
                        source={require('../../assets/images/closeicon.png')}
                        style={tw`w-6 h-6`}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={tw` w-[100%]`}>
                    <View style={tw` w-[100%]`}>
                      <View
                        style={tw`mt-3 rounded-[40px] overflow-hidden`}></View>
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
                            <View style={tw`w-[100%]`}>
                              <Dropdown
                                disable={followedChurchList.length === 10}
                                style={[
                                  styles.dropdown,
                                  isFocus && {borderColor: '#0077B6'},
                                ]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={
                                  listOfChurches?.length > 0
                                    ? listOfChurches
                                    : []
                                }
                                search
                                maxHeight={300}
                                labelField="name"
                                valueField="_id"
                                placeholder={
                                  !isFocus ? 'Select church' : 'Select church'
                                }
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
                                  setFieldValue(
                                    'selectedChurchAddress',
                                    item?.address,
                                  );
                                  handleSubmit();
                                }}
                                renderItem={item => (
                                  <View style={styles.dropdownItem}>
                                    <Text style={styles.itemName}>
                                      {item.name}
                                    </Text>
                                    {/* <Text style={styles.itemCity}>
                                      {item.city}
                                    </Text> */}
                                    <Text style={styles.itemCity}>
                                      {item.city ? item.city : ' --- '}
                                    </Text>
                                    <Text style={styles.itemCity}>
                                      {item.zipcode ? item.zipcode : ' --- '}
                                    </Text>
                                  </View>
                                )}
                              />
                              {touched.selectedChurch &&
                                errors.selectedChurch && (
                                  <Text style={tw`text-red-500 mb-4`}>
                                    {errors.selectedChurch}
                                  </Text>
                                )}

                              {/* {followedChurchList.length < 10 && (
                                <View style={tw` items-center`}>
                                  <TouchableOpacity
                                    style={[
                                      tw`mt-3 w-[90%] h-[44px] rounded-[30px] border-2 flex flex-row justify-center items-center`,
                                      followedChurchList.length >= 10
                                        ? tw`border-gray-400 bg-gray-300`
                                        : tw`border-[#0077B6]`,
                                    ]}
                                    onPress={
                                      !userUpdateLoading ? handleSubmit : null
                                    }
                                    disabled={followedChurchList.length >= 10}>
                                    <Image
                                      source={require('../../assets/images/plusicon.png')}
                                      style={[
                                        followedChurchList.length >= 10
                                          ? {tintColor: 'gray'}
                                          : {tintColor: '#0077B6'},
                                      ]}
                                    />
                                    <Text
                                      style={[
                                        tw`text-[16px] font-medium ml-2`,
                                        followedChurchList.length >= 10
                                          ? tw`text-gray-500`
                                          : tw`text-[#0077B6]`,
                                      ]}>
                                      Add another Church
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )} */}
                              <View style={tw`mt-5`}>
                                <View style={tw`flex flex-row`}>
                                  <Image
                                    source={require('../../assets/images/churchicon.png')}
                                  />
                                  <Text
                                    style={tw`text-[18px] text-[#040641] font-bold ml-2`}>
                                    {`Churches you follow  ${followedChurchList.length}/10`}
                                  </Text>
                                </View>

                                {followedChurchList.length === 0 && (
                                  <View style={{height: 5, padding: 3}}>
                                    <View
                                      style={tw`w-full h-[58px] bg-[#040641] bg-opacity-6 rounded-[16px] flex justify-center items-start mt-3`}>
                                      <Text
                                        style={tw`text-[#040641] text-base md:text-lg lg:text-lg ml-4`}>
                                        No Data yet
                                      </Text>
                                    </View>
                                  </View>
                                )}

                                <View style={styles.church}>
                                  <FlatList
                                    data={followedChurchList}
                                    keyExtractor={(item, index) => item._id}
                                    renderItem={followedChurches}
                                  />
                                </View>
                              </View>
                              <View style={tw`items-center`}>
                                <TouchableOpacity
                                  style={tw`mt-4 w-[80%] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}
                                  onPress={handleCloseButton}>
                                  <Text
                                    style={tw`text-[#0077B6] text-[16px] font-medium ml-2`}>
                                    Continue
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </>
                        )}
                      </Formik>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
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
    width: '100%',
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
  addButton: {
    backgroundColor: '#0077B6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownItem: {
    color: 'black',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'black',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    color: 'black',
  },
  church: {
    height: hp('45%'),
    padding: 3,
    overflow: 'scroll',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: hp('2.8%'),
    textAlign: 'start',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  button: {
    padding: 10,
    marginHorizontal: 10,
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
    marginBottom: 5,
    marginLeft: 5,
  },
  itemName: {
    color: 'black',
  },
  itemCity: {
    color: 'gray',
    fontSize: 13,
  },
});

export default OtherLiveChurchModal;
