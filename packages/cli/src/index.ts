#!/usr/bin/env node

import { generate } from '@grpc-ts/generate'
import { findProtoPaths, getGenerators } from '@grpc-ts/internals'
import { parseArgs } from './utils/args'
import { getOutputDir } from './utils/utils'

const main = async () => {
    const args = process.argv.slice(2)

    if (args[0] === 'generate') {
        const parsedArgs = parseArgs(args.slice(1))
        if (!parsedArgs) return

        const protoPaths = findProtoPaths(parsedArgs['--proto'])
        if (!protoPaths) {
            console.error('No proto files found')
            return
        }

        const outDir = await getOutputDir({ cwd: process.cwd() })
        if (!outDir) {
            return
        }

        const { generateClient, generateServer } = getGenerators(parsedArgs['--client'], parsedArgs['--server'])

        await generate({
            protoPaths,
            outDir,
            generateClient,
            generateServer,
        })
    }
}

main()
