import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, TouchableOpacity, Image, View, StyleSheet} from 'react-native';
import tw from 'twrnc';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const LeaderListItem = ({leaderInfo}) => {
  const navigation = useNavigation();

  const handleLeaderProfileClick = leaderId => {
    navigation.navigate('LeaderProfile', {leaderId});
  };

  return (
    <View style={tw` mt-4  mb-6`}>
      <View style={tw`flex flex-row flex-wrap justify-between`}>
        <TouchableOpacity
          onPress={() => handleLeaderProfileClick(leaderInfo._id)}
          key={leaderInfo._id}
          style={tw`w-auto`}>
          <View>
            <Image
              source={
                leaderInfo.profile_image
                  ? {uri: leaderInfo.profile_image}
                  : require('../../assets/images/leaderplaceholder.png')
              }
              style={[tw`bg-[#E6F8FB] rounded-[10px]`, styles.img]}
            />
          </View>
          <View style={tw`mt-[6px] bg-white rounded-b-10 `}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text
                numberOfLines={1}
                style={tw`text-[16px] text-[#0077B6] w-30  flex flex-wrap font-medium mb-1`}>
                {`${leaderInfo.first_name} ${leaderInfo.last_name}`}
              </Text>
              {leaderInfo.featured && (
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/images/profilebadge.png')}
                    style={tw` h-4 w-4`}
                  />
                </TouchableOpacity>
              )}
            </View>
            {leaderInfo.jobs && (
              <Text
                numberOfLines={1}
                style={[
                  tw`text-[13px] w-30 text-[#040641] font-medium opacity-80 mb-1`,
                  styles.churchtext,
                ]}>
                {leaderInfo.jobs}
                {/* {'Pastor'} */}
              </Text>
            )}
            <Text
              numberOfLines={1}
              style={[
                tw`text-[#040641] font-medium w-30 flex flex-wrap opacity-70`,
                styles.churchtext,
              ]}>
              {/* {'Lakewood Church'} */}
              {leaderInfo?.church?.name}
            </Text>
            <Text
              numberOfLines={1}
              style={tw`text-[12px] w-30 text-[#040641] font-medium opacity-50`}>
              {`${leaderInfo.state}, ${leaderInfo.country}`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeaderListItem;

const styles = StyleSheet.create({
  img: {
    width: wp('43.2%'),
    height: hp('20.1%'),
  },
  churchtext: {
    fontSize: hp('1.44%'),
    width: wp('43.2%'),
    marginBottom: 4,
  },
});
