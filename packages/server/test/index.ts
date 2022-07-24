import "reflect-metadata"
import { createPackage } from "../../core/src"
import { Server } from "../src/server"
import { service } from "./servicetest"

const p = createPackage({ name: "main" })
	.addService(service)

const server = new Server([p])
