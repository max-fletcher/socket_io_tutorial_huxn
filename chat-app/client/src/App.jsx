import { useEffect, useState } from 'react'
import './App.css'
import { socketServerInit } from './utils/socket'

function App() {
  const [socketServer,setSocketServer] = useState(null)
  const socketUrl = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4001'

  // Establish socket connection
  const [isConnected, setIsConnected] = useState(false)
  const [socketEvents, setSocketEvents] = useState([])
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    console.log('use effect',{socketUrl, isConnected}, socketServer)
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

      // function broadcastMessageToClient(value) {
      //   setSocketEvents(previous => [...previous, value]);
      // }

      socketServer.on('connect', connect)
      socketServer.on('disconnect', disconnect)
      socketServer.on('socketEvent', onSocketEvent)
      socketServer.on('broadcast message to client', (by, message) => {
        console.log('Server received msg', `Id ${by.id} and userName ${by.name}` , `${message}`);
      })
      socketServer.connect()
    }
    else{
      console.log('Effect disconnecting...')
      if(socketServer){
        socketServer.off('connect')
        socketServer.off('disconnect')
        socketServer.off('socketEvent')
        socketServer.off('broadcast message to client')
        socketServer.disconnect()
        setSocketServer(null)
      }

    return () => {
      if(socketServer){
        socketServer.off('connect')
        socketServer.off('disconnect')
        socketServer.off('socketEvent')
        socketServer.off('broadcast message to client')
        setSocketServer(null)
      }
    }
  }}, [socketUrl, isConnected, socketServer])

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
  const enterRoom = () => {
    if(!socketServer)
      alert('Socket not connected') 
    else if(roomName === '')
      alert('Room name is empty')

    socketServer.emit("join room", roomName, { id: userId, name:userName })
    console.log("joined room", roomName, { id: userId, name:userName })
  }

  const [message, setMessage] = useState('')
  const sendMessage = () => {
    if(!socketServer)
      alert('Socket not connected')
    else if(message === '')
      alert('Message is empty')

    socketServer.emit("send message to server", roomName, message)
    console.log("sent message", roomName, message)
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

      <button onClick={ enterRoom } disabled={!isConnected}>Enter room</button>
      <br />

      <input type="text" onChange={(e) => {setMessage(e.target.value)}} value={message} placeholder='Enter Message' />
      <br />
      <button onClick={ sendMessage } disabled={!isConnected}>Send Message</button>
    </>
  )
}

export default App
