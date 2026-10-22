import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import {useRemoveNotificationsCountMutation} from '../../features/auth/authApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import {resetBellNotificationCount} from '../../features/auth/authSlice';
import {HomeIcon} from 'react-native-heroicons/outline';
const NavHeaders = ({title, showHomeButton = false}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {bellNotificationCount} = useSelector(state => state.auth);

  const [removeNotifications] = useRemoveNotificationsCountMutation();

  const handleNotificationsPress = async () => {
    try {
      navigation.navigate('Notifications');
      // to reset the count in db
      await removeNotifications();
      // reset the count in the global store
      dispatch(resetBellNotificationCount());
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <View style={tw`mx-4 flex-row justify-between  items-center`}>
      {/* <PersonalGroupsListener /> */}
      <View style={tw`flex-row items-center`}>
        <Text style={tw`text-xl text-[#fff] font-semibold`}>{title}</Text>
      </View>
      <View style={tw`flex-row`}>
        {/* Search icon hidden in header; search moved to Today screen */}
        {showHomeButton && (
          <TouchableOpacity
            style={tw`mr-3 py-4`}
            onPress={() => navigation.navigate('Today')}>
            <HomeIcon color="#fff" size={26} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* Bell Notifications */}
        <TouchableOpacity
          style={tw`mr-4  py-4 relative`}
          onPress={handleNotificationsPress}>
          <Image
            source={require('../../assets/images/bellicon.png')}
            style={tw`w-6 h-6`}
          />
          {bellNotificationCount > 0 && (
            <View
              style={tw`absolute top-2 -right-2 bg-red-500 w-6.3 h-4.4 rounded-full flex items-center justify-center`}>
              <Text style={tw`text-white text-xs`}>
                {bellNotificationCount > 99 ? '99+' : bellNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Messages notifications count */}
        {/* <TouchableOpacity
          style={tw`mr-4 py-4`}
          onPress={() => navigation.navigate('Messages')}>
          <Image
            source={require('../../assets/images/chaticon.png')}
            style={tw`w-6 h-6`}
          />
          {messageNotificationCount > 0 && (
            <View
              style={tw`absolute top-2 -right-2 bg-red-500 w-6.3 h-4.4 rounded-full flex items-center justify-center`}>
              <Text style={tw`text-white text-xs`}>
                {messageNotificationCount > 99
                  ? '99+'
                  : messageNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity> */}

        <TouchableOpacity
          style={tw`py-4`}
          onPress={() => navigation.navigate('Dashboard')}>
          <Image
            source={require('../../assets/images/profileicon.png')}
            style={tw`w-6 h-6`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NavHeaders;
