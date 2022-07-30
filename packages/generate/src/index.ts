import { loadPackageDefinition, Client, GrpcObject } from "@grpc/grpc-js"
import { loadSync } from "@grpc/proto-loader"

interface GenerateOptions {
	protoPaths: string[]
}

const DEFAULT_LOAD_PKG_OPTIONS = {

}

export const generate = ({ protoPaths }: GenerateOptions) => {

	const packageDefinition = loadSync(
		protoPaths,
		DEFAULT_LOAD_PKG_OPTIONS
	)
	const protoDefinition = loadPackageDefinition(packageDefinition)
	console.log(protoDefinition)
	const { } = parseDefinition(protoDefinition)
	// console.log((protoDefinition.api as any).test.PutRequest.type)

	Object.entries(protoDefinition).forEach(([name, def]: [string, any]) => {
		const isService = def?.prototype instanceof Client
		console.log(name, isService)
	})

}

const parseDefinition = (protoDefinition: GrpcObject) => {
	return {}
}