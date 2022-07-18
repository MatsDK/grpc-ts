import { createService, grpc } from "@grpc-ts/core"

type Context = {}

export const service = createService<Context>({ name: "MainService" })
	.rpc("test", {
		input: grpc.Message("name", { test: 'test' }),
		output: grpc.Message("name", { test: 'test' }),
		resolve: ({ ctx, input: { test }, metadata }) => {
			return { test }
		}
	})