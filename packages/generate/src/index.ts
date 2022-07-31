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
	const { pacakgeDefs } = parseDefinition(protoDefinition)
	console.log(pacakgeDefs)


}

type ParsedDefinitions = { services: any[], messages: any[] }

const parseDefinition = (protoDefinition: GrpcObject) => {
	const pacakgeDefs = new Map() as Map<string, ParsedDefinitions>

	const nestedPackage = (defs: object, packageName = "") => {
		const packageDefinitions = { services: [], messages: [] } as ParsedDefinitions

		Object.entries(defs).forEach(([name, def]) => {
			const isNotNestedPackage = "format" in def || def.prototype instanceof Client

			if (isNotNestedPackage) {
				if ("format" in def) packageDefinitions.messages.push(def)
				else if (def.prototype instanceof Client) packageDefinitions.services.push(def)
			} else {
				const nestedPackageName = packageName ? `${packageName}.${name}` : name
				nestedPackage(def, nestedPackageName)
			}
		});

		(packageDefinitions.services.length || packageDefinitions.messages.length)
			&& pacakgeDefs.set(packageName, packageDefinitions)
	}

	nestedPackage(protoDefinition)


	return { pacakgeDefs }
}