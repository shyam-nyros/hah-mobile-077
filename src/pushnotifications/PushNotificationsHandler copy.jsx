import {useEffect} from 'react';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import MessageInbox from '../components/messages/MessageInbox';

// Handle background messages when app is closed state
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

const PushNotificationsHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle messages when the app is in foreground
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      notifee.displayNotification({
        id: remoteMessage?.messageId,
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId,
        },
      });
    });

    // Handle initial notification when app opens from closed state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
      
        // if the type is a post
        if (remoteMessage?.data?.type === 'post') {
          navigation.navigate('PostDetails', {
            postId: remoteMessage?.data?.redirect_id,
          });
        }
        // the type message is a individual
        if (
          remoteMessage?.data?.type === 'message' &&
          remoteMessage?.data?.redirect_id
        ) {
          navigation.navigate('Chat', {
            recepientId: remoteMessage?.data?.redirect_id,
            conversationId: remoteMessage?.data?.conversation_id,
            name: remoteMessage?.notification?.title,
            profileImage: remoteMessage?.notification?.android?.imageUrl,
          });
        }
        // the type message is a group
        if (
          remoteMessage?.data?.type === 'message' &&
          !remoteMessage?.data?.redirect_id
        ) {
          navigation.navigate('GroupChat', {
            groupId: remoteMessage?.data?.conversation_id,
          });
        }
      });

    // navigation.navigate('GroupChat', {
    //   groupId: chatInfo._id,
    // });
    // Cleanup the event listeners
    return () => {
      unsubscribeOnMessage();
    };
  }, [navigation]);

  return <MessageInbox />; 
};

export default PushNotificationsHandler;
