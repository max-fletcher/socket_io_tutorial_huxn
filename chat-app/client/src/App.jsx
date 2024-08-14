import { useEffect, useState } from 'react'
import './App.css'
import { socketServerInit } from './utils/socket'

function App() {
  const [socketServer,setSocketServer] = useState(null)

  // Establish socket connection
  const [isConnected, setIsConnected] = useState(false)
  const [socketEvents, setSocketEvents] = useState([])
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    console.log('use effect',{isConnected}, socketServer)
    if(isConnected){
      console.log('inside use effect',socketServer)
      console.log('Effect connecting...')

      function connect() {
        console.log("Connected to server")
      }

      function disconnect() {
        console.log("Disconnected to server")
      }

      function onSocketEvent(value) {
        setSocketEvents(previous => [...previous, value]);
      }

      function broadcastMessageToClient(by, message) {
        console.log('Server received msg', `Id ${by.id} and userName ${by.name}` , `${message}`);
      }

      socketServer.on('connect', connect)
      socketServer.on('disconnect', disconnect)
      socketServer.on('socketEvent', onSocketEvent)
      socketServer.on('broadcastMessageToClient', (by, message) => {
        broadcastMessageToClient(by, message)
      })
      socketServer.connect()
    }
    else{
      console.log('Effect disconnecting...')
      if(socketServer){
        socketServer.off('connect')
        socketServer.off('disconnect')
        socketServer.off('socketEvent')
        socketServer.off('broadcastMessageToClient')
        socketServer.disconnect()
        setSocketServer(null)
      }

    return () => {
      if(socketServer){
        socketServer.off('connect')
        socketServer.off('disconnect')
        socketServer.off('socketEvent')
        socketServer.off('broadcastMessageToClient')
        setSocketServer(null)
      }
    }
  }}, [isConnected, socketServer])

  function connect() {
    console.log('connecting...')
    if(!userId.length && !userName.length){
      setIsConnected(false)
      alert('Username and Id is empty')
      return
    }
    setSocketServer(socketServerInit({user: { id: userId, name: userName }}))
    setIsConnected(true)
  }

  function disconnect() {
    console.log('disconnecting...')
    setUserId('')
    setUserName('')
    setRoomName('')
    setIsConnected(false)
  }

  const [roomName, setRoomName] = useState('')
  const [joinedRoom, setJoinedRoom] = useState('')
  const enterRoom = () => {
    if(!socketServer)
      alert('Socket not connected') 
    else if(roomName === '')
      alert('Room name is empty')
    else if(joinedRoom.length > 0)
      alert('You already entered a room. Leave it to join another room.')

    socketServer.emit("joinRoom", roomName, { id: userId, name:userName })
    setJoinedRoom(roomName)
    console.log("joined room", roomName, { id: userId, name:userName })
  }

  const leaveRoom = () => {
    if(!socketServer)
      alert('Socket not connected') 
    else if(roomName === '')
      alert('Room name is empty')
    else if(joinedRoom.length === 0)
      alert('You haven\'t joined any rooms yet')

    socketServer.emit("leaveRoom", roomName, { id: userId, name:userName })
    setJoinedRoom('')
    console.log("left room", roomName, { id: userId, name:userName })
  }

  const [message, setMessage] = useState('')
  const sendMessage = () => {
    if(!socketServer)
      alert('Socket not connected')
    else if(message === '')
      alert('Message is empty')

    socketServer.emit("sendMessageToServer", roomName, message)
    console.log("sent message", roomName, message)
    setMessage('')
  }

  return (
    <>
      <h1>Connection state:</h1>
      <p>Connected: { '' + isConnected }</p>
      <p>Room: {''}{joinedRoom.length > 0 ? joinedRoom : 'Not joined'}</p>
      <p>{  }</p>

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

      <button onClick={ enterRoom } disabled={!isConnected || joinedRoom.length > 0}>Enter room</button>
      <button onClick={ leaveRoom } disabled={!isConnected || joinedRoom.length === 0}>Leave room</button>
      <br />

      <input type="text" onChange={(e) => {setMessage(e.target.value)}} value={message} placeholder='Enter Message' />
      <br />
      <button onClick={ sendMessage } disabled={!isConnected}>Send Message</button>
    </>
  )
}

export default App
