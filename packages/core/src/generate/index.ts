import fs from "fs"

interface GenerateProtobufOptions {
	output: string
}

// export const generateProtobuf = ({ output }: GenerateProtobufOptions) => {
// 	let protobuf = `syntax = "proto3";\n\n`;

// 	protobuf += generateService()

// 	fs.writeFileSync(output, protobuf)
// }

// const generateService = () => {
// 	let output = ``;
// 	console.log(getOrCreateGlobalState())
// 	getOrCreateGlobalState().services.forEach((service, name) => {
// 		output += `service ${service.name} {${generateRpcsForService(name)}}`
// 	})
// 	return output
// }

// const generateRpcsForService = (name: string) => {
// 	let output = ""
// 	const rpcs = getOrCreateGlobalState().rpcs.get(name)
// 	if (!rpcs) return ""
// 	rpcs.forEach((rpc) => {
// 		output += `\n\trpc ${rpc.name}(any) returns (any);`
// 	})
// 	if (rpcs.length) output += "\n"

// 	return output
// }