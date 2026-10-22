import React, {useEffect, useState} from 'react';
import socket from '../socket/socket';
import {useDispatch, useSelector} from 'react-redux';
import {
  setBellNotificationCount,
  setMessageNotificationCount,
} from '../features/auth/authSlice';
import {useHomeNotificationsCountQuery} from '../features/auth/authApiSlice';
import {useListenForMessageNotificationQuery} from '../features/chat/chatApiSlice';

const Notifications = () => {
  const dispatch = useDispatch();

  const {currentUserId} = useSelector(state => state.auth);

  const {data, isLoading} = useHomeNotificationsCountQuery();

  // const {data: messageNotificationCount} =
  //   useListenForMessageNotificationQuery(currentUserId);

  // show the bell notification & message notifcation count on initial load
  useEffect(() => {
    // LOG  {"message_count": 5, "notification_count": 0}
    if (data?.notification_count > 0) {
      dispatch(setBellNotificationCount(data?.notification_count));
    }
    if (data?.message_count > 0) {
      dispatch(setMessageNotificationCount(data?.message_count));
    }
  }, [isLoading, data]);

  // listen for bell notifications count when there is a new notification
  useEffect(() => {
    if (socket?.socket) {
      // socket?.socket?.emit(`notification_${currentUserId}`);
      const eventName = `notification_${currentUserId}`;
      socket?.socket?.on(eventName, count => {
        dispatch(setBellNotificationCount(count?.unread_count));
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, [currentUserId]);

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `message_count_${currentUserId}`;
      socket?.socket?.on(eventName, count => {
        dispatch(setMessageNotificationCount(count?.unread_count));
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, [currentUserId]);

  // useEffect(() => {
  //   dispatch(
  //     setMessageNotificationCount(messageNotificationCount?.unread_count),
  //   );
  // }, [messageNotificationCount]);

  return <></>;
};

export default Notifications;
