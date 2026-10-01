"use client"

import { useEffect } from "react"
import { connectLsp, sendRequest, sendNotification, } from "@/lib/lsp/client"
import { lspLogger } from "@/utils/logger"

/**
 * Connects and initializes the language server for the current project.
 */
export function useLsp(projectId: string, userId: string) {
  useEffect(() => {
    if (!projectId || !userId) return

    let socket: WebSocket | null = null

    async function init() {
      socket = await connectLsp(projectId, userId)

      // Initialize the language server and advertise client capabilities.
      // The runtime replaces rootUri with the actual workspace path.
      await sendRequest("initialize", {
        processId: null,
        rootUri: null,
        capabilities: {
          textDocument: {
            synchronization: {
              dynamicRegistration: false,
              willSave: false,
              didSave: false,
              willSaveWaitUntil: false,
            },
            publishDiagnostics: {
              relatedInformation: true,
            },
            hover: {
              contentFormat: ["markdown", "plaintext"],
            },
          },
          workspace: {
            configuration: true,
            workspaceFolders: true,
          },
        },
      })

      // Notify the server that initialization is complete.
      sendNotification("initialized", {})
    }

    init().catch((error) => {
      lspLogger.kittyError("[LSP] Initialization failed:", error)
    })

    return () => {
      socket?.close()
    }
  }, [projectId, userId])
}
