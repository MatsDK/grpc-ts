import { Server as GrpcServer, loadPackageDefinition, UntypedServiceImplementation } from "@grpc/grpc-js"
import { join } from "path";
import { loadSync, Options } from "@grpc/proto-loader";
import { Package, GenerateProtobufOutputPaths } from "@grpc-ts/core"
import { generate } from "@grpc-ts/generate"

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
		const path = join(__dirname, "../test/main.proto")
		const path2 = join(__dirname, "../test/main2.proto")
		generate({ protoPaths: [path, path2] })

		// this.#loadPackages(test)
	}

	#loadPackages(paths: Set<GenerateProtobufOutputPaths>) {
		for (const { outputPath, serviceName, package: pkg } of paths) {
			const packageDefinition = loadSync(
				outputPath,
				LOAD_SYNC_OPTIONS
			);

			const protoDescriptor = loadPackageDefinition(packageDefinition)[serviceName] as any;
			console.log(packageDefinition, protoDescriptor.service)

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
