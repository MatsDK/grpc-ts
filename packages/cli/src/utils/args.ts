import Arg from 'arg'

export const arg = <T extends Arg.Spec>(
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

export const isError = <T extends Arg.Spec>(result: Error | Arg.Result<T>): result is Error => {
    return result instanceof Error
}
