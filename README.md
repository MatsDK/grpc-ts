# Typesafe gRPC

grpc-ts is designed to help you create a typesafe [gRPC](https://grpc.io/) api

## Core Features

- Ability to create a server and a client with the same schema
- Typesafe resolvers/api-calls
- Typescript types generation from `.proto` files

## Quickstart

Look at the examples to learn the basics

**Installation**

```
```

## Example

1. Defining your [protobufs](https://developers.google.com/protocol-buffers/docs/overview)

```protobuf
// proto/example.proto
syntax = "proto3";

service RouteGuide {
  rpc GetUser() returns (User) {}
}

message User {
	int32 id = 1;
	string name = 2;
}
```

2. Generate typescript types from proto files

```
$ npx ts-grpc generate
```

Providing location of proto files:

- Add `--proto` flag, for example `--proto=proto/*.proto`
- Add location to `pacakge.json`

```json
{
	..

    "grpc_ts": {
        "protoPaths": "proto/*.proto"
    }
}
```

- By default grpc-ts will look inside the `./proto` folder

---

**Running a server**

```typescript
import { createGrpcServer, User } from '@grpc-ts/server'

type Context = {}

const createContext = () => {
    return {}
}

const server = createGrpcServer<Context>({ createContext })
    .addServiceResolvers('RouteGuide', {
        async GetUser({ ctx, meta, request }) {
            // ...

            const user: User = {
                id: 1,
                name: 'name',
            }

            return user
        },
    })

server.listen('localhost:3000', (error, port) => {
    if (error) throw error

    console.log(`> Server running on port ${port}`)
})
```

**Running a client**

```typescript
```
