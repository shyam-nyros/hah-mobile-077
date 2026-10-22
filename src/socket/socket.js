import {io} from 'socket.io-client';

class SocketService {
  socket = null;

  initialize(token) {

    if (this.socket?.connected) {
   
      return;
    }
    // this.socket = io('http://000.000.00.0:3002', { //for local purpose only 
    this.socket = io('https://www.heavenathand.org:3002', {
      extraHeaders: {Authorization: `Bearer ${token}`},
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999,
    });


    this.socket.on('connect', () => {

    });

    this.socket.on('disconnect', () => {});

  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socket = new SocketService();
export default socket;
