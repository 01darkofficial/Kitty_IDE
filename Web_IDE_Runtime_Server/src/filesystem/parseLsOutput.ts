export function parseLsOutput(output: string) {

    const result: {
        path: string
        files: string[]
    }[] = []

    const sections = output.split("\n\n")

    for (const section of sections) {

        const lines =
            section.split("\n").filter(Boolean)

        if (lines.length === 0) continue

        const dirLine = lines[0]

        if (!dirLine.endsWith(":")) continue

        const path =
            dirLine.replace(":", "")

        const files =
            lines
                .slice(1)
                .flatMap(line =>
                    line.split(/\s+/)
                )
                .filter(Boolean)

        result.push({
            path,
            files
        })

    }

    return result
}