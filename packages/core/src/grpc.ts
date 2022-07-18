
type Test = {
	[name: string]: Test | string
}

export const grpc = {
	Message: <T extends Test>(name: string, obj: T) => ({ ...obj })
}