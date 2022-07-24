
export type GrpcOutput<TInput> = {
	out: string
	name?: string
	inner?: TInput
}

export abstract class GrpcType<
	Output = any,
	Input = Output
	> {
	readonly _output!: Output;
	readonly _input!: Input;
}

export class GrpcString extends GrpcType<string> {
	static create = (): GrpcString => {
		return new GrpcString()
	}
}

export namespace objectUtil {
	export type identity<T> = T;
	export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;
}

export type GrpcRawShape = { [k: string]: GrpcType };

export type baseObjectOutputType<Shape extends GrpcRawShape> = {
	[k in keyof Shape]: Shape[k]["_output"];
}

export type objectOutputType<Shape extends GrpcRawShape> = objectUtil.flatten<
	baseObjectOutputType<Shape>
>;

export class GrpcObject<
	T extends GrpcRawShape,
	Output = objectOutputType<T>,
	> extends GrpcType<Output> {

	readonly _shape!: T;

	static create = <TInput extends GrpcRawShape>(shape: TInput): GrpcObject<TInput> => {
		return new GrpcObject()
	}
}


type Infer<T extends GrpcType> = T["_output"];

export const grpc = {
	Message: <T extends GrpcRawShape>(name: string, inner: T) => GrpcObject.create(inner),
	String: GrpcString.create()
}
