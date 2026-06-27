import * as pty from "node-pty"
import { TerminalProcessor } from "./terminalProcessor"
import { ScrollbackBuffer } from "./scrollbackBuffer"

export type TerminalSession = {
    pty: pty.IPty
    terminalProcessor: TerminalProcessor
    scrollback: ScrollbackBuffer
}

export const terminalMap = new Map<string, TerminalSession>()
export const terminalLastSeenMap = new Map<string, number>()