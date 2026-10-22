import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import Featured from '../../components/events/Featured';
import HappeningToday from '../../components/events/HappeningToday';
import EventsThisWeek from '../../components/events/EventsThisWeek';
import UpcomingEvents from '../../components/events/UpcomingEvents';
import {SafeAreaView} from 'react-native-safe-area-context';
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

const EventsScreen = ({navigation}) => {
  const [fetchingCoords, setFetchingCoords] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [showLocationErrorModal, setShowLocationErrorModal] = useState(false);

  // Simplified to use only one coordinates state
  const [coords, setCoords] = useState({
    latitude: '',
    longitude: '',
  });

  // Add ref to track if location request is in progress
  const locationRequestInProgress = React.useRef(false);

  // Load GPS state and coordinates from AsyncStorage
  const loadPersistedState = async () => {
    try {
      const savedGpsState = await AsyncStorage.getItem('gpsEnabled');
      const savedCoords = await AsyncStorage.getItem('userCoords');

      if (savedGpsState === 'true') {
        setGpsEnabled(true);
        if (savedCoords) {
          const parsedCoords = JSON.parse(savedCoords);
          setCoords(parsedCoords);
        }
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  };

  // Save GPS state to AsyncStorage
  const saveGpsState = async enabled => {
    try {
      await AsyncStorage.setItem('gpsEnabled', enabled.toString());
    } catch (error) {
      console.error('Error saving GPS state:', error);
    }
  };

  // Save coordinates to AsyncStorage
  const saveCoords = async coordinates => {
    try {
      await AsyncStorage.setItem('userCoords', JSON.stringify(coordinates));
    } catch (error) {
      console.error('Error saving coordinates:', error);
    }
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

  const fetchCurrentUserCoords = async () => {
    // Prevent multiple concurrent requests
    if (locationRequestInProgress.current) {
      return;
    }

    locationRequestInProgress.current = true;
    setFetchingCoords(true);

    // check for android
    if (Platform.OS === 'android') {
      const isLocationEnabled = await checkIfLocationEnabled();

      if (!isLocationEnabled) {
        Alert.alert(
          'Location Disabled',
          'Please enable location services to fetch coordinates.',
          [
            {
              text: 'Retry',
              onPress: () => {
                locationRequestInProgress.current = false;
                fetchCurrentUserCoords();
              },
            },
          ],
        );
        setFetchingCoords(false);
        locationRequestInProgress.current = false;
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission is required',
          'Please provide permission in the app settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                locationRequestInProgress.current = false;
                disableGPS();
              },
            },
            {
              text: 'Open Settings',
              onPress: () => {
                locationRequestInProgress.current = false;
                openSettings();
              },
            },
          ],
        );
        setFetchingCoords(false);
        locationRequestInProgress.current = false;
        return;
      }

      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0, // Don't use cached location
          distanceFilter: 0, // Get location regardless of distance moved
        });
        const {latitude, longitude} = location;

        const newCoords = {latitude, longitude};
        setCoords(newCoords);
        await saveCoords(newCoords);
      } catch (error) {
        console.error('Error fetching location:', error);

        // Handle specific error cases
        if (error.message.includes('cancelled by another request')) {
          // Don't show alert for this error, just reset the flag
        } else {
          setGpsEnabled(false);
          await saveGpsState(false);
          Alert.alert(
            'Error',
            error.code === 'UNAVAILABLE'
              ? 'Location services are unavailable.'
              : error.code === 'TIMEOUT'
              ? 'Fetching location timed out. Please try again.'
              : error.message.includes('cancelled')
              ? 'Location request was cancelled. Please try again.'
              : 'Failed to fetch location.',
          );
        }
      } finally {
        setFetchingCoords(false);
        locationRequestInProgress.current = false;
      }
    }

    // check for ios
    if (Platform.OS === 'ios') {
      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0, // Don't use cached location
          distanceFilter: 0, // Get location regardless of distance moved
        });
        const {latitude, longitude} = location;

        const newCoords = {latitude, longitude};
        setCoords(newCoords);
        await saveCoords(newCoords);
      } catch (error) {
        console.error('Error fetching location:', error);

        // Handle specific error cases
        if (error.message.includes('cancelled by another request')) {
          // Don't show modal for this error, just reset the flag
        } else {
          setGpsEnabled(false);
          await saveGpsState(false);
          setShowLocationErrorModal(true);
        }
      } finally {
        setFetchingCoords(false);
        locationRequestInProgress.current = false;
      }
    }
  };

  const enableGPS = async () => {
    if (locationRequestInProgress.current) {
      return;
    }

    setGpsEnabled(true);
    await saveGpsState(true);
    // Always fetch fresh coordinates when enabling GPS
    await fetchCurrentUserCoords();
  };

  const disableGPS = async () => {
    // Cancel any ongoing location request
    locationRequestInProgress.current = false;
    setFetchingCoords(false);
    setGpsEnabled(false);
    setCoords({latitude: '', longitude: ''});
    await saveGpsState(false);
    await AsyncStorage.removeItem('userCoords');
  };

  // Load persisted state when component mounts
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Only fetch coordinates on initial load if GPS is enabled but no coords exist
  useEffect(() => {
    if (
      gpsEnabled &&
      !coords.latitude &&
      !fetchingCoords &&
      !locationRequestInProgress.current
    ) {
      fetchCurrentUserCoords();
    }
  }, [gpsEnabled, coords.latitude]);

  const navigateToPreviousScreen = () => {
    navigation.goBack();
  };

  const handleLocationToggle = () => {
    if (fetchingCoords) {
      return;
    }

    if (gpsEnabled) {
      disableGPS();
    } else {
      enableGPS();
    }
  };

  return (
    <>
      <View style={tw`flex-1 bg-[#0077B6]`}>
        {/* Header */}
        <View
          style={tw`bg-[#0077B6] flex-row justify-between items-center px-4`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <View style={tw`mx-2 flex-row  py-4 items-center`}>
              <View>
                <Image
                  source={require('../../assets/images/chevronlefticon.png')}
                  style={tw`w-[26px] h-[26px]`}
                />
              </View>
              <Text style={tw`text-xl text-[#fff] font-medium`}>Events</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLocationToggle}>
            <Image
              source={
                gpsEnabled
                  ? require('../../assets/images/Locationmarkactive.png')
                  : require('../../assets/images/locationiconwhite.png')
              }
              style={tw`w-8 h-8`}
            />
          </TouchableOpacity>
        </View>

        {/** Body **/}
        <ScrollView style={tw`bg-white`}>
          <View style={{marginTop: 15, marginHorizontal: 16}}>
            {gpsEnabled && (
              <Text style={tw`text-[16px] font-semibold text-[#040641]`}>
                Near by events
              </Text>
            )}
          </View>
          <Featured coords={coords} />
          <HappeningToday coords={coords} />
          <EventsThisWeek coords={coords} />
          <UpcomingEvents coords={coords} />
        </ScrollView>
      </View>

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
  },
});

export default EventsScreen;
