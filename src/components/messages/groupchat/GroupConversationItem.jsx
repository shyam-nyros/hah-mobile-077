import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useJoinGroupAPIMutation} from '../../../features/chat/groupChat';
import {truncateText} from '../../../utils/helpers';
import tw from 'twrnc';
import TimeAgo from '../TimeAgo';

const GroupConversationItem = ({chatInfo, index}) => {
  
  
  const {groupConversationList, personalConversationList} = useSelector(
    state => state.message,
  );

  const {currentUserId} = useSelector(state => state.auth);

  const navigation = useNavigation();

  const [joinGroupAPI, {isLoading, isError}] = useJoinGroupAPIMutation();

  const handleNavigation = () => {
    navigation.navigate('GroupChat', {
      groupId: chatInfo._id,
    });
  };
  // const handleNavigation = () => {
  //   navigation.navigate('GroupChat', {
  //     groupId: chatInfo._id,
  //     groupAdminId: chatInfo?.admin[0]?._id,
  //     groupAdminName:
  //       chatInfo?.admin[0]?.first_name + ' ' + chatInfo?.admin[0]?.last_name,
  //     groupName: `${chatInfo?.groupName}`,
  //     profileImage: chatInfo?.groupPicture,
  //     membersCount: chatInfo?.participants.length,
  //   });
  // };

  const handleGroupProfile = () => {
    navigation.navigate('GroupProfile', {groupId: chatInfo._id});
  };

  const handleJoinGroup = async groupId => {
    try {
      const response = await joinGroupAPI(groupId).unwrap();

    } catch (error) {
  
    }
  };

  const renderMessage = () => {
    // No last message details - show connected message
    if (!chatInfo?.lastMessageDetails?.type) {
      return (
        <Text style={tw`text-[#040641] text-[14px] text-gray-500`}>
          Group created! 🎉
        </Text>
      );
    }

    // Unread count greater than 0 - show unread count
    if (chatInfo?.unreadCount > 0 && currentUserId !== chatInfo?.lastMessageDetails?.sender) {
      return (
        <Text style={tw`font-semibold text-black`}>
          {chatInfo?.unreadCount} new message
          {chatInfo?.unreadCount > 1 ? 's' : ''} -
        </Text>
      );
    }

    // Handle different message types when unread count is 0
    const messageType = chatInfo?.lastMessageDetails?.type;

    switch (messageType) {
      case 'image':
        return <Text style={tw`text-[#040641] text-[14px]`}>Image</Text>;

      case 'video':
        return <Text style={tw`text-[#040641] text-[14px]`}>Video</Text>;

      case 'text':
        return (
          <Text style={tw`text-[#040641] text-[14px]`}>
            {truncateText(chatInfo?.lastMessageDetails?.content, 10)} -
          </Text>
        );

      default:
        return <></>;
    }
  };

  return (
    <>
      <View style={tw`mx-4 mt-3 flex-1  -z-100`}>
        <View style={tw`mb-3 flex-1`}>
          <View style={tw`flex-row justify-between items-start`}>
            {/* if user is a member of group then nav to chat screen or else nav to group profile screen */}
            <TouchableOpacity
              style={tw`flex-row items-start flex-1`}
              onPress={
                chatInfo?.is_user_a_member
                  ? handleNavigation
                  : handleGroupProfile
              }>
              <Image
                source={
                  chatInfo?.groupPicture
                    ? {uri: chatInfo.groupPicture}
                    : require('../../../assets/images/groupplaceholder.png')
                }
                style={tw`w-12 h-12 rounded-full`}
              />
              <View style={tw`ml-3 flex-1 `}>
                <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
                  {`${chatInfo?.groupName}`}
                </Text>
                {/* show the admin name */}
                {/* <View style={tw`flex flex-wrap`}>
                  <Text style={tw`text-[#040641] text-[13px] font-medium`}>
                    {`${chatInfo?.admin[0].first_name} ${chatInfo?.admin[0].last_name}`}
                  </Text>
                </View> */}

                <View style={tw`flex-row mt-1`}>
                  {renderMessage()}
                  {/* show time ago if there is a presence of last message content */}
                  {/* other wise there is no message inside the group or it may be a new group */}
                  {chatInfo?.lastMessageDetails && (
                    <TimeAgo
                      createdAt={chatInfo?.lastMessageDetails?.createdAt}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {!chatInfo?.is_user_a_member && (
              <TouchableOpacity
                onPress={() => handleJoinGroup(chatInfo._id)}
                style={tw` w-20 h-7 rounded-[6px] border-[1px] border-[#0077B6] items-center justify-center`}>
                <Text style={tw`text-[#0077B6] text-[13px]`}>Join Group</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* if user is a member then no need to show description */}
          {!chatInfo?.is_user_a_member && (
            <Text style={tw`text-[#040641] opacity-40 text-[12px] mt-2`}>
              {chatInfo?.about}
            </Text>
          )}

          {/* show the group categories if the user is not a member of group */}
          {!chatInfo?.is_user_a_member && (
            <View style={tw`flex-row  flex-wrap gap-2 mt-2`}>
              {chatInfo?.category &&
                chatInfo?.category.length > 0 &&
                chatInfo.category.map(item => (
                  <View
                    key={item._id}
                    style={tw`bg-[#040641] bg-opacity-40 rounded-full p-[5px] px-3`}>
                    <Text style={tw`text-[#fff]  text-[12px] `}>
                      {item.name}
                    </Text>
                  </View>
                ))}
            </View>
          )}
        </View>
        <View style={tw`border-b border-[#ccc] opacity-20 mt-1 mb-1`} />
      </View>
    </>
  );
};

export default GroupConversationItem;