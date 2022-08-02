import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export const getProtoPaths = async () => {
    const protoFolder = join(__dirname, '../../../proto')
    if (!existsSync(protoFolder)) return []

    const paths = readDir(protoFolder)
    return paths
}

const readDir = (folderPath: string): string[] => {
    const paths = []

    for (const folderItemName of readdirSync(folderPath)) {
        const path = join(folderPath, folderItemName)

        const stat = statSync(path)
        if (stat.isFile()) paths.push(path)
        else if (stat.isDirectory()) {
            readDir(path).forEach((p) => paths.push(p))
        }
    }

    return paths
}
