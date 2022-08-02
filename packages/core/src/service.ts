type ServiceOptions = {
    name: string
}

type ResolverFn<TInput, TOutput, TContext> = (opts: ResolverInput<TInput, TContext>) => Promise<TOutput> | TOutput

type ResolverInput<TInput, TContext> = { ctx: TContext; metadata: string; input: TInput }

export type RpcParserWithInputOutput<TInput, TOutput> = ProcedureParserZodEsque<TInput, TOutput>

export type ProcedureParserZodEsque<TInput, TOutput> = {
    _input: TInput
    _output: TOutput
}

export type RpcOptions<TInput, TOutput, TContext, TParsedInput, TParsedOutput> = {
    input: RpcParserWithInputOutput<TInput, TParsedInput>
    output: RpcParserWithInputOutput<TOutput, TParsedOutput>
    resolve: ResolverFn<TInput, TOutput, TContext>
}

export class Service<TContext> {
    rpcs: Map<string, any> = new Map()
    name: string

    constructor(opt: ServiceOptions) {
        this.name = opt.name
    }

    rpc<
        TName extends string,
        TInput,
        TOutput,
        TParsedInput,
        TParsedOutput,
    >(
        name: TName,
        rpcOptions: RpcOptions<
            TInput,
            TOutput,
            TContext,
            TParsedInput,
            TParsedOutput
        >,
    ) {
        this.rpcs.set(name, rpcOptions)
        return this
    }
}

export const createService = <TContext>(opt: ServiceOptions) => {
    return new Service<TContext>(opt)
}
