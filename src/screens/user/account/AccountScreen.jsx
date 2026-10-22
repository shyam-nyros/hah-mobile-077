import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import DeactivateAccount from '../../../components/user/account/DeactivateAccount';
import DeleteAccount from '../../../components/user/account/DeleteAccount';
import {useSelector} from 'react-redux';

const AccountScreen = ({navigation}) => {
  const {isLeader} = useSelector(state => state.auth);
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
            <Text style={tw`text-xl text-[#fff] font-medium`}>Account</Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body */}
      <ScrollView style={tw`bg-white`}>
        <View style={tw`mx-4 mt-4`}>
          {/* change password */}
          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('ChangePassword')}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>
                  Change Password
                </Text>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>
          {/* blocked users list */}
          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('BlockedUsers')}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>
                  Blocked Users
                </Text>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* current church */}
          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('CurrentChurch')}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>
                  {' '}
                  Current Church
                </Text>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/*privacy poilicy  */}
          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('PrivacyPolicy')}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>
                  Privacy Policy
                </Text>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* app version */}
          <View
            style={tw`px-3 py-[16px]  w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>App Version</Text>
              </View>
              <View>
                <Text style={tw` text-[#aaa]`}>V1.0</Text>
                {/* <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                /> */}
              </View>
            </View>
          </View>

          {/* deactivate account */}
          {/* <DeactivateAccount /> */}

          {/* delete account option only for users and not for leaders */}

          {!isLeader && <DeleteAccount />}
          {/* contact hah */}
          <View
            style={tw`px-3 py-[16px] w-full bg-[#040641] bg-opacity-6 rounded-[12px] mb-2`}>
            <TouchableOpacity
              style={tw`flex-row items-center justify-between`}
              onPress={() => navigation.navigate('ContactHah')}>
              <View>
                <Text style={tw`text-[15px] text-[#040641] `}>Contact HAH</Text>
              </View>
              <View>
                <Image
                  source={require('../../../assets/images/darkchevronrighticon.png')}
                  style={tw`w-5 h-5 mr-2`}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountScreen;
