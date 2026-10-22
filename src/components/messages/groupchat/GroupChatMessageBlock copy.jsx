import React, {useEffect, useState} from 'react';
import {FlatList, Text, View, StyleSheet, Image} from 'react-native';
import {useSelector} from 'react-redux';
import moment from 'moment'; // To handle date formatting
import GroupChatSenderMessageItem from './GroupChatSenderMessageItem';
import GroupChatReveiverMessageItem from './GroupChatReveiverMessageItem';
import LoadingSpinner from '../../LoadingSpinner';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import ChatDate from '../ChatDate';
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
    <Text style={tw`text-[#fff]  text-[12px] text-center`}>
      {moment(date).format('MMMM DD, YYYY')}
    </Text>
  </View>
);

const GroupChatMessageBlock = ({groupId}) => {
  const {currentUserId} = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);

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
    <View style={tw`flex-col mb-4`}>
      {/* Left-aligned shimmer */}
      <View style={tw`flex-row items-center gap-4 mb-4 self-start`}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-12 h-12 rounded-full`}
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
      <View style={tw`flex-row items-center gap-4 mb-4 self-end`}>
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
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`w-12 h-12 rounded-full`}
        />
      </View>
    </View>
  );

  // when flat list reaches the top then increment the current page
  // the flatlist is inverted so check for top reached or not
  const handleEndReached = () => {
    if (list?.hasMore && !listLoading) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    if (!listLoading && list?.messageList) {
      setMessages(list?.messageList);
    }
  }, [listLoading, list, list?.messageList]);

  const generatedItems = generateItems(messages);

  const renderItem = ({item}) => {
    if (item.type === 'day') {
      return <Day date={item.date} />;
    }

    const isSender = item.sender?._id === currentUserId;
    return isSender ? (
      <GroupChatSenderMessageItem
        key={item._id}
        content={item.content}
        createdAt={item.createdAt}
      />
    ) : (
      <GroupChatReveiverMessageItem
        key={item._id}
        content={item.content}
        createdAt={item.createdAt}
        profileImage={item.sender?.profile_image}
        name={`${item.sender?.first_name} ${item.sender?.last_name}`}
      />
    );
  };

  return (
    <>
      {listLoading && (
        <View>
          {Array.from({length: 8}).map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
        </View>
      )}
      <FlatList
        data={generatedItems}
        onEndReached={handleEndReached}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id || item._id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.listContainer}
      />
    </>
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
  dayContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
});

export default GroupChatMessageBlock;
