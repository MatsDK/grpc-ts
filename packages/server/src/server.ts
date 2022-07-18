import { Server as GrpcServer } from "@grpc/grpc-js"
import { Package } from "../../core/src"
// import { generateProtobuf } from "@grpc-ts/core/src"

export type ObjectType<T> = { new(): T }


export class Server {
	server: GrpcServer

	constructor(packages: Package<any>[]) {
		console.log(packages)
		this.server = new GrpcServer()

		// generateProtobuf({ output: "./proto.proto" })
	}
}