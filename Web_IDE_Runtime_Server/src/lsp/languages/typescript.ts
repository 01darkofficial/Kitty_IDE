import { spawn } from "child_process"

import { LspSession } from "../../types/lsp"
import { lspLogger } from "../../utils/logger"
import { handleLspOutput } from "../transport"

export function startTypescriptServer(session: LspSession) {

    if (session.process) {
        return session.process
    }

    const process = spawn(
        "typescript-language-server",
        ["--stdio"],
        {
            cwd: session.workspacePath,
        }
    )

    session.process = process

    /* ---------------- STDOUT (LSP Messages) ---------------- */

    process.stdout.on("data", (chunk) => {
        handleLspOutput(session, chunk)
    })

    /* ---------------- STDERR ---------------- */

    process.stderr.on("data", (chunk) => {
        lspLogger.kittyError("[TS-LSP]", chunk.toString())
    })

    /* ---------------- Spawn Errors ---------------- */

    process.on("error", (err) => {
        lspLogger.kittyError("[TS-LSP] Failed to start:", err)
        session.process = null
    })

    /* ---------------- Process Exit ---------------- */

    process.on("exit", (code) => {
        lspLogger.kittyDebug(`[TS-LSP] Exited (${code})`)
        session.process = null
    })

    return process
}

export function stopTypescriptServer(session: LspSession) {
    session.process?.kill()
    session.process = null
}