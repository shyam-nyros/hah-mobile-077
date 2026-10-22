import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  TextInput,
  Platform,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
  Button,
  Alert,
} from 'react-native';
import {useGetLiveChurchesAPIQuery} from '../../features/livechurches/liveChurchAPiSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import LiveChurchList from '../../components/livechurch/LiveChurchList';
import OtherLiveChurchModal from '../../components/livechurch/OtherLiveChurchModal';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import {HomeIcon} from 'react-native-heroicons/outline';
// import Geolocation from '@react-native-community/geolocation';
import GetLocation from 'react-native-get-location';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import RNAndroidLocationEnabler, {
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {
  hideLiveModalForm,
  showLiveModalForm,
} from '../../features/auth/authSlice';
import {useDispatch, useSelector} from 'react-redux';
import {showAddMoreChurchesModal} from '../../features/livechurches/liveChurchSlice';
import useDebounce from '../../utils/customhooks/useDebounce';

const LiveChurchScreen = ({navigation}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshList, setRefreshList] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);
  const [fetchingCoords, setFetchingCoords] = useState(false);
  const dispatch = useDispatch();
  const {liveModalForm} = useSelector(state => state.auth);
  const {addMoreChurchesModal} = useSelector(state => state.livechurch);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [coords, setCoords] = useState({
    latitude: '',
    longitude: '',
  });

  const [currentCoords, setCurrentCoords] = useState({
    latitude: '',
    longitude: '',
  });

  const handleSearchInput = txt => {
    setSearchKeyword(txt);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showLocationErrorModal, setShowLocationErrorModal] = useState(false);

  const {
    data: liveChurches,
    isLoading: liveChurchListLoading,
    isFetching: liveChurchListFetching,
    error: liveChurchListError,
  } = useGetLiveChurchesAPIQuery(
    {
      search: debouncedSearchKeyword,
      page: currentPage,
      location: coords,
    },
    {refetchOnMountOrArgChange: true},
  );

  useEffect(() => {
    if (debouncedSearchKeyword !== '') {
      setCurrentPage(1);
      setRefreshList(true);
    }
  }, [debouncedSearchKeyword]);

  const handleEndReached = () => {
    if (liveChurches?.hasMore && !liveChurchListFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setRefreshList(true);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    setRefreshList(true);
  };

  useEffect(() => {
    if (!liveChurchListFetching) {
      setRefreshList(false);
    }
  }, [liveChurchListFetching, liveChurches, liveChurchListError, refreshList]);

  const handleShowLiveModalForm = () => {
    dispatch(showLiveModalForm());
  };

  // Function to check if location is enabled
  const checkIfLocationEnabled = async () => {
    if (Platform.OS === 'android') {
      try {
        const enabled = await promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });
        return enabled === 'enabled' || enabled === 'already-enabled';
      } catch (error) {
        console.error('Error checking location status:', error);
        return false;
      }
    }
    return true; // Assume enabled on iOS
  };

  const Placeholder = () => (
    <View style={tw`mb-4 mx-4`}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={tw`flex-row items-center mb-3`}>
          <ShimmerPlaceholder
            style={tw`h-30 w-25 rounded-6 mt-3`}
            LinearGradient={LinearGradient}
          />
          <View style={tw`ml-2`}>
            <ShimmerPlaceholder
              style={tw`h-4 w-60 mb-2 rounded-full`}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={tw`h-3 w-40 mb-2 rounded-full`}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={tw`h-3 w-20 mb-2 rounded-full`}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={tw`h-3 w-30 mb-2 rounded-full`}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>
      ))}
    </View>
  );

  // Function to request location permission
  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    try {
      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Denied',
          'Location permission is permanently denied. Please enable it in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        return false;
      }
    } catch (error) {
      console.error('Error checking/requesting permission:', error);
      return false;
    }
  };

  const enableGPS = async () => {
    setFetchingCoords(true);
    setGpsEnabled(true);
  };

  const disableGPS = () => {
    setCurrentPage(1);
    setFetchingCoords(false);
    setGpsEnabled(false);
    setCoords({latitude: '', longitude: ''});
  };

  const fetchCurrentUserCoords = async () => {
    // check for android
    if (Platform.OS === 'android') {
      const isLocationEnabled = await checkIfLocationEnabled();

      if (!isLocationEnabled) {
        Alert.alert(
          'Location Disabled',
          'Please enable location services to fetch coordinates.',
          [{text: 'Retry', onPress: fetchCurrentUserCoords}],
        );
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission is required',
          'Please provide permission in the app settings.',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => disableGPS()},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        return;
      }

      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        const {latitude, longitude} = location;

        setCurrentCoords({latitude, longitude});
      } catch (error) {
        console.error('Error fetching location:', error);
        setGpsEnabled(false);
        Alert.alert(
          'Error',
          error.code === 'UNAVAILABLE'
            ? 'Location services are unavailable.'
            : error.code === 'TIMEOUT'
            ? 'Fetching location timed out.'
            : 'Failed to fetch location.',
        );
      } finally {
        setFetchingCoords(false);
      }
    }

    // check for ios
    if (Platform.OS === 'ios') {
      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        const {latitude, longitude} = location;

        setCurrentCoords({latitude, longitude});
      } catch (error) {
        console.error('Error fetching location:', error);
        setGpsEnabled(false);
        setShowLocationErrorModal(true);
      } finally {
        setFetchingCoords(false);
      }
    }
  };

  useEffect(() => {
    if (gpsEnabled) {
      fetchCurrentUserCoords();
    }
  }, [gpsEnabled]);

  useEffect(() => {
    if (gpsEnabled && currentCoords) {
      setCurrentPage(1);
      setCoords({
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
      });
    }
  }, [currentCoords]);

  return (
    <>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <View style={tw`flex flex-row justify-between items-center mx-4`}>
          <Text style={tw`text-xl text-[#fff] font-semibold`}>Live church</Text>

          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              style={tw`mr-4 py-4`}
              onPress={() => navigation.navigate('Today')}>
              <HomeIcon color="#fff" size={26} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`mr-3 py-3`}
              onPress={() => (gpsEnabled ? disableGPS() : enableGPS())}>
              <Image
                source={
                  gpsEnabled
                    ? require('../../assets/images/Locationmarkactive.png')
                    : require('../../assets/images/locationiconwhite.png')
                }
                style={tw`w-8 h-8`}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`py-3`}
              onPress={() => dispatch(showAddMoreChurchesModal())}>
              <Image
                source={require('../../assets/images/addchurchwhite.png')}
                style={tw`w-8 h-8`}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={tw`px-4 bg-white`}>
        {/* Search */}
        <View style={tw`mb-2 rounded-[10px]`}>
          <View style={styles.inputbar}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TextInput
                placeholder="Search"
                value={searchKeyword}
                placeholderTextColor="rgba(4, 6, 65, 0.7)"
                style={tw` text-[15px] flex-1 h-full text-black`}
                onChangeText={handleSearchInput}
              />
              <View style={tw`flex-row gap-3 justify-center items-center`}>
                {searchKeyword && (
                  <TouchableOpacity onPress={clearSearch}>
                    <Image
                      source={require('../../assets/images/closeicon.png')}
                      style={tw` w-7 h-7`}
                    />
                  </TouchableOpacity>
                )}
                <Image
                  // source={require('../../assets/images/filtericon.png')}
                  source={require('../../assets/images/searchicon2.png')}
                  style={tw` ${searchKeyword ? '' : ''} w-7 h-7`}
                />
              </View>
            </View>
          </View>
        </View>
        {gpsEnabled ? (
          <Text style={tw`text-[16px] font-semibold text-[#040641]`}>
            Live Churches Near Your Location
          </Text>
        ) : (
          <Text style={tw`text-[16px] font-semibold text-[#040641]`}>
            All Live Churches
          </Text>
        )}
      </View>
      {liveChurchListLoading ||
      fetchingCoords ||
      (liveChurchListFetching && currentPage === 1) ? (
        <Placeholder />
      ) : liveChurchListError ? (
        <View style={tw`flex-1 justify-center items-center mt-3 mb-3`}>
          <Text style={tw`text-[14px] text-[#040641]`}>
            Failed to load live churches
          </Text>
        </View>
      ) : liveChurches?.list?.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center mt-3 mb-3`}>
          <Text style={tw`text-[14px] text-[#040641]`}>
            No live churches available
          </Text>
        </View>
      ) : (
        <>
          <View style={tw`bg-white flex-1 pb-4`}>
            <View style={tw`mt-4 mb-6`}>
              {currentPage === 1 && liveChurchListFetching && (
                <LoadingSpinner />
              )}
              {liveChurches && liveChurches?.list?.length > 0 && (
                <FlatList
                  data={liveChurches?.list}
                  keyExtractor={item => String(item._id)}
                  refreshing={refreshList}
                  onRefresh={handleRefresh}
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.4}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{gap: 16, paddingHorizontal: 16}}
                  renderItem={({item}) => (
                    // individual cards
                    <LiveChurchList
                      item={item}
                      length={liveChurches?.list?.length}
                    />
                  )}
                  ListFooterComponent={
                    <View>
                      {!liveChurchListFetching &&
                        liveChurches?.list?.length === 0 && (
                          <Text style={tw`text-center text-black`}>
                            No live churches available
                          </Text>
                        )}
                      {liveChurchListFetching && (
                        <View style={{marginBottom: 60}}>
                          <LoadingSpinner color="blue" size="small" />
                        </View>
                      )}
                      {!liveChurches?.hasMore && !liveChurchListFetching && (
                        <Text style={tw`text-center text-gray-500 mb-10`}>
                          No more live churches to load
                        </Text>
                      )}
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </>
      )}

      {/* Other Live Church Modal */}
      {addMoreChurchesModal && <OtherLiveChurchModal />}

      {/* iOS Location Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLocationErrorModal}
        onRequestClose={() => setShowLocationErrorModal(false)}>
        <View
          style={tw`flex-1 justify-center items-center bg-gray-500 bg-opacity-50 px-4`}>
          <View style={tw`bg-white p-6 rounded-lg w-full `}>
            <Text style={tw`text-[20px] font-semibold text-[#040641]`}>
              Turn on Location Service for your IPhone
            </Text>
            <Text style={tw`text-md text-[#040641] mt-2`}>
              We were unable to get your location. Please ensure that your
              location services are enabled and try again.
            </Text>
            <View style={tw`flex justify-center items-start  mx-7  gap-4 my-4`}>
              <View style={tw`flex-row justify-center  items-center gap-3`}>
                <Image
                  source={require('../../assets/images/settingsicon.png')}
                  style={tw`w-8 h-8`}
                />
                <Text style={tw`text-[14px] text-gray-500`}>
                  1 . Open the settings app
                </Text>
              </View>
              <View style={tw`flex-row justify-start items-center gap-3`}>
                <Image
                  source={require('../../assets/images/handiosicon.png')}
                  style={tw`w-8 h-8`}
                />
                <Text style={tw`text-[14px] text-gray-500`}>
                  2 . Select Privacy
                </Text>
              </View>
              <View style={tw`flex-row justify-center items-center gap-3`}>
                <Image
                  source={require('../../assets/images/settingsicon.png')}
                  style={tw`w-8 h-8`}
                />
                <Text style={tw`text-[14px] text-gray-500`}>
                  3 . Select Location Services
                </Text>
              </View>
              <View style={tw`flex-row justify-center items-center gap-3`}>
                <Image
                  source={require('../../assets/images/iosicon.png')}
                  style={tw`w-8 h-8`}
                />
                <Text style={tw`text-[14px] text-gray-500`}>
                  4 . Turn on Location Services
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setShowLocationErrorModal(false)}
              style={tw`mt-4 bg-[#0077B6] p-2 rounded-lg`}>
              <Text style={tw`text-white text-center`}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 46,
    backgroundColor: 'rgba(139, 192, 220, 0.4)',
    borderRadius: 50,
    marginTop: 24,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});

export default LiveChurchScreen;
