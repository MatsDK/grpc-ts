import "reflect-metadata"
import { createPackage } from "../../core/src"
import { Server } from "../src/server"
import { service } from "./servicetest"

const p = createPackage({ name: "main1" })
	.addService(service)

const server = new Server([p])
