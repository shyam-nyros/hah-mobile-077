import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import tw from 'twrnc';
import {useDispatch, useSelector} from 'react-redux';
import {
  useUpdateCurrentChurchOfTheUserMutation,
  useUpdateUserAPIMutation,
} from '../../../features/auth/authApiSlice';
import {Dropdown} from 'react-native-element-dropdown';
import {useGetChurchesAPIQuery} from '../../../features/churches/churchApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';
import {setSelectedChurch} from '../../../features/auth/authSlice';
import useDebounce from '../../../utils/customhooks/useDebounce';

const validationSchema = yup.object().shape({
  selectedChurch: yup
    .string()
    .required('Please select a church')
    .min(4, 'Church name must be at least 4 characters'),
});

const CurrentChurchScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const debouncedSearchKeyword = useDebounce(search, 300);

  const {selectedChurchName} = useSelector(state => state.auth);

  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const [listOfChurches, setListOfChurches] = useState([]);

  const {
    data: churches,
    isLoading: churchListLoading,
    isFetching: churchListFetching,
    isError: churchListIsError,
    error: churchListError,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const [updateCurrentChurchOfTheUser, {isLoading: userUpdateLoading}] =
    useUpdateCurrentChurchOfTheUserMutation();

  const updateCurrentChurch = async (values, {resetForm}) => {
    try {


      const response = await updateCurrentChurchOfTheUser({
        church_id: values.selectedChurchId,
      }).unwrap();



      dispatch(
        setSelectedChurch({
          id: values?.selectedChurchId,
          name: values?.selectedChurch,
          address: values?.selectedChurchAddress,
        }),
      );
      // Reset form and dropdown state after submission
      resetForm();
      setSearch('');
      setValue(null);
      setListOfChurches([]);
      Alert.alert('Success', 'Church updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update church. Please try again.');
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

  return (
    <View style={tw`flex-1 bg-white`}>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={tw`mx-2 flex-row py-4 items-center`}>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
            <Text style={tw`text-xl text-[#fff] font-medium`}>
              Current Church
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={tw`px-4 mt-4`}>
        <View style={tw`flex-row items-center gap-2 mb-4`}>
          <Image
            source={require('../../../assets/images/churchicon1.png')}
            style={tw`w-6 h-6`}
          />
          <Text style={tw`text-gray-800 text-lg font-medium`}>
            Current Church
          </Text>
        </View>
        <View style={tw`bg-gray-100 p-4 rounded-md mb-6`}>
          <Text style={tw`text-gray-500`}>{selectedChurchName}</Text>
        </View>
        <Text style={tw`text-[#040641] text-[22px] font-bold my-4`}>
          Select Your Church
        </Text>

        <Formik
          initialValues={{
            selectedChurch: '',
            selectedChurchId: '',
            selectedChurchAddress: '',
          }}
          validationSchema={validationSchema}
          onSubmit={updateCurrentChurch}>
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            touched,
            errors,
          }) => (
            <>
              {/* <Dropdown
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
                  if (txt.length >= 4) {
                    setSearch(txt);
                  }
                }}
                onChange={item => {
             
                  setValue(item.value);
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
              /> */}

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
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChangeText={txt => {
                  if (txt.length >= 5) {
                    setSearch(txt);
                  }
                }}
                onChange={item => {
                  setValue(item._id); // Correctly set the value field
                  setIsFocus(false);
                  setFieldValue('selectedChurch', item.name);
                  setFieldValue('selectedChurchId', item._id);
                  setFieldValue('selectedChurchAddress', item.address);
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCity}>{item.city ? item.city : " --- "}</Text>
                    <Text style={styles.itemCity}>{item.zipcode ? item.zipcode : " --- "}</Text>
                  </View>
                )}
              />

              {touched.selectedChurch && errors.selectedChurch && (
                <Text style={tw`text-red-500 mb-4`}>
                  {errors.selectedChurch}
                </Text>
              )}

              <View style={tw` mt-20 justify-center items-center`}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={tw`mt-3 w-[280px] h-[44px] rounded-[30px] border-2 border-[#0077B6] flex flex-row justify-center items-center`}>
                  <Text style={tw`text-[#0077B6] text-[16px] font-medium `}>
                    Save New Church
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
      {/* spinner for search keyword fetching */}
      {(churchListLoading || churchListFetching) && <LoadingSpinner />}
      {userUpdateLoading && <LoadingSpinner marginTop={120} />}
    </View>
  );
};

export default CurrentChurchScreen;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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
