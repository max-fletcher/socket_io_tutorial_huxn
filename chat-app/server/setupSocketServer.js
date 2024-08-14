import { Server as SocketIoServer } from "socket.io"

export const allowedOrigins = [
  'https://www.yoursite.com',
  'http://127.0.0.1:5173',
  'http://localhost:5173'
];

const socketIoServerOptions = {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
}

const socketPort = 4002

console.log(socketIoServerOptions);

// Setup the server
const setupSockerServer = (server) => {
  const io = new SocketIoServer(server, socketIoServerOptions)

  // Contains a list of all userIds and their socketIds as key-values
  const userSockets = new Map()

  const disconnect = (client) => {
    const user = userSockets.get(client.id)
    if(user){
      userSockets.delete(client.id)
      console.log(`Socket Id - ${client.id} : User with Id - ${user.id} has disconnected from socket server`)
      console.log("userSockets", userSockets)
    }
    console.log('disconnect client with id', client.id);
  }

  io.on('connection', async (client) => {
    console.log('A user connected to the socket server')

    const user = client.handshake.auth.user // runs when a client attempts to connect to the socket and peforms a handshake
    if(user){
      console.log("handshake", client.handshake.auth, client.handshake.auth.user.id, client.handshake.auth.user.name);

      let alreadyConnected = false
      for(const [value] of userSockets){
        if(value.id === user.id){
          alreadyConnected = true
          break;
        }
      }

      if(!alreadyConnected){
        userSockets.set(client.id, user)
        console.log(`Socket Id - ${client.id} assigned to User with Id - ${user.id}`)
      }
      else{
        console.log(`Duplicate entry for userId - ${user.id} & username - ${user.name}`)
        client.disconnect()
      }
    }
    else{
      console.log(`User Id not provided. Disconnecting...`)
      client.disconnect()
    }

    console.log("userSockets", userSockets)
    const allConnections = await io.fetchSockets()
    console.log('allConnections', allConnections.length)

    client.on('joinRoom', async (roomName, user) => {  // To Join a specific room
      await client.join(roomName)
      const sockets = await io.in(roomName).fetchSockets();
      console.log('all sockets', roomName, user, sockets, 'socket count', sockets.length);
    })

    client.on('leaveRoom', async (roomName, user) => {  // To Join a specific room
      await client.leave(roomName)
      const sockets = await io.in(roomName).fetchSockets();
      console.log('all sockets', roomName, user, sockets, 'socket count', sockets.length);
    })

    client.on('sendMessageToServer', (roomName, message) => {
      console.log('server received msg', roomName, user, message)
      io.to(roomName).emit('broadcastMessageToClient', user, `User with id ${user.id} says: ${message}`)
    })

    // Doesn't work
    // io.of("/").adapter.on("create-room", (room) => { // On creating room
    //   io.to(room).emit(`User with id {user.id} created room ${room}`);
    // })
  
    // io.of("/").adapter.on("join-room", (room) => { // On joining room
    //   io.to(room).emit(`User with id {user.id} joined room ${room}`);
    // })
  
    // io.of("/").adapter.on("leave-room", (room) => { // On joining room
    //   io.to(room).emit(`User with id {user.id} left room ${room}`);
    // })

    client.on('disconnect', () => disconnect(client))
  });

  io.listen(socketPort);
}

export default setupSockerServer