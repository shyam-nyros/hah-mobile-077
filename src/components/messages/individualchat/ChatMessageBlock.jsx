import React, {useEffect, useState} from 'react';
import {FlatList, Text, View, StyleSheet, Image} from 'react-native';
import moment from 'moment';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import ReceiverMessageItem from './ReceiverMessageItem';
import SenderMessageItem from './SenderMessageItem';
import {
  useFetchIndividualMessagesQuery,
  useListenForIndividualConversationQuery,
} from '../../../features/chat/chatApiSlice';
import socket from '../../../socket/socket';
import tw from 'twrnc';
import {useSelector} from 'react-redux';
import LoadingSpinner from '../../LoadingSpinner';

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

const ChatMessageBlock = ({conversationId, name, recepientId}) => {
  const {currentUserId} = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [messages, setMessages] = useState([]);

  // when no conversation id - then no need to trigger for the first time
  const [hideLoaderFirstTime, setHideLoaderFirstTime] = useState(false);

  const {
    data: list,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useFetchIndividualMessagesQuery(
    {conversationId, page: currentPage},
    {skip: !conversationId},
  );

  const {data: message} = useListenForIndividualConversationQuery(
    {conversationId},
    {skip: !conversationId},
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
      <View style={tw`flex-row items-center  mb-4 self-end`}>
        <View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-[90%] h-4 mb-2  rounded-md`}
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

  // listen for the first message and then set the socket response in the setMessages state
  // so it instantly shows in the UI
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `new_conversation_${currentUserId}`;
      const handleNewMessage = firstMessage => {
        
        
        if (
          (firstMessage?.data?.message?.sender === currentUserId ||
            recepientId) &&
          (firstMessage?.data?.message?.receiver === currentUserId ||
            recepientId)
        ) {
          setMessages([firstMessage?.data?.message]);
        }
      };
      socket?.socket?.on(eventName, handleNewMessage);
      return () => {
        socket?.socket?.off(eventName, handleNewMessage);
      };
    }
  }, []);

  // for triggering the read message
  // and to add new messages to the existing array
  useEffect(() => {
    const conversation = `conversation_${conversationId}`;
    if (socket?.socket) {
      const readNewMessage = msg => {
        // check for the conversation id before adding it to the existing list
        // only if the id matched - add to the list
        // if (conversationId === msg?.data?.conversation) {
        //   setMessages(prevMessages => [msg?.data, ...prevMessages]);
        // }
        // trigger read_message event only when the opp user is in chat screen
        if (msg?.data?.sender?._id != currentUserId) {
          socket?.socket?.emit('read_message', {
            conversation_id: conversationId,
            message_id: msg?.data?._id,
          });
        }
      };
      socket?.socket.on(conversation, readNewMessage);
      // Cleanup function to stop listening
      return () => {
        
        socket?.socket?.off(conversation, readNewMessage);
      };
    }
  }, [socket, conversationId]);

  // for new chats - which means there is no conversation id
  // then set hideLoaderFirstTime to true
  // this is used to stop showing the loader when a first message is sent
  useEffect(() => {
    if (!conversationId) {
      setHideLoaderFirstTime(true);
    }
  }, [conversationId]);

  
  const generatedItems = generateItems(messages);

  const renderItem = ({item, index}) => {
    if (item.type === 'day') {
      return <Day date={item.date} />;
    }
    const isSender = item.sender?._id === currentUserId;
    const isLastItem = index === 0;
    return isSender ? (
      <SenderMessageItem
        key={item._id}
        content={item.content}
        createdAt={item.createdAt}
        lastItemInMsgArray={isLastItem}
        conversationId={conversationId}
        type={item.type}
        status={item.status}
        attachment={item.attachment}
      />
    ) : (
      <ReceiverMessageItem
        key={item._id}
        messageId={item._id}
        conversationId={conversationId}
        content={item.content}
        createdAt={item.createdAt}
        name={name}
        recepientId={recepientId}
        profileImage={item.sender?.profile_image}
        isBlocked={item.isBlocked}
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
      {(list?.hasMore && listFetching) && <LoadingSpinner size={'small'} color={'white'} />}
      <FlatList
        data={generatedItems}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
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

export default ChatMessageBlock;
