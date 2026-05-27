import { IGNORED_FILES, IGNORED_FOLDERS } from "./constants"

/**
Checks whether a ZIP entry path should
be excluded during import/extraction.
*/
export function shouldIgnorePath(path: string) {

    const ignoredFolder = IGNORED_FOLDERS.some(folder => path.includes(`/${folder}/`) || path.startsWith(`${folder}/`))

    if (ignoredFolder) {
        return true
    }

    const ignoredFile = IGNORED_FILES.some(file => path.endsWith(file))
    return ignoredFile
}