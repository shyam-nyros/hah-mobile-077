import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import tw from 'twrnc';
import {Dropdown} from 'react-native-element-dropdown';
import {useGetChurchesAPIQuery} from '../../features/churches/churchApiSlice';
import {
  useAddAnotherChurchAPIMutation,
  useDeleteAnotherChurchAPIMutation,
  useUserFollowedChurchesAPIQuery,
} from '../../features/auth/authApiSlice';
import {
  removeItemFromFollowedChurchList,
  setFollowedChurches,
} from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../../utils/customalert/CustomAlert';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import useDebounce from '../../utils/customhooks/useDebounce';

// Define the validation schema using yup
const validationSchema = yup.object().shape({
  selectedChurch: yup.string().required('Please select a church'),
});

const FollowChurchScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {churchList} = useSelector(state => state.church);
  const {followedChurchList} = useSelector(state => state.auth);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [listOfChurches, setListOfChurches] = useState([]);
  const debouncedSearchKeyword = useDebounce(search, 300);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedChurch, setSelectedChurchState] = useState(null);

  const [churchNameInAlert, setChurchNameInAlert] = useState('');
  const [churchIdInAlert, setChurchIdInAlert] = useState('');
  const [
    addAnotherChurchAPI,
    {isLoading: userUpdateLoading, error: userUpdateError},
  ] = useAddAnotherChurchAPIMutation();

  const [
    deleteAnotherChurchAPI,
    {isLoading: deleteChurchLoading, error: deleteChurchError},
  ] = useDeleteAnotherChurchAPIMutation();

  const [alertVisible, setAlertVisible] = useState(false);

  const {
    data,
    isLoading: followedChurchListLoading,
    error: followedChurchListError,
  } = useUserFollowedChurchesAPIQuery();

  const {
    data: churches,
    isLoading: churchListLoading,
    isError: churchListError,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const handleNext = async () => {
    if (!followedChurchList.length > 0) {
      Alert.alert('Error', 'Please add at least one church');
      return;
    }
    navigation.navigate('Interests');
  };

  const addChurch = async (values, {setSubmitting, resetForm}) => {
    if (values.selectedChurch) {
      try {
        const response = await addAnotherChurchAPI({
          church: values.selectedChurchId,
        }).unwrap();
        dispatch(setFollowedChurches(response.following_churches));
      } catch (error) {}
      resetForm();
      setSearch('');
      setValue(null);
      setListOfChurches([]);
    }
  };

  useEffect(() => {
    if (!followedChurchListLoading) {
      if (data.length > 0) {
        dispatch(setFollowedChurches(data));
      }
    }
  }, [followedChurchListLoading]);

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
    } catch (error) {}
  };

  const showChurchRemoveAlert = church => {
    setAlertVisible(true);
    setChurchNameInAlert(church.name);
    setChurchIdInAlert(church._id);
  };

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
        onPress={() => showChurchRemoveAlert(item)}
        style={tw`p-2`}>
        <Image
          source={require('../../assets/images/closeicon.png')}
          style={tw` w-4 h-4`}
        />
        {/* <Text>X</Text> */}
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <LinearGradient
        colors={['#0077B6', '#90E0EF']}
        style={tw`h-[120px] bg-white`}></LinearGradient>

      <View
        style={[
          tw`bg-white rounded-[40px] h-[700px] h-full bg-white px-4`,
          {marginTop: -30},
        ]}>
        {userUpdateLoading && <LoadingSpinner />}
        {deleteChurchLoading && <LoadingSpinner />}
        {followedChurchListLoading && <LoadingSpinner />}
        {/* <TouchableOpacity onPress={() => navigation.navigate('Church')}>
          <Image
            source={require('../../assets/images/backnav.png')}
            style={tw`mt-[14px] `}
          />
        </TouchableOpacity> */}

        <CustomAlert
          visible={alertVisible}
          boldText={churchNameInAlert}
          message={'Are you sure to unfollow ?'}
          onConfirm={() => {
            setAlertVisible(false);
            handleRemoveChurch(churchIdInAlert);
          }}
          onCancel={() => {
            setAlertVisible(false);
          }}
        />

        <Text
          style={tw`text-[#040641] text-[22px] md:text-2xl lg:text-2xl font-bold mt-8  text-left`}>
          Want to follow more Churches?  Add them below.
        </Text>

        <Formik
          initialValues={{
            selectedChurch: '',
            selectedChurchId: '',
            selectedChurchAddress: '',
          }}
          validationSchema={validationSchema}
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
                style={[styles.dropdown, isFocus && {borderColor: '#0077B6'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={listOfChurches || []}
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
                  setFieldValue('selectedChurchAddress', item?.address); // Optional: Set city
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCity}>{item.city}</Text>
                  </View>
                )}
              />
              {touched.selectedChurch && errors.selectedChurch && (
                <Text style={tw`text-red-500 mb-4`}>
                  {errors.selectedChurch}
                </Text>
              )}
              {followedChurchList.length < 10 && (
                <View style={tw`w-full items-center`}>
                  <TouchableOpacity
                    style={tw`mt-3 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}
                    onPress={handleSubmit}>
                    <Image
                      source={require('../../assets/images/plusicon.png')}
                    />
                    <Text
                      style={tw`text-[#0077B6] text-[16px] font-medium ml-2`}>
                      Add another Chruch
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={tw`mt-5`}>
                <View style={tw`flex flex-row`}>
                  <Image
                    source={require('../../assets/images/churchicon.png')}
                  />
                  <Text style={tw`text-[18px] text-[#040641] font-bold ml-2`}>
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
                    // persistentScrollbar
                    data={followedChurchList}
                    keyExtractor={(item, index) => item._id}
                    renderItem={followedChurches}
                  />
                </View>
              </View>

              {/* <View style={tw`mt-3 flex flex-row justify-center  `}>
                <Text
                  style={tw`text-[#040641] text-[15px] md:text-lg lg:text-lg font-medium`}>
                  Didn't find your church? Please add
                </Text>
                <TouchableOpacity>
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
              </View> */}

              <View style={tw`items-center`}>
                <TouchableOpacity
                  style={tw`mt-4 w-[322px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}
                  onPress={handleNext}>
                  <Text style={tw`text-[#0077B6] text-[16px] font-medium ml-2`}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Interests');
                }}>
                <Text
                  style={tw`text-[#040641] text-[16px] font-semibold mt-5 text-center`}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </View>
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
    marginTop: 2,
    marginBottom: 5,
    marginLeft: 5,
  },
  church: {
    height: hp('25%'),
    padding: 3,
  },

  dropdownItem: {
    color: '#ccc',
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
  },
  itemCity: {
    color: 'gray',
    fontSize: 13,
  },
});
export default FollowChurchScreen;
