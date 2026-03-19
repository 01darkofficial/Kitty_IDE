import express from "express"
import runRoute from "./routes/run"
import pingRoute from "./routes/ping"
import filesRoute from "./routes/files"
import cors from "cors"

const app = express()

// -------------------
// middleware
// -------------------
app.use(express.json())
app.use(cors())
app.use("/run", runRoute)
app.use("/ping", pingRoute)
app.use("/files", filesRoute)

export default app