import fs from "fs"
import { GrpcMessage } from "../grpc"
import { Package } from "../package"
import { Service } from "../service"
import { getNestedMessages } from "../utils/getNestedMessages"
import type { MessagesMap } from "../utils/getNestedMessages"
import { GenerateProtobufOutputPaths } from "../types"

interface GenerateProtobufOptions {
	packages: Package<any>[]
}


export const generateProtobuf = ({ packages }: GenerateProtobufOptions) => {
	let messages: MessagesMap = new Map()
	let outputPaths = new Set<GenerateProtobufOutputPaths>()
	for (const p of packages) {
		const { messages: packageMessages, output, serviceName } = generatePackage(p)
		serviceName && outputPaths.add({ outputPath: output, serviceName, package: p })
		messages = new Map([...messages, ...packageMessages])
	}

	return { outputPaths }
}

const generatePackage = (p: Package<any>) => {
	let messages: MessagesMap = new Map()
	let packageOutput = `syntax = "proto3";\n\n`
	let serviceName = "";

	p.services.forEach((service, _name) => {
		const { output } = generateService(service, messages)
		packageOutput += output

		messages = new Map([...getNestedMessages(messages), ...messages])
		serviceName = service.name
	})

	packageOutput += generateMessages(messages)

	let output = `./${p.name || "main"}.proto`
	fs.writeFileSync(output, packageOutput)

	return { messages, output, serviceName }
}

const generateService = (service: Service<any>, messages: MessagesMap) => {
	let output = `service ${service.name} {`
	if (service.rpcs.size) output += '\n'

	Array.from(service.rpcs).forEach(([name, rpc], idx) => {
		if (rpc.input instanceof GrpcMessage)
			messages.set(rpc.input._name, rpc.input)
		if (rpc.output instanceof GrpcMessage)
			messages.set(rpc.output._name, rpc.output)

		output += `\trpc ${name} (${rpc.input._name}) returns (${rpc.output._name});`
		if (idx !== service.rpcs.size) output += '\n'
	});

	output += '}\n\n'

	return { output }
}

const generateMessages = (messages: MessagesMap) => {

	const generateMessage = (msg: GrpcMessage) => {

		let output = `message ${msg._name} {`

		const props: any[] = Object.entries(msg._shape)

		if (props.length) output += '\n'

		props.forEach(([name, prop], idx) => {
			output += `\t${prop._name} ${name} = ${idx};`
			if (idx !== props.length) output += '\n'
		})

		output += '}\n'
		return output
	}

	let outputMessages = ``

	Array.from(messages).forEach(([name, msg], idx) => {
		outputMessages += generateMessage(msg)

		if (idx !== messages.size) outputMessages += '\n'
	})

	return outputMessages
}