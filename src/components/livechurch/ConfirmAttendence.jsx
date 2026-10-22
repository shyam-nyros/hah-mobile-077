import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';

const ConfirmAttendence = () => {
  const [attending, setAttending] = useState(
    item.currentUserResponse ? item.currentUserResponse : 'default',
  );

  useEffect(() => {
    setAttending(
      item.currentUserResponse ? item.currentUserResponse : 'default',
    );
  }, [item]);

  return <div>ConfirmAttendence</div>;
};

export default ConfirmAttendence;
