
type ServiceOptions = {
	name: string
}

type ResolverFn<TInput, TOutput, TContext> = (opts: ResolverInput<TInput, TContext>) => Promise<TOutput> | TOutput

type ResolverInput<TInput, TContext> = { ctx: TContext, metadata: string, input: TInput }

type RpcOptions<TInput, TOutput, TContext> = {
	input: TInput
	output: TOutput
	resolve: ResolverFn<TInput, TOutput, TContext>
}


export class Service<TContext> {
	rpcs: Map<string, any> = new Map()
	name: string

	constructor(opt: ServiceOptions) {
		this.name = opt.name
	}


	rpc<TName extends string, TInput, TOutput>(name: TName, rpcOptions: RpcOptions<TInput, TOutput, TContext>) {
		this.rpcs.set(name, rpcOptions)
		return this
	}
}

export const createService = <TContext>(opt: ServiceOptions) => {
	return new Service<TContext>(opt)
}