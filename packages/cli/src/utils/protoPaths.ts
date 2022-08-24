import { findProtoPaths } from '@grpc-ts/internals'
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
