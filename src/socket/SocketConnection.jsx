import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import socket from './socket';


const SocketConnection = () => {
  const {token, currentUserId} = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
  
      socket.initialize(token);
    }

    return () => {
      socket.disconnect();

    };
  }, [token, currentUserId]);
};

export default SocketConnection;
