import { useEffect, useRef, useState } from 'react'
import './App.css'
import { io } from 'socket.io-client';
// import { socketServer } from './utils/socket'

function App() {
  let socketServer = useRef(null); // Socket Ref
  const socketUrl = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4001';

  // Establish socket connection
  const [isConnected, setIsConnected] = useState(false)
  const [socketEvents, setSocketEvents] = useState([])
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userData, setUserData] = useState({ id: '', name: '' })

  useEffect(() => {
    if(isConnected){
      console.log('connecting...')
      if(!userId.length && userName.length){
        setIsConnected(false)
        return
      }

      setUserData({ id: userId, name: userName })
      socketServer.current = io(socketUrl, {auth: { user: userData }})

      function onSocketEvent(value) {
        setSocketEvents(previous => [...previous, value]);
      }

      socketServer.current.on('connect', console.log("Connected to server"))
      socketServer.current.on('disconnect', console.log("Disconnected from server"))
      socketServer.current.on('socketEvent', onSocketEvent)

      socketServer.current.connect()
      setUserId('')
      setUserName('')
    }
    else{
      console.log('disconnecting...')
      if(socketServer.current){
        socketServer.current.disconnect()
        setUserId('')
        setUserName('')
      }
    }

    return () => {
      if(socketServer.current){
        socketServer.current.off('connect')
        socketServer.current.off('disconnect')
        socketServer.current.off('socketEvent')
        socketServer.current = null
      }
    }
  }, [socketUrl, userId, userName, userData, isConnected])

  function connect() {
    setIsConnected(true)
  }

  function disconnect() {
    setIsConnected(false)
  }

  const [roomName, setRoomName] = useState('')
  const enterRoom = () => {
    if(roomName === '')
      alert('Room name is empty')

    socketServer.current.emit("join room", roomName, userData)
    console.log("joined room", roomName, userData)
    setRoomName('')
  }


  const [message, setMessage] = useState('')
  const sendMessage = () => {
    if(message === '')
      alert('Message is empty')

    socketServer.current.emit("send message", roomName, userData, message)
    console.log("sent message", roomName, userData, message)
    setMessage('')
  }

  return (
    <>
      <h1>Connection state:</h1>
      <p>State: { '' + isConnected }</p>

      <h1>Socket events:</h1>
      <ul>
        {
          socketEvents.map((event, index) =>
            <li key={ index }>{ event }</li>
          )
        }
      </ul>
      <input type="text" onChange={(e) => {setUserId(e.target.value)}} value={userId} placeholder='Enter User Id' />
      <input type="text" onChange={(e) => {setUserName(e.target.value)}} value={userName} placeholder='Enter User Name' />
      <br />
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
      <br />

      <input type="text" onChange={(e) => {setRoomName(e.target.value)}} value={roomName} placeholder='Enter Room Name.' />
      <br />
      <button onClick={ enterRoom } disabled={isConnected}>Enter room</button>
      <br />

      <input type="text" onChange={(e) => {setMessage(e.target.value)}} value={message} placeholder='Enter Message' />
      <br />
      <button onClick={ sendMessage } disabled={isConnected}>Send Message</button>
    </>
  )
}

export default App
