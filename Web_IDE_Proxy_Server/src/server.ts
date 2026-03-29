import { createHTTPServer } from "./servers/httpServer"
import { setupTerminalWS, handleUpgrade } from "./servers/wsTerminal"

import { startCleanupLoop } from "./runtime/cleanup"

const server = createHTTPServer()

setupTerminalWS()

server.on("upgrade", (req, socket, head) => {
    if (handleUpgrade(req, socket, head)) return

    socket.destroy()
})

startCleanupLoop()

server.listen(4000, () => {
    console.log("Proxy running on http://localhost:4000")
})