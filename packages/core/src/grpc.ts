export type GrpcOutput<TInput> = {
    out: string
    name?: string
    inner?: TInput
}

export abstract class GrpcType<
    Output = any,
    Input = Output,
> {
    readonly _output!: Output
    readonly _input!: Input
}

export class GrpcString extends GrpcType<string> {
    _name = 'string'

    static create = (): GrpcString => {
        return new GrpcString()
    }
}

export namespace objectUtil {
    export type identity<T> = T
    export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>
}

export type GrpcRawShape = { [k: string]: GrpcType }

export type baseObjectOutputType<Shape extends GrpcRawShape> = {
    [k in keyof Shape]: Shape[k]['_output']
}

export type objectOutputType<Shape extends GrpcRawShape> = objectUtil.flatten<
    baseObjectOutputType<Shape>
>

export class GrpcMessage<
    T extends GrpcRawShape = any,
    Output = objectOutputType<T>,
> extends GrpcType<Output> {
    readonly _name: string
    readonly _shape!: T

    constructor(name: string, shape: T) {
        super()
        this._shape = shape
        this._name = name
    }

    static create = <TInput extends GrpcRawShape>(shape: TInput, name: string): GrpcMessage<TInput> => {
        return new GrpcMessage(name, shape)
    }
}

type Infer<T extends GrpcType> = T['_output']

export const grpc = {
    Message: <T extends GrpcRawShape>(name: string, inner: T) => GrpcMessage.create(inner, name),
    String: GrpcString.create(),
}
