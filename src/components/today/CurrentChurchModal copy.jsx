import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import {useDispatch, useSelector} from 'react-redux';
import {
  setSelectedChurch,
  hideCurrentChurchModal,
} from '../../features/auth/authSlice';
import {Dropdown} from 'react-native-element-dropdown';
import {useGetChurchesAPIQuery} from '../../features/churches/churchApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';
import {
  useUpdateCurrentChurchOfTheUserMutation,
  useRequestLeaderAccessAPIMutation,
} from '../../features/auth/authApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {Formik} from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  selectedChurch: yup.string().required('Please select a church'),
});

const CurrentChurchModal = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [listOfChurches, setListOfChurches] = useState([]);

  const debouncedSearchKeyword = useDebounce(search, 300);

  const {selectedChurchName, selectedChurchId, currentChurchModal} =
    useSelector(state => state.auth);

  const {
    data: churches,
    isLoading: churchListLoading,
    isFetching: churchListFetching,
  } = useGetChurchesAPIQuery(
    {search: debouncedSearchKeyword},
    {skip: search?.length < 5 && !debouncedSearchKeyword},
  );

  const [updateCurrentChurchOfTheUser, {isLoading: userUpdateLoading}] =
    useUpdateCurrentChurchOfTheUserMutation();

  const [requestLeaderAccessAPI, {isLoading: leaderRequestLoading}] =
    useRequestLeaderAccessAPIMutation();

  React.useEffect(() => {
    if (!churchListLoading && churches && churches?.length > 0) {
      setListOfChurches(churches);
    }
  }, [churchListLoading, churches]);

  const handleCloseModal = () => {
    dispatch(hideCurrentChurchModal());
    setSearch('');
    setValue(null);
    setListOfChurches([]);
  };

  const handleUpdateChurch = async (values, {resetForm}) => {
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

      resetForm();
      handleCloseModal();
      Alert.alert('Success', 'Church updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update church. Please try again.');
    }
  };

  const handleRequestLeader = async () => {
    if (!selectedChurchId) {
      Alert.alert('Error', 'Please select a church first');
      return;
    }

    try {
      await requestLeaderAccessAPI({church_id: selectedChurchId}).unwrap();
      Alert.alert('Success', 'Leader access request sent successfully!');
      handleCloseModal();
    } catch (error) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to send leader request',
      );
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={currentChurchModal}
        onRequestClose={handleCloseModal}>
        <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-t-[20px] p-6 h-[80%] shadow-lg`}>
            <Text
              style={tw`text-[20px] font-bold text-[#040641] text-center mb-4`}>
              Update Church
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Formik
                initialValues={{
                  selectedChurch: '',
                  selectedChurchId: '',
                  selectedChurchAddress: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdateChurch}>
                {({handleSubmit, setFieldValue, values, errors, touched}) => (
                  <>
                    <Dropdown
                      style={[
                        styles.dropdown,
                        isFocus && {borderColor: '#0077B6'},
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

                    <TouchableOpacity
                      onPress={handleSubmit}
                      style={tw`mt-6 h-[44px] rounded-[30px] bg-[#0077B6] flex justify-center items-center`}>
                      <Text style={tw`text-white text-[16px] font-medium`}>
                        Update Church
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleRequestLeader}
                      disabled={!selectedChurchId}
                      style={tw`mt-4 h-[44px] rounded-[30px] border-2 border-[#0077B6] flex justify-center items-center ${
                        !selectedChurchId ? 'opacity-50' : ''
                      }`}>
                      <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                        Request Leader Access
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCloseModal}
                      style={tw`mt-4`}>
                      <Text
                        style={tw`text-[#040641] text-center text-[14px] font-medium`}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {(churchListLoading ||
        churchListFetching ||
        userUpdateLoading ||
        leaderRequestLoading) && <LoadingSpinner />}
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
});

export default CurrentChurchModal;
