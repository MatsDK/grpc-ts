import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export const getProtoPaths = async () => {
    const protoDir = join(__dirname, '../../../proto')
    if (!existsSync(protoDir)) return []

    const paths = readDir(protoDir)
    return paths
}

const readDir = (dirPath: string): string[] => {
    const paths = []

    for (const dirItemName of readdirSync(dirPath)) {
        const path = join(dirPath, dirItemName)

        const stat = statSync(path)
        if (stat.isFile()) paths.push(path)
        else if (stat.isDirectory()) {
            readDir(path).forEach((p) => paths.push(p))
        }
    }

    return paths
}
