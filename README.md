# Typesafe gRPC

grpc-ts allows you to easily created gRPC api

## Features
- Ability to create a server and a client with the same schema
- Typesafe resolvers/api-calls
- Protobuf generation

## Quickstart
Look at the examples to learn the basics

**Installation**
```
```

## Examples
How to create a package and service
```typescript
import { createService, grpc, createPackage } from "@grpc-ts/core"

type Context = {}

const myService = createService<Context>({ name: "MainService" })
	.rpc("testRpc", {
		input: grpc.Message("input", {}),
		output: grpc.Message("ouput", {}),
		resolve: ({ ctx, input: { }, metadata }) => {
			return {}
		}
	})

const myPackage = createPackage({ name: "MyPackage" }).addService(myService)
```

Running a server
```typescript
import { Server } from "@grpc-ts/server"

// Packages/Services

const server = new Server([myPackage])
server.listen(SERVER_URL, () => console.log("gRPC server is running"))
```
