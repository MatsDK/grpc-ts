#! /usr/bin / env node

import { generate } from '@grpc-ts/generate'
import { getProtoPaths } from './utils/protoPaths'
import { getOutputDir } from './utils/utils'

const main = async () => {
    const args = process.argv.slice(2)

    if (args[0] === 'generate') {
        const protoPaths = await getProtoPaths(args.slice(1))
        if (!protoPaths) {
            console.error('No proto files found')
            return
        }
        const outDir = await getOutputDir({ cwd: process.cwd() })
        if (!outDir) {
            return
        }

        await generate({ protoPaths, outDir })
    }
}

main()
