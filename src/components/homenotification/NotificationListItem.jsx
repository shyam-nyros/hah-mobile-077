import React from 'react';
import {Text} from 'react-native';
import Post from './Post';
import Message from './Message';
import AddChurchRequest from './AddChurchRequest';
import LeaderRequest from './LeaderRequest';
import Follow from './Follow';
import FollowAccecpted from './FollowAccecpted';
import FollowRejected from './FollowRejected';
import LibraryPurchase from './LibraryPurchase';
import NewEvent from './NewEvent';
import NewLiveChurch from './NewLiveChurch';
import NewLibrary from './NewLibrary';
import NewGiveProject from './NewGiveProject';
import NewSchedule from './NewSchedule';

const NotificationListItem = ({notificationItem}) => {
  return (
    <>
      {notificationItem?.type === 'post' && (
        <Post postItem={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'follow_request' && (
        <Follow info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'follow_request_accepted' && (
        <FollowAccecpted info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'follow_request_rejected' && (
        <FollowRejected info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'library_purchase' && (
        <LibraryPurchase info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'new_event' && (
        <NewEvent info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'new_live_church' && (
        <NewLiveChurch info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'new_library' && (
        <NewLibrary info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'new_give_project' && (
        <NewGiveProject info={notificationItem} key={notificationItem?._id} />
      )}
      {notificationItem?.type === 'new_schedule' && (
        <NewSchedule info={notificationItem} key={notificationItem?._id} />
      )}
    </>
  );
};

export default NotificationListItem;
