import { Package } from "./package"

export type ResolverFn = (arg: any) => any
export type InputType<T> = { metadata?: string, input: T }
export type GenerateProtobufOutputPaths = { outputPath: string, serviceName: string, package: Package<any> }