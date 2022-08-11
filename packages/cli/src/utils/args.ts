import Arg from 'arg'

export const arg = <T extends Arg.Spec>(
    argv: string[],
    spec: T,
    stopAtPositional = true,
    permissive = false,
): Arg.Result<T> | Error => {
    try {
        return Arg(spec, { argv, stopAtPositional, permissive })
    } catch (e: any) {
        return e
    }
}

export const isError = (result: any): result is Error => {
    return result instanceof Error
}
