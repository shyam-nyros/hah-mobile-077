import {useEffect} from 'react';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';

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
        if (remoteMessage?.data?.type === 'post') {
          navigation.navigate('PostDetails', {
            postId: remoteMessage?.data?.redirect_id,
            // postId: '67094e03f4da2644795d0a2f',
          });
        }
      });

    // Cleanup the event listeners
    return () => {
      unsubscribeOnMessage();
    };
  }, [navigation]);

  return null; // This component does not need to render anything
};

export default PushNotificationsHandler;
