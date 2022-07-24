import { Server as GrpcServer } from "@grpc/grpc-js"
import { Package } from "../../core/src"
import { RpcOptions, Service } from "@grpc-ts/core"
// import { generateProtobuf } from "@grpc-ts/core/src"

export type ObjectType<T> = { new(): T }


export class Server {
	server: GrpcServer

	constructor(packages: Package<any>[]) {
		this.server = new GrpcServer()


		this.#generateProtos(packages)
		// generateProtobuf({ output: "./proto.proto" })
	}

	#generateProtos(packages: Package<any>[]) {
		for (const p of packages) {
			p.services.forEach((service, name) => {
				const { output } = generateService(service)
				console.log(output)
			})
		}
	}
}

const generateService = (service: Service<any>) => {
	let output = `service ${service.name} {`
	if (service.rpcs.size) output += '\n'

	Array.from(service.rpcs).forEach(([name, rpc], idx) => {
		output += `\trpc ${name} (${rpc.input.out}) returns (${rpc.output.out})`
		if (idx !== service.rpcs.size) output += '\n'
	});

	output += '}'

	return { output }
}