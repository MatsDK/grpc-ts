#! /usr/bin/env node

import { generate } from '@grpc-ts/generate'
import { getProtoPaths } from './utils'

const main = async () => {
    const args = process.argv.slice(2)

    if (args[0] === 'generate') {
        const protoPaths = await getProtoPaths()
        if (!protoPaths.length) return

        generate({ protoPaths, outDir: '../' })
    }
}

main()