export type TerminalEvent = | {
    type: "port-started"
    port: number
} | {
    type: "port-stopped"
    port: number
}

export class TerminalProcessor {

    private partialLine = ""

    // keep only for debugging
    private readonly lines: string[] = []
    private readonly events: TerminalEvent[] = []
    private readonly runningPorts = new Set<number>()

    constructor(
        private readonly projectId: string
    ) { }

    private stripAnsi(text: string): string {
        return text.replace(/\x1B\[[0-9;?]*[A-Za-z]/g, "").replace(/\x1B\][^\x07]*\x07/g, "")
    }

    process(data: string): void {

        const visible = this.stripAnsi(data)
        this.partialLine += visible
        const chunks = this.partialLine.split(/\r?\n/)
        this.partialLine = chunks.pop() ?? ""

        for (const line of chunks) {
            this.lines.push(line)
            this.processLine(line)
        }

        if (this.lines.length > 500) {
            this.lines.splice(0, this.lines.length - 500)
        }
    }

    private processLine(line: string): void {
        const cleaned = this.stripAnsi(line).trim()
        const match = line.match(/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/)

        if (match) {
            const port = Number(match[2])

            if (!this.runningPorts.has(port)) {
                this.runningPorts.add(port)
                this.events.push({
                    type: "port-started",
                    port
                })
            }
        }

        if (this.runningPorts.size > 0 && cleaned.includes("^C")) {
            for (const port of this.runningPorts) {
                this.events.push({
                    type: "port-stopped",
                    port
                })
            }

            this.runningPorts.clear()
        }

        if (/.+@.+:.+\$$/.test(line.trim())) {
            for (const port of this.runningPorts) {
                this.events.push({
                    type: "port-stopped",
                    port
                })
            }

            this.runningPorts.clear()
        }
    }

    getEvents(): TerminalEvent[] {
        const events = [...this.events]
        this.events.length = 0
        return events
    }

    getLines(): string[] {
        return this.lines
    }
}