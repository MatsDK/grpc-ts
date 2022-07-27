import { Server as GrpcServer, loadPackageDefinition, UntypedServiceImplementation } from "@grpc/grpc-js"
import { loadSync, Options } from "@grpc/proto-loader";
import { generateProtobuf, Package, GenerateProtobufOutputPaths } from "@grpc-ts/core"

const LOAD_SYNC_OPTIONS: Options = {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
}

export class Server {
	server: GrpcServer

	constructor(packages: Package<any>[]) {
		this.server = new GrpcServer()

		const { outputPaths } = generateProtobuf({ packages })
		this.#loadPackages(outputPaths)
	}

	#loadPackages(paths: Set<GenerateProtobufOutputPaths>) {
		for (const { outputPath, serviceName, package: pkg } of paths) {
			const packageDefinition = loadSync(
				outputPath,
				LOAD_SYNC_OPTIONS
			);

			const protoDescriptor = loadPackageDefinition(packageDefinition)[serviceName] as any;

			this.server.addService(protoDescriptor.service, this.#buildPackageResolvers(pkg))
		}
	}

	#buildPackageResolvers(pkg: Package<any>): UntypedServiceImplementation {
		const resolvers = {} as UntypedServiceImplementation
		pkg.services.forEach((service) => {
			service.rpcs.forEach((rpc, name) => {
				resolvers[name] = rpc.resolve
			})
		})
		console.log(resolvers)

		return resolvers
	}
}
