import { useEffect, useState } from 'react'
import './App.css'
import { socketServer } from './utils/socket'

function App() {
  // Establish socket connection
  const [isConnected, setIsConnected] = useState(socketServer.connected)
  const [socketEvents, setSocketEvents] = useState([])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSocketEvent(value) {
      setSocketEvents(previous => [...previous, value]);
    }

    socketServer.on('connect', onConnect)
    socketServer.on('disconnect', onDisconnect)
    socketServer.on('socketEvent', onSocketEvent)

    return () => {
      socketServer.off('connect', onConnect)
      socketServer.off('disconnect', onDisconnect)
      socketServer.off('socketEvent', onSocketEvent);
    }
  }, [])

  function connect() {
    socketServer.connect();
  }

  function disconnect() {
    socketServer.disconnect();
  }

  // const [connect, setConnect] = useState(false)
  // const [userId, setUserId] = useState('')
  // const [userName, setUserName] = useState('')
  // const [userData, setUserData] = useState({ id: '', name: '' })

  // const [roomName, setRoomName] = useState('')
  // const [message, setMessage] = useState('')

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

      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>

      {/* <input type="text" onChange={(e) => {setUserId(e.target.value)}} value={userId} placeholder='Enter User Id' />
      <input type="text" onChange={(e) => {setUserName(e.target.value)}} value={userName} placeholder='Enter User Name' />

      <input type="text" onChange={(e) => {setUserName(e.target.value)}} value={userName} placeholder='Enter User Name' />

      <input type="text" onChange={(e) => {setUserName(e.target.value)}} value={userName} placeholder='Enter User Name' /> */}
    </>
  )
}

export default App
