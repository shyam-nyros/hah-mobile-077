import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Button,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import CreateMessage from '../../../../components/messages/individualchat/CreateMessage';
import ChatMessageBlock from '../../../../components/messages/individualchat/ChatMessageBlock';
import {useDispatch, useSelector} from 'react-redux';
import {setPersonalItemClicked} from '../../../../features/messages/messageSlice';
import socket from '../../../../socket/socket';
import {
  setHideMinistryIcon,
  setShowMinistryIcon,
} from '../../../../features/auth/authSlice';
import NamePromptCard from '../../../../components/shared/NamePromptCard';

const ChatScreen = ({navigation, route}) => {
  const {
    recepientId,
    featured,
    conversationId,
    name,
    profileImage,
    is_leader,
    about,
    is_verified,
    isFollowing,
  } = route.params;

  const dispatch = useDispatch();
  const {currentUserId} = useSelector(state => state.auth);

  const [convId, setConvId] = useState(conversationId ? conversationId : null);

  const navigateToPreviousScreen = () => {
    // dispatch to reload the list
    // dispatch(setPersonalItemClicked());
    navigation.goBack();
  };

  const handleIndividualProfile = () => {
    navigation.navigate(
      'IndividualProfile',
      {userId: recepientId},
      is_leader,
      is_verified,
      featured,
      about,
      isFollowing,
    );
  };

  // listen for the first message and then set the conversation id
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
          setConvId(firstMessage?.data?.message?.conversation);
        }
      };
      // Attach the listener
      socket?.socket?.on(eventName, handleNewMessage);
      // Cleanup function to remove the listener
      return () => {
        socket?.socket?.off(eventName, handleNewMessage);
      };
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Hide when chat opens
      dispatch(setHideMinistryIcon());

      return () => {
        // Show again when leaving chat
        dispatch(setShowMinistryIcon());
      };
    }, []),
  );

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
        // behavior= 'padding'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
        {/* Header */}
        <SafeAreaView style={tw`bg-[#fff]`}>
          <View style={tw`mx-2 flex-row items-center justify-between`}>
            <View style={tw`flex-row gap-2  items-center`}>
              <TouchableOpacity onPress={navigateToPreviousScreen}>
                <View style={tw`py-2 px-2`}>
                  <Image
                    source={require('../../../../assets/images/backnavicon.png')}
                    style={tw`w-[26px] h-[46px]`}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw`flex-row items-center gap-2 pv-2`}
                onPress={handleIndividualProfile}>
                {/* <Image
                  source={require('../../../assets/images/profile2.png')}
                  style={tw`w-10 h-10`}
                /> */}
                {/* leader */}
                {is_leader && (
                  <View>
                    <Image
                      source={require('../../../../assets/images/leadersframe.png')}
                      style={tw` w-12.3 h-12.3 rounded-full`}
                    />
                    {featured && (
                      <Image
                        source={require('../../../../assets/images/profilebadge.png')}
                        style={tw`w-[15px] h-[16px] absolute top-[9] left-[9]`}
                      />
                    )}
                    <Image
                      source={
                        profileImage
                          ? {uri: profileImage}
                          : require('../../../../assets/images/placeholder.png')
                      }
                      style={tw`w-9.3 h-9.3 absolute left-[6px]  top-[6px] rounded-full`}
                      resizeMode="cover"
                    />
                  </View>
                )}
                {/* non leader */}
                {!is_leader && (
                  <View>
                    <Image
                      source={
                        profileImage
                          ? {uri: profileImage}
                          : require('../../../../assets/images/placeholder.png')
                      }
                      style={tw`w-12 h-12  rounded-full`}
                      resizeMode="cover"
                    />
                  </View>
                )}
                {/* <View
                  style={tw`${
                    is_leader ? 'w-15 h-15' : 'w-15 h-15'
                  } rounded-full`}>
                  {is_leader && (
                    <Image
                      source={require('../../../../assets/images/leadersframe.png')}
                      style={tw`absolute top-[-3px] left-[-1px] w-5 h-5 rounded-full`}
                    />
                  )}
                  <Image
                    source={
                      profileImage
                        ? {uri: profileImage}
                        : require('../../../../assets/images/placeholder.png')
                    }
                    style={tw`w-5 h-5 left-[6px] top-[4.7px] rounded-full`}
                    resizeMode="cover"
                  />
                  {is_verified && (
                    <Image
                      source={require('../../../../assets/images/profilebadge.png')}
                      style={tw`w-[15px] h-[16px] absolute top-[9] left-[11]`}
                    />
                  )}
                </View> */}

                <Text style={tw`text-[18px] text-[#040641] font-medium`}>
                  {name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.container}>
          {/* Body */}
          <View style={styles.body}>
            <View contentContainerStyle={tw`flex-grow`} style={tw`flex-1`}>
              <LinearGradient
                colors={['#0077B6', '#00B4D8']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={tw`h-full`}>
                {/* Chat messages */}
                <ChatMessageBlock
                  conversationId={convId}
                  recepientId={recepientId}
                  name={name}
                />
              </LinearGradient>
            </View>
            <NamePromptCard />
          </View>

          {/* Footer Input Text Area */}
          <View style={styles.createMessage}>
            <CreateMessage recepientId={recepientId} conversationId={convId} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
  },
  createMessage: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
});

export default ChatScreen;
