import express from "express"
import startRuntimeRoute from "./routes/runtime.routes"
import pingRoute from "./routes/activity.routes"
import filesRoute from "./routes/files.routes"
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