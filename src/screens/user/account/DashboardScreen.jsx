import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {useDispatch, useSelector} from 'react-redux';
import {logout, setHideMinistryIcon} from '../../../features/auth/authSlice';
import messaging from '@react-native-firebase/messaging';
import {rootApiSlice} from '../../../store/rootApiSlice';

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {firstName, lastName, email, profilePicture, isLeader} = useSelector(
    state => state.auth,
  );

  const logoutUser = async () => {
    dispatch(rootApiSlice.util.resetApiState());
    dispatch(logout());
    dispatch(setHideMinistryIcon());
    const deletedToken = await messaging().deleteToken();
  };

  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={tw`mx-2 flex-row  py-4 items-center`}>
            <View>
              <Image
                source={require('../../../assets/images/chevronlefticon.png')}
                style={tw`w-[26px] h-[26px]`}
              />
            </View>
            <Text style={tw`text-xl text-[#fff] font-medium`}>Profile</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      <ScrollView style={tw`bg-white`}>
        <View style={tw`mx-4 mt-4`}>
          <View
            style={tw`px-3 py-5 w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('Profile')}>
              <View style={tw`flex-row gap-3`}>
                {/* <Image
                  source={
                    profilePicture
                      ? {uri: profilePicture}
                      : require('../../../assets/images/placeholder.png') // Apply the static path if no attachment
                  }
                  style={tw`w-12 h-12 rounded-full`}
                /> */}
                <View
                  style={tw`${
                    isLeader ? 'w-11 h-10' : 'w-10 h-10'
                  } rounded-full relative`}>
                  {isLeader && (
                    <Image
                      source={require('../../../assets/images/leadersframe.png')}
                      style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
                    />
                  )}
                  <Image
                    source={
                      profilePicture
                        ? {uri: profilePicture}
                        : require('../../../assets/images/whiteplaceholder.png')
                    }
                    style={tw`${
                      isLeader ? 'w-9 h-9 left-1.3 top-0.7' : 'w-11 h-11'
                    } rounded-full`}
                  />
                </View>
                <View>
                  <Text style={tw`text-[15px] text-[#040641] font-medium`}>
                    {`${firstName} ${lastName}`}
                  </Text>
                  <Text style={tw`text-[13px] text-[#040641] opacity-70`}>
                    {email}
                  </Text>

                  {/* <Text style={tw`text-[13px] text-[#00B4D8] font-medium`}>
                    View Profile
                  </Text> */}
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('Account')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/blueprofileicon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641] `}>Account</Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('Referral')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/share2icon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641] `}>Referral</Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('WeeklyActivityScreen')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/bluestopwatchicon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641] `}>
                    Week Activity
                  </Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('Favorites')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/saveicon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641] `}>Favorites</Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px] w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('GrowthGoals')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/bluebulbicon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641] `}>
                    Growth Goals
                  </Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('OrderHistory')}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/bluedeliveryicon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641]`}>
                    Order History
                  </Text>
                </View>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => logoutUser()}>
              <View style={tw`flex-row gap-3 items-center justify-between`}>
                <Image
                  source={require('../../../assets/images/logouticon.png')}
                  style={tw`w-6 h-6`}
                />
                <View>
                  <Text style={tw`text-[15px] text-[#040641]`}>Logout</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
