// 1. Packages
import express from "express"
import http from "http"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { Server } from "socket.io"
import setupSockerServer, { allowedOrigins } from "./setupSocketServer.js"

// 2. Instances
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins
  }
})

// 3. Serving HTML File
const __dirname = dirname(fileURLToPath(import.meta.url))
app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')))

// 4. Define a connection event handler
setupSockerServer(server)

// 5. Start the server
const PORT = 4001
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))