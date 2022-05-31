/* eslint-disable @typescript-eslint/no-var-requires */
const env = require('dotenv')
const fs = require('fs')
const path = require('path')
const res = env.config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`) })
const str = `// Network
export const chainId = '${res.parsed.chainId}'
export const chainName = '${res.parsed.chainName}'
export const supportedChainIds = ${res.parsed.supportedChainIds}
export const rpcUrls = ${res.parsed.rpcUrls}
export const blockExplorerUrls = ${res.parsed.blockExplorerUrls}

// Contract
export const cEther = '${res.parsed.cEther}'

// API server
export const serverUrl = '${res.parsed.serverUrl}'
`
fs.writeFileSync(path.join(__dirname, '../src/app/utils/config.ts'), str)
