import { EventEmitter } from "events"
import { vi } from "vitest"

export function createMockPty() {

    const emitter =
        new EventEmitter()

    return {

        onData: (cb: any) => {

            emitter.on("data", cb)

        },

        write: vi.fn(),

        resize: vi.fn(),

        kill: vi.fn(),

        emitData(data: string) {

            emitter.emit("data", data)

        }

    }

}