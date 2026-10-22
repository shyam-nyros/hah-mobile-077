import React, {useEffect, useState} from 'react';
import {FlatList, View, Text, Image, Platform, StyleSheet} from 'react-native';
import tw from 'twrnc';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import socket from '../../socket/socket';

const FeedActivitiesMessages = ({currentUsername, liveActivityId, christianId}) => {
  const [feedData, setFeedData] = useState([]);

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `feed_${christianId}_${liveActivityId}`;
      socket?.socket?.on(eventName, newMessage => {
 
        setFeedData(prevFeedData => [newMessage, ...prevFeedData]);
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, [christianId, liveActivityId]);

  const renderItem = ({item}) => {
    const isCurrentUser = item.user.username === currentUsername;

    return (
      <View style={tw`${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} mt-3`}>
        <View
          style={tw`gap-2 items-start ${
            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
          }`}>
          <View
            style={tw`${
              item?.user?.is_leader ? 'w-12 h-14 top-1' : 'w-12 h-14 top-1'
            } rounded-full relative`}>
            {item?.user.is_leader && (
              <Image
                source={require('../../assets/images/leadersframe.png')}
                style={tw`absolute top-[-4px] left-[-2px] w-[50px] h-[50px] rounded-full`}
              />
            )}
            <Image
              source={
                item?.user?.profile_pic
                  ? {uri: item?.user?.profile_pic}
                  : require('../../assets/images/whiteplaceholder.png')
              }
              style={tw`${
                item?.user.is_leader ? 'w-9 h-9 left-1.3 top-0.7' : 'w-11 h-11'
              } rounded-full`}
            />
            {item?.user?.is_verified && (
              <Image
                source={require('../../assets/images/profilebadge.png')}
                style={tw`w-[13px] h-[15px] absolute top-[8] left-[8]`}
              />
            )}
          </View>

          <View>
            <View
              style={tw`items-center gap-1 ${
                isCurrentUser ? 'flex-row-reverse' : 'flex-row'
              }`}>
              <Text
                style={tw`text-[#0077B6] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
                {item.user.username}
              </Text>
              <Text
                style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
                {item.line}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  tw`text-[#040641] text-[14px] md:text-[16px] lg:text-[16px] opacity-80 ${
                    isCurrentUser ? 'text-right' : ''
                  }`,
                  styles.messages,
                ]}>
                {item.message}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  
  return (
   <View style={styles.container}>
      <FlatList
        data={feedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default FeedActivitiesMessages;

const styles = StyleSheet.create({
  messages: {
    width: wp('82%'),
  },
  container: {
    flex: 1,
    paddingBottom: 80,
    paddingLeft: 20
    
  },
  listContainer: {
    paddingTop: 10,
  },
});
