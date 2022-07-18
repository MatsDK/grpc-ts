import { Service } from "./service"

type CreatePackageOptions = {
	name?: string
}

export class Package<TContext> {
	#services: Map<string, Service<TContext>> = new Map()
	name?: string

	constructor(opt: CreatePackageOptions = {}) {
		this.name = opt.name


	}

	addService(service: Service<TContext>) {
		this.#services.set(service.name, service)
		return this
	}
}

export const createPackage = (opt: CreatePackageOptions) => {
	return new Package(opt)
}