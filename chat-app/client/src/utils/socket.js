import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://127.0.0.1:4002';

export const socketServerInit = (auth) => {
  return io(URL, { auth: auth }, {
    autoConnect: false
  });
}