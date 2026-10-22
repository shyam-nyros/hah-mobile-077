import React from 'react';
import {Text} from 'react-native';

import FollowList from './FollowList';

const PendingRequestListItem = ({notificationItem}) => {
  return (
    <>
      {notificationItem?.type === 'follow_request' && (
        <FollowList info={notificationItem} key={notificationItem?._id} />
      )}
    </>
  );
};

export default PendingRequestListItem;
