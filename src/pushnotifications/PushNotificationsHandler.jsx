import {useEffect} from 'react';
import notifee, {EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import MessageInbox from '../components/messages/MessageInbox';
import SocketConnection from '../socket/SocketConnection';

// Handle background / quit-state messages (data-only silent push on iOS)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (!remoteMessage.notification) {
    // Data-only message — display it manually via notifee
    await notifee.displayNotification({
      title: remoteMessage.data?.title,
      body: remoteMessage.data?.body,
      android: {
        channelId: 'default',
        pressAction: {id: 'default'},
      },
      ios: {
        sound: 'default',
      },
      data: remoteMessage.data,
    });
  }
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
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
        data: remoteMessage.data,
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
  }, []);

  // Function to handle navigation based on notification data
  const handleNotificationNavigation = remoteMessage => {
    if (!remoteMessage?.data) return;

    const {data, notification} = remoteMessage;

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

    // type is campaign
    if (data?.type === 'campaign' && data?.landingpage === 'activity') {
      navigation.navigate('Homecampaign', {campaignData: data});
    }
    if (data?.type === 'campaign' && data?.landingpage === 'prayer') {
      navigation.navigate('Prayercampaign', {campaignData: data});
    }

    // Handle library purchase confirmation navigation
    if (data?.type === 'library_purchase' && data?.redirect_id) {
      const screenByContentType = {
        video: 'VideoDetails',
        audio: 'PodcastDetails',
        ebook: 'BookDetails',
      };
      const screen = screenByContentType[data?.content_type];
      if (screen) {
        navigation.navigate(screen, {libraryItemId: data?.redirect_id});
      }
    }

    // Handle new event navigation - sent to a church's members when a
    // church admin publishes a new Event (see notifyChurchUsers.js on the
    // backend)
    if (data?.type === 'new_event' && data?.redirect_id) {
      navigation.navigate('EventDetails', {eventId: data?.redirect_id});
    }

    // Handle new live church navigation - sent to a church's members when a
    // church admin schedules/goes live with a new LiveChurch service (see
    // notifyChurchUsers.js on the backend)
    if (data?.type === 'new_live_church' && data?.redirect_id) {
      navigation.navigate('LiveChurchDetails', {
        liveChurchId: data?.redirect_id,
      });
    }

    // Handle new library item navigation - sent to a church's members when a
    // church admin or super admin publishes a new Library item (see
    // notifyChurchUsers.js on the backend). content_type carries the
    // library's actual type (video/audio/ebook), same as library_purchase.
    if (data?.type === 'new_library' && data?.redirect_id) {
      const screenByContentType = {
        video: 'VideoDetails',
        audio: 'PodcastDetails',
        ebook: 'BookDetails',
      };
      const screen = screenByContentType[data?.content_type];
      if (screen) {
        navigation.navigate(screen, {libraryItemId: data?.redirect_id});
      }
    }

    // Handle new give project navigation - sent to a church's members when a
    // church admin or super admin publishes a new Give project (see
    // notifyChurchUsers.js on the backend)
    if (data?.type === 'new_give_project' && data?.redirect_id) {
      navigation.navigate('GiveDetails', {giveProjectId: data?.redirect_id});
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
