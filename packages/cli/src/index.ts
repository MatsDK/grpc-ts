#! /usr/bin/env node

import { getProtoPaths } from './utils'

const main = async () => {
    const args = process.argv.slice(2)

    if (args[0] === 'generate') {
        const protoPaths = await getProtoPaths()
        console.log(protoPaths)
    }
}

main()
