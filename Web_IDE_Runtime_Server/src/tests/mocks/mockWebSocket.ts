import { EventEmitter } from "events"
import { vi } from "vitest"

export class MockWebSocket
    extends EventEmitter {

    readyState = 1

    sent: any[] = []

    /*
    Send mock
    */

    send(data: any) {

        this.sent.push(data)

    }

    /*
    Close mock (spy-able)
    */

    close = vi.fn(() => {

        this.emit("close")

    })

    /*
    Optional future support
    */

    terminate = vi.fn(() => {

        this.emit("close")

    })

    emitMessage(data: any) {

        this.emit(
            "message",
            typeof data === "string"
                ? data
                : JSON.stringify(data)
        )

    }

}