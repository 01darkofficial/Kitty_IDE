import { Duplex } from "stream"
import { vi } from "vitest"

export function createMockDuplex() {

    const socket =
        new Duplex({

            read() { },

            write(_chunk, _enc, cb) {
                cb()
            }

        })

    socket.destroy =
        vi.fn()

    return socket

}