import { createService, grpc } from '@grpc-ts/core'

type Context = {}

const TestInput = grpc.Message('TestInput', {
    prop: grpc.String,
})
const Test2Input = grpc.Message('Test2Input', {
    test: grpc.String,
    test1: grpc.Message('Test2NestedInput', {
        test: grpc.String,
    }),
})

export const service = createService<Context>({ name: 'MainService' })
    .rpc('test', {
        input: TestInput,
        output: TestInput,
        resolve: ({ ctx, input, metadata }) => {
            return input
        },
    })
    .rpc('test1', {
        input: Test2Input,
        output: Test2Input,
        async resolve({ ctx, input: { test, test1 }, metadata }) {
            return { test }
        },
    })
