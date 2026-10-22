import {useEffect} from 'react';
import notifee, {AndroidStyle, EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import MessageInbox from '../components/messages/MessageInbox';
import SocketConnection from '../socket/SocketConnection';

// Handle background messages when app is in closed state
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  if (remoteMessage?.data?.type === 'message') {
    await displayMessageNotification(remoteMessage);
  } else if (remoteMessage?.data?.type === 'post') {
    await displayPostNotification(remoteMessage);
  }
});

const PushNotificationsHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle messages when the app is in foreground
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.data?.type === 'message') {
        await displayMessageNotification(remoteMessage);
      } else if (remoteMessage?.data?.type === 'post') {
        await displayPostNotification(remoteMessage);
      }
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

  // Function to display message notifications
  const displayMessageNotification = async remoteMessage => {
    const channelId = await notifee.createChannel({
      id: 'messages',
      name: 'Message Notifications',
    });
 
    
    const senderName = remoteMessage?.data?.senderName || 'Unknown Sender';
    const messageBody =
      remoteMessage?.data?.message || 'You have a new message';
    const senderImage =
      remoteMessage?.data?.senderImage ||
      'https://your-static-image-url.com/default-profile.jpg';

    // const senderName = remoteMessage?.data?.title;
    // const messageBody = remoteMessage?.notification?.body;
    // const senderImage = remoteMessage?.data?.imageUrl;

    await notifee.displayNotification({
      title: senderName,
      body: messageBody,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        largeIcon: senderImage,
        style: {
          type: AndroidStyle.MESSAGING,
          person: {
            name: senderName,
            icon: senderImage,
          },
          messages: [
            {
              text: messageBody,
              timestamp: Date.now(),
              person: {
                name: senderName,
                icon: senderImage,
              },
            },
          ],
        },
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    });
  };

  // Function to display post notifications
  const displayPostNotification = async remoteMessage => {
    const channelId = await notifee.createChannel({
      id: 'posts',
      name: 'Post Notifications',
    });

    await notifee.displayNotification({
      id: remoteMessage?.messageId,
      title: remoteMessage.notification?.title || 'New Post Alert',
      body: remoteMessage.notification?.body || 'Check out this new post',
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    });
  };

  // Function to handle navigation based on notification data
  const handleNotificationNavigation = remoteMessage => {
    if (!remoteMessage?.data) return;

    const {data, notification} = remoteMessage;

    const title = notification?.title || data?.title;
    const imageUrl = notification?.android?.imageUrl || data?.imageUrl;

    if (data?.type === 'post') {
      navigation.navigate('PostDetails', {
        postId: data?.redirect_id,
      });
    } else if (data?.type === 'message' && data?.redirect_id) {
      navigation.navigate('Chat', {
        recepientId: data?.redirect_id,
        conversationId: data?.conversation_id,
        name: title,
        profileImage: imageUrl,
      });
    } else if (data?.type === 'message' && !data?.redirect_id) {
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
