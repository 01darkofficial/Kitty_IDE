export class ScrollbackBuffer {
    private readonly chunks: string[] = []
    private bytes = 0

    constructor(
        private readonly maxBytes = 1024 * 1024 // 1 MB
    ) { }

    push(data: string): void {
        const size = Buffer.byteLength(data)
        this.chunks.push(data)
        this.bytes += size

        while (this.bytes > this.maxBytes && this.chunks.length > 0) {
            const removed = this.chunks.shift()!
            this.bytes -= Buffer.byteLength(removed)
        }
    }

    toString(): string {
        return this.chunks.join("")
    }

    clear(): void {
        this.chunks.length = 0
        this.bytes = 0
    }
}