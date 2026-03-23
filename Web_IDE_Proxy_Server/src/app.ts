import express from "express"
import startRuntimeRoute from "./routes/startRuntime"
import pingRoute from "./routes/ping"
import filesRoute from "./routes/files"
import cors from "cors"

const app = express()

// -------------------
// middleware
// -------------------
app.use(express.json())
app.use(cors())
app.use("/runtime/start", startRuntimeRoute)
app.use("/ping", pingRoute)
app.use("/files", filesRoute)

export default app