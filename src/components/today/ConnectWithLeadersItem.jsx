import React, {useEffect, useState} from 'react';
import {
  useFollowLeaderAPIMutation,
  useUnFollowLeaderAPIMutation,
} from '../../features/messages/messageApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import {
  Image,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import {useSelector} from 'react-redux';

// import {useListenForNotificationCountQuery} from '../../features/chat/chatApiSlice';
import {useListenForConnectLeadersUnreadCountQuery} from '../../features/chat/chatApiSlice';
import socket from '../../socket/socket';

const ConnectWithLeadersItem = ({leaderInfo}) => {
  const {currentUserId} = useSelector(state => state.auth);
  const navigation = useNavigation();

  const [notificationCount, setNotificationCount] = useState(0);

  const [
    followLeaderAPI,
    {isLoading: followLeaderLoading, isError: followLeaderError},
  ] = useFollowLeaderAPIMutation();

  const [
    unFollowLeaderAPI,
    {isLoading: unFollowLeaderLoading, isError: unFollowLeaderError},
  ] = useUnFollowLeaderAPIMutation();

  // notification count
  // const {data: unreadCount, isLoading: unreadCountLoading} =
  //   useListenForNotificationCountQuery({
  //     currentUserId,
  //     recepientId: leaderInfo._id,
  //   });
  // const {data: unreadCount, isLoading: unreadCountLoading} =
  //   useListenForConnectLeadersUnreadCountQuery({
  //     currentUserId,
  //     recepientId: leaderInfo._id,
  //   });

  const handleLeaderNav = leaderId => {
    // setNotificationCount(0);
    navigation.navigate('LeaderProfile', {leaderId});
  };

  const handleFollowLeader = async userId => {
    try {
      const response = await followLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  const handleUnFollowLeader = async userId => {
    try {
      const response = await unFollowLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  // listen for unread messages count
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `unread_count_with_sender_${currentUserId}_${leaderInfo._id}`;
      socket?.socket?.on(eventName, count => {
        setNotificationCount(count?.unread_count_with_sender);
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, []);

  return (
    <SafeAreaView
    // style={{marginBottom: Platform.OS === 'ios' ? 40 : 0}}
    >
      <TouchableOpacity
        style={tw`w-19 mr-2`}
        onPress={() => handleLeaderNav(leaderInfo?._id)}>
        <View style={tw`justify-center  items-center mt-2 `}>
          <View style={tw`justify-center  items-center  `}>
            {/* <View
              style={tw`absolute top-[0px]  bg-[#fff] border border-[#0077B6] rounded-full flex-1 px-[7px] h-5 flex items-center z-10`}>
              {!leaderInfo?.isFollowing && (
                <TouchableOpacity
                  onPress={() => handleFollowLeader(leaderInfo?._id)}>
                  <Text
                    style={tw`text-white flex-1 w-full text-[#0077B6] text-xs`}>
                    Follow
                  </Text>
                </TouchableOpacity>
              )}
              {leaderInfo?.isFollowing && (
                <TouchableOpacity
                  onPress={() => handleUnFollowLeader(leaderInfo?._id)}>
                  <Text style={tw`text-white flex-1 text-[#0077B6] text-xs`}>
                    UnFollow
                  </Text>
                </TouchableOpacity>
              )}
            </View> */}
            <View
              style={tw`${
                !leaderInfo?.isFollowing
                  ? 'absolute top-[0px] bg-[#fff] border border-[#0077B6] rounded-full flex-1 px-[7px] h-5 flex items-center z-10'
                  : ''
              }`}>
              {!leaderInfo?.isFollowing && (
                <TouchableOpacity
                  onPress={() => handleFollowLeader(leaderInfo?._id)}>
                  <Text
                    style={tw`text-white flex-1 w-full text-[#0077B6] text-xs`}>
                    Follow
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View>
              <Image
                source={require('../../assets/images/leadersframe.png')}
                style={tw`w-18 h-18 rounded-full`}
              />
              <Image
                source={{uri: leaderInfo?.profile_image}}
                style={tw`w-[54px] h-[54px] absolute top-[9px] right-[8.6px]  rounded-full`}
              />
               {leaderInfo.featured && (
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/images/profilebadge.png')}
                    style={tw` h-4 w-4 right-[4px] top-[-5px] absolute`}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text
              numberOfLines={2}
              style={tw`text-[12px] text-center text-[#0077B6] font-medium w-14 mt-1`}>
              {`${leaderInfo?.first_name} ${leaderInfo?.last_name}`}
            </Text>
          </View>
          {notificationCount > 0 && (
            <View
              style={tw`absolute bottom-[40px] left-[-40px] bg-[#FF3C3C] rounded-full w-5 h-5 flex items-center justify-center z-100`}>
              <Text style={tw`text-white text-xs`}>{notificationCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ConnectWithLeadersItem;
