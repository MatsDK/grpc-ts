import { findProtoPaths } from '@grpc-ts/internals'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { arg, isError } from './args'

export const getProtoPaths = async (argv: string[]) => {
    const args = arg(argv, {
        '--proto': [String],
        '--respawn': String,
    })

    if (isError(args)) {
        return
    }

    return findProtoPaths(args['--proto'])
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
