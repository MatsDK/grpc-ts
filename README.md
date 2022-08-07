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

## Examples

__Generation types for server/client__

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

__Running a server__
```typescript
```

__Running a client__
```typescript
```
