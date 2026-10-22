import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import TimeAgo from '../TimeAgo';
import {truncateText} from '../../../utils/helpers';
import {useSelector} from 'react-redux';

const PersonalConversationItem = React.memo(({chatInfo}) => {
  

  const {currentUserId, currentOnlineUsers} = useSelector(state => state.auth);
  const navigation = useNavigation();

  const handleNavigation = () => {
    if (chatInfo?.relationStatus?.buttonState === 'remove') {
      
      navigation.navigate('Chat', {
        conversationId: chatInfo._id,
        recepientId: chatInfo?.oppositeUserDetails?._id,
        featured: chatInfo?.oppositeUserDetails?.featured,
        name: `${chatInfo?.oppositeUserDetails?.first_name} ${chatInfo?.oppositeUserDetails?.last_name}`,
        profileImage: chatInfo?.oppositeUserDetails?.profile_image,
        is_leader: chatInfo?.oppositeUserDetails?.is_leader,
        is_verified: chatInfo?.oppositeUserDetails?.is_verified,
      });
    } else {
      
      navigation.navigate('IndividualProfile', {
        userId: chatInfo?.oppositeUserDetails?._id,
      });
    }
  };

  const isUserOnline =
    currentOnlineUsers &&
    currentOnlineUsers.includes(chatInfo?.oppositeUserDetails?._id);

  // const renderMessage = () => {
  //   if (
  //     chatInfo?.unreadCount > 0 &&
  //     currentUserId !== chatInfo?.lastMessageDetails?.sender
  //   ) {
  //     return (
  //       <Text style={tw`font-semibold text-black`}>
  //         {chatInfo?.unreadCount} new messages -
  //       </Text>
  //     );
  //   }

  //   // content is text
  //   if (
  //     chatInfo?.unreadCount === 0 &&
  //     chatInfo?.lastMessageDetails?.type === 'text'
  //   ) {
  //     return (
  //       <Text
  //         style={tw`text-[#040641] text-[14px] ${
  //           chatInfo?.unreadCount > 0 ? 'font-medium' : ''
  //         }`}>
  //         {truncateText(chatInfo?.lastMessageDetails?.content, 10)}-
  //       </Text>
  //     );
  //   }

  //   // content is image
  //   if (
  //     chatInfo?.unreadCount === 0 &&
  //     chatInfo?.lastMessageDetails?.type === 'image'
  //   ) {
  //     return (
  //       <Text
  //         style={tw`text-[#040641] text-[14px] ${
  //           chatInfo?.unreadCount > 0 ? 'font-medium' : ''
  //         }`}>
  //         Image
  //         {/* Image {chatInfo?.lastMessageDetails?.attachment?.name} */}
  //       </Text>
  //     );
  //   }

  //   // content is video
  //   if (
  //     chatInfo?.unreadCount === 0 &&
  //     chatInfo?.lastMessageDetails?.type === 'video'
  //   ) {
  //     return (
  //       <Text
  //         style={tw`text-[#040641] text-[14px] ${
  //           chatInfo?.unreadCount > 0 ? 'font-medium' : ''
  //         }`}>
  //         Video
  //       </Text>
  //     );
  //   }

  //   // show connected only there is no lastMessageDetails
  //   if (!chatInfo?.lastMessage) {
  //     return (
  //       <Text style={tw`text-[#040641] text-[14px] text-gray-500`}>
  //         You are now connected! 🤝
  //       </Text>
  //     );
  //   }

  //   return <></>;
  // };

  const renderMessage = () => {
    // No last message details - show connected message
    if (!chatInfo?.lastMessageDetails?.type) {
      return (
        <Text style={tw`text-[#040641] text-[14px] text-gray-500`}>
          You are now connected! 🤝
        </Text>
      );
    }

    // Unread count greater than 0 - show unread count
    if (chatInfo?.unreadCount > 0) {
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
        // Check if unread count is exactly 1 for bold styling
        const shouldBeBold = chatInfo?.unreadCount === 1;

        return (
          <Text
            style={tw`text-[#040641] text-[14px] ${
              shouldBeBold ? 'font-bold' : ''
            }`}>
            {truncateText(chatInfo?.lastMessageDetails?.content, 10)} -
          </Text>
        );

      default:
        return <></>;
    }
  };

  const isSentByCurrentUser =
    chatInfo?.lastMessageDetails?.sender === currentUserId;
  
  const shouldShowTimestamp = true
  
  // old code to show time ago
  // const shouldShowTimestamp =
  //   (chatInfo?.lastMessageDetails?.content &&
  //     (!chatInfo?.lastMessageDetails?.isBlocked || isSentByCurrentUser)) ||
  //   chatInfo?.lastMessageByUserDetails?.content;

  return (
    <View style={tw`mx-4 mt-3 -z-100`}>
      <View style={tw`flex-row justify-between items-start`}>
        <TouchableOpacity
          style={tw`flex-row items-start`}
          onPress={handleNavigation}>
          <View
            style={tw`${
              chatInfo?.oppositeUserDetails?.is_leader
                ? 'w-15 h-15'
                : 'w-14 h-14'
            } rounded-full relative`}>
            {chatInfo?.oppositeUserDetails?.is_leader && (
              <Image
                source={require('../../../assets/images/leadersframe.png')}
                style={tw`absolute top-[-8px] left-[-8px] w-15 h-15 rounded-full`}
              />
            )}
            <Image
              source={
                chatInfo?.oppositeUserDetails?.profile_image
                  ? {uri: chatInfo.oppositeUserDetails.profile_image}
                  : require('../../../assets/images/placeholder.png')
              }
              style={tw`${
                chatInfo?.oppositeUserDetails?.is_leader
                  ? 'w-11 h-11'
                  : 'w-12 h-12'
              } rounded-full`}
            />
            {chatInfo?.oppositeUserDetails?.featured && (
              <Image
                source={require('../../../assets/images/profilebadge.png')}
                style={tw`w-[15px] h-[16px] absolute top-[8] left-[9]`}
              />
            )}
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-[#0077B6] text-[16px] font-medium`}>
              {`${chatInfo?.oppositeUserDetails?.first_name} ${chatInfo?.oppositeUserDetails?.last_name}`}
            </Text>
            <View style={tw`flex-row`}>
              {renderMessage()}
              {shouldShowTimestamp ? (
                <TimeAgo
                  createdAt={
                    chatInfo?.lastMessageDetails?.createdAt ||
                    chatInfo?.lastMessageByUserDetails?.createdAt
                  }
                />
              ) : null}
            </View>
          </View>
        </TouchableOpacity>

        {isUserOnline && <View style={tw`w-2 h-2 rounded-full bg-[#29D845]`} />}
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 `} />
    </View>
  );
});

export default PersonalConversationItem;
