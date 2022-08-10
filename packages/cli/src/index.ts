#! /usr/bin / env node

import { generate } from '@grpc-ts/generate'
import { join } from 'node:path'
import { getProtoPaths } from './utils'

const outDir = join(__dirname, '../output')

const main = async () => {
    const args = process.argv.slice(2)

    if (args[0] === 'generate') {
        const protoPaths = await getProtoPaths(args.slice(1))
        if (!protoPaths.length) return

        generate({ protoPaths, outDir })
    }
}

main()
