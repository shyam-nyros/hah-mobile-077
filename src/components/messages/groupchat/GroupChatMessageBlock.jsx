import React, {useEffect, useState} from 'react';
import {FlatList, Text, View, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import moment from 'moment';

import GroupChatSenderMessageItem from './GroupChatSenderMessageItem';
import GroupChatReceiverMessageItem from './GroupChatReveiverMessageItem';
import LoadingSpinner from '../../LoadingSpinner';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import socket from '../../../socket/socket';
import {
  useFetchGroupMessagesQuery,
  useListenForNewMessageInGroupQuery,
} from '../../../features/chat/groupChat';

// Function to group messages by date
function groupedDays(messages) {
  return messages.reduce((acc, el) => {
    const messageDay = moment(el.createdAt).format('YYYY-MM-DD');
    if (acc[messageDay]) {
      acc[messageDay].push(el);
    } else {
      acc[messageDay] = [el];
    }
    return acc;
  }, {});
}

// Function to generate items for FlatList
function generateItems(messages) {
  const days = groupedDays(messages);
  const sortedDays = Object.keys(days).sort(
    (a, b) => moment(b, 'YYYY-MM-DD').unix() - moment(a, 'YYYY-MM-DD').unix(),
  );
  const items = sortedDays.reduce((acc, date) => {
    const sortedMessages = days[date].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return acc.concat([...sortedMessages, {type: 'day', date, id: date}]);
  }, []);
  return items;
}

// Components
const Day = ({date}) => (
  <View style={tw`mt-2`}>
    <Text style={tw`text-[#fff] text-[12px] text-center`}>
      {moment(date).format('MMMM DD, YYYY')}
    </Text>
  </View>
);

const GroupChatMessageBlock = ({groupId}) => {
  const {currentUserId} = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [hideLoaderFirstTime, setHideLoaderFirstTime] = useState(false);

  const {
    data: list,
    isLoading: listLoading,
    isError: listIsError,
    error: listError,
  } = useFetchGroupMessagesQuery(
    {conversationId: groupId, page: currentPage},
    {skip: !groupId},
  );

  const {data: newMsgInGroup, isLoading: newMsgInGroupLoading} =
    useListenForNewMessageInGroupQuery(
      {conversationId: groupId},
      {skip: !groupId},
    );

  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-col mb-4 mt-2 mx-4`}>
      {/* Left-aligned shimmer */}
      <View style={tw`flex-row items-center gap-4 mb-4 self-start`}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-8 h-8 rounded-full`}
        />
        <View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[75%] h-4 mb-2 rounded-md`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[50%] h-4 rounded-md`}
          />
        </View>
      </View>

      {/* Right-aligned shimmer */}
      <View style={tw`flex-row items-center mb-4 self-end`}>
        <View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[90%] h-4 mb-2 rounded-md`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[50%] h-4 rounded-md`}
          />
        </View>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-8 h-8 rounded-full`}
        />
      </View>
    </View>
  );

  // Handle initial message load
  useEffect(() => {
    if (!listLoading && list?.messageList) {
      setMessages(list.messageList);
      setHideLoaderFirstTime(true);
    }
  }, [listLoading, list]);

  // Socket listener for new group messages
  useEffect(() => {
    if (!socket?.socket || !groupId) return;

    const handleNewGroupMessage = msg => {
      if (msg?.data?.conversation === groupId) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === msg?.data?._id)) return prev;
          return [msg.data, ...prev];
        });
      }
    };

    const conversationEvent = `conversation_${groupId}`;
    socket.socket.on(conversationEvent, handleNewGroupMessage);

    return () => {
      socket.socket.off(conversationEvent, handleNewGroupMessage);
    };
  }, [groupId]);

  // when flat list reaches the top then increment the current page
  // the flatlist is inverted so check for top reached or not
  const handleEndReached = () => {
    if (list?.hasMore && !listLoading) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const generatedItems = generateItems(messages);

  const renderItem = ({item, index}) => {
    if (item.type === 'day') {
      return <Day date={item.date} />;
    }

    const isSender = item.sender?._id === currentUserId;
    const isLastItem = index === 0;

    return isSender ? (
      <GroupChatSenderMessageItem
        key={item._id}
        content={item.content}
        createdAt={item.createdAt}
        attachment={item.attachment}
        type={item.type}
      />
    ) : (
      <GroupChatReceiverMessageItem
        key={item._id}
        content={item.content}
        createdAt={item.createdAt}
        profileImage={item.sender?.profile_image}
        name={`${item.sender?.first_name} ${item.sender?.last_name}`}
        attachment={item.attachment}
        type={item.type}
      />
    );
  };

  if (listLoading && !hideLoaderFirstTime) {
    return (
      <View>
        {Array.from({length: 8}).map((_, index) => (
          <View key={index}>{renderShimmerPlaceholder()}</View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={generatedItems}
        onEndReached={handleEndReached}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id || item._id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingTop: 10,
  },
});

export default GroupChatMessageBlock;