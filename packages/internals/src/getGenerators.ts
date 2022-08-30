import { getGrpcTsConfigFromPkgJson } from './config'

export const getGenerators = (clientArg: string | undefined, serverArg: string | undefined) => {
    return {
        generateClient: getGeneratorsFromArg(clientArg)
            ?? getGeneratorFromPkgJson('client')
            ?? true,
        generateServer: getGeneratorsFromArg(serverArg)
            ?? getGeneratorFromPkgJson('server')
            ?? true,
    }
}

const getGeneratorsFromArg = (arg: string | undefined) => {
    return arg == null ? null : (arg === 'true' ? true : false)
}

const getGeneratorFromPkgJson = (propName: 'client' | 'server') => {
    const grpcTsConfig = getGrpcTsConfigFromPkgJson()

    return grpcTsConfig?.config?.generate?.[propName] ?? null
}
