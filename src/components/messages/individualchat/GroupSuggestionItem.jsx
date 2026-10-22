import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';

import LoadingSpinner from '../../LoadingSpinner';
import {useJoinGroupAPIMutation} from '../../../features/chat/groupChat';

const GroupSuggestionItem = ({groupInfo}) => {
  const navigation = useNavigation();

  const [joinGroupAPI, {isLoading, isError}] = useJoinGroupAPIMutation();

  const handleJoinGroup = async groupId => {
    try {
      const response = await joinGroupAPI(groupId).unwrap();
   
    } catch (error) {
   
    }
  };

  const handleNavigation = () => {
    navigation.navigate('GroupChat', {
      groupId: chatInfo._id,
    });
  };

  const handleGroupProfile = () => {
    navigation.navigate('GroupProfile', {groupId: groupInfo._id});
  };

  return (
    <View style={tw`mx-4 mt-3 flex-1  -z-100`}>
      {isLoading && <LoadingSpinner />}
      <View style={tw`mb-3 flex-1`}>
        <View style={tw`flex-row justify-between items-start`}>
          {/* if user is a member of group then nav to chat screen or else nav to group profile screen */}
          <TouchableOpacity
            style={tw`flex-row items-start flex-1`}
            onPress={
              groupInfo?.is_user_a_member
                ? handleNavigation
                : handleGroupProfile
            }>
            <Image
              source={
                groupInfo?.groupPicture
                  ? {uri: groupInfo.groupPicture}
                  : require('../../../assets/images/groupplaceholder.png')
              }
              style={tw`w-12 h-12 rounded-full`}
            />
            <View style={tw`ml-3 flex-1 `}>
              <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                {`${groupInfo?.groupName}`}
              </Text>
              <View style={tw`flex flex-wrap`}>
                <Text style={tw`text-[#040641] text-[13px] font-medium`}>
                  {`${groupInfo?.admin[0]?.first_name} ${groupInfo?.admin[0]?.last_name}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {!groupInfo?.is_user_a_member && (
            <TouchableOpacity
              onPress={() => handleJoinGroup(groupInfo._id)}
              style={tw` w-20 h-7 rounded-[6px] border-[1px] border-[#0077B6] items-center justify-center`}>
              <Text style={tw`text-[#0077B6] text-[13px]`}>Join Group</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={tw`text-[#040641] opacity-40 text-[12px] mt-2`}>
          {groupInfo?.about}
        </Text>
        <View style={tw`flex-row  flex-wrap gap-2 mt-2`}>
          {groupInfo?.category &&
            groupInfo?.category.length > 0 &&
            groupInfo.category.map(item => (
              <View
                key={item._id}
                style={tw`bg-[#040641] bg-opacity-40 rounded-full p-[5px] px-3`}>
                <Text style={tw`text-[#fff]  text-[12px] `}>{item.name}</Text>
              </View>
            ))}
        </View>
      </View>
      <View style={tw`border-b border-[#ccc] opacity-20 mt-1 mb-1`} />
    </View>
  );
};

export default GroupSuggestionItem;
