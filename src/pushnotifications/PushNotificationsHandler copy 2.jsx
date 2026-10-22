import {useEffect} from 'react';
import notifee, {EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import MessageInbox from '../components/messages/MessageInbox';
import SocketConnection from '../socket/SocketConnection';

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
          pressAction: {
            id: 'default', // Add a pressAction to make it clickable
          },
        },
        data: remoteMessage.data, // Attach the data for navigation
      });
    });

    // Handle initial notification when app opens from closed state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        handleNotificationNavigation(remoteMessage);
      });

    // Handle notification press events when the app is in the foreground
    const unsubscribeForegroundEvent = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
        
          handleNotificationNavigation({data: detail.notification?.data});
        }
      },
    );

    // Cleanup the event listeners
    return () => {
      unsubscribeOnMessage();
      unsubscribeForegroundEvent();
    };
  }, [navigation]);

  // Function to handle navigation based on notification data
  const handleNotificationNavigation = remoteMessage => {
    if (!remoteMessage?.data) return;

    const {data, notification} = remoteMessage;

    console.log('Navigating with notification data:', remoteMessage);

    const title = notification?.title || data?.title; // Fallback to `data.title` if notification is absent
    const imageUrl = notification?.android?.imageUrl || data?.imageUrl; // Fallback for imageUrl

    // Handle navigation for "post" type
    if (data?.type === 'post') {
      navigation.navigate('PostDetails', {
        postId: data?.redirect_id,
      });
    }

    // Handle individual message navigation
    if (data?.type === 'message' && data?.redirect_id) {
      navigation.navigate('Chat', {
        recepientId: data?.redirect_id,
        conversationId: data?.conversation_id,
        name: title,
        profileImage: imageUrl,
      });
    }

    // Handle group chat navigation
    if (data?.type === 'message' && !data?.redirect_id) {
      navigation.navigate('GroupChat', {
        groupId: data?.conversation_id,
      });
    }
  };

  return (
    <>
      <SocketConnection />
      <MessageInbox />
    </>
  );
};

export default PushNotificationsHandler;
