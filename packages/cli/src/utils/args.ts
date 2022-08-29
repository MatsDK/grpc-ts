import Arg from 'arg'

const arg = <T extends Arg.Spec>(
    argv: string[],
    spec: T,
    stopAtPositional = true,
    permissive = false,
): Arg.Result<T> | Error => {
    try {
        return Arg(spec, { argv, stopAtPositional, permissive })
    } catch (e) {
        return e as Error
    }
}

const isError = <T extends Arg.Spec>(result: Error | Arg.Result<T>): result is Error => {
    return result instanceof Error
}

export const parseArgs = (args: string[]) => {
    const parsed = arg(args, {
        '--proto': [String],
        '--client': String,
        '--server': String,
        '--respawn': String,
    })

    if (isError(parsed)) {
        return
    }

    return parsed
}
