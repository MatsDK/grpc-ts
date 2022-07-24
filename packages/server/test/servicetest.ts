import { createService, grpc } from "@grpc-ts/core"

type Context = {}

export const service = createService<Context>({ name: "MainService" })
	.rpc("test", {
		input: grpc.String,
		output: grpc.String,
		resolve: ({ ctx, input, metadata }) => {
			return input
		}
	})
	.rpc("test", {
		input: grpc.Message("name", { test: grpc.String, test1: grpc.Message("name1", { "test": grpc.String }) }),
		output: grpc.Message("name", { test: grpc.String }),
		async resolve({ ctx, input: { test, test1 }, metadata }) {
			return { test }
		}
	})