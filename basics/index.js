// 1. Packages
import express from "express"
import http from "http"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { Server } from "socket.io"

// 2. Instances
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// 3. Serving HTML File
const __dirname = dirname(fileURLToPath(import.meta.url))
app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')))

// 4. Define a connection event handler
io.on('connection', (client) => {
  console.log('A user connected');

  setTimeout(() => {
    client.emit('message one', 'Meow meow MF', 'I SAID WE CATS TODAY !!')
  }, 3000);

  client.on('message two', (msg, msg2) => {
    console.log(msg, msg2);
  })

  client.on('disconnect', () => {
    console.log('User disconnected from the server');
  })
});

// 5. Start the server
const PORT = 4001
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))